import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// Singleton pattern to prevent multiple database connections in development
const globalForDb = globalThis as unknown as {
  sqlite: Database.Database | undefined;
};

if (!globalForDb.sqlite) {
  const dbPath =
    process.env.DATABASE_PATH?.replace("file:", "") || "./tempo.db";
  globalForDb.sqlite = new Database(dbPath);

  // Enable WAL mode for better concurrency
  globalForDb.sqlite.pragma("journal_mode = WAL");
  globalForDb.sqlite.pragma("busy_timeout = 5000"); // Wait up to 5 seconds for locks
}

const sqlite = globalForDb.sqlite;
export const db = drizzle(sqlite, { schema });
