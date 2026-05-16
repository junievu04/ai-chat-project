import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Message, MessageDocument } from "../chat/message.schema";
import { CreateSessionDto } from "./dto/create-session.dto";
import { Session, SessionDocument } from "./session.schema";

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

  async findMessages(sessionId: string) {
    const session = await this.sessionModel.findById(sessionId).lean();
    if (!session) throw new NotFoundException("Session not found");

    const messages = await this.messageModel
      .find({ sessionId })
      .sort({ createdAt: 1 })
      .lean();

    return { session, messages };
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
