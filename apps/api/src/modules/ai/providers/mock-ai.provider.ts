import { Injectable, Logger } from '@nestjs/common';
import {
  AiProvider,
  ImageClassificationResult,
  ComplaintGenerationResult,
} from './ai-provider.interface';

/**
 * Mock AI provider for development and testing.
 * Returns realistic mock data without requiring any AI API key.
 */
@Injectable()
export class MockAiProvider implements AiProvider {
  private readonly logger = new Logger(MockAiProvider.name);

  private readonly mockScenarios: ImageClassificationResult[] = [
    {
      category: 'waste_management',
      subcategory: 'garbage_dump',
      confidence: 0.92,
      severity: 'high',
      evidence: ['Visible pile of garbage', 'Overflowing waste bin', 'Scattered litter on road'],
      explanation: 'The image shows an unattended garbage dump with waste spilling onto the road, posing health and environmental risks.',
    },
    {
      category: 'roads',
      subcategory: 'pothole',
      confidence: 0.88,
      severity: 'medium',
      evidence: ['Visible road damage', 'Pothole on road surface', 'Water accumulation in depression'],
      explanation: 'A pothole is visible on the road surface that could cause vehicle damage and accidents.',
    },
    {
      category: 'water',
      subcategory: 'water_leak',
      confidence: 0.85,
      severity: 'high',
      evidence: ['Water flowing from pipe', 'Wet road surface', 'Visible pipe damage'],
      explanation: 'A water pipe leak is detected causing water wastage and road damage.',
    },
    {
      category: 'street_lighting',
      subcategory: 'broken_streetlight',
      confidence: 0.9,
      severity: 'medium',
      evidence: ['Broken street light fixture', 'Non-functioning light pole', 'Dark street area'],
      explanation: 'A broken or non-functioning street light creating a safety hazard in the area.',
    },
    {
      category: 'sewerage',
      subcategory: 'open_manhole',
      confidence: 0.95,
      severity: 'critical',
      evidence: ['Missing manhole cover', 'Open sewer access', 'Safety hazard on footpath'],
      explanation: 'An open manhole without a cover presents an immediate safety risk to pedestrians.',
    },
    {
      category: 'traffic',
      subcategory: 'damaged_signal',
      confidence: 0.87,
      severity: 'high',
      evidence: ['Damaged traffic signal', 'Non-functioning signal lights', 'Signal pole damage'],
      explanation: 'A damaged traffic signal detected which could lead to traffic accidents.',
    },
    {
      category: 'public_infrastructure',
      subcategory: 'damaged_bench',
      confidence: 0.82,
      severity: 'low',
      evidence: ['Broken public bench', 'Damaged seating area', 'Worn out public furniture'],
      explanation: 'Public seating infrastructure is damaged and requires maintenance.',
    },
    {
      category: 'environment',
      subcategory: 'illegal_dumping',
      confidence: 0.91,
      severity: 'high',
      evidence: ['Construction debris', 'Illegally dumped waste', 'Environmental contamination'],
      explanation: 'Illegal dumping of construction debris or hazardous waste detected in the area.',
    },
  ];

  async classifyImage(
    _imageBuffer: Buffer,
    _mimeType: string,
  ): Promise<ImageClassificationResult> {
    this.logger.log('Mock AI: Classifying image...');

    // Simulate processing delay
    await this.delay(500);

    // Select a random scenario
    const scenario =
      this.mockScenarios[Math.floor(Math.random() * this.mockScenarios.length)];

    this.logger.log(
      `Mock AI: Classified as ${scenario.category}/${scenario.subcategory} with confidence ${scenario.confidence}`,
    );

    return { ...scenario };
  }

  async generateComplaint(
    classification: ImageClassificationResult,
    location: string,
    timestamp: Date,
  ): Promise<ComplaintGenerationResult> {
    this.logger.log('Mock AI: Generating complaint text...');

    // Simulate processing delay
    await this.delay(500);

    const categoryTitles: Record<string, string> = {
      waste_management: 'Waste Management Issue',
      roads: 'Road Damage Report',
      water: 'Water Supply Issue',
      street_lighting: 'Street Lighting Problem',
      sewerage: 'Sewerage Issue',
      traffic: 'Traffic Infrastructure Problem',
      public_infrastructure: 'Public Infrastructure Damage',
      environment: 'Environmental Concern',
      other: 'Civic Issue Report',
    };

    const baseTitle =
      categoryTitles[classification.category] || 'Civic Issue Report';
    const title = `${baseTitle} - ${classification.subcategory.replace(/_/g, ' ')}`;

    const description = [
      `A ${classification.severity} severity ${classification.category.replace(/_/g, ' ')} issue has been identified.`,
      `Location: ${location || 'Not specified'}.`,
      `Reported on: ${timestamp.toISOString().split('T')[0]}.`,
      '',
      `Issue Details: ${classification.explanation}`,
      '',
      `Evidence observed:`,
      ...classification.evidence.map((e) => `- ${e}`),
      '',
      `AI Confidence: ${(classification.confidence * 100).toFixed(1)}%`,
      `This complaint was auto-generated based on image analysis and may require verification.`,
    ].join('\n');

    return { title, description };
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
