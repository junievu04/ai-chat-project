import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './message.schema';
import { Session, SessionDocument } from '../session/session.schema';
import { AiService } from './ai.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private aiService: AiService,
  ) {}

  async sendMessage(dto: SendMessageDto) {
    const { prompt, sessionId, attachments = [] } = dto;

    if (!prompt?.trim()) {
      throw new BadRequestException('Prompt is required');
    }

    // ── 1. Get or create session ──────────────────────────
    let session: SessionDocument;

    if (sessionId) {
      session = await this.sessionModel.findById(sessionId);
    }

    if (!session) {
      session = await this.sessionModel.create({
        title: prompt.slice(0, 60) + (prompt.length > 60 ? '…' : ''),
      });
    }

    // ── 2. Save user message ──────────────────────────────
    const userMsg = await this.messageModel.create({
      sessionId: session._id,
      role: 'user',
      content: prompt,
      attachments,
    });

    // ── 3. Fetch conversation history for context ─────────
    const history = await this.messageModel
      .find({ sessionId: session._id })
      .sort({ createdAt: 1 })
      .limit(20)
      .lean();

    const contextMessages = history
      .filter((m) => m._id.toString() !== userMsg._id.toString())
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    // ── 4. Generate AI response ───────────────────────────
    const aiText = await this.aiService.generateResponse(contextMessages, prompt);

    // ── 5. Save AI message ────────────────────────────────
    const aiMsg = await this.messageModel.create({
      sessionId: session._id,
      role: 'assistant',
      content: aiText,
      attachments: [],
    });

    // ── 6. Update session message count ───────────────────
    await this.sessionModel.findByIdAndUpdate(session._id, {
      $inc: { messageCount: 2 },
      updatedAt: new Date(),
    });

    return {
      sessionId: session._id,
      userMessage: {
        _id: userMsg._id,
        role: 'user',
        content: prompt,
        attachments,
        createdAt: userMsg['createdAt'],
      },
      aiMessage: {
        _id: aiMsg._id,
        role: 'assistant',
        content: aiText,
        attachments: [],
        createdAt: aiMsg['createdAt'],
      },
    };
  }
}
