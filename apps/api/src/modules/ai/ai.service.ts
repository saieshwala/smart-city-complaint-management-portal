import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/prisma/prisma.service';
import {
  AiProvider,
  ImageClassificationResult,
  ComplaintGenerationResult,
} from './providers/ai-provider.interface';
import { MockAiProvider } from './providers/mock-ai.provider';
import { OpenAiVisionProvider } from './providers/openai-vision.provider';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly provider: AiProvider;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly mockProvider: MockAiProvider,
    private readonly openAiProvider: OpenAiVisionProvider,
  ) {
    const providerName = this.configService.get<string>('AI_PROVIDER', 'mock');
    this.provider = this.selectProvider(providerName);
    this.logger.log(`AI provider initialized: ${providerName}`);
  }

  private selectProvider(providerName: string): AiProvider {
    switch (providerName.toLowerCase()) {
      case 'openai':
        // Verify API key is available, fall back to mock if not
        const apiKey = this.configService.get<string>('OPENAI_API_KEY');
        if (!apiKey) {
          this.logger.warn(
            'OPENAI_API_KEY not set, falling back to mock AI provider',
          );
          return this.mockProvider;
        }
        return this.openAiProvider;
      case 'mock':
      default:
        return this.mockProvider;
    }
  }

  /**
   * Classify an image using the configured AI provider.
   * Stores the analysis result in the AiAnalysis table.
   */
  async classifyImage(
    imageBuffer: Buffer,
    mimeType: string,
    complaintId: string,
    imageId?: string,
  ): Promise<ImageClassificationResult> {
    const startTime = Date.now();

    try {
      const result = await this.provider.classifyImage(imageBuffer, mimeType);
      const processingTimeMs = Date.now() - startTime;

      const providerName = this.configService.get<string>(
        'AI_PROVIDER',
        'mock',
      );

      // Store analysis result in database
      await this.prisma.aiAnalysis.create({
        data: {
          complaintId,
          imageId: imageId || null,
          provider: providerName,
          category: result.category,
          subcategory: result.subcategory,
          confidence: result.confidence,
          severity: result.severity,
          evidence: result.evidence,
          explanation: result.explanation,
          rawResponse: result as any,
          processingTimeMs,
        },
      });

      this.logger.log(
        `Image classified: ${result.category}/${result.subcategory} (${processingTimeMs}ms)`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `Image classification failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Fall back to mock provider if the primary provider fails
      if (this.provider !== this.mockProvider) {
        this.logger.warn('Falling back to mock AI provider');
        return this.mockProvider.classifyImage(imageBuffer, mimeType);
      }

      throw error;
    }
  }

  /**
   * Generate a complaint title and description from classification results.
   */
  async generateComplaint(
    classification: ImageClassificationResult,
    location: string,
    timestamp: Date,
    complaintId?: string,
  ): Promise<ComplaintGenerationResult> {
    try {
      const result = await this.provider.generateComplaint(
        classification,
        location,
        timestamp,
      );

      // If a complaintId is provided, update the AiAnalysis record
      if (complaintId) {
        const latestAnalysis = await this.prisma.aiAnalysis.findFirst({
          where: { complaintId },
          orderBy: { createdAt: 'desc' },
        });

        if (latestAnalysis) {
          await this.prisma.aiAnalysis.update({
            where: { id: latestAnalysis.id },
            data: {
              generatedTitle: result.title,
              generatedDescription: result.description,
            },
          });
        }
      }

      return result;
    } catch (error) {
      this.logger.error(
        `Complaint generation failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Fall back to mock provider
      if (this.provider !== this.mockProvider) {
        this.logger.warn('Falling back to mock AI provider for complaint generation');
        return this.mockProvider.generateComplaint(
          classification,
          location,
          timestamp,
        );
      }

      throw error;
    }
  }
}
