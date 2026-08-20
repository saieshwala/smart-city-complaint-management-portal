import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { StorageService } from '../common/storage/storage.service';
import { ImageProcessorService } from './image-processor.service';
import { MetadataExtractorService } from './metadata-extractor.service';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.heic', '.heif'];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILES_PER_COMPLAINT = 5;

@Injectable()
export class ImagesService {
  private readonly logger = new Logger(ImagesService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly imageProcessor: ImageProcessorService,
    private readonly metadataExtractor: MetadataExtractorService,
  ) {}

  /**
   * Upload and process images for a complaint.
   */
  async uploadImages(
    complaintId: string,
    files: Express.Multer.File[],
  ): Promise<any[]> {
    // Verify complaint exists
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { images: true },
    });

    if (!complaint) {
      throw new NotFoundException('Complaint not found');
    }

    // Check total image count
    const existingCount = complaint.images.length;
    if (existingCount + files.length > MAX_FILES_PER_COMPLAINT) {
      throw new BadRequestException(
        `Maximum ${MAX_FILES_PER_COMPLAINT} images per complaint. Currently has ${existingCount}.`,
      );
    }

    const uploadedImages = [];

    for (const file of files) {
      // Validate MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        throw new BadRequestException(
          `Unsupported file type: ${file.mimetype}. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
        );
      }

      // Validate extension
      const ext = this.getExtension(file.originalname);
      if (!ALLOWED_EXTENSIONS.includes(ext.toLowerCase())) {
        throw new BadRequestException(
          `Unsupported file extension: ${ext}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`,
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        throw new BadRequestException(
          `File ${file.originalname} exceeds maximum size of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        );
      }

      // Validate image content (magic bytes + dimensions)
      await this.imageProcessor.validateImage(file.buffer, file.mimetype);

      // Extract metadata before stripping EXIF
      const metadata = await this.metadataExtractor.extractMetadata(file.buffer);

      // Get dimensions
      const dimensions = await this.imageProcessor.getImageDimensions(file.buffer);

      // Generate unique storage keys
      const imageId = uuidv4();
      const storageKey = `complaints/${complaintId}/${imageId}${ext}`;
      const thumbnailKey = `complaints/${complaintId}/${imageId}_thumb.jpg`;

      // Generate image hash for deduplication
      const imageHash = crypto
        .createHash('sha256')
        .update(file.buffer)
        .digest('hex');

      // Strip EXIF for the stored public copy
      const cleanedBuffer = await this.imageProcessor.stripExif(file.buffer);

      // Generate thumbnail
      const thumbnailBuffer =
        await this.imageProcessor.generateThumbnail(file.buffer);

      // Upload original (cleaned) and thumbnail to storage
      await Promise.all([
        this.storageService.upload(storageKey, cleanedBuffer, file.mimetype),
        this.storageService.upload(thumbnailKey, thumbnailBuffer, 'image/jpeg'),
      ]);

      // Create database record
      const image = await this.prisma.complaintImage.create({
        data: {
          complaintId,
          storageKey,
          thumbnailKey,
          originalFilename: file.originalname,
          mimeType: file.mimetype,
          fileSize: file.size,
          width: dimensions.width || null,
          height: dimensions.height || null,
          exifTimestamp: metadata.timestamp || null,
          exifLatitude: metadata.latitude || null,
          exifLongitude: metadata.longitude || null,
          exifDevice: metadata.device || null,
          imageHash,
          isPrimary: existingCount === 0 && uploadedImages.length === 0,
        },
      });

      uploadedImages.push(image);

      this.logger.log(
        `Image uploaded: ${file.originalname} -> ${storageKey}`,
      );
    }

    return uploadedImages;
  }

  /**
   * Generate a signed URL for private image access.
   */
  async getSignedUrl(storageKey: string): Promise<string> {
    return this.storageService.getSignedUrl(storageKey, 3600);
  }

  /**
   * Delete all images for a complaint from storage and database.
   */
  async deleteImages(complaintId: string): Promise<void> {
    const images = await this.prisma.complaintImage.findMany({
      where: { complaintId },
    });

    // Delete from storage
    for (const image of images) {
      try {
        await this.storageService.delete(image.storageKey);
        if (image.thumbnailKey) {
          await this.storageService.delete(image.thumbnailKey);
        }
      } catch (error) {
        this.logger.warn(
          `Failed to delete storage object ${image.storageKey}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // Delete from database
    await this.prisma.complaintImage.deleteMany({
      where: { complaintId },
    });

    this.logger.log(
      `Deleted ${images.length} images for complaint ${complaintId}`,
    );
  }

  private getExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1) return '';
    return filename.substring(lastDot);
  }
}
