import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { CreateSessionDto } from "./dto/create-session.dto";
import { SessionService } from "./session.service";

@Controller("sessions")
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get()
  findAll() {
    return this.sessionService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSessionDto) {
    return this.sessionService.create(dto);
  }

  @Get(":id/messages")
  findMessages(
    @Param("id") id: string,
    @Query("next") next?: string,
    @Query("limit") limit?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : undefined;
    return this.sessionService.findMessages(id, next, parsedLimit);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.sessionService.findOne(id);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.sessionService.remove(id);
  }
}
