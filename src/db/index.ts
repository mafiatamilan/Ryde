import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as authSchema from "./schema/auth";
import * as mainSchema from "./schema";
import * as fs from "fs";

type Schema = typeof authSchema & typeof mainSchema;

declare global {
  var __db: BetterSQLite3Database<Schema> | undefined;
  var __sqlite: Database.Database | undefined;
}

export function getDb() {
  if (globalThis.__db) return globalThis.__db;
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const rawPath = url.replace("file:", "");

  let path = rawPath;

  // Build workers each need their own DB copy to avoid SQLITE_BUSY
  if (process.env.BUILD_WORKER === "1") {
    const pidPath = rawPath.replace(".db", `-${process.pid}.db`);
    if (!fs.existsSync(pidPath)) {
      const template = rawPath.includes(".db")
        ? rawPath
        : rawPath + ".template";
      if (fs.existsSync(template)) {
        fs.copyFileSync(template, pidPath);
      }
    }
    path = pidPath;
  }

  const sqlite = new Database(path);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  globalThis.__sqlite = sqlite;
  globalThis.__db = drizzle(sqlite, { schema: { ...authSchema, ...mainSchema } });
  return globalThis.__db;
}

export const db = new Proxy({} as BetterSQLite3Database<Schema>, {
  get(_, prop) {
    return (getDb() as any)[prop];
  },
});
