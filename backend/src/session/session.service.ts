import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Message, MessageDocument } from "../chat/message.schema";
import { CreateSessionDto } from "./dto/create-session.dto";
import { Session, SessionDocument } from "./session.schema";

const MESSAGE_PAGE_SIZE = 20;

type SessionLean = Session & { _id: Types.ObjectId };
export type SessionWithMessageCount = SessionLean & { messageCount: number };

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async findAll(): Promise<SessionWithMessageCount[]> {
    const sessions = await this.sessionModel
      .find()
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();
    return this.attachMessageCounts(sessions);
  }

  async create(dto: CreateSessionDto): Promise<SessionDocument> {
    return this.sessionModel.create({ title: dto.title || "New Chat" });
  }

  async findOne(sessionId: string): Promise<SessionWithMessageCount> {
    const session = await this.sessionModel.findById(sessionId).lean();
    if (!session) throw new NotFoundException("Session not found");
    const [withCount] = await this.attachMessageCounts([session]);
    return withCount;
  }

  async findMessages(
    sessionId: string,
    next?: string,
    limit = MESSAGE_PAGE_SIZE,
  ) {
    const session = await this.sessionModel.findById(sessionId).lean();
    if (!session) throw new NotFoundException("Session not found");

    const filter: Record<string, unknown> = {
      sessionId: new Types.ObjectId(sessionId),
    };

    if (next) {
      if (!Types.ObjectId.isValid(next)) {
        throw new BadRequestException("Invalid next");
      }
      const anchor = await this.messageModel.findById(next).lean();
      if (!anchor?.createdAt) throw new BadRequestException("Invalid next");
      filter.createdAt = { $lt: anchor.createdAt };
    }

    const batch = await this.messageModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .lean();

    let nextResponse: string | null = null;
    if (batch.length > limit) {
      batch.pop();
      nextResponse = String(batch[batch.length - 1]._id);
    }

    const messages = batch.reverse();

    const [sessionWithCount] = await this.attachMessageCounts([session]);

    return { session: sessionWithCount, messages, next: nextResponse };
  }

  async remove(sessionId: string): Promise<{ success: boolean }> {
    await this.messageModel.deleteMany({ sessionId });
    await this.sessionModel.findByIdAndDelete(sessionId);
    return { success: true };
  }

  private async attachMessageCounts<T extends { _id: Types.ObjectId }>(
    sessions: T[],
  ): Promise<(T & { messageCount: number })[]> {
    if (sessions.length === 0) return [];

    const sessionIds = sessions.map((s) => s._id);
    const counts = await this.messageModel.aggregate<{
      _id: Types.ObjectId;
      count: number;
    }>([
      { $match: { sessionId: { $in: sessionIds } } },
      { $group: { _id: "$sessionId", count: { $sum: 1 } } },
    ]);

    const countBySession = new Map(
      counts.map((row) => [String(row._id), row.count]),
    );

    return sessions.map((session) => ({
      ...session,
      messageCount: countBySession.get(String(session._id)) ?? 0,
    }));
  }
}
