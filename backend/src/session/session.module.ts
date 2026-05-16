import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Message, MessageSchema } from "../chat/message.schema";
import { SessionController } from "./session.controller";
import { Session, SessionSchema } from "./session.schema";
import { SessionService } from "./session.service";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Session.name, schema: SessionSchema },
      { name: Message.name, schema: MessageSchema },
    ]),
  ],
  controllers: [SessionController],
  providers: [SessionService],
  exports: [SessionService, MongooseModule],
})
export class SessionModule {}
