import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../schema";

export async function seed(db: PostgresJsDatabase<typeof schema>) {
  console.log("Seeding Auth...");

  // Create an admin user if not exists
  await db
    .insert(schema.user)
    .values({
      id: "admin-id",
      name: "Admin User",
      email: "admin@example.com",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "admin",
    })
    .onConflictDoNothing();

  await db
    .insert(schema.user)
    .values({
      id: "user-id",
      name: "Demo User",
      email: "user@example.com",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "user",
    })
    .onConflictDoNothing();

  await db
    .insert(schema.user)
    .values({
      id: "user-2-id",
      name: "Tester User",
      email: "tester@example.com",
      emailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      role: "user",
    })
    .onConflictDoNothing();
}
