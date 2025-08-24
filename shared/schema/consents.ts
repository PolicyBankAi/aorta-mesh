import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/pg-core";

// GDPR Consent Tracking Table
export const consents = pgTable(
  "consents",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // FK to users table (logical link, enforce in migrations if needed)
    userId: uuid("user_id").notNull(),

    // e.g. "gdpr_data_processing", "research", "email_marketing"
    consentType: text("consent_type").notNull(),

    // Consent lifecycle
    grantedAt: timestamp("granted_at").defaultNow().notNull(),
    withdrawn: boolean("withdrawn").default(false).notNull(),
    withdrawnAt: timestamp("withdrawn_at"), // null until withdrawn

    // Audit timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Optimize queries like: SELECT * FROM consents WHERE user_id=? AND consent_type=?
    userConsentIdx: index("consents_user_consent_idx").on(
      table.userId,
      table.consentType,
    ),
  }),
);
