import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

// GDPR Consent Tracking Table
export const consents = pgTable("consents", {
  id: uuid("id").primaryKey().defaultRandom(),       // Unique ID
  user_id: uuid("user_id").notNull(),                // FK to users table
  consent_type: text("consent_type").notNull(),      // e.g. "gdpr_data_processing"
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  withdrawn: boolean("withdrawn").default(false).notNull(), // Track withdrawal
});
