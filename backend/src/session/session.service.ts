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

@Injectable()
export class SessionService {
  constructor(
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async findAll(): Promise<Session[]> {
    return this.sessionModel.find().sort({ updatedAt: -1 }).limit(50).lean();
  }

  async create(dto: CreateSessionDto): Promise<SessionDocument> {
    return this.sessionModel.create({ title: dto.title || "New Chat" });
  }

  async findOne(sessionId: string) {
    const session = await this.sessionModel.findById(sessionId).lean();
    if (!session) throw new NotFoundException("Session not found");
    return session;
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
      next = String(batch[batch.length - 1]._id);
    }

    const messages = batch.reverse();

    return { session, messages, next: nextResponse };
  }

  async remove(sessionId: string): Promise<{ success: boolean }> {
    await this.messageModel.deleteMany({ sessionId });
    await this.sessionModel.findByIdAndDelete(sessionId);
    return { success: true };
  }

  async incrementMessageCount(sessionId: string, by = 2) {
    await this.sessionModel.findByIdAndUpdate(sessionId, {
      $inc: { messageCount: by },
    });
  }
}
