import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';
import { cards } from './cards';

export const animationJobs = pgTable('animation_jobs', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.userId),
  cardId: integer('card_id')
    .notNull()
    .references(() => cards.id),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // pending, processing, complete, failed
  imageUrl: text('image_url').notNull(),
  animationPrompt: text('animation_prompt'),
  result: jsonb('result'), // Will store { videoUrl, replicateUrl, uploadDetails }
  error: text('error'),
  workerId: varchar('worker_id', { length: 50 }), // ID of the worker processing this job
  completedAt: timestamp('completed_at'), // When the job was completed
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
