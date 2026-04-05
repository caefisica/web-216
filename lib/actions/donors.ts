"use server";

import { db } from "@/lib/db";
import { donors, donations } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function getDonors() {
  return await db.select().from(donors).orderBy(desc(donors.createdAt));
}

export async function getDonations() {
  const allDonations = await db
    .select({
      id: donations.id,
      donorId: donations.donorId,
      bookTitle: donations.bookTitle,
      bookAuthor: donations.bookAuthor,
      donationDate: donations.donationDate,
      status: donations.status,
      notes: donations.notes,
      donor: {
        id: donors.id,
        name: donors.name,
      },
    })
    .from(donations)
    .leftJoin(donors, eq(donations.donorId, donors.id))
    .orderBy(desc(donations.donationDate));

  return allDonations;
}

export async function getDonationsStats() {
  const [stats] = await db
    .select({
      total_books: sql<number>`count(${donations.id})`,
      total_donors: sql<number>`count(distinct ${donations.donorId})`,
    })
    .from(donations);

  return stats;
}
