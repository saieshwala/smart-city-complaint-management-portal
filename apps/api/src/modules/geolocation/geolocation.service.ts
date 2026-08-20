import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GeocodeResult {
  country: string;
  state: string;
  district: string;
  city: string;
  ward: string | null;
  postalCode: string | null;
  formattedAddress: string;
}

@Injectable()
export class GeolocationService {
  private readonly logger = new Logger(GeolocationService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Reverse-geocode latitude/longitude into a structured address.
   *
   * For MVP, uses the free Nominatim (OpenStreetMap) API.
   * The MAP_PROVIDER config key can be used to switch providers in the future.
   */
  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
    const provider = this.configService.get<string>('MAP_PROVIDER', 'nominatim');

    this.logger.log(
      `Reverse geocoding (${lat}, ${lng}) using provider: ${provider}`,
    );

    try {
      const url =
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;

      const response = await fetch(url, {
        headers: {
          'User-Agent': 'MultiConnectedComplaintPortal/1.0',
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Nominatim responded with status ${response.status}`);
      }

      const data = await response.json();
      const address = data.address || {};

      return {
        country: address.country || 'India',
        state: address.state || '',
        district: address.county || address.state_district || '',
        city:
          address.city ||
          address.town ||
          address.village ||
          address.hamlet ||
          '',
        ward: address.suburb || address.neighbourhood || null,
        postalCode: address.postcode || null,
        formattedAddress: data.display_name || '',
      };
    } catch (error) {
      this.logger.warn(
        `Reverse geocoding failed for (${lat}, ${lng}): ${error.message}. Returning mock data.`,
      );

      // Fallback mock data for development
      return {
        country: 'India',
        state: 'Maharashtra',
        district: 'Pune',
        city: 'Pune',
        ward: 'Ward 1',
        postalCode: '411001',
        formattedAddress: `Mock address for (${lat}, ${lng})`,
      };
    }
  }
}
