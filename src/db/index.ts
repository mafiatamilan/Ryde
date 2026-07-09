import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as authSchema from "./schema/auth";
import * as mainSchema from "./schema";

const sqlite = new Database(process.env.DATABASE_URL!.replace("file:", ""));
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

export const db = drizzle(sqlite, {
  schema: { ...authSchema, ...mainSchema },
});
