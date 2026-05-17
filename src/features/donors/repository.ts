import { getDb } from "@/lib/db";
import { donors, donations } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function listDonors() {
  const db = await getDb();
  return db.select().from(donors).orderBy(desc(donors.createdAt));
}

export async function listDonations() {
  const db = await getDb();
  return db
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
      createdAt: donations.createdAt,
      updatedAt: donations.updatedAt,
    })
    .from(donations)
    .leftJoin(donors, eq(donations.donorId, donors.id))
    .orderBy(desc(donations.donationDate));
}

export async function getDonationStats() {
  const db = await getDb();
  const [stats] = await db
    .select({
      totalBooks: sql<number>`count(${donations.id})`,
      totalDonors: sql<number>`count(distinct ${donations.donorId})`,
    })
    .from(donations);

  return stats;
}
