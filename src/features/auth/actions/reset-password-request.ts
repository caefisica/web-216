"use server";

import { getDb } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  generatePasswordResetToken,
  createPasswordResetSession,
  sendPasswordResetEmail,
  setPasswordResetCookie,
} from "@/features/auth/core/password-reset";

type FormState = { error: string } | { sent: true } | null;

export async function requestPasswordResetAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const db = await getDb();
  const email = formData.get("email");
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Correo electrónico inválido." };
  }

  const rows = await db
    .select({ id: userTable.id, email: userTable.email })
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);

  if (rows.length > 0) {
    const user = rows[0];
    const token = generatePasswordResetToken();
    const resetSession = await createPasswordResetSession(token, user.id, user.email);
    sendPasswordResetEmail(user.email, resetSession.code);
    await setPasswordResetCookie(token, resetSession.expiresAt);
  }

  return { sent: true };
}
