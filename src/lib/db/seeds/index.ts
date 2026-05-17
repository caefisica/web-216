import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../schema";
import { runBootstrapSeed } from "./bootstrap";
import { runDemoSeed } from "./demo";

export async function runSeeds(db: PostgresJsDatabase<typeof schema>) {
  console.log("Starting seeds...");
  await runBootstrapSeed(db);
  if (process.env.NODE_ENV !== "production") {
    await runDemoSeed(db);
  }
  console.log("Seeding complete.");
}
