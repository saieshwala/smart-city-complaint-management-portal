import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GeolocationController } from './geolocation.controller';
import { GeolocationService } from './geolocation.service';
import { JurisdictionService } from './jurisdiction.service';

@Module({
  imports: [ConfigModule],
  controllers: [GeolocationController],
  providers: [GeolocationService, JurisdictionService],
  exports: [GeolocationService, JurisdictionService],
})
export class GeolocationModule {}
