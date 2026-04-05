"use server";

import { db } from "@/lib/db";
import { books, borrowRequests, user, userBookHearts, bookImages } from "@/lib/db/schema";
import { eq, and, sql, gte, desc, lte } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getAdminStats() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user.role !== "admin" && session.user.role !== "librarian")) {
    throw new Error("Unauthorized");
  }

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
    db.select({ count: sql<number>`count(*)` }).from(books).where(eq(books.status, "available")),
    db.select({ count: sql<number>`count(*)` }).from(books).where(eq(books.status, "borrowed")),
    db.select({ count: sql<number>`count(*)` }).from(user),
    db.select({ count: sql<number>`count(*)` }).from(borrowRequests).where(eq(borrowRequests.status, "pending")),
    db.select({ count: sql<number>`count(*)` }).from(borrowRequests).where(eq(borrowRequests.status, "approved")),
    db.select({ count: sql<number>`count(*)` }).from(user).where(gte(
      user.updatedAt, 
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    )),
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
}

export async function getPendingBorrowRequests() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || (session.user.role !== "admin" && session.user.role !== "librarian")) {
    throw new Error("Unauthorized");
  }

  const requests = await db
    .select({
      id: borrowRequests.id,
      requestDate: borrowRequests.requestDate,
      status: borrowRequests.status,
      bookId: borrowRequests.bookId,
      userId: borrowRequests.userId,
      book: books,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      }
    })
    .from(borrowRequests)
    .innerJoin(books, eq(borrowRequests.bookId, books.id))
    .innerJoin(user, eq(borrowRequests.userId, user.id))
    .where(eq(borrowRequests.status, "pending"))
    .orderBy(desc(borrowRequests.requestDate));

  return requests.map(r => ({
    ...r,
    request_date: r.requestDate,
    book_id: r.bookId,
    user_id: r.userId
  }));
}

export async function getDetailedAdminStats() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "librarian")) {
    throw new Error("Unauthorized");
  }

  // 1. Fetch Popular Books (Calculate scores)
  const bookActivity = await db.select({
    id: books.id,
    title: books.title,
    author: books.author,
    status: books.status,
    borrowCount: sql<number>`(SELECT count(*) FROM ${borrowRequests} WHERE ${borrowRequests.bookId} = ${books.id} AND ${borrowRequests.status} = 'approved')`.mapWith(Number),
    heartsCount: sql<number>`(SELECT count(*) FROM ${userBookHearts} WHERE ${userBookHearts.bookId} = ${books.id})`.mapWith(Number),
  })
  .from(books);

  const popularBooks = bookActivity
    .map(book => ({
      ...book,
      popularity_score: (book.borrowCount * 3) + (book.heartsCount * 1),
      borrow_count: book.borrowCount,
      hearts_count: book.heartsCount,
    }))
    .filter(book => book.popularity_score > 0)
    .sort((a, b) => b.popularity_score - a.popularity_score);

  // 2. Fetch Active Users
  const activeUsers = await db.select({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    borrow_count: sql<number>`(SELECT count(*) FROM ${borrowRequests} WHERE ${borrowRequests.userId} = ${user.id} AND ${borrowRequests.status} = 'approved')`.mapWith(Number),
  })
  .from(user)
  .orderBy(sql`borrow_count DESC`)
  .limit(20);

  // 3. Monthly Trends (Last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlyActivity = await db.select({
    month: sql<string>`TO_CHAR(${borrowRequests.requestDate}, 'YYYY-MM')`,
    borrows: sql<number>`COUNT(*) FILTER (WHERE ${borrowRequests.status} = 'approved')`,
    returns: sql<number>`COUNT(*) FILTER (WHERE ${borrowRequests.returnDate} IS NOT NULL)`,
  })
  .from(borrowRequests)
  .where(gte(borrowRequests.requestDate, sixMonthsAgo))
  .groupBy(sql`TO_CHAR(${borrowRequests.requestDate}, 'YYYY-MM')`)
  .orderBy(sql`month ASC`);

  // Map to local Spanish months
  const monthlyData = monthlyActivity.map(m => {
    const d = new Date(m.month + "-01");
    return {
      month: d.toLocaleDateString("es-ES", { month: "long", year: "numeric" }),
      borrows: Number(m.borrows),
      returns: Number(m.returns),
      new_users: 0,
    };
  });

  return {
    popularBooks,
    activeUsers: activeUsers.filter(u => u.borrow_count > 0),
    monthlyData,
    overallStats: {
      totalBorrows: popularBooks.reduce((sum, b) => sum + b.borrow_count, 0),
      totalReturns: monthlyData.reduce((sum, m) => sum + m.returns, 0),
      bookUtilizationRate: popularBooks.length > 0 
        ? Math.round((popularBooks.reduce((sum, b) => sum + b.borrow_count, 0) / popularBooks.length) * 10) / 10 
        : 0,
      mostActiveMonth: monthlyData.length > 0 
        ? monthlyData.reduce((max, m) => (m.borrows > max.borrows ? m : max)).month 
        : "N/A",
    }
  };
}

export async function getBorrowingHistory(limit = 50) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "librarian")) {
    throw new Error("Unauthorized");
  }

  const results = await db.select({
    id: borrowRequests.id,
    status: borrowRequests.status,
    request_date: borrowRequests.requestDate,
    approved_date: borrowRequests.approvedDate,
    returned_date: borrowRequests.returnDate,
    book: {
      title: books.title
    },
    user: {
      name: user.name
    }
  })
  .from(borrowRequests)
  .leftJoin(books, eq(borrowRequests.bookId, books.id))
  .leftJoin(user, eq(borrowRequests.userId, user.id))
  .orderBy(desc(borrowRequests.requestDate))
  .limit(limit);

  return results.map(r => ({
    ...r,
    request_date: r.request_date?.toISOString(),
    approved_date: r.approved_date?.toISOString(),
    returned_date: r.returned_date?.toISOString(),
  }));
}

export async function updateBorrowStatus(requestId: string, status: "approved" | "rejected") {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "librarian")) {
    throw new Error("Unauthorized");
  }

  const updateData: any = {
    status,
    librarianId: session.user.id,
    updatedAt: new Date(),
  };

  if (status === "approved") {
    updateData.approvedDate = new Date();
    updateData.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  }

  // 1. Update the request
  const [request] = await db.update(borrowRequests)
    .set(updateData)
    .where(eq(borrowRequests.id, requestId))
    .returning();

  // 2. If approved, update book status to borrowed
  if (status === "approved" && request) {
    await db.update(books)
      .set({ status: "borrowed" })
      .where(eq(books.id, request.bookId));
  }

  revalidatePath("/");
  return { success: true };
}

