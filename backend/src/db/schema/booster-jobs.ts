import {
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const boosterJobs = pgTable('booster_jobs', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.userId),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, processing, complete, failed
  result: jsonb('result'),
  error: text('error'),
  workerId: varchar('worker_id', { length: 50 }), // ID of the worker processing this job
  completedAt: timestamp('completed_at'), // When the job was completed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
