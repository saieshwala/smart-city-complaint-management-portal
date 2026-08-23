import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiProvider,
  ImageClassificationResult,
  ComplaintGenerationResult,
} from './ai-provider.interface';

/**
 * OpenAI Vision provider using GPT-4o for image classification
 * and complaint text generation.
 */
@Injectable()
export class OpenAiVisionProvider implements AiProvider {
  private readonly logger = new Logger(OpenAiVisionProvider.name);
  private readonly apiKey: string;
  private readonly model: string;
  private readonly apiUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('OPENAI_API_KEY', '');
    this.model = this.configService.get<string>('OPENAI_MODEL', 'gpt-4o');
  }

  async classifyImage(
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<ImageClassificationResult> {
    this.logger.log('OpenAI Vision: Classifying image...');

    const base64Image = imageBuffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Image}`;

    const systemPrompt = `You are an AI system that classifies images of civic issues in Indian cities.
Analyze the image and classify it into one of these categories:
- waste_management (subcategories: garbage_dump, overflowing_bin, littering, dead_animal, construction_debris)
- roads (subcategories: pothole, road_damage, waterlogging, unpaved_road, road_blockage)
- traffic (subcategories: damaged_signal, missing_sign, illegal_parking, road_marking)
- water (subcategories: water_leak, no_supply, contaminated_water, broken_pipeline, water_logging)
- sewerage (subcategories: open_manhole, blocked_drain, sewage_overflow, broken_pipeline)
- street_lighting (subcategories: broken_streetlight, no_lighting, flickering_light)
- public_infrastructure (subcategories: damaged_bench, broken_footpath, damaged_railing, park_maintenance)
- environment (subcategories: illegal_dumping, tree_fall, air_pollution, noise_pollution, deforestation)
- other (subcategories: other)

Respond ONLY with a valid JSON object in this exact format:
{
  "category": "category_slug",
  "subcategory": "subcategory_slug",
  "confidence": 0.0-1.0,
  "severity": "low|medium|high|critical",
  "evidence": ["evidence item 1", "evidence item 2"],
  "explanation": "Brief explanation of what was detected"
}

If you cannot classify the image, return:
{
  "category": "other",
  "subcategory": "other",
  "confidence": 0.1,
  "severity": "low",
  "evidence": ["Unable to classify image content"],
  "explanation": "The image could not be confidently classified into a civic issue category."
}`;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Classify the civic issue shown in this image.',
                },
                {
                  type: 'image_url',
                  image_url: { url: dataUrl, detail: 'high' },
                },
              ],
            },
          ],
          max_tokens: 500,
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`OpenAI API error: ${response.status} ${errorText}`);
        throw new Error(`OpenAI API returned ${response.status}`);
      }

      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      // Parse JSON from the response (handle possible markdown code blocks)
      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result: ImageClassificationResult = JSON.parse(jsonStr);

      this.logger.log(
        `OpenAI Vision: Classified as ${result.category}/${result.subcategory} with confidence ${result.confidence}`,
      );

      return result;
    } catch (error) {
      this.logger.error(
        `OpenAI Vision classification failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      return {
        category: 'other',
        subcategory: 'other',
        confidence: 0,
        severity: 'low',
        evidence: ['Classification failed due to an error'],
        explanation: 'Unable to classify the image due to a processing error.',
      };
    }
  }

  async generateComplaint(
    classification: ImageClassificationResult,
    location: string,
    timestamp: Date,
  ): Promise<ComplaintGenerationResult> {
    this.logger.log('OpenAI Vision: Generating complaint text...');

    const systemPrompt = `You are an AI assistant that generates professional civic complaint descriptions for Indian municipal authorities.
Generate a concise title and detailed but factual description.
Do NOT invent facts that are not provided in the classification data.
Do NOT add emotional language.
Be specific and professional.

Respond ONLY with a valid JSON object:
{
  "title": "Brief title (max 100 chars)",
  "description": "Detailed factual description"
}`;

    const userPrompt = `Generate a complaint based on this AI classification:
Category: ${classification.category}
Subcategory: ${classification.subcategory}
Severity: ${classification.severity}
Confidence: ${(classification.confidence * 100).toFixed(1)}%
Evidence: ${classification.evidence.join(', ')}
Explanation: ${classification.explanation}
Location: ${location || 'Not specified'}
Date: ${timestamp.toISOString().split('T')[0]}`;

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 500,
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API returned ${response.status}`);
      }

      const data: any = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from OpenAI');
      }

      const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const result: ComplaintGenerationResult = JSON.parse(jsonStr);

      return result;
    } catch (error) {
      this.logger.error(
        `OpenAI complaint generation failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      // Fallback: generate a basic complaint without AI
      const categoryLabel = classification.category.replace(/_/g, ' ');
      return {
        title: `${categoryLabel} issue reported`,
        description: `A ${classification.severity} severity ${categoryLabel} issue has been identified. ${classification.explanation}`,
      };
    }
  }
}
