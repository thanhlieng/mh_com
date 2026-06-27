import { Logger } from '@nestjs/common';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { ILog } from './log.interface';

export class CommonLogger extends Logger {
  private winstonLogger: winston.Logger;

  constructor(context?: string, isTimestampEnabled?: boolean) {
    super(context);
    const winstonTransports = new winston.transports.DailyRotateFile({
      filename: '%DATE%.log',
      dirname: './logs/',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
    });
    this.winstonLogger = winston.createLogger({
      transports: winstonTransports,
    });
  }

  customError(message: string, trace: string, log: ILog) {
    this.winstonLogger.error(message, log);
    super.error(message, trace);
  }

  customInfo(message: string) {
    this.winstonLogger.info(message);
  }
}
