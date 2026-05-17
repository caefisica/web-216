import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, {
  prepare: false, // required for Supabase Transaction pooler (port 6543)
  max: 1,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
});

export const db = drizzle(client, { schema });
