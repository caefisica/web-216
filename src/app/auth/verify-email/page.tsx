"use client";

import { useActionState, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import {
  verifyEmailAction,
  resendVerificationEmailAction,
} from "@/features/auth/actions/verify-email";
import { isErr } from "@/lib/result";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Verificando..." : "Verificar"}
    </Button>
  );
}

export default function VerifyEmailPage() {
  const [state, formAction] = useActionState(verifyEmailAction, null);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isResending, startTransition] = useTransition();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Verifica tu correo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            Ingresa el código de 6 dígitos que enviamos a tu correo.
          </p>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{state.error}</p>
            )}
            <div>
              <Label htmlFor="code">Código de verificación</Label>
              <Input
                id="code"
                name="code"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                placeholder="000000"
                className="text-center text-lg tracking-widest"
              />
            </div>
            <SubmitButton />
          </form>
          <div className="space-y-1">
            {resendError && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{resendError}</p>
            )}
            <button
              type="button"
              disabled={isResending}
              className="w-full text-sm text-blue-600 hover:underline mt-2"
              onClick={() =>
                startTransition(async () => {
                  const r = await resendVerificationEmailAction();
                  setResendError(isErr(r) ? r.error : null);
                })
              }
            >
              {isResending ? "Enviando..." : "Reenviar código"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
