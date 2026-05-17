"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { user as userTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  createUser,
  generateSessionToken,
  createSession,
  setSessionTokenCookie,
} from "@/lib/auth/session";
import { verifyPasswordStrength } from "@/lib/auth/password";
import {
  createEmailVerificationRequest,
  sendVerificationEmail,
  sendVerificationEmailBucket,
  setEmailVerificationCookie,
} from "@/lib/auth/email-verification";
import { RefillingTokenBucket } from "@/lib/auth/rate-limit";

const signupIpBucket = new RefillingTokenBucket<string>(3, 10);

type FormState = { error: string } | null;

export async function signUpAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = formData.get("name");
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    return { error: "Datos de formulario inválidos." };
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") ?? headerStore.get("x-real-ip") ?? "unknown";

  if (!signupIpBucket.consume(ip, 1)) {
    return { error: "Demasiados intentos. Intente más tarde." };
  }

  if (!name.trim() || name.length > 100) {
    return { error: "El nombre es requerido y debe tener menos de 100 caracteres." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Correo electrónico inválido." };
  }

  if (password.length < 8 || password.length > 255) {
    return { error: "La contraseña debe tener entre 8 y 255 caracteres." };
  }

  const strong = await verifyPasswordStrength(password);
  if (!strong) {
    return { error: "Esta contraseña ha sido comprometida en brechas de datos. Elige otra." };
  }

  const existing = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.email, email))
    .limit(1);
  if (existing.length > 0) {
    return { error: "Este correo ya está registrado." };
  }

  const user = await createUser(email, name.trim(), password);

  const token = generateSessionToken();
  const session = await createSession(token, user.id);
  await setSessionTokenCookie(token, session.expiresAt);

  if (sendVerificationEmailBucket.consume(user.id, 1)) {
    const request = await createEmailVerificationRequest(user.id, user.email);
    sendVerificationEmail(request.email, request.code);
    await setEmailVerificationCookie(request.id, request.expiresAt);
  }

  redirect("/auth/verify-email");
}
