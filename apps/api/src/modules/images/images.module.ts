import { Module } from '@nestjs/common';
import { StorageModule } from '../common/storage/storage.module';
import { ImagesService } from './images.service';
import { ImagesController } from './images.controller';
import { ImageProcessorService } from './image-processor.service';
import { MetadataExtractorService } from './metadata-extractor.service';

@Module({
  imports: [StorageModule],
  controllers: [ImagesController],
  providers: [ImagesService, ImageProcessorService, MetadataExtractorService],
  exports: [ImagesService, ImageProcessorService, MetadataExtractorService],
})
export class ImagesModule {}
