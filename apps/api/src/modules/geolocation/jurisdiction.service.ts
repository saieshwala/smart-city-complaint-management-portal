import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';

export interface JurisdictionResult {
  authority: {
    id: string;
    name: string;
    type: string;
    city: string;
    district: string;
    state: string;
  } | null;
  ward: string | null;
  departments: Array<{
    id: string;
    name: string;
    slug: string;
    description: string | null;
  }>;
}

@Injectable()
export class JurisdictionService {
  private readonly logger = new Logger(JurisdictionService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Determine the governing authority and its departments for a given
   * geographic coordinate.
   *
   * For MVP, returns the first active authority with its departments.
   * In a future release, PostGIS spatial queries will be used to match
   * the point against authority boundary polygons.
   */
  async getJurisdiction(
    lat: number,
    lng: number,
  ): Promise<JurisdictionResult> {
    this.logger.log(
      `Looking up jurisdiction for (${lat}, ${lng}) — MVP: returning first active authority`,
    );

    const authority = await this.prisma.authority.findFirst({
      where: { isActive: true },
      include: {
        departments: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
          orderBy: { name: 'asc' },
        },
      },
    });

    if (!authority) {
      return {
        authority: null,
        ward: null,
        departments: [],
      };
    }

    return {
      authority: {
        id: authority.id,
        name: authority.name,
        type: authority.type,
        city: authority.city,
        district: authority.district,
        state: authority.state,
      },
      ward: null, // Will be determined via PostGIS in the future
      departments: authority.departments,
    };
  }
}
