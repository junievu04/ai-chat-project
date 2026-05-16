import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SessionModule } from './session/session.module';
import { ChatModule } from './chat/chat.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    // ── Global config (.env) ───────────────────────────────
    ConfigModule.forRoot({ isGlobal: true }),

    // ── MongoDB via Mongoose ───────────────────────────────
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // ── Feature modules ────────────────────────────────────
    SessionModule,
    ChatModule,
    UploadModule,
  ],
})
export class AppModule {}
