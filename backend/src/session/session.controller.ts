import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
import { CreateSessionDto } from "./dto/create-session.dto";
import { SessionService } from "./session.service";

@Controller("sessions")
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  // GET /api/sessions
  @Get()
  findAll() {
    return this.sessionService.findAll();
  }

  // POST /api/sessions
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSessionDto) {
    return this.sessionService.create(dto);
  }

  // GET /api/sessions/:id/messages
  @Get(":id/messages")
  findMessages(@Param("id") id: string) {
    return this.sessionService.findMessages(id);
  }

  // DELETE /api/sessions/:id
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.sessionService.remove(id);
  }
}
