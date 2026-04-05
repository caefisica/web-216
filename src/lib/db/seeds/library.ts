import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../schema";

export async function seed(db: PostgresJsDatabase<typeof schema>) {
  console.log("Seeding Library...");

  const categoryData = [
    { name: "Quantum Mechanics" },
    { name: "Astrophysics" },
    { name: "Computational Physics" },
    { name: "Classical Mechanics" },
    { name: "Thermodynamics & Statistical Mechanics" },
    { name: "Electromagnetism" },
    { name: "Solid State Physics" },
  ];

  for (const cat of categoryData) {
    await db
      .insert(schema.categories)
      .values({
        name: cat.name,
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
