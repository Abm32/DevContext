import { pgTable, serial, varchar, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export const e2emGrants = pgTable("e2em_grants", {
  id: serial("id").primaryKey(),
  github_username: varchar("github_username", { length: 100 }).notNull(),
  repos: jsonb("repos").$type<string[]>().notNull().default([]),
  recipient_name: varchar("recipient_name", { length: 200 }).notNull().default("Sir"),
  recipient_email: varchar("recipient_email", { length: 200 }),
  user_display_name: varchar("user_display_name", { length: 200 }),
  enabled: boolean("enabled").notNull().default(true),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type E2emGrant = typeof e2emGrants.$inferSelect;
export type InsertE2emGrant = typeof e2emGrants.$inferInsert;
