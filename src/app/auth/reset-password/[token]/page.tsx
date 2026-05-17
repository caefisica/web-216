"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { use } from "react";
import { resetPasswordAction } from "@/features/auth/actions/reset-password-token";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Actualizando..." : "Actualizar contraseña"}
    </Button>
  );
}

export default function ResetPasswordTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const boundAction = resetPasswordAction.bind(null, token);
  const [state, formAction] = useActionState(boundAction, null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Nueva contraseña</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-md">{state.error}</p>
            )}
            <div>
              <Label htmlFor="password">Nueva contraseña</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
            <div>
              <Label htmlFor="confirm">Confirmar contraseña</Label>
              <Input id="confirm" name="confirm" type="password" required minLength={8} />
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
