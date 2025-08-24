import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import * as schema from "@shared/schema";
import { securityLogger } from "./security"; // ✅ use your structured logger

// Use WebSocket driver for Neon
neonConfig.webSocketConstructor = ws;

// ✅ Validate env
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  throw new Error("❌ DATABASE_URL must be set. Did you forget to configure it?");
}

// ✅ Configure pool
export const pool = new Pool({
  connectionString: dbUrl,
  max: parseInt(process.env.DB_MAX_CONNECTIONS || "5", 10), // prevent runaway
  connectionTimeoutMillis: 10_000, // 10s timeout
  idleTimeoutMillis: 30_000, // free idle connections quickly
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: true } : false,
});

// ✅ Create Drizzle instance
export const db = drizzle({ client: pool, schema });

// ✅ Lifecycle hooks
pool.on("connect", () => {
  securityLogger.info("✅ Database connection established");
});

pool.on("error", (err) => {
  securityLogger.error("❌ Database connection error", { error: err.message });
});

// ✅ Graceful shutdown for serverless/long-lived apps
process.on("beforeExit", async () => {
  try {
    await pool.end();
    securityLogger.info("🛑 Database pool closed cleanly");
  } catch (err) {
    securityLogger.error("❌ Failed to close database pool", {
      error: (err as Error).message,
    });
  }
});
