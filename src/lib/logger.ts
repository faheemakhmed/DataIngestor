import winston from 'winston';
import { v4 as uuidv4 } from 'uuid';

const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${correlationId || 'no-corr'}] ${level}: ${message} ${metaStr}`;
  })
);

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        logFormat
      )
    })
  ]
});

export function createCorrelationId(): string {
  return uuidv4();
}

export function logWithCorrelation(correlationId: string, level: 'info' | 'warn' | 'error' | 'debug', message: string, meta?: Record<string, unknown>) {
  logger.log(level, message, { correlationId, ...meta });
}