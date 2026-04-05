"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { getUserActivity, updateUserProfile } from "@/lib/actions/users";
import type { Book } from "@/lib/types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Edit, BookOpen, CheckCircle, XCircle, Clock, Info, Briefcase } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;
  const router = useRouter();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  const [borrowHistory, setBorrowHistory] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setNewName(user.name || "");
      fetchUserActivity();
    }
  }, [user]);

  const fetchUserActivity = async () => {
    try {
      setLoadingData(true);
      const data = await getUserActivity();
      setBorrowHistory(data || []);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      toast({
        title: "Error",
        description: "No se pudo cargar tu actividad.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!user || !newName.trim()) return;

    try {
      const result = await updateUserProfile({ name: newName.trim() });
      if (result.success) {
        toast({ title: "Éxito", description: "Tu nombre ha sido actualizado." });
        setIsEditingName(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating name:", error);
      toast({
        title: "Error",
        description: "Error al actualizar el nombre.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-400">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case "approved":
        return (
          <Badge variant="outline" className="text-green-600 border-green-400">
            <CheckCircle className="h-3 w-3 mr-1" />
            Aprobado
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="text-red-600 border-red-400">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazado
          </Badge>
        );
      case "returned":
        return (
          <Badge variant="secondary">
            <Info className="h-3 w-3 mr-1" />
            Devuelto
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-medium">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const borrowedBooks = borrowHistory.filter(
    (req) => req.status === "approved" || req.status === "pending",
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-3">Mi perfil</h1>
          <p className="text-gray-600">
            Gestiona los detalles de tu cuenta y ve tu actividad en la biblioteca.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
            <TabsTrigger value="account">Cuenta</TabsTrigger>
            <TabsTrigger value="borrowed">Préstamos</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Detalles de cuenta</CardTitle>
                <CardDescription>Ve y actualiza tu información personal.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo</Label>
                  {isEditingName ? (
                    <div className="flex items-center gap-2">
                      <Input
                        id="name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                      <Button onClick={handleNameUpdate} size="sm">
                        Guardar
                      </Button>
                      <Button onClick={() => setIsEditingName(false)} size="sm" variant="outline">
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-gray-800">{user.name}</p>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingName(true)}>
                        <Edit className="h-4 w-4 mr-2" /> Editar
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{user.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <Badge variant="secondary" className="capitalize">
                      {user.role}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <Button variant="destructive" onClick={handleSignOut}>
                    Cerrar sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="borrowed">
            <Card>
              <CardHeader>
                <CardTitle>Libros solicitados / prestados</CardTitle>
                <CardDescription>
                  Libros que tienes actualmente en préstamo o espera.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <p>Cargando información...</p>
                ) : borrowedBooks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3" />
                    <p>No tienes libros en préstamo actualmente.</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {borrowedBooks.map((req) => (
                      <li key={req.id} className="p-4 border rounded-lg bg-gray-50">
                        <div className="flex flex-col sm:row justify-between">
                          <div>
                            <Link
                              href={`/books/${req.book?.id}`}
                              className="font-semibold hover:underline"
                            >
                              {req.book?.title}
                            </Link>
                            <p className="text-sm text-gray-600">{req.book?.author}</p>
                          </div>
                          <div className="mt-2 text-right">{getStatusBadge(req.status)}</div>
                        </div>
                        <div className="text-xs text-gray-500 mt-2">
                          Solicitado el {new Date(req.request_date).toLocaleDateString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historial completo</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {borrowHistory.map((req) => (
                    <li key={req.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between">
                        <span>{req.book?.title}</span>
                        {getStatusBadge(req.status)}
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
