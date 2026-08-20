import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AiService } from './ai.service';
import { MockAiProvider } from './providers/mock-ai.provider';
import { OpenAiVisionProvider } from './providers/openai-vision.provider';

@Module({
  imports: [ConfigModule],
  providers: [AiService, MockAiProvider, OpenAiVisionProvider],
  exports: [AiService],
})
export class AiModule {}
