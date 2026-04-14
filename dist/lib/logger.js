"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
exports.createCorrelationId = createCorrelationId;
exports.logWithCorrelation = logWithCorrelation;
const winston_1 = __importDefault(require("winston"));
const uuid_1 = require("uuid");
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), winston_1.default.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `${timestamp} [${correlationId || 'no-corr'}] ${level}: ${message} ${metaStr}`;
}));
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), logFormat)
        })
    ]
});
function createCorrelationId() {
    return (0, uuid_1.v4)();
}
function logWithCorrelation(correlationId, level, message, meta) {
    exports.logger.log(level, message, { correlationId, ...meta });
}
//# sourceMappingURL=logger.js.map