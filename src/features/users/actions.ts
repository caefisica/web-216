"use server";

import { getDb } from "@/lib/db";
import { user, borrowRequests, books } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { protectedAction, authenticatedAction } from "@/lib/protected-action";

// --- SCHEMAS ---

const RoleUpdateSchema = z.object({
  userId: z.string(),
  newRole: z.enum(["user", "librarian", "admin", "suspended"]),
});

const ProfileUpdateSchema = z.object({
  name: z.string().min(1).optional(),
});

// --- ACTIONS ---

/**
 * Fetches all users. Requires librarian or admin roles.
 */
export const getAllUsers = protectedAction(z.void(), ["librarian", "admin"], async () => {
  const db = await getDb();
  return await db.select().from(user).orderBy(desc(user.createdAt));
});

/**
 * Fetches the current user's borrowing activity.
 */
export const getUserActivity = authenticatedAction(z.void(), async (_, session) => {
  const db = await getDb();
  const activity = await db
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
    .where(eq(borrowRequests.userId, session.user.id))
    .orderBy(desc(borrowRequests.requestDate));

  return activity;
});

/**
 * Updates the current user's profile information.
 */
export const updateUserProfile = authenticatedAction(ProfileUpdateSchema, async (data, session) => {
  const db = await getDb();
  const [updatedUser] = await db
    .update(user)
    .set(data)
    .where(eq(user.id, session.user.id))
    .returning();

  revalidatePath("/profile");
  return { success: true, user: updatedUser };
});

/**
 * Updates a user's role. Restricted to admins only.
 */
export const updateUserRole = protectedAction(
  RoleUpdateSchema,
  ["admin"],
  async ({ userId, newRole }) => {
    const db = await getDb();
    await db.update(user).set({ role: newRole }).where(eq(user.id, userId));

    revalidatePath("/");
    return { success: true, message: `Rol actualizado a ${newRole}` };
  },
);

/**
 * Suspends a user. Restricted to admins only. (Convenience wrapper)
 */
export const suspendUser = protectedAction(
  z.object({ userId: z.string() }),
  ["admin"],
  async ({ userId }) => {
    const db = await getDb();
    await db.update(user).set({ role: "suspended" }).where(eq(user.id, userId));

    revalidatePath("/");
    return { success: true, message: "Usuario suspendido exitosamente" };
  },
);
