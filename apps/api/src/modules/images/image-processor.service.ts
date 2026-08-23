import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);

  // Known magic bytes for supported image formats
  private readonly magicBytes: Record<string, number[]> = {
    'image/jpeg': [0xff, 0xd8, 0xff],
    'image/png': [0x89, 0x50, 0x4e, 0x47],
    'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header (WebP starts with RIFF)
    'image/heic': [0x00, 0x00, 0x00], // ftyp box (variable offset)
    'image/heif': [0x00, 0x00, 0x00],
  };

  private readonly maxWidth = 8000;
  private readonly maxHeight = 8000;
  private readonly maxFileSize = 20 * 1024 * 1024; // 20MB

  /**
   * Validate that the image buffer matches its declared MIME type
   * and meets dimension/size constraints.
   */
  async validateImage(buffer: Buffer, mimeType: string): Promise<void> {
    // Check file size
    if (buffer.length > this.maxFileSize) {
      throw new BadRequestException(
        `Image file size exceeds maximum of ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    // Verify magic bytes match declared MIME type
    const expectedBytes = this.magicBytes[mimeType];
    if (expectedBytes) {
      const headerBytes = Array.from(buffer.subarray(0, expectedBytes.length));
      const matches = expectedBytes.every(
        (byte, index) => headerBytes[index] === byte,
      );
      if (!matches) {
        throw new BadRequestException(
          'Image file content does not match its declared MIME type',
        );
      }
    }

    // Validate dimensions
    try {
      const metadata = await sharp(buffer).metadata();
      if (
        metadata.width &&
        metadata.height &&
        (metadata.width > this.maxWidth || metadata.height > this.maxHeight)
      ) {
        throw new BadRequestException(
          `Image dimensions exceed maximum of ${this.maxWidth}x${this.maxHeight}`,
        );
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.warn(
        `Could not read image metadata: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw new BadRequestException('Invalid or corrupted image file');
    }
  }

  /**
   * Generate a thumbnail (400px width, JPEG quality 80).
   */
  async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    try {
      const thumbnail = await sharp(buffer)
        .resize(400, null, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      this.logger.log(
        `Thumbnail generated: ${buffer.length} bytes -> ${thumbnail.length} bytes`,
      );
      return thumbnail;
    } catch (error) {
      this.logger.error(
        `Thumbnail generation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Strip EXIF data from the image for public display.
   * Returns a clean copy without metadata.
   */
  async stripExif(buffer: Buffer): Promise<Buffer> {
    try {
      const metadata = await sharp(buffer).metadata();
      const format = metadata.format || 'jpeg';

      const cleaned = await sharp(buffer)
        .rotate() // Auto-rotate based on EXIF orientation before stripping
        .toFormat(format as keyof sharp.FormatEnum)
        .toBuffer();

      return cleaned;
    } catch (error) {
      this.logger.error(
        `EXIF stripping failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get image dimensions.
   */
  async getImageDimensions(
    buffer: Buffer,
  ): Promise<{ width: number; height: number }> {
    try {
      const metadata = await sharp(buffer).metadata();
      return {
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get image dimensions: ${error instanceof Error ? error.message : String(error)}`,
      );
      return { width: 0, height: 0 };
    }
  }
}
