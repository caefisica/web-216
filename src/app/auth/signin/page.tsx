"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signInAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Iniciando sesión..." : "Iniciar sesión"}
    </Button>
  );
}

export default function SignInPage() {
  const [state, formAction] = useActionState(signInAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Iniciar sesión</CardTitle>
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
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            <SubmitButton />
          </form>
          <div className="mt-4 flex flex-col items-center gap-2 text-sm text-gray-600">
            <Link href="/auth/reset-password" className="text-blue-600 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
            <span>
              ¿No tienes una cuenta?{" "}
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                Registrarse
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
