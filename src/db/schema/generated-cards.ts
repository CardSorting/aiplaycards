import {
  boolean,
  integer,
  json,
  pgTable,
  serial,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { users } from './users';

export const generatedCards = pgTable('generated_cards', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 255 })
    .notNull()
    .references(() => users.userId),

  // Pokemon identification
  pokemonName: varchar('pokemon_name', { length: 100 }).notNull(),

  // Basic card data
  name: varchar('name', { length: 255 }).notNull(),
  subname: varchar('subname', { length: 255 }),
  hitpoints: integer('hitpoints').notNull(),
  supertypeId: integer('supertype_id').notNull(),
  typeId: integer('type_id').notNull(),
  subtypeId: integer('subtype_id').notNull(),
  variationId: integer('variation_id'),
  rarityId: integer('rarity_id'),

  // Type effectiveness
  weaknessTypeId: integer('weakness_type_id'),
  resistanceTypeId: integer('resistance_type_id'),
  retreatCost: integer('retreat_cost'),

  // Card info
  illustrator: varchar('illustrator', { length: 255 }),
  cardNumber: varchar('card_number', { length: 50 }),
  totalInSet: varchar('total_in_set', { length: 50 }),

  // Pokedex data
  dexStats: varchar('dex_stats', { length: 500 }),

  description: varchar('description', { length: 1000 }),

  // Ability data
  hasAbility: boolean('has_ability').default(false),
  abilityData: json('ability_data').$type<{
    name: string;
    description: string;
  } | null>(),

  // Move data
  move1Data: json('move1_data').$type<{
    name: string;
    description: string;
    damageAmount: number | string;
    damageModifier: string | null;
    energyCost: Array<{ amount: number; typeId: number }>;
  } | null>(),

  hasMove2: boolean('has_move2').default(false),
  move2Data: json('move2_data').$type<{
    name: string;
    description: string;
    damageAmount: number | string;
    damageModifier: string | null;
    energyCost: Array<{ amount: number; typeId: number }>;
  } | null>(),

  // Generation metadata
  generationModel: varchar('generation_model', { length: 100 }).default(
    'gemini-2.5-flash',
  ),
  creditsCost: integer('credits_cost').notNull().default(2),
  generationTime: integer('generation_time_ms'), // Time taken to generate in milliseconds

  // Full AI response for debugging/analysis
  rawAiResponse: json('raw_ai_response').$type<Record<string, unknown>>(),

  // Timestamps
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type GeneratedCard = typeof generatedCards.$inferSelect;
export type NewGeneratedCard = typeof generatedCards.$inferInsert;
