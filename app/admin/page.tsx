"use client";

import { useState } from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import type { BorrowRequest } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Users,
  Clock,
  TrendingUp,
  BarChart3,
  Activity,
  UserCog,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import { BorrowingTimeline } from "@/components/admin/borrowing-timeline";
import { UserManagement } from "@/components/admin/user-management";
import { AdminStats } from "@/components/admin/admin-stats";

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState<BorrowRequest[]>([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    totalUsers: 0,
    pendingRequests: 0,
    totalBorrows: 0,
    activeUsers: 0,
    popularBooks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect admin users to the main homepage which now contains all admin functionality
    if (user && (user.role === "librarian" || user.role === "admin")) {
      router.replace("/");
    } else {
      // Non-admin users get redirected to homepage as well
      router.replace("/");
    }

    // Fetch data if user is admin or librarian
    if (user && (user.role === "librarian" || user.role === "admin")) {
      fetchData();
    }
  }, [user, router]);

  const fetchData = async () => {
    try {
      // Fetch pending requests
      const { data: requests, error: requestsError } = await supabase
        .from("borrow_requests")
        .select(
          `
          *,
          user:users!borrow_requests_user_id_fkey(*),
          book:books(*)
        `,
        )
        .eq("status", "pending")
        .order("request_date", { ascending: false });

      if (requestsError) throw requestsError;

      // Fetch comprehensive stats
      const [
        { count: totalBooks },
        { count: availableBooks },
        { count: borrowedBooks },
        { count: totalUsers },
        { count: pendingRequestsCount },
        { count: totalBorrows },
        { count: activeUsers },
      ] = await Promise.all([
        supabase.from("books").select("*", { count: "exact", head: true }),
        supabase
          .from("books")
          .select("*", { count: "exact", head: true })
          .eq("status", "available"),
        supabase
          .from("books")
          .select("*", { count: "exact", head: true })
          .eq("status", "borrowed"),
        supabase.from("users").select("*", { count: "exact", head: true }),
        supabase
          .from("borrow_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending"),
        supabase
          .from("borrow_requests")
          .select("*", { count: "exact", head: true })
          .eq("status", "approved"),
        supabase
          .from("users")
          .select("*", { count: "exact", head: true })
          .gte(
            "last_sign_in_at",
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          ),
      ]);

      setPendingRequests(requests || []);
      setStats({
        totalBooks: totalBooks || 0,
        availableBooks: availableBooks || 0,
        borrowedBooks: borrowedBooks || 0,
        totalUsers: totalUsers || 0,
        pendingRequests: pendingRequestsCount || 0,
        totalBorrows: totalBorrows || 0,
        activeUsers: activeUsers || 0,
        popularBooks: 0, // Will be calculated in AdminStats component
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description:
          "No se pudieron cargar los datos del panel de administración.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAction = async (
    requestId: string,
    action: "approved" | "rejected",
  ) => {
    try {
      const updateData: any = {
        status: action,
        librarian_id: user?.id,
      };

      if (action === "approved") {
        updateData.approved_date = new Date().toISOString();
        updateData.due_date = new Date(
          Date.now() + 14 * 24 * 60 * 60 * 1000,
        ).toISOString();
      }

      const { error } = await supabase
        .from("borrow_requests")
        .update(updateData)
        .eq("id", requestId);

      if (error) throw error;

      // If approved, update book status
      if (action === "approved") {
        const request = pendingRequests.find((r) => r.id === requestId);
        if (request) {
          await supabase
            .from("books")
            .update({ status: "borrowed" })
            .eq("id", request.book_id);
        }
      }

      toast({
        title:
          action === "approved" ? "Solicitud aprobada" : "Solicitud rechazada",
        description: `La solicitud de préstamo ha sido ${action === "approved" ? "aprobada" : "rechazada"}.`,
      });

      fetchData();
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la solicitud.",
        variant: "destructive",
      });
    }
  };

  if (!user || (user.role !== "librarian" && user.role !== "admin")) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold">Acceso denegado</h1>
        <p className="text-gray-600">
          No tienes permisos para acceder a esta página.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="bg-gray-200 h-8 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Panel de administración</h1>
          <p className="text-gray-600 mt-2">
            Gestiona la biblioteca, usuarios y visualiza estadísticas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500">
            Conectado como: <span className="font-medium">{user.name}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total de libros
                </p>
                <p className="text-2xl font-bold">{stats.totalBooks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disponibles</p>
                <p className="text-2xl font-bold">{stats.availableBooks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Prestados</p>
                <p className="text-2xl font-bold">{stats.borrowedBooks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total de usuarios
                </p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Tabs */}
      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Solicitudes ({stats.pendingRequests})
          </TabsTrigger>
          <TabsTrigger value="books" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Libros
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Usuarios
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Estadísticas
          </TabsTrigger>
        </TabsList>

        {/* Pending Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Solicitudes de préstamo pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No hay solicitudes pendientes
                  </h3>
                  <p className="text-gray-600">
                    Todas las solicitudes han sido procesadas
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {request.book?.title}
                        </h3>
                        <p className="text-gray-600">
                          Solicitado por:{" "}
                          <span className="font-medium">
                            {request.user?.name}
                          </span>{" "}
                          ({request.user?.email})
                        </p>
                        <p className="text-sm text-gray-500">
                          Fecha de solicitud:{" "}
                          {new Date(request.request_date).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                        {request.notes && (
                          <p className="text-sm text-gray-600 mt-2 p-2 bg-blue-50 rounded">
                            <strong>Nota:</strong> {request.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleRequestAction(request.id, "approved")
                          }
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Aprobar
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleRequestAction(request.id, "rejected")
                          }
                        >
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Books Management Tab */}
        <TabsContent value="books" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Gestión de libros
                <Button asChild>
                  <Link href="/admin/books/create">Añadir nuevo libro</Link>
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Gestiona tu colección de libros, añade nuevos libros, edita los
                existentes y sube imágenes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Libros disponibles</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.availableBooks}
                  </p>
                  <p className="text-sm text-gray-600">Listos para préstamo</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Libros prestados</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {stats.borrowedBooks}
                  </p>
                  <p className="text-sm text-gray-600">
                    Actualmente en préstamo
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-2">Total de libros</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.totalBooks}
                  </p>
                  <p className="text-sm text-gray-600">En toda la colección</p>
                </div>
              </div>
              <div className="mt-6 flex gap-4">
                <Button asChild variant="outline">
                  <Link href="/admin/books">Ver todos los libros</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/admin/books/create">Añadir libro</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>

        {/* Activity History Tab */}
        <TabsContent value="activity" className="space-y-4">
          <BorrowingTimeline />
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-4">
          <AdminStats />
        </TabsContent>
      </Tabs>
    </div>
  );
}
