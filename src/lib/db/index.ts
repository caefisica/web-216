import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Database = NodePgDatabase<typeof schema>;

let dbPromise: Promise<Database> | undefined;
let pool: Pool | undefined;

async function resolveConnectionString(): Promise<string> {
  try {
    const context = await getCloudflareContext({ async: true });
    const hyperdrive = (context.env as { HYPERDRIVE?: { connectionString?: string } }).HYPERDRIVE;
    const hyperdriveConnectionString = hyperdrive?.connectionString;

    if (hyperdriveConnectionString) {
      return hyperdriveConnectionString;
    }
  } catch {
    // No Cloudflare runtime context available (for example local Node scripts).
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "No database connection configured. Set DATABASE_URL for local/runtime environments or configure a Hyperdrive binding named HYPERDRIVE.",
    );
  }

  return databaseUrl;
}

export async function getDb(): Promise<Database> {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    const connectionString = await resolveConnectionString();
    pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 20_000,
      allowExitOnIdle: true,
    });

    return drizzle({ client: pool, schema });
  })();

  return dbPromise;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
  dbPromise = undefined;
}
