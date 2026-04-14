# Incremental Data Ingestion and Enrichment Pipeline

A production-grade backend system for fetching, processing, and enriching data from external sources with deduplication, retries, and observability.

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Sources   │────▶│    RAW      │────▶│  NORMALIZED │────▶│  ENRICHED   │
│  (API/RSS)  │     │   Records   │     │   Records   │     │   Records   │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                          │                    │                    │
                          ▼                    ▼                    ▼
                    ┌─────────────────────────────────────────────────────┐
                    │                   Job Queue                         │
                    │  INGEST ──▶ NORMALIZE ──▶ ENRICH                   │
                    └─────────────────────────────────────────────────────┘
```

## Project Structure

```
src/
├── modules/
│   ├── auth/           # Authentication (JWT)
│   ├── sources/        # Source CRUD + checkpoints
│   ├── ingestion/      # Raw data fetching
│   ├── pipeline/       # Normalization stage
│   ├── enrichment/     # Data enrichment
│   ├── records/        # Record APIs
│   ├── queue/          # Job queue management
│   └── logging/        # Logging utilities
├── lib/                # Core utilities
│   ├── prisma.ts       # Database client
│   ├── logger.ts       # Winston logger
│   ├── config.ts       # Config management
│   ├── hash.ts         # Hashing utilities
│   └── cache.ts        # In-memory cache
├── workers/            # Background workers
│   ├── ingestion.ts
│   ├── normalization.ts
│   └── enrichment.ts
└── api/                # Express routes
```

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
```bash
# Create database
createdb data_pipeline

# Run migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 3. Configure Environment
Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/data_pipeline"
JWT_SECRET="your-secret-key"
PORT=3000
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Start Workers (separate terminals)
```bash
npm run worker:ingest
npm run worker:normalize
npm run worker:enrich
```

## API Documentation

### Authentication

**POST /api/auth/register**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**POST /api/auth/login**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
Returns: `{ "user": {...}, "token": "jwt-token" }`

### Sources

**GET /api/sources** - List all sources

**POST /api/sources** - Create source
```json
{
  "name": "Users API",
  "type": "API",
  "config": {
    "url": "https://api.example.com/users"
  }
}
```

**POST /api/sources/:id/sync** - Trigger sync

**GET /api/sources/:id/checkpoint** - Get last sync checkpoint

### Records

**GET /api/records** - List records (paginated)
- Query: `?page=1&limit=50&status=completed&sourceId=...`

**GET /api/records/:id** - Get record with full pipeline data

**GET /api/records/enriched** - List enriched records

### Jobs

**GET /api/jobs** - List pending jobs

**GET /api/jobs/:id/logs** - Get job execution logs

**POST /api/jobs/:jobId/reprocess** - Retry failed job

**POST /api/jobs/:jobId/reprocess-dead-letter** - Retry dead letter job

### Pipeline

**POST /api/pipeline/reprocess** - Reprocess from specific stage
```json
{
  "rawRecordId": "uuid"  // Start from normalization
}
```
or
```json
{
  "normalizedRecordId": "uuid"  // Start from enrichment
}
```

## Data Flow

1. **Ingestion**: Fetch from external API → Store as RawRecord → Create normalize job
2. **Normalization**: Transform raw payload → Validate/clean fields → Create enrich job
3. **Enrichment**: Call external API → Cache results → Mark as completed

## Job Queue

- Uses PostgreSQL for job storage
- Supports: PENDING → PROCESSING → COMPLETED/FAILED
- Retry with exponential backoff (max 3 retries)
- Dead letter queue for failed jobs after max retries

## Deduplication

- Content hash generated from sourceId + externalId + payload
- Duplicate records skipped via unique constraints
- Idempotent processing at each stage

## Observability

- Structured logging with Winston
- Correlation IDs for tracking pipeline runs
- Job logs stored in database
- Metrics: job duration, success/failure rates

## Performance

- Batch inserts for raw records
- Database indexes on: hash, sourceId, status, correlationId
- In-memory cache for enrichment results (TTL: 1 hour)
- Pagination for all list endpoints