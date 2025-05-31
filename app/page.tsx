"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookCard } from "@/components/books/book-card";
import { AdminBookCard } from "@/components/books/admin-book-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Book, Category, BorrowRequest } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/auth-provider";
import {
  Search,
  Filter,
  Plus,
  BarChart3,
  Clock,
  TrendingUp,
  Users,
  BookOpen,
  UserCog,
  Activity,
} from "lucide-react";
import { BorrowingTimeline } from "@/components/admin/borrowing-timeline";
import { UserManagement } from "@/components/admin/user-management";
import { AdminStats } from "@/components/admin/admin-stats";
import { toast } from "@/hooks/use-toast";

export default function HomePage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pendingRequests, setPendingRequests] = useState<BorrowRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    borrowedBooks: 0,
    totalBorrows: 0,
    activeUsers: 0,
    pendingRequests: 0,
    totalUsers: 0,
  });

  const isAdmin = user && (user.role === "librarian" || user.role === "admin");
  const isSuperAdmin = user && user.role === "admin";

  useEffect(() => {
    fetchData();
    if (isAdmin) {
      fetchAdminData();
    }
  }, [isAdmin]);

  useEffect(() => {
    filterBooks();
  }, [searchQuery, selectedCategory, selectedStatus]);

  const fetchData = async () => {
    try {
      // Fetch all books with enhanced data including images and categories
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select(
          `
          *,
          hearts_count:user_book_hearts(count)
        `,
        )
        .order("created_at", { ascending: false });

      if (booksError) throw booksError;

      // Fetch images for all books
      const { data: allImages, error: imagesError } = await supabase
        .from("book_images")
        .select("*")
        .order("display_order");

      // Fetch categories for all books
      const { data: allBookCategories, error: categoriesError } =
        await supabase.from("book_categories").select(`
          book_id,
          category_id,
          categories(*)
        `);

      // Process books with their images and categories
      const processedBooks =
        booksData?.map((book) => {
          // Add images
          const bookImages =
            allImages?.filter((img) => img.book_id === book.id) || [];
          const coverImage =
            bookImages.find((img) => img.is_cover) || bookImages[0];

          book.images = bookImages;
          book.cover_image = coverImage;

          // Add categories
          const bookCategoryRelations =
            allBookCategories?.filter((bc) => bc.book_id === book.id) || [];
          book.categories = bookCategoryRelations
            .map((bc) => bc.categories)
            .filter(Boolean);

          return book;
        }) || [];

      // Add heart status if user is logged in
      if (user) {
        const { data: userHearts } = await supabase
          .from("user_book_hearts")
          .select("book_id")
          .eq("user_id", user.id);

        const heartedBookIds = userHearts?.map((h) => h.book_id) || [];

        const booksWithHeartStatus = processedBooks.map((book) => ({
          ...book,
          is_hearted: heartedBookIds.includes(book.id),
        }));

        setBooks(booksWithHeartStatus);
      } else {
        setBooks(processedBooks);
      }

      // Fetch categories for filter dropdown
      const { data: categoriesData, error: categoriesFilterError } =
        await supabase.from("categories").select("*").order("name");

      if (categoriesFilterError) throw categoriesFilterError;
      setCategories(categoriesData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    try {
      // Fetch pending requests for admin
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

      // Fetch comprehensive admin stats
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
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  };

  const filterBooks = async () => {
    try {
      let query = supabase.from("books").select(`
          *,
          hearts_count:user_book_hearts(count)
        `);

      // Apply search filter
      if (searchQuery.trim()) {
        query = query.or(
          `title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`,
        );
      }

      // Apply category filter
      if (selectedCategory !== "all") {
        // For category filtering, we need to join with book_categories
        const { data: bookCategoryIds } = await supabase
          .from("book_categories")
          .select("book_id")
          .eq("category_id", selectedCategory);

        if (bookCategoryIds && bookCategoryIds.length > 0) {
          const bookIds = bookCategoryIds.map((bc) => bc.book_id);
          query = query.in("id", bookIds);
        } else {
          // No books in this category, return empty result
          setBooks([]);
          return;
        }
      }

      // Apply status filter
      if (selectedStatus !== "all") {
        query = query.eq("status", selectedStatus);
      }

      query = query.order("created_at", { ascending: false });

      const { data: filteredBooks, error } = await query;

      if (error) throw error;

      // Fetch images and categories for filtered books
      if (filteredBooks && filteredBooks.length > 0) {
        const bookIds = filteredBooks.map((book) => book.id);

        // Fetch images for filtered books
        const { data: bookImages } = await supabase
          .from("book_images")
          .select("*")
          .in("book_id", bookIds)
          .order("display_order");

        // Fetch categories for filtered books
        const { data: bookCategories } = await supabase
          .from("book_categories")
          .select(
            `
            book_id,
            category_id,
            categories(*)
          `,
          )
          .in("book_id", bookIds);

        // Process filtered books with their images and categories
        const processedBooks = filteredBooks.map((book) => {
          // Add images
          const images =
            bookImages?.filter((img) => img.book_id === book.id) || [];
          const coverImage = images.find((img) => img.is_cover) || images[0];

          book.images = images;
          book.cover_image = coverImage;

          // Add categories
          const bookCategoryRelations =
            bookCategories?.filter((bc) => bc.book_id === book.id) || [];
          book.categories = bookCategoryRelations
            .map((bc) => bc.categories)
            .filter(Boolean);

          return book;
        });

        // Add heart status if user is logged in
        if (user) {
          const { data: userHearts } = await supabase
            .from("user_book_hearts")
            .select("book_id")
            .eq("user_id", user.id);

          const heartedBookIds = userHearts?.map((h) => h.book_id) || [];

          const booksWithHeartStatus = processedBooks.map((book) => ({
            ...book,
            is_hearted: heartedBookIds.includes(book.id),
          }));

          setBooks(booksWithHeartStatus);
        } else {
          setBooks(processedBooks);
        }
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error("Error filtering books:", error);
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

      fetchAdminData();
      fetchData(); // Refresh books to update status
    } catch (error) {
      console.error("Error updating request:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la solicitud.",
        variant: "destructive",
      });
    }
  };

  const getStatusCount = (status: string) => {
    return books.filter((book) => book.status === status).length;
  };

  // Loading state
  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="bg-gray-200 h-8 rounded w-1/2" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-200 h-32 rounded" />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-200 animate-pulse"
                >
                  <div className="aspect-[3/4] bg-gray-200 rounded-t-lg" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                  {isAdmin
                    ? "Gestión de biblioteca"
                    : "Una biblioteca de física hecha por físicos para físicos"}
                </h1>
                <p className="text-base text-gray-600 mt-2">
                  {isAdmin
                    ? "Panel completo de administración y gestión bibliotecaria"
                    : "Explora nuestra colección de libros de física y materiales de investigación"}
                </p>
              </div>

              {isAdmin && (
                <Button
                  asChild
                  className="transition-all duration-200 hover:scale-105"
                >
                  <Link href="/admin/books/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir nuevo libro
                  </Link>
                </Button>
              )}
            </div>

            {/* Admin Stats Overview */}
            {isAdmin && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                      <div className="ml-3">
                        <div className="text-xl font-bold text-blue-600">
                          <AnimatedCounter value={stats.totalBooks} />
                        </div>
                        <p className="text-xs text-gray-600">libros totales</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <TrendingUp className="h-6 w-6 text-green-600" />
                      <div className="ml-3">
                        <div className="text-xl font-bold text-green-600">
                          <AnimatedCounter value={stats.availableBooks} />
                        </div>
                        <p className="text-xs text-gray-600">disponibles</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Clock className="h-6 w-6 text-orange-600" />
                      <div className="ml-3">
                        <div className="text-xl font-bold text-orange-600">
                          <AnimatedCounter value={stats.pendingRequests} />
                        </div>
                        <p className="text-xs text-gray-600">solicitudes</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="p-4">
                    <div className="flex items-center">
                      <Users className="h-6 w-6 text-purple-600" />
                      <div className="ml-3">
                        <div className="text-xl font-bold text-purple-600">
                          <AnimatedCounter value={stats.totalUsers} />
                        </div>
                        <p className="text-xs text-gray-600">usuarios</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Regular User Stats */}
            {!isAdmin && (
              <div className="flex gap-6">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-700 text-sm"
                  >
                    {books.length} libros en total
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 text-sm"
                  >
                    {getStatusCount("available")} disponibles
                  </Badge>
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 border-red-200 text-sm"
                  >
                    {getStatusCount("borrowed")} prestados
                  </Badge>
                </div>
              </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Busca libros, autores o temas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-base"
                />
              </div>

              <div className="flex gap-2">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-48 bg-white border-gray-200 text-sm">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-32 bg-white border-gray-200 text-sm">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="available">Disponible</SelectItem>
                    <SelectItem value="borrowed">Prestado</SelectItem>
                    <SelectItem value="maintenance">
                      En mantenimiento
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {isAdmin ? (
          /* Admin Interface */
          <Tabs defaultValue="books" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger
                value="books"
                className="flex items-center gap-2 text-sm"
              >
                <BookOpen className="h-4 w-4" />
                Libros
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className="flex items-center gap-2 text-sm"
              >
                <Clock className="h-4 w-4" />
                Solicitudes ({stats.pendingRequests})
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="flex items-center gap-2 text-sm"
              >
                <UserCog className="h-4 w-4" />
                Usuarios
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="flex items-center gap-2 text-sm"
              >
                <Activity className="h-4 w-4" />
                Historial
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="flex items-center gap-2 text-sm"
              >
                <BarChart3 className="h-4 w-4" />
                Estadísticas
              </TabsTrigger>
            </TabsList>

            {/* Books Management Tab */}
            <TabsContent value="books" className="space-y-6">
              {books.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Filter className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron libros
                  </h3>
                  <p className="text-base text-gray-600">
                    Intenta ajustar tu búsqueda o criterios de filtro
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {books.map((book) => (
                    <AdminBookCard
                      key={book.id}
                      book={book}
                      onUpdate={fetchData}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

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
                              {new Date(
                                request.request_date,
                              ).toLocaleDateString("es-ES", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
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
        ) : (
          /* Regular User Interface */
          <>
            {books.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Filter className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron libros
                </h3>
                <p className="text-base text-gray-600">
                  Intenta ajustar tu búsqueda o criterios de filtro
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onHeartChange={fetchData}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
