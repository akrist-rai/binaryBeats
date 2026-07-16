/**
 * Drizzle database connection — uses node-postgres (pg) driver for the
 * long-running Koa server. Reads DATABASE_URL from environment (set in
 * server/.env or the deployment environment).
 */
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "[db] DATABASE_URL is not set. " +
    "Create server/.env with DATABASE_URL=postgresql://... (get from neon.tech)"
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Neon requires SSL
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;
