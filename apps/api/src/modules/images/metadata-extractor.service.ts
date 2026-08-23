import { Injectable, Logger } from '@nestjs/common';
import * as exifr from 'exifr';

export interface ImageMetadata {
  latitude?: number;
  longitude?: number;
  timestamp?: Date;
  device?: string;
  width?: number;
  height?: number;
}

@Injectable()
export class MetadataExtractorService {
  private readonly logger = new Logger(MetadataExtractorService.name);

  /**
   * Extract metadata (GPS coordinates, timestamp, device info) from an image buffer.
   * Returns nulls for missing fields -- EXIF data is NOT always present.
   */
  async extractMetadata(buffer: Buffer): Promise<ImageMetadata> {
    try {
      const exif = await exifr.parse(buffer, {
        gps: true,
        tiff: true,
        exif: true,
      } as any);

      if (!exif) {
        this.logger.log('No EXIF data found in image');
        return {};
      }

      // Extract GPS coordinates
      const latitude = exif.latitude ?? undefined;
      const longitude = exif.longitude ?? undefined;

      // Extract timestamp (try multiple EXIF date fields)
      let timestamp: Date | undefined;
      const dateValue =
        exif.DateTimeOriginal || exif.CreateDate || exif.ModifyDate;
      if (dateValue) {
        timestamp = dateValue instanceof Date ? dateValue : new Date(dateValue);
        if (isNaN(timestamp.getTime())) {
          timestamp = undefined;
        }
      }

      // Extract device info
      let device: string | undefined;
      const make = exif.Make;
      const model = exif.Model;
      if (make || model) {
        device = [make, model].filter(Boolean).join(' ').trim();
      }

      // Extract dimensions from EXIF (if available)
      const width = exif.ImageWidth ?? exif.ExifImageWidth ?? undefined;
      const height = exif.ImageHeight ?? exif.ExifImageHeight ?? undefined;

      this.logger.log(
        `Metadata extracted: GPS=${latitude !== undefined}, timestamp=${timestamp !== undefined}, device=${device || 'unknown'}`,
      );

      return {
        latitude,
        longitude,
        timestamp,
        device,
        width,
        height,
      };
    } catch (error) {
      this.logger.warn(
        `Metadata extraction failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Return empty metadata on failure -- this is non-critical
      return {};
    }
  }
}
