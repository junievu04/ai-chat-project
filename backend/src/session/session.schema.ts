import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type SessionDocument = Session & Document;

@Schema({ timestamps: true })
export class Session {
  @Prop({ default: "New Chat" })
  title: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
