import {
  Controller,
  Post,
  Get,
  Param,
  Res,
  UseInterceptors,
  UploadedFiles,
  ParseUUIDPipe,
  UseGuards,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ImagesService } from './images.service';

@ApiTags('images')
@Controller('complaints/:id/images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload complaint images (max 5 files)',
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
          maxItems: 5,
        },
      },
    },
  })
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: {
        fileSize: 20 * 1024 * 1024, // 20MB per file
      },
    }),
  )
  async uploadImages(
    @Param('id', ParseUUIDPipe) complaintId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('At least one image file is required');
    }

    const images = await this.imagesService.uploadImages(complaintId, files);

    return {
      message: `${images.length} image(s) uploaded successfully`,
      data: images,
    };
  }

  @Get(':imageId')
  async getImage(
    @Param('id', ParseUUIDPipe) complaintId: string,
    @Param('imageId', ParseUUIDPipe) imageId: string,
    @Res() res: Response,
  ) {
    const { buffer, mimeType } = await this.imagesService.getImageFile(
      complaintId,
      imageId,
    );

    res.set({
      'Content-Type': mimeType,
      'Content-Length': buffer.length.toString(),
      'Cache-Control': 'public, max-age=3600',
    });
    res.send(buffer);
  }
}
