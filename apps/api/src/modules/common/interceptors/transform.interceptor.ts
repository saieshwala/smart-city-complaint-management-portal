import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface SuccessResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Checks whether the payload looks like a paginated result.
 */
function isPaginatedResult(data: unknown): data is PaginatedResult<unknown> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'items' in data &&
    'meta' in data &&
    Array.isArray((data as PaginatedResult<unknown>).items)
  );
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, SuccessResponse<T>>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<SuccessResponse<T>> {
    return next.handle().pipe(
      map((data: unknown) => {
        // If the response is already wrapped, pass through
        if (
          typeof data === 'object' &&
          data !== null &&
          'data' in data &&
          Object.prototype.hasOwnProperty.call(data, 'data')
        ) {
          return data as SuccessResponse<T>;
        }

        // Handle paginated responses
        if (isPaginatedResult(data)) {
          return {
            data: data.items as unknown as T,
            meta: data.meta,
          };
        }

        // Wrap plain responses
        return {
          data: data as T,
        };
      }),
    );
  }
}
