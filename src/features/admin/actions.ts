"use server";

import { db } from "@/lib/db";
import { books, borrowRequests, user, userBookHearts } from "@/lib/db/schema";
import { eq, sql, gte, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { protectedAction } from "@/lib/protected-action";

// --- SCHEMAS ---

const BorrowStatusSchema = z.object({
  requestId: z.uuid(),
  status: z.enum(["approved", "rejected"]),
});

// --- ACTIONS ---

/**
 * Fetches high-level library statistics for the admin dashboard.
 */
export const getAdminStats = protectedAction(z.void(), ["librarian", "admin"], async () => {
  const [
    totalBooks,
    availableBooks,
    borrowedBooks,
    totalUsers,
    pendingRequests,
    totalBorrows,
    activeUsers,
  ] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(books),
    db
      .select({ count: sql<number>`count(*)` })
      .from(books)
      .where(eq(books.status, "available")),
    db
      .select({ count: sql<number>`count(*)` })
      .from(books)
      .where(eq(books.status, "borrowed")),
    db.select({ count: sql<number>`count(*)` }).from(user),
    db
      .select({ count: sql<number>`count(*)` })
      .from(borrowRequests)
      .where(eq(borrowRequests.status, "pending")),
    db
      .select({ count: sql<number>`count(*)` })
      .from(borrowRequests)
      .where(eq(borrowRequests.status, "approved")),
    db
      .select({ count: sql<number>`count(*)` })
      .from(user)
      .where(gte(user.updatedAt, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))),
  ]);

  return {
    totalBooks: Number(totalBooks[0].count),
    availableBooks: Number(availableBooks[0].count),
    borrowedBooks: Number(borrowedBooks[0].count),
    totalUsers: Number(totalUsers[0].count),
    pendingRequests: Number(pendingRequests[0].count),
    totalBorrows: Number(totalBorrows[0].count),
    activeUsers: Number(activeUsers[0].count),
  };
});

/**
 * Fetches all borrow requests with a 'pending' status.
 */
export const getPendingBorrowRequests = protectedAction(
  z.void(),
  ["librarian", "admin"],
  async () => {
    const requests = await db
      .select({
        id: borrowRequests.id,
        requestDate: borrowRequests.requestDate,
        status: borrowRequests.status,
        bookId: borrowRequests.bookId,
        userId: borrowRequests.userId,
        librarianId: borrowRequests.librarianId,
        approvedDate: borrowRequests.approvedDate,
        dueDate: borrowRequests.dueDate,
        returnDate: borrowRequests.returnDate,
        notes: borrowRequests.notes,
        createdAt: borrowRequests.createdAt,
        updatedAt: borrowRequests.updatedAt,
        book: books,
        user: user,
      })
      .from(borrowRequests)
      .innerJoin(books, eq(borrowRequests.bookId, books.id))
      .innerJoin(user, eq(borrowRequests.userId, user.id))
      .where(eq(borrowRequests.status, "pending"))
      .orderBy(desc(borrowRequests.requestDate));

    return requests; // CamelCase by default from Drizzle
  },
);

/**
 * Fetches detailed analytics including popular books and monthly trends.
 */
