import type { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../schema";
import { hashPassword } from "@/lib/auth/password";

const SEED_USERS = [
  { email: "admin@unmsm.edu.pe", name: "Admin", role: "admin" as const },
  { email: "librarian@unmsm.edu.pe", name: "Librarian", role: "librarian" as const },
  { email: "student@unmsm.edu.pe", name: "Student", role: "user" as const },
];

export async function runDemoSeed(db: NodePgDatabase<typeof schema>) {
  console.log("Seeding demo users...");

  const password = process.env.SEED_PASSWORD ?? "password123";
  const passwordHash = await hashPassword(password);

  for (const u of SEED_USERS) {
    await db
      .insert(schema.user)
      .values({
        id: crypto.randomUUID(),
        email: u.email,
        passwordHash,
        name: u.name,
        emailVerified: true,
        role: u.role,
        createdAt: new Date(),
      })
      .onConflictDoNothing();
  }

  const allCategories = await db.query.categories.findMany();
  const qmCat = allCategories.find((c) => c.name === "Quantum Mechanics");
  const astroCat = allCategories.find((c) => c.name === "Astrophysics");

  if (qmCat) {
    await db
      .insert(schema.books)
      .values({
        title: "Principles of Quantum Mechanics",
        author: "R. Shankar",
        isbn: "978-0306447907",
        categoryId: qmCat.id,
        status: "available",
        publicationYear: 1994,
        publisher: "Plenum Press",
        pages: 676,
        location: "QA-101",
      })
      .onConflictDoNothing();
  }

  if (astroCat) {
    await db
      .insert(schema.books)
      .values({
        title: "Cosmos",
        author: "Carl Sagan",
        isbn: "978-0345539434",
        categoryId: astroCat.id,
        status: "available",
        publicationYear: 2013,
        publisher: "Ballantine Books",
        pages: 432,
        location: "AP-300",
      })
      .onConflictDoNothing();
  }
}
