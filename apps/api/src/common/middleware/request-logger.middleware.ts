import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../logging/logger.service';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: LoggerService) {
    this.logger.setContext('RequestLogger');
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();

    // Log incoming request
    this.logger.log(`Incoming ${method} ${originalUrl} from ${ip}`);

    // Log response when finished
    res.on('finish', () => {
      const { statusCode } = res;
      const responseTime = Date.now() - startTime;
      const logLevel = statusCode >= 400 ? 'error' : 'log';

      const message = `${method} ${originalUrl} ${statusCode} - ${responseTime}ms - ${userAgent}`;

      if (logLevel === 'error') {
        this.logger.error(message);
      } else {
        this.logger.log(message);
      }
    });

    next();
  }
}