export const getDetailedAdminStats = protectedAction(z.void(), ["librarian", "admin"], async () => {
  const bookActivity = await db
    .select({
      id: books.id,
      title: books.title,
      author: books.author,
      status: books.status,
      borrowCount:
        sql<number>`(SELECT count(*) FROM ${borrowRequests} WHERE ${borrowRequests.bookId} = ${books.id} AND ${borrowRequests.status} = 'approved')`.mapWith(
          Number,
        ),
      heartsCount:
        sql<number>`(SELECT count(*) FROM ${userBookHearts} WHERE ${userBookHearts.bookId} = ${books.id})`.mapWith(
          Number,
        ),
    })
    .from(books);

  const popularBooks = bookActivity
    .map((book) => ({
      ...book,
      popularityScore: book.borrowCount * 3 + book.heartsCount * 1,
    }))
    .filter((book) => book.popularityScore > 0)
    .sort((a, b) => b.popularityScore - a.popularityScore);

  const activeUsers = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      borrowCount:
        sql<number>`(SELECT count(*) FROM ${borrowRequests} WHERE ${borrowRequests.userId} = ${user.id} AND ${borrowRequests.status} = 'approved')`.mapWith(
          Number,
        ),
    })
    .from(user)
    .orderBy(sql`borrow_count DESC`)
    .limit(20);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlyActivity = await db
    .select({
      month: sql<string>`TO_CHAR(${borrowRequests.requestDate}, 'YYYY-MM')`,
      borrows: sql<number>`COUNT(*) FILTER (WHERE ${borrowRequests.status} = 'approved')`,
      returns: sql<number>`COUNT(*) FILTER (WHERE ${borrowRequests.returnDate} IS NOT NULL)`,
    })
    .from(borrowRequests)
    .where(gte(borrowRequests.requestDate, sixMonthsAgo))
    .groupBy(sql`TO_CHAR(${borrowRequests.requestDate}, 'YYYY-MM')`)
    .orderBy(sql`month ASC`);

  const monthlyData = monthlyActivity.map((m) => {
    const d = new Date(m.month + "-01");
    return {
      month: d.toLocaleDateString("es-ES", { month: "long", year: "numeric" }),
      borrows: Number(m.borrows),
      returns: Number(m.returns),
    };
  });

  return {
    popularBooks,
    activeUsers: activeUsers.filter((u) => u.borrowCount > 0),
    monthlyData,
    overallStats: {
      totalBorrows: popularBooks.reduce((sum, b) => sum + b.borrowCount, 0),
      totalReturns: monthlyData.reduce((sum, m) => sum + m.returns, 0),
      bookUtilizationRate:
        popularBooks.length > 0
          ? Math.round(
              (popularBooks.reduce((sum, b) => sum + b.borrowCount, 0) / popularBooks.length) * 10,
            ) / 10
          : 0,
      mostActiveMonth:
        monthlyData.length > 0
          ? monthlyData.reduce((max, m) => (m.borrows > max.borrows ? m : max)).month
          : "N/A",
    },
  };
});

/**
 * Fetches the full borrowing history with pagination.
 */
export const getBorrowingHistory = protectedAction(
  z.object({ limit: z.number().default(50) }),
  ["librarian", "admin"],
  async ({ limit }) => {
    const results = await db
      .select({
        id: borrowRequests.id,
        status: borrowRequests.status,
        requestDate: borrowRequests.requestDate,
        approvedDate: borrowRequests.approvedDate,
        returnDate: borrowRequests.returnDate,
        book: { title: books.title },
        user: { name: user.name },
      })
      .from(borrowRequests)
      .leftJoin(books, eq(borrowRequests.bookId, books.id))
      .leftJoin(user, eq(borrowRequests.userId, user.id))
      .orderBy(desc(borrowRequests.requestDate))
      .limit(limit);

    return results;
  },
);

/**
 * Approves or rejects a borrow request and updates book status accordingly.
 */
export const updateBorrowStatus = protectedAction(
  BorrowStatusSchema,
  ["librarian", "admin"],
  async ({ requestId, status }, session) => {
    const updateData: Partial<typeof borrowRequests.$inferInsert> = {
      status,
      librarianId: session.user.id,
      updatedAt: new Date(),
    };

    if (status === "approved") {
      updateData.approvedDate = new Date();
      updateData.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
    }

    const [request] = await db
      .update(borrowRequests)
      .set(updateData)
      .where(eq(borrowRequests.id, requestId))
      .returning();

    if (status === "approved" && request) {
      await db.update(books).set({ status: "borrowed" }).where(eq(books.id, request.bookId));
    }

    revalidatePath("/");
    return { success: true };
  },
);
