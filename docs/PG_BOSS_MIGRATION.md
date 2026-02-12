# Pg-Boss Queue Migration

This document describes the completed migration from an in-memory queue system to pg-boss for persistent, reliable job processing.

## Migration Summary

**From:** In-memory queue (`src/features/booster-queue/memory-queue.ts`)  
**To:** PostgreSQL-based queue using pg-boss (`src/features/booster-queue/pg-boss-queue.ts`)

## Benefits

- **Persistence**: Jobs survive application restarts
- **Reliability**: Failed jobs are automatically retried
- **Scalability**: Multiple workers can process jobs concurrently
- **Monitoring**: Built-in job state tracking and metrics
- **Dead Letter Handling**: Failed jobs are preserved for analysis

## Implementation Details

### New Files Created:

- `src/features/booster-queue/pg-boss-queue.ts` - Main queue implementation
- `src/features/booster-queue/pg-boss-worker.ts` - Worker pool implementation
- `src/features/booster-queue/pg-boss-manager.ts` - Management functions

### Updated Files:

- `src/features/booster-queue/manager.ts` - Now uses pg-boss instead of memory queue
- `src/features/booster-queue/worker-manager.ts` - Now uses pg-boss workers

### Configuration

The system uses the existing `DATABASE_URL` environment variable for PostgreSQL connection.

Pg-boss creates its own schema (`pgboss`) in the database and manages all queue tables automatically.

### Key Features

- **Automatic Retries**: Failed jobs are retried up to 3 times with exponential backoff
- **Priority Queue**: Jobs can be prioritized (lower number = higher priority)
- **Connection Pooling**: Built-in PostgreSQL connection pooling
- **Schema Management**: Automatic database schema creation and migrations
- **Monitoring**: Built-in queue statistics and health checks

## Usage

The API remains the same - all existing code using `addJobToQueue()` and related functions will continue to work without changes.

```typescript
import { addJobToQueue } from '../features/booster-queue/manager';

// Add a job (same API as before)
const job = {
  id: 123,
  userId: 'user123',
  baseUrl: 'http://localhost:3000',
  priority: 1,
  metadata: { test: true },
};

await addJobToQueue(job);
```

## Testing

Test scripts are available:

- `scripts/test-pg-boss.ts` - Comprehensive test suite
- `scripts/test-pg-boss-basic.ts` - Quick functionality test

Run with:

```bash
DATABASE_URL="your_connection_string" npx tsx scripts/test-pg-boss-basic.ts
```

## Monitoring

Queue stats are available via the existing `getQueueStats()` function:

```typescript
import { getQueueStats } from '../features/booster-queue/manager';

const stats = await getQueueStats();
console.log(stats);
```

The stats now include:

- Message count in queue
- Worker/consumer count
- Health status
- Advanced features status (dead letter, connection pooling, etc.)

## Migration Completed

✅ All queue operations now use PostgreSQL via pg-boss  
✅ Jobs persist across application restarts  
✅ Automatic retry logic implemented  
✅ Connection pooling enabled  
✅ Dead letter handling configured  
✅ Backward compatibility maintained

The migration is complete and the system is ready for production use.
