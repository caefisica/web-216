"use server";

import { db } from "@/lib/db";
import { user, borrowRequests, books } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getAllUsers() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role;
  if (!session || (userRole !== "admin" && userRole !== "librarian")) {
    throw new Error("Unauthorized");
  }

  return await db.select().from(user).orderBy(desc(user.createdAt));
}

export async function getUserActivity() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const activity = await db.select({
    id: borrowRequests.id,
    userId: borrowRequests.userId,
    bookId: borrowRequests.bookId,
    status: borrowRequests.status,
    request_date: borrowRequests.requestDate,
    approved_date: borrowRequests.approvedDate,
    due_date: borrowRequests.dueDate,
    returned_date: borrowRequests.returnDate,
    notes: borrowRequests.notes,
    book: books
  })
  .from(borrowRequests)
  .leftJoin(books, eq(borrowRequests.bookId, books.id))
  .where(eq(borrowRequests.userId, session.user.id))
  .orderBy(desc(borrowRequests.requestDate));

  return activity;
}

export async function updateUserProfile(data: { name?: string; image?: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) throw new Error("Unauthorized");

  const [updatedUser] = await db.update(user)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(user.id, session.user.id))
    .returning();

  revalidatePath("/profile");
  return { success: true, user: updatedUser };
}

export async function updateUserRole(userId: string, newRole: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userRole = (session?.user as any)?.role;
  if (!session || userRole !== "admin") {
    throw new Error("Only admins can manage roles");
  }

  await db.update(user)
    .set({ role: newRole as any })
    .where(eq(user.id, userId));

  revalidatePath("/");
  return { success: true, message: `Rol actualizado a ${newRole}` };
}

export async function suspendUser(userId: string) {
  return await updateUserRole(userId, "suspended");
}
