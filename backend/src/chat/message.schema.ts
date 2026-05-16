import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

class Attachment {
  @Prop({ required: true }) url: string;
  @Prop({ required: true }) publicId: string;
  @Prop({ enum: ['image', 'pdf', 'file'], default: 'file' }) type: string;
  @Prop({ required: true }) name: string;
}

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Session', required: true, index: true })
  sessionId: Types.ObjectId;

  @Prop({ enum: ['user', 'assistant'], required: true })
  role: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [Attachment], default: [] })
  attachments: Attachment[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
