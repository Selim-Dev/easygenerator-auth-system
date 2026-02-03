import { Injectable, LoggerService as NestLoggerService, LogLevel } from '@nestjs/common';

@Injectable()
export class LoggerService implements NestLoggerService {
  private context?: string;

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    this.printMessage('LOG', message, context);
  }

  error(message: any, trace?: string, context?: string) {
    this.printMessage('ERROR', message, context);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: any, context?: string) {
    this.printMessage('WARN', message, context);
  }

  debug(message: any, context?: string) {
    this.printMessage('DEBUG', message, context);
  }

  verbose(message: any, context?: string) {
    this.printMessage('VERBOSE', message, context);
  }

  private printMessage(level: string, message: any, context?: string) {
    const timestamp = new Date().toISOString();
    const ctx = context || this.context || 'Application';
    const logMessage = `[${timestamp}] [${level}] [${ctx}] ${message}`;

    switch (level) {
      case 'ERROR':
        console.error(logMessage);
        break;
      case 'WARN':
        console.warn(logMessage);
        break;
      case 'DEBUG':
      case 'VERBOSE':
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }
}
