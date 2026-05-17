import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../schema";

const CATEGORIES = [
  { name: "Quantum Mechanics" },
  { name: "Astrophysics" },
  { name: "Computational Physics" },
  { name: "Classical Mechanics" },
  { name: "Thermodynamics & Statistical Mechanics" },
  { name: "Electromagnetism" },
  { name: "Solid State Physics" },
];

export async function runBootstrapSeed(db: PostgresJsDatabase<typeof schema>) {
  console.log("Seeding categories...");
  for (const cat of CATEGORIES) {
    await db.insert(schema.categories).values({ name: cat.name }).onConflictDoNothing();
  }
}
