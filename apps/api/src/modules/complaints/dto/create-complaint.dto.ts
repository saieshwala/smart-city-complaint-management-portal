import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { LocationSource } from '@prisma/client';

export class CreateComplaintDto {
  @ApiProperty({
    description: 'Title of the complaint',
    minLength: 5,
    maxLength: 500,
    example: 'Broken streetlight on MG Road',
  })
  @IsString()
  @MinLength(5)
  @MaxLength(500)
  title: string;

  @ApiProperty({
    description: 'Detailed description of the complaint',
    minLength: 10,
    maxLength: 5000,
    example: 'The streetlight near the bus stop on MG Road has been broken for 2 weeks.',
  })
  @IsString()
  @MinLength(10)
  @MaxLength(5000)
  description: string;

  @ApiPropertyOptional({
    description: 'Category ID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({
    description: 'Subcategory ID',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  subcategoryId?: string;

  @ApiPropertyOptional({
    description: 'Latitude of the complaint location',
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Longitude of the complaint location',
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({
    description: 'Human-readable address of the complaint location',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'How the location was determined',
    enum: LocationSource,
  })
  @IsOptional()
  @IsEnum(LocationSource)
  locationSource?: LocationSource;

  @ApiProperty({
    description: 'Date when the issue was reported/observed',
    example: '2026-08-15T10:30:00.000Z',
  })
  @IsDateString()
  reportedAt: string;
}
