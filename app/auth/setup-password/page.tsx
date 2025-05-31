"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { Eye, EyeOff, CheckCircle, AlertCircle, Lock } from "lucide-react";

export default function SetupPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      setError("Enlace de invitación inválido o expirado");
    }
  }, [token]);

  const validatePassword = (password: string) => {
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return "La contraseña debe contener al menos una letra minúscula";
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return "La contraseña debe contener al menos una letra mayúscula";
    }
    if (!/(?=.*\d)/.test(password)) {
      return "La contraseña debe contener al menos un número";
    }
    return null;
  };

  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError("Enlace de invitación inválido");
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Use the recovery token to set the password
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: "recovery",
      });

      if (error) {
        throw error;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
      toast({
        title: "Contraseña configurada exitosamente",
        description: "Ya puedes iniciar sesión con tu nueva contraseña",
      });

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (error: any) {
      console.error("Error setting up password:", error);
      setError(error.message || "Error al configurar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
              <h2 className="mt-4 text-xl font-bold text-gray-900">
                ¡Contraseña configurada!
              </h2>
              <p className="mt-2 text-gray-600">
                Tu contraseña ha sido configurada exitosamente. Serás redirigido
                al inicio de sesión.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <Lock className="mx-auto h-12 w-12 text-blue-600" />
            <CardTitle className="mt-4 text-2xl font-bold text-gray-900">
              Configura tu contraseña
            </CardTitle>
            <p className="mt-2 text-gray-600">
              Establece una contraseña segura para tu cuenta
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetupPassword} className="space-y-4">
            <div>
              <Label htmlFor="password">Nueva contraseña</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingresa tu nueva contraseña"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
              <div className="relative mt-1">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirma tu nueva contraseña"
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
              <p className="font-medium text-blue-900 mb-2">
                Requisitos de contraseña:
              </p>
              <ul className="text-blue-700 space-y-1">
                <li className="flex items-center gap-2">
                  <span
                    className={
                      password.length >= 8 ? "text-green-600" : "text-gray-400"
                    }
                  >
                    {password.length >= 8 ? "✓" : "○"}
                  </span>
                  Al menos 8 caracteres
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={
                      /(?=.*[a-z])/.test(password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                  >
                    {/(?=.*[a-z])/.test(password) ? "✓" : "○"}
                  </span>
                  Una letra minúscula
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={
                      /(?=.*[A-Z])/.test(password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                  >
                    {/(?=.*[A-Z])/.test(password) ? "✓" : "○"}
                  </span>
                  Una letra mayúscula
                </li>
                <li className="flex items-center gap-2">
                  <span
                    className={
                      /(?=.*\d)/.test(password)
                        ? "text-green-600"
                        : "text-gray-400"
                    }
                  >
                    {/(?=.*\d)/.test(password) ? "✓" : "○"}
                  </span>
                  Un número
                </li>
              </ul>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !token || !password || !confirmPassword}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Configurando contraseña...
                </>
              ) : (
                "Configurar contraseña"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <button
                onClick={() => router.push("/auth/signin")}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Iniciar sesión
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
