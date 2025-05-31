"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/auth/auth-provider";
import { supabase } from "@/lib/supabase";
import type {
  User,
  Book,
  BorrowRequest as BorrowRequestType,
} from "@/lib/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Edit,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Info,
  Briefcase,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BorrowRequestWithBook extends BorrowRequestType {
  book: Book;
}

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth();
  const router = useRouter();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  const [borrowedBooks, setBorrowedBooks] = useState<BorrowRequestWithBook[]>(
    [],
  );
  const [borrowHistory, setBorrowHistory] = useState<BorrowRequestWithBook[]>(
    [],
  );
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      setProfileUser(user);
      setNewName(user.name || "");
      fetchUserActivity();
    }
  }, [user]);

  const fetchUserActivity = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      // Fetch all borrow requests for the user, joining with book details
      const { data: requests, error: requestsError } = await supabase
        .from("borrow_requests")
        .select(
          `
          *,
          book:books(*)
        `,
        )
        .eq("user_id", user.id)
        .order("request_date", { ascending: false });

      if (requestsError) throw requestsError;

      const typedRequests = requests as BorrowRequestWithBook[];

      const currentBorrows = typedRequests.filter(
        (req) => req.status === "approved",
      );
      setBorrowedBooks(currentBorrows);
      setBorrowHistory(typedRequests);
    } catch (error) {
      console.error("Error fetching user activity:", error);
      toast({
        title: "Error",
        description: "Could not load your activity.",
        variant: "destructive",
      });
    } finally {
      setLoadingData(false);
    }
  };

  const handleNameUpdate = async () => {
    if (!user || !newName.trim()) return;

    try {
      const { data, error } = await supabase
        .from("users")
        .update({ name: newName.trim() })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;

      setProfileUser(data as User);
      // This won't update the useAuth context immediately, a page refresh or re-login would.
      // For now, just update local state. A more robust solution might involve updating AuthProvider.
      toast({ title: "Éxito", description: "Tu nombre ha sido actualizado." });
      setIsEditingName(false);
    } catch (error) {
      console.error("Error updating name:", error);
      toast({
        title: "Error",
        description: "Error al actualizar el nombre.",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-400"
          >
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-3">Mi perfil</h1>
          <p className="text-gray-600">
            Gestiona los detalles de tu cuenta y ve tu actividad en la
            biblioteca.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="account" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:w-[400px]">
            <TabsTrigger value="account">Cuenta</TabsTrigger>
            <TabsTrigger value="borrowed">Libros prestados</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Detalles de cuenta</CardTitle>
                <CardDescription>
                  Ve y actualiza tu información personal.
                </CardDescription>
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
                      <Button
                        onClick={() => setIsEditingName(false)}
                        size="sm"
                        variant="outline"
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <p className="text-gray-800">{profileUser?.name}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingName(true)}
                      >
                        <Edit className="h-4 w-4 mr-2" /> Editar
                      </Button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{profileUser?.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <div className="flex items-center gap-2 text-gray-800">
                    <Briefcase className="h-4 w-4 text-gray-500" />
                    <Badge variant="secondary" className="capitalize">
                      {profileUser?.role}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <Button variant="destructive" onClick={signOut}>
                    Cerrar sesión
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="borrowed">
            <Card>
              <CardHeader>
                <CardTitle>Libros actualmente prestados</CardTitle>
                <CardDescription>
                  Libros que tienes actualmente en préstamo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <p>Cargando libros prestados...</p>
                ) : borrowedBooks.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <BookOpen className="h-12 w-12 mx-auto mb-3" />
                    <p>No tienes libros prestados actualmente.</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {borrowedBooks.map((req) => (
                      <li
                        key={req.id}
                        className="p-4 border rounded-lg bg-gray-50"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                          <div>
                            <Link
                              href={`/books/${req.book.id}`}
                              className="font-semibold hover:text-blue-600"
                            >
                              {req.book.title}
                            </Link>
                            <p className="text-sm text-gray-600">
                              {req.book.author}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0 sm:text-right">
                            {getStatusBadge(req.status)}
                          </div>
                        </div>
                        <Separator className="my-3" />
                        <div className="text-sm text-gray-500 space-y-1">
                          <p>
                            Solicitado:{" "}
                            {new Date(req.request_date).toLocaleDateString()}
                          </p>
                          {req.approved_date && (
                            <p>
                              Aprobado:{" "}
                              {new Date(req.approved_date).toLocaleDateString()}
                            </p>
                          )}
                          {req.due_date && (
                            <p
                              className={`font-medium ${new Date(req.due_date) < new Date() ? "text-red-600" : "text-green-600"}`}
                            >
                              Fecha de entrega:{" "}
                              {new Date(req.due_date).toLocaleDateString()}
                              {new Date(req.due_date) < new Date() && (
                                <span className="ml-1">(atrasado)</span>
                              )}
                            </p>
                          )}
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
                <CardTitle>Historial de solicitudes de préstamo</CardTitle>
                <CardDescription>
                  Todas tus solicitudes de préstamo pasadas y pendientes.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <p>Cargando historial de solicitudes...</p>
                ) : borrowHistory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-12 w-12 mx-auto mb-3" />
                    <p>No tienes un historial de solicitudes de préstamo.</p>
                  </div>
                ) : (
                  <ul className="space-y-4">
                    {borrowHistory.map((req) => (
                      <li key={req.id} className="p-4 border rounded-lg">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                          <div>
                            <Link
                              href={`/books/${req.book.id}`}
                              className="font-semibold hover:text-blue-600"
                            >
                              {req.book.title}
                            </Link>
                            <p className="text-sm text-gray-600">
                              Solicitado el:{" "}
                              {new Date(req.request_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="mt-2 sm:mt-0">
                            {getStatusBadge(req.status)}
                          </div>
                        </div>
                        {req.notes && (
                          <p className="text-sm text-gray-500 mt-2 italic">
                            Nota: {req.notes}
                          </p>
                        )}
                        {req.status === "approved" && req.due_date && (
                          <p className="text-sm text-gray-500 mt-1">
                            Fecha de entrega:{" "}
                            {new Date(req.due_date).toLocaleDateString()}
                          </p>
                        )}
                        {req.status === "rejected" && (
                          <p className="text-sm text-red-500 mt-1">
                            Esta solicitud fue rechazada.
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
