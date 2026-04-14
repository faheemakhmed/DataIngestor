import winston from 'winston';
export declare const logger: winston.Logger;
export declare function createCorrelationId(): string;
export declare function logWithCorrelation(correlationId: string, level: 'info' | 'warn' | 'error' | 'debug', message: string, meta?: Record<string, unknown>): void;
//# sourceMappingURL=logger.d.ts.map