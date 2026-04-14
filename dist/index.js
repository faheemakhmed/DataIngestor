"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("tsconfig-paths/register");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const routes_1 = __importDefault(require("./api/routes"));
const logger_1 = require("./lib/logger");
const config_1 = __importDefault(require("./lib/config"));
const app = (0, express_1.default)();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later' },
});
app.use('/api', limiter);
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
app.use('/api', routes_1.default);
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Data Ingestion Pipeline API',
            version: '1.0.0',
            description: 'Production-grade backend system for fetching, processing, and enriching data from external sources',
        },
        servers: [{ url: `http://localhost:${config_1.default.port}` }],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        name: { type: 'string' },
                    },
                },
                Source: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        type: { type: 'string', enum: ['API', 'RSS', 'CSV', 'JSON'] },
                        config: { type: 'object' },
                        isActive: { type: 'boolean' },
                    },
                },
                Record: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        sourceId: { type: 'string' },
                        externalId: { type: 'string' },
                        payload: { type: 'object' },
                        status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] },
                    },
                },
                Job: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        type: { type: 'string', enum: ['INGEST', 'NORMALIZE', 'ENRICH'] },
                        status: { type: 'string', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'DEAD_LETTER'] },
                        retries: { type: 'number' },
                    },
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/api/routes.ts', './src/modules/**/*.ts'],
};
const swaggerDocs = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerDocs));
app.use((err, req, res, next) => {
    logger_1.logger.error('Unhandled error', { error: err.message, stack: err.stack });
    res.status(500).json({ error: 'Internal server error' });
});
const port = config_1.default.port;
app.listen(port, () => {
    logger_1.logger.info(`API server started on port ${port}`, { env: config_1.default.nodeEnv });
});
exports.default = app;
//# sourceMappingURL=index.js.map