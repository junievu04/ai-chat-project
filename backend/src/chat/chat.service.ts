import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Session, SessionDocument } from "../session/session.schema";
import { toAiErrorMessage } from "./ai-error.util";
import { AiService } from "./ai.service";
import { SendMessageDto } from "./dto/send-message.dto";
import { Message, MessageDocument } from "./message.schema";

export type ChatStreamEventType = "meta" | "chunk" | "done" | "error";

export interface ChatStreamEvent {
  type: ChatStreamEventType;
  data: Record<string, unknown>;
}

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private aiService: AiService,
  ) {}

  async *sendMessageStream(
    dto: SendMessageDto,
  ): AsyncGenerator<ChatStreamEvent> {
    const { prompt, sessionId, attachments = [] } = dto;

    if (!prompt?.trim()) {
      throw new BadRequestException("Prompt is required");
    }

    let session: SessionDocument;

    if (sessionId) {
      session = await this.sessionModel.findById(sessionId);
      if (!session) {
        throw new NotFoundException("Session not found");
      }
    } else {
      session = await this.sessionModel.create({
        title: prompt.slice(0, 60) + (prompt.length > 60 ? "…" : ""),
      });
    }

    const userMsg = await this.messageModel.create({
      sessionId: session._id,
      role: "user",
      content: prompt,
      attachments,
    });

    const sid = String(session._id);

    yield {
      type: "meta",
      data: {
        sessionId: sid,
        userMessage: this.toMessagePayload(userMsg, sid),
      },
    };

    const history = await this.messageModel
      .find({ sessionId: session._id })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    const contextMessages = history
      .filter((m) => m._id.toString() !== userMsg._id.toString())
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }));

    let fullText = "";

    try {
      for await (const chunk of this.aiService.generateResponseStream(
        contextMessages,
        prompt,
      )) {
        fullText += chunk;
        yield { type: "chunk", data: { text: chunk } };
      }
    } catch (err) {
      yield { type: "error", data: { message: toAiErrorMessage(err) } };
      return;
    }

    const aiMsg = await this.messageModel.create({
      sessionId: session._id,
      role: "assistant",
      content: fullText,
      attachments: [],
    });

    await this.sessionModel.findByIdAndUpdate(session._id, {
      updatedAt: new Date(),
    });

    yield {
      type: "done",
      data: {
        aiMessage: this.toMessagePayload(aiMsg, sid),
      },
    };
  }

  private toMessagePayload(
    msg:
      | MessageDocument
      | {
          _id: Types.ObjectId;
          role: string;
          content: string;
          attachments?: unknown[];
          createdAt?: Date;
        },
    sessionId: string,
  ) {
    return {
      _id: String(msg._id),
      sessionId,
      role: msg.role,
      content: msg.content,
      attachments: msg.attachments ?? [],
      createdAt:
        (msg as MessageDocument).createdAt?.toISOString?.() ??
        new Date().toISOString(),
    };
  }
}
