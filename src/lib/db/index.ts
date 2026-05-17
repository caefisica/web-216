import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// For long-running processes (like dev server), use a singleton or pool
const client = postgres(connectionString, { max: 1, idle_timeout: 20, max_lifetime: 60 * 30 });
export const db = drizzle(client, { schema });
