import { defineConfig } from "drizzle-kit";
import path from "path";

// Ensure environment variable exists
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "❌ DATABASE_URL must be set. Did you forget to configure your environment?"
  );
}

export default defineConfig({
  out: path.resolve(__dirname, "./migrations"),
  schema: path.resolve(__dirname, "./shared/**/*.ts"), // safer glob, recursive
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  verbose: true,      // enable detailed logs in dev/CI
  strict: true        // enforce stricter migration safety
});
