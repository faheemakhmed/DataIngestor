import 'tsconfig-paths/register';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import routes from './api/routes';
import { logger } from './lib/logger';
import config from './lib/config';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' },
});
app.use('/api', limiter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Data Ingestion Pipeline API',
      version: '1.0.0',
      description: 'Production-grade backend system for fetching, processing, and enriching data from external sources',
    },
    servers: [{ url: `http://localhost:${config.port}` }],
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

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });
  res.status(500).json({ error: 'Internal server error' });
});

const port = config.port;

app.listen(port, () => {
  logger.info(`API server started on port ${port}`, { env: config.nodeEnv });
});

export default app;