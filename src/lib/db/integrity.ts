import { readFileSync, readdirSync, lstatSync } from "node:fs";
import { join, relative } from "node:path";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

function hashDirectory(dir: string): string {
  try {
    const cwd = process.cwd();
    const files = readdirSync(dir)
      .filter((f) => f.endsWith(".ts"))
      .map((f) => join(dir, f))
      .filter((f) => lstatSync(f).isFile())
      .sort();

    return files.reduce((acc, file) => {
      const relativePath = relative(cwd, file);
      return acc + `--- ${relativePath} ---\n` + readFileSync(file, "utf8") + "\n";
    }, "");
  } catch {
    return "";
  }
}

export async function computeHashes(): Promise<{ schemaHash: string; seedHash: string }> {
  const schemaInput = hashDirectory(join(process.cwd(), "src/lib/db/schema"));
  const seedInput = hashDirectory(join(process.cwd(), "src/lib/db/seeds"));

  const [schemaHash, seedHash] = await Promise.all([digest(schemaInput), digest(seedInput)]);

  return { schemaHash, seedHash };
}

async function digest(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function readStoredIntegrity(
  db: NodePgDatabase<typeof schema>,
): Promise<{ schemaHash: string | null; seedHash: string | null }> {
  try {
    const [result] = await db.select().from(schema.schemaIntegrity).limit(1);
    return {
      schemaHash: result?.schemaHash ?? null,
      seedHash: result?.seedHash ?? null,
    };
  } catch {
    return { schemaHash: null, seedHash: null };
  }
}

export async function writeStoredIntegrity(
  db: NodePgDatabase<typeof schema>,
  hashes: { schemaHash: string; seedHash: string },
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(schema.schemaIntegrity);
    await tx.insert(schema.schemaIntegrity).values({
      id: "integrity",
      ...hashes,
    });
  });
}
