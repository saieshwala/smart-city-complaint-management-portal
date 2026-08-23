import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly localUploadDir: string;
  private useLocalFallback = false;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('STORAGE_ENDPOINT');
    const region = this.configService.get<string>('STORAGE_REGION', 'us-east-1');
    const accessKeyId = this.configService.get<string>('STORAGE_ACCESS_KEY', '');
    const secretAccessKey = this.configService.get<string>('STORAGE_SECRET_KEY', '');

    this.bucket = this.configService.get<string>('STORAGE_BUCKET', 'civicconnect');

    this.s3Client = new S3Client({
      region,
      endpoint: endpoint || undefined,
      forcePathStyle: !!endpoint, // Required for MinIO and S3-compatible services
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    // Local fallback directory for when S3/MinIO is unavailable
    this.localUploadDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(this.localUploadDir)) {
      fs.mkdirSync(this.localUploadDir, { recursive: true });
    }

    this.logger.log(
      `Storage initialized: bucket=${this.bucket}, endpoint=${endpoint || 'AWS S3'}, localFallback=${this.localUploadDir}`,
    );
  }

  /**
   * Upload a file to S3/MinIO storage, with local filesystem fallback.
   */
  async upload(key: string, buffer: Buffer, mimeType: string): Promise<void> {
    try {
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: mimeType,
        }),
      );
      this.logger.log(`Uploaded to S3: ${key} (${buffer.length} bytes)`);
    } catch (error) {
      this.logger.warn(
        `S3 upload failed for ${key}, using local fallback: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Fallback to local filesystem
      await this.uploadLocal(key, buffer);
      this.useLocalFallback = true;
    }
  }

  /**
   * Download a file from S3/MinIO storage, with local filesystem fallback.
   */
  async download(key: string): Promise<Buffer> {
    // Try local first if we know S3 is unavailable
    const localPath = path.join(this.localUploadDir, key);
    if (fs.existsSync(localPath)) {
      return fs.readFileSync(localPath);
    }

    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );

      const stream = response.Body;
      if (!stream) {
        throw new Error(`Empty response body for key: ${key}`);
      }

      // Convert readable stream to Buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of stream as AsyncIterable<Uint8Array>) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error) {
      this.logger.error(
        `Download failed for ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Generate a presigned URL for temporary access to a private object.
   * Falls back to a local serve path when S3 is unavailable.
   */
  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    // If file exists locally, return a local URL path
    const localPath = path.join(this.localUploadDir, key);
    if (fs.existsSync(localPath)) {
      return `/api/uploads/${key}`;
    }

    try {
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      return url;
    } catch (error) {
      this.logger.error(
        `Signed URL generation failed for ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Check if a file exists (locally or in S3).
   */
  fileExistsLocally(key: string): boolean {
    const localPath = path.join(this.localUploadDir, key);
    return fs.existsSync(localPath);
  }

  /**
   * Get the local file path for a key.
   */
  getLocalPath(key: string): string {
    return path.join(this.localUploadDir, key);
  }

  /**
   * Delete a file from S3/MinIO storage and local fallback.
   */
  async delete(key: string): Promise<void> {
    // Delete local copy if exists
    const localPath = path.join(this.localUploadDir, key);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }

    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucket,
          Key: key,
        }),
      );
      this.logger.log(`Deleted: ${key}`);
    } catch (error) {
      this.logger.warn(
        `S3 delete failed for ${key}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Save file to local filesystem.
   */
  private async uploadLocal(key: string, buffer: Buffer): Promise<void> {
    const filePath = path.join(this.localUploadDir, key);
    const dir = path.dirname(filePath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(filePath, buffer);
    this.logger.log(`Uploaded to local: ${filePath} (${buffer.length} bytes)`);
  }
}
