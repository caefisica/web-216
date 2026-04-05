import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../schema";
import * as auth from "./auth";
import * as library from "./library";

export async function runSeeds(db: PostgresJsDatabase<typeof schema>) {
  console.log("Starting modular seeding...");
  await auth.seed(db);
  await library.seed(db);
  console.log("Seeding complete!");
}

export const SEED_MODULE_FUNCTIONS = [auth.seed.toString(), library.seed.toString()];
