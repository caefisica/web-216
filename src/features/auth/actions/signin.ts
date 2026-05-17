"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import {
  getUserFromEmail,
  generateSessionToken,
  createSession,
  setSessionTokenCookie,
} from "@/features/auth/core/session";
import { verifyPasswordHash } from "@/features/auth/core/password";
import { Throttler, RefillingTokenBucket } from "@/features/auth/core/rate-limit";
import { isErr } from "@/lib/result";

const loginThrottler = new Throttler<string>([1, 2, 4, 8, 16, 30, 60, 180, 300]);
const loginIpBucket = new RefillingTokenBucket<string>(20, 1);

type FormState = { error: string } | null;

export async function signInAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string") {
    return { error: "Datos de formulario inválidos." };
  }

  const headerStore = await headers();
  const ip = headerStore.get("x-forwarded-for") ?? headerStore.get("x-real-ip") ?? "unknown";

  if (!loginIpBucket.check(ip, 1)) {
    return { error: "Demasiados intentos. Intente más tarde." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Credenciales inválidas." };
  }

  const userResult = await getUserFromEmail(email);

  loginIpBucket.consume(ip, 1);

  if (isErr(userResult) || !loginThrottler.consume(userResult.value.id)) {
    return { error: "Credenciales inválidas." };
  }
  const user = userResult.value;

  const valid = await verifyPasswordHash(user.passwordHash, password);
  if (!valid) {
    return { error: "Credenciales inválidas." };
  }

  loginThrottler.reset(user.id);

  const token = generateSessionToken();
  const session = await createSession(token, user.id);
  await setSessionTokenCookie(token, session.expiresAt);

  redirect("/");
}
