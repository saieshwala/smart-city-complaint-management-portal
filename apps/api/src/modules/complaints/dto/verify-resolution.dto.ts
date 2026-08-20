import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerifyResolutionDto {
  @ApiProperty({
    description: 'Whether the citizen confirms the issue is resolved',
    example: true,
  })
  @IsBoolean()
  verified: boolean;

  @ApiPropertyOptional({
    description: 'Optional note from the citizen about the resolution',
    example: 'Yes, the streetlight has been repaired. Thank you!',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
