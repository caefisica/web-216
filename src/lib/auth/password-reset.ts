import { encodeHexLowerCase } from "@oslojs/encoding";
import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32LowerCaseNoPadding } from "@oslojs/encoding";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { passwordResetSession as prsTable, user as userTable } from "@/lib/db/schema";
import { Ok, Err, type Result } from "@/lib/result";
import { generateOTP } from "./otp";

export interface PasswordResetSession {
  id: string;
  userId: string;
  email: string;
  code: string;
  expiresAt: Date;
}

export function generatePasswordResetToken(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
}

export async function createPasswordResetSession(
  token: string,
  userId: string,
  email: string,
): Promise<PasswordResetSession> {
  const id = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await db.delete(prsTable).where(eq(prsTable.userId, userId));
  await db.insert(prsTable).values({ id, userId, email, code, expiresAt });
  return { id, userId, email, code, expiresAt };
}

export async function validatePasswordResetToken(
  token: string,
): Promise<
  Result<
    { session: PasswordResetSession; user: { id: string; email: string; name: string } },
    "not_found" | "expired"
  >
> {
  const id = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));

  const rows = await db
    .select({
      prs: prsTable,
      user: { id: userTable.id, email: userTable.email, name: userTable.name },
    })
    .from(prsTable)
    .innerJoin(userTable, eq(prsTable.userId, userTable.id))
    .where(eq(prsTable.id, id))
    .limit(1);

  if (rows.length === 0) return Err("not_found");

  const { prs, user } = rows[0];

  if (Date.now() >= prs.expiresAt.getTime()) {
    await db.delete(prsTable).where(eq(prsTable.id, id));
    return Err("expired");
  }

  return Ok({
    session: {
      id: prs.id,
      userId: prs.userId,
      email: prs.email,
      code: prs.code,
      expiresAt: prs.expiresAt,
    },
    user,
  });
}

export async function invalidatePasswordResetSession(userId: string): Promise<void> {
  await db.delete(prsTable).where(eq(prsTable.userId, userId));
}

export function sendPasswordResetEmail(email: string, code: string): void {
  console.log(`[email] To ${email}: password reset code ${code}`);
}

export async function setPasswordResetCookie(token: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("password_reset_session", token, {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  });
}

export async function deletePasswordResetCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("password_reset_session", "", {
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  });
}
