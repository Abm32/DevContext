import { pgTable, serial, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  event_type: varchar("event_type", { length: 60 }).notNull(),
  page: varchar("page", { length: 200 }),
  element: varchar("element", { length: 100 }),
  user_id: integer("user_id"),
  user_login: varchar("user_login", { length: 100 }),
  session_id: varchar("session_id", { length: 64 }),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;
