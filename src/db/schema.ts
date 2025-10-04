import { relations } from 'drizzle-orm';
import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  primaryKey,
  doublePrecision,
  boolean,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

// ============ NextAuth Tables ============

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  password: text('password'), // For credentials provider
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').notNull().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// ============ Application Tables ============

export const decks = pgTable(
  'decks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    dailyNewLimit: integer('daily_new_limit').default(20).notNull(),
    dailyReviewLimit: integer('daily_review_limit').default(200).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('decks_user_id_idx').on(table.userId),
  })
);

export const cardTypeEnum = pgEnum('card_type', ['basic', 'cloze', 'occlusion']);

export const cards = pgTable(
  'cards',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    deckId: uuid('deck_id')
      .notNull()
      .references(() => decks.id, { onDelete: 'cascade' }),
    type: cardTypeEnum('type').notNull().default('basic'),
    front: text('front').notNull(),
    back: text('back'),
    clozeJson: text('cloze_json'), // JSON string for cloze deletions
    occlusionJson: text('occlusion_json'), // JSON string for occlusion masks
    tags: text('tags').array().default([]).notNull(),
    mediaUrls: text('media_urls').array().default([]).notNull(),
    
    // SRS fields
    easeFactor: doublePrecision('ease_factor').default(2.5).notNull(),
    interval: integer('interval').default(0).notNull(), // Days
    repetitions: integer('repetitions').default(0).notNull(),
    dueAt: timestamp('due_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
    lastReviewedAt: timestamp('last_reviewed_at', { mode: 'date', withTimezone: true }),
    lapseCount: integer('lapse_count').default(0).notNull(),
    suspended: boolean('suspended').default(false).notNull(),
    
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    deckIdIdx: index('cards_deck_id_idx').on(table.deckId),
    dueAtIdx: index('cards_due_at_idx').on(table.dueAt),
    deckIdDueAtIdx: index('cards_deck_id_due_at_idx').on(table.deckId, table.dueAt),
    tagsIdx: index('cards_tags_idx').on(table.tags),
  })
);

export const ratingEnum = pgEnum('rating', ['again', 'hard', 'good', 'easy']);

export const reviewLogs = pgTable(
  'review_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    cardId: uuid('card_id')
      .notNull()
      .references(() => cards.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    deckId: uuid('deck_id')
      .notNull()
      .references(() => decks.id, { onDelete: 'cascade' }),
    rating: ratingEnum('rating').notNull(),
    scheduledInterval: integer('scheduled_interval').notNull(),
    newEaseFactor: doublePrecision('new_ease_factor').notNull(),
    createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    cardIdIdx: index('review_logs_card_id_idx').on(table.cardId),
    userIdIdx: index('review_logs_user_id_idx').on(table.userId),
    deckIdIdx: index('review_logs_deck_id_idx').on(table.deckId),
    createdAtIdx: index('review_logs_created_at_idx').on(table.createdAt),
  })
);

// ============ Relations ============

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  decks: many(decks),
  reviewLogs: many(reviewLogs),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const decksRelations = relations(decks, ({ one, many }) => ({
  user: one(users, {
    fields: [decks.userId],
    references: [users.id],
  }),
  cards: many(cards),
  reviewLogs: many(reviewLogs),
}));

export const cardsRelations = relations(cards, ({ one, many }) => ({
  deck: one(decks, {
    fields: [cards.deckId],
    references: [decks.id],
  }),
  reviewLogs: many(reviewLogs),
}));

export const reviewLogsRelations = relations(reviewLogs, ({ one }) => ({
  card: one(cards, {
    fields: [reviewLogs.cardId],
    references: [cards.id],
  }),
  user: one(users, {
    fields: [reviewLogs.userId],
    references: [users.id],
  }),
  deck: one(decks, {
    fields: [reviewLogs.deckId],
    references: [decks.id],
  }),
}));
