import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { GeolocationService } from './geolocation.service';
import { JurisdictionService } from './jurisdiction.service';

@ApiTags('Geolocation')
@Controller()
export class GeolocationController {
  constructor(
    private readonly geolocationService: GeolocationService,
    private readonly jurisdictionService: JurisdictionService,
  ) {}

  @Get('geocode/reverse')
  @ApiOperation({ summary: 'Reverse geocode a lat/lng pair into an address' })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude' })
  @ApiQuery({ name: 'lng', type: Number, description: 'Longitude' })
  async reverseGeocode(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    return this.geolocationService.reverseGeocode(
      parseFloat(lat),
      parseFloat(lng),
    );
  }

  @Get('jurisdiction')
  @ApiOperation({
    summary: 'Get the governing authority, ward, and departments for a location',
  })
  @ApiQuery({ name: 'lat', type: Number, description: 'Latitude' })
  @ApiQuery({ name: 'lng', type: Number, description: 'Longitude' })
  async getJurisdiction(
    @Query('lat') lat: string,
    @Query('lng') lng: string,
  ) {
    return this.jurisdictionService.getJurisdiction(
      parseFloat(lat),
      parseFloat(lng),
    );
  }
}
