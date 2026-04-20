import {
  pgTable,
  text,
  numeric,
  timestamp,
  integer,
  uuid,
  boolean,
  pgEnum,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { z } from 'zod'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const assetTypeEnum = pgEnum('asset_type', [
  'etf',
  'stock',
  'crypto',
  'unit_trust',
  'cash',
  'bond',
  'reit',
  'other',
])

export const brokerEnum = pgEnum('broker', [
  'easy_equities',
  'luno',
  'satrix',
  'allan_gray',
  'tfg',
  'absa',
  'fnb',
  'nedbank',
  'standard_bank',
  'other',
])

export const reminderFrequencyEnum = pgEnum('reminder_frequency', [
  'weekly',
  'biweekly',
  'monthly',
])

// ─── Assets ───────────────────────────────────────────────────────────────────

export const assets = pgTable('assets', {
  id:        uuid('id').primaryKey().defaultRandom(),
  name:      text('name').notNull(),
  ticker:    text('ticker'),
  type:      assetTypeEnum('type').notNull().default('etf'),
  broker:    brokerEnum('broker').notNull().default('easy_equities'),
  color:     text('color').notNull().default('#1B3A8A'),
  isActive:  boolean('is_active').notNull().default(true),
  notes:     text('notes'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

// ─── Deposits ─────────────────────────────────────────────────────────────────

export const deposits = pgTable('deposits', {
  id:          uuid('id').primaryKey().defaultRandom(),
  assetId:     uuid('asset_id').notNull().references(() => assets.id, { onDelete: 'cascade' }),
  amount:      numeric('amount', { precision: 12, scale: 2 }).notNull(),
  depositedAt: timestamp('deposited_at').notNull(),
  notes:       text('notes'),
  createdAt:   timestamp('created_at').notNull().defaultNow(),
})

// ─── Snapshots ────────────────────────────────────────────────────────────────

export const snapshots = pgTable('snapshots', {
  id:         uuid('id').primaryKey().defaultRandom(),
  assetId:    uuid('asset_id').notNull().references(() => assets.id, { onDelete: 'cascade' }),
  value:      numeric('value', { precision: 12, scale: 2 }).notNull(),
  snapshotAt: timestamp('snapshot_at').notNull(),
  notes:      text('notes'),
  createdAt:  timestamp('created_at').notNull().defaultNow(),
})

// ─── Portfolio Snapshots ──────────────────────────────────────────────────────
// Aggregate totals per snapshot date — computed & cached after bulk entry

export const portfolioSnapshots = pgTable('portfolio_snapshots', {
  id:             uuid('id').primaryKey().defaultRandom(),
  snapshotAt:     timestamp('snapshot_at').notNull().unique(),
  totalValue:     numeric('total_value', { precision: 12, scale: 2 }).notNull(),
  totalDeposited: numeric('total_deposited', { precision: 12, scale: 2 }).notNull(),
  pnl:            numeric('pnl', { precision: 12, scale: 2 }).notNull(),
  pnlPct:         numeric('pnl_pct', { precision: 8, scale: 4 }).notNull(),
  createdAt:      timestamp('created_at').notNull().defaultNow(),
})

// ─── AI Insights ──────────────────────────────────────────────────────────────

export const aiInsights = pgTable('ai_insights', {
  id:         uuid('id').primaryKey().defaultRandom(),
  snapshotAt: timestamp('snapshot_at').notNull(),
  prompt:     text('prompt').notNull(),
  response:   text('response').notNull(),
  model:      text('model').notNull(),
  createdAt:  timestamp('created_at').notNull().defaultNow(),
})

// ─── User Settings ────────────────────────────────────────────────────────────

export const userSettings = pgTable('user_settings', {
  id:                 integer('id').primaryKey().default(1),
  firstName:          text('first_name').notNull().default('Investor'),
  reminderEmail:      text('reminder_email').notNull().default(''),
  reminderFrequency:  reminderFrequencyEnum('reminder_frequency').notNull().default('weekly'),
  reminderDay:        text('reminder_day').notNull().default('monday'),
  reminderTime:       text('reminder_time').notNull().default('08:00'),
  currencySymbol:     text('currency_symbol').notNull().default('R'),
  updatedAt:          timestamp('updated_at').notNull().defaultNow(),
})

// ─── Relations ────────────────────────────────────────────────────────────────

export const assetsRelations = relations(assets, ({ many }) => ({
  deposits:  many(deposits),
  snapshots: many(snapshots),
}))

export const depositsRelations = relations(deposits, ({ one }) => ({
  asset: one(assets, { fields: [deposits.assetId], references: [assets.id] }),
}))

export const snapshotsRelations = relations(snapshots, ({ one }) => ({
  asset: one(assets, { fields: [snapshots.assetId], references: [assets.id] }),
}))

// ─── Zod Schemas ──────────────────────────────────────────────────────────────

export const insertAssetSchema = createInsertSchema(assets, {
  name:  z.string().min(1, 'Name is required').max(100),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
})

export const insertDepositSchema = createInsertSchema(deposits, {
  amount: z.string().refine(v => parseFloat(v) > 0, 'Amount must be greater than 0'),
})

export const insertSnapshotSchema = createInsertSchema(snapshots, {
  value: z.string().refine(v => parseFloat(v) >= 0, 'Value must be 0 or greater'),
})

export const updateSettingsSchema = createInsertSchema(userSettings).omit({ id: true })

// ─── Types ────────────────────────────────────────────────────────────────────

export type Asset            = typeof assets.$inferSelect
export type InsertAsset      = typeof assets.$inferInsert
export type Deposit          = typeof deposits.$inferSelect
export type InsertDeposit    = typeof deposits.$inferInsert
export type Snapshot         = typeof snapshots.$inferSelect
export type InsertSnapshot   = typeof snapshots.$inferInsert
export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect
export type AiInsight        = typeof aiInsights.$inferSelect
export type UserSettings     = typeof userSettings.$inferSelect
