"use server";

import { redirect } from "next/navigation";
import { getCurrentSession, invalidateSession, deleteSessionTokenCookie } from "@/lib/auth/session";

export async function signOutAction(): Promise<void> {
  const { session } = await getCurrentSession();
  if (session) {
    await invalidateSession(session.id);
  }
  await deleteSessionTokenCookie();
  redirect("/auth/signin");
}
