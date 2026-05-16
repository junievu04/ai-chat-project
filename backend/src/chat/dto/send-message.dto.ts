import { Type } from "class-transformer";
import { IsArray, IsOptional, IsString, ValidateNested } from "class-validator";

export class AttachmentDto {
  @IsString() url: string;
  @IsString() publicId: string;
  @IsString() type: string;
  @IsString() name: string;
}

export class SendMessageDto {
  @IsString()
  prompt: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
