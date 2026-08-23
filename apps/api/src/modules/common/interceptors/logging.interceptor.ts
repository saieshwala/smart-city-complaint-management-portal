import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';

/** Fields that must never be logged */
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'otp',
  'secret',
  'authorization',
];

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body } = request;
    const requestId = uuidv4();
    const startTime = Date.now();

    // Attach request ID to the request for downstream use
    (request as any)['requestId'] = requestId;

    // Log incoming request (sanitized)
    const sanitizedBody = this.sanitize(body);
    this.logger.log(
      `[${requestId}] --> ${method} ${url} ${
        Object.keys(sanitizedBody).length > 0
          ? JSON.stringify(sanitizedBody)
          : ''
      }`.trim(),
    );

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const statusCode: number = response.statusCode;
          const duration = Date.now() - startTime;

          this.logger.log(
            `[${requestId}] <-- ${method} ${url} ${statusCode} ${duration}ms`,
          );
        },
        error: (error: Error) => {
          const duration = Date.now() - startTime;
          this.logger.error(
            `[${requestId}] <-- ${method} ${url} ERROR ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }

  /**
   * Remove sensitive fields from an object before logging.
   */
  private sanitize(obj: unknown): Record<string, unknown> {
    if (!obj || typeof obj !== 'object') {
      return {};
    }

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }
}
