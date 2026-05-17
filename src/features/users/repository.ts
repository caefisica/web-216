import { getDb } from "@/lib/db";
import { user, borrowRequests, books } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function listUsers() {
  const db = await getDb();
  return db.select().from(user).orderBy(desc(user.createdAt));
}

export async function listUserActivity(userId: string) {
  const db = await getDb();
  return db
    .select({
      id: borrowRequests.id,
      userId: borrowRequests.userId,
      bookId: borrowRequests.bookId,
      status: borrowRequests.status,
      requestDate: borrowRequests.requestDate,
      approvedDate: borrowRequests.approvedDate,
      dueDate: borrowRequests.dueDate,
      returnDate: borrowRequests.returnDate,
      notes: borrowRequests.notes,
      librarianId: borrowRequests.librarianId,
      createdAt: borrowRequests.createdAt,
      updatedAt: borrowRequests.updatedAt,
      book: books,
    })
    .from(borrowRequests)
    .leftJoin(books, eq(borrowRequests.bookId, books.id))
    .where(eq(borrowRequests.userId, userId))
    .orderBy(desc(borrowRequests.requestDate));
}

export async function updateUserName(userId: string, name?: string) {
  const db = await getDb();
  if (!name) {
    const [currentUser] = await db.select().from(user).where(eq(user.id, userId)).limit(1);
    return currentUser;
  }
  const [updatedUser] = await db.update(user).set({ name }).where(eq(user.id, userId)).returning();
  return updatedUser;
}

export async function setUserRole(
  userId: string,
  newRole: "user" | "librarian" | "admin" | "suspended",
) {
  const db = await getDb();
  await db.update(user).set({ role: newRole }).where(eq(user.id, userId));
}
