"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { requestPasswordResetAction } from "@/features/auth/actions/reset-password-request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Enviando..." : "Enviar enlace de restablecimiento"}
    </Button>
  );
}

export default function ResetPasswordPage() {
  const [state, formAction] = useActionState(requestPasswordResetAction, null);

  if (state && "sent" in state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <p className="font-medium text-gray-900">Revisa tu correo</p>
            <p className="text-sm text-gray-600">
              Si ese correo está registrado, recibirás instrucciones para restablecer tu contraseña.
            </p>
            <Link href="/auth/signin" className="text-sm text-blue-600 hover:underline block">
              Volver al inicio de sesión
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Restablecer contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{state.error}</p>
            )}
            <div>
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" name="email" type="email" required placeholder="tu@email.com" />
            </div>
            <SubmitButton />
          </form>
          <p className="mt-4 text-center text-sm text-gray-600">
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              Volver al inicio de sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
