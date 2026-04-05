import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";
import * as schema from "./schema";
import { runSeeds } from "./seeds";
import { computeHashes, readStoredIntegrity, writeStoredIntegrity } from "./integrity";
import { execSync } from "node:child_process";

export async function sync() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
  }

  const client = postgres(connectionString, { max: 1 });
  const db = drizzle(client, { schema });

  console.log("Checking database sync...");

  const { schemaHash, seedHash } = await computeHashes();
  const stored = await readStoredIntegrity(db);

  if (stored.schemaHash === schemaHash && stored.seedHash === seedHash) {
    console.log("Database is up to date (hash matches).");
    await client.end();
    return;
  }

  try {
    if (stored.schemaHash !== schemaHash) {
      console.log("Schema changed. Wiping and regenerating...");

      // 1. Wipe the schema
      await db.execute(sql`DROP SCHEMA public CASCADE`);
      await db.execute(sql`CREATE SCHEMA public`);
      await db.execute(sql`GRANT ALL ON SCHEMA public TO public`);

      // 2. Push Schema
      execSync("bun x drizzle-kit push", { stdio: "inherit", env: process.env });

      // 3. Re-seed everything
      await runSeeds(db);
    } else {
      console.log("Seeds changed. Re-seeding...");
      await runSeeds(db);
    }

    // 4. Update the integrity hashes
    await writeStoredIntegrity(db, { schemaHash, seedHash });

    console.log("Database synchronization complete!");
  } catch (error) {
    console.error("Database sync failed:", error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

if (import.meta.main) {
  sync();
}
