"use server";

import { redirect } from "next/navigation";
import {
  validatePasswordResetToken,
  invalidatePasswordResetSession,
  deletePasswordResetCookie,
} from "@/lib/auth/password-reset";
import { updateUserPassword } from "@/lib/auth/session";
import { verifyPasswordStrength } from "@/lib/auth/password";
import { isErr } from "@/lib/result";

type FormState = { error: string } | null;

export async function resetPasswordAction(
  token: string,
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = formData.get("password");
  const confirm = formData.get("confirm");

  if (typeof password !== "string" || typeof confirm !== "string") {
    return { error: "Datos inválidos." };
  }
  if (password !== confirm) return { error: "Las contraseñas no coinciden." };
  if (password.length < 8 || password.length > 255) {
    return { error: "La contraseña debe tener entre 8 y 255 caracteres." };
  }

  const tokenResult = await validatePasswordResetToken(token);
  if (isErr(tokenResult)) {
    const messages = {
      not_found: "El enlace de restablecimiento es inválido.",
      expired: "El enlace ha expirado. Solicita uno nuevo.",
    } as const satisfies Record<typeof tokenResult.error, string>;
    return { error: messages[tokenResult.error] };
  }
  const { user } = tokenResult.value;

  // External call
  const strong = await verifyPasswordStrength(password);
  if (!strong)
    return { error: "Esta contraseña ha sido comprometida en brechas de datos. Elige otra." };

  await updateUserPassword(user.id, password);
  await invalidatePasswordResetSession(user.id);
  await deletePasswordResetCookie();
  redirect("/auth/signin");
}
