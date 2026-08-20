export interface ImageClassificationResult {
  category: string;
  subcategory: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  evidence: string[];
  explanation: string;
}

export interface ComplaintGenerationResult {
  title: string;
  description: string;
}

export interface AiProvider {
  classifyImage(imageBuffer: Buffer, mimeType: string): Promise<ImageClassificationResult>;
  generateComplaint(classification: ImageClassificationResult, location: string, timestamp: Date): Promise<ComplaintGenerationResult>;
}
