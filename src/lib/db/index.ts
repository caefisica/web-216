import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Database = NodePgDatabase<typeof schema>;

let dbPromise: Promise<Database> | undefined;
let pool: Pool | undefined;

function safeConnectionMeta(connectionString: string) {
  try {
    const url = new URL(connectionString);
    return {
      host: url.hostname,
      port: url.port || "(default)",
      database: url.pathname.replace(/^\//, "") || "(none)",
      user: url.username || "(none)",
    };
  } catch {
    return null;
  }
}

async function resolveConnectionString(): Promise<string> {
  try {
    const context = await getCloudflareContext({ async: true });
    const hyperdrive = (context.env as { HYPERDRIVE?: { connectionString?: string } }).HYPERDRIVE;
    const hyperdriveConnectionString = hyperdrive?.connectionString;

    if (hyperdriveConnectionString) {
      console.info("db: using hyperdrive connection", safeConnectionMeta(hyperdriveConnectionString));
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

  console.info("db: using DATABASE_URL connection", safeConnectionMeta(databaseUrl));
  return databaseUrl;
}

export async function getDb(): Promise<Database> {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    const connectionString = await resolveConnectionString();
    pool = new Pool({
      connectionString,
      max: 1,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 10_000,
      keepAlive: true,
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
