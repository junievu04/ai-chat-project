import {
  Body,
  Controller,
  HttpException,
  Logger,
  Post,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { ChatService } from "./chat.service";
import { toAiErrorMessage } from "./ai-error.util";
import { SendMessageDto } from "./dto/send-message.dto";

@Controller("chat")
export class ChatController {
  private readonly logger = new Logger(ChatController.name);

  constructor(private readonly chatService: ChatService) {}

  @Post()
  async sendMessage(@Body() dto: SendMessageDto, @Res() res: Response) {
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    // SSE should be 200 — Nest defaults POST to 201 even when the stream fails
    res.status(200);
    res.flushHeaders();

    const writeEvent = (type: string, data: Record<string, unknown>) => {
      res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      for await (const event of this.chatService.sendMessageStream(dto)) {
        if (event.type === "error") {
          this.logger.warn(
            `Chat AI error: ${String((event.data as { message?: string }).message ?? "unknown")}`,
          );
        }
        writeEvent(event.type, event.data);
      }
    } catch (err) {
      if (!res.writableEnded) {
        const status = err instanceof HttpException ? err.getStatus() : 500;
        if (!res.headersSent) res.status(status);

        const message =
          err instanceof HttpException
            ? (() => {
                const response = err.getResponse();
                if (typeof response === "string") return response;
                const m = (response as { message?: string | string[] }).message;
                return Array.isArray(m) ? m.join(", ") : String(m ?? err.message);
              })()
            : toAiErrorMessage(err);

        this.logger.warn(`Chat failed: ${message}`);
        writeEvent("error", { message });
      }
    } finally {
      if (!res.writableEnded) res.end();
    }
  }
}
