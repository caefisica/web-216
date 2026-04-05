"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getDetailedAdminStats } from "@/lib/actions/admin";
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Star,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  Heart,
  BookOpen,
} from "lucide-react";

interface BookStats {
  id: string;
  title: string;
  author: string;
  borrow_count: number;
  hearts_count: number;
  popularity_score: number;
  status: string;
}

interface UserStats {
  id: string;
  name: string;
  email: string;
  borrow_count: number;
  created_at: string;
  role: string;
}

interface MonthlyStats {
  month: string;
  borrows: number;
  returns: number;
  new_users: number;
}

// Popularity scoring weights
const POPULARITY_WEIGHTS = {
  BORROW_REQUEST: 3, // Borrowing shows strong intent
  HEART: 1, // Hearting shows interest but less commitment
};

const BOOKS_PER_PAGE = 5;

export function AdminStats() {
  const [loading, setLoading] = useState(true);
  const [allPopularBooks, setAllPopularBooks] = useState<BookStats[]>([]);
  const [currentBooksPage, setCurrentBooksPage] = useState(0);
  const [activeUsers, setActiveUsers] = useState<UserStats[]>([]);
  const [currentUsersPage, setCurrentUsersPage] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);
  const [overallStats, setOverallStats] = useState({
    totalBorrows: 0,
    totalReturns: 0,
    averageBorrowTime: 0,
    mostActiveMonth: "",
    userGrowthRate: 0,
    bookUtilizationRate: 0,
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const calculatePopularityScore = (borrowCount: number, heartsCount: number): number => {
    return borrowCount * POPULARITY_WEIGHTS.BORROW_REQUEST + heartsCount * POPULARITY_WEIGHTS.HEART;
  };

  const fetchStatistics = async () => {
    try {
      const data = await getDetailedAdminStats();

      setAllPopularBooks(data.popularBooks as any);
      setActiveUsers(data.activeUsers as any);
      setMonthlyData(data.monthlyData as any);
      setOverallStats(data.overallStats as any);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentBooks = () => {
    const startIndex = currentBooksPage * BOOKS_PER_PAGE;
    return allPopularBooks.slice(startIndex, startIndex + BOOKS_PER_PAGE);
  };

  const getCurrentUsers = () => {
    const startIndex = currentUsersPage * BOOKS_PER_PAGE;
    return activeUsers.slice(startIndex, startIndex + BOOKS_PER_PAGE);
  };

  const totalBooksPages = Math.ceil(allPopularBooks.length / BOOKS_PER_PAGE);
  const totalUsersPages = Math.ceil(activeUsers.length / BOOKS_PER_PAGE);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Disponible
          </Badge>
        );
      case "borrowed":
        return (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            Prestado
          </Badge>
        );
      case "maintenance":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Mantenimiento
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="default">Administrador</Badge>;
      case "librarian":
        return <Badge variant="secondary">Bibliotecario</Badge>;
      default:
        return <Badge variant="outline">Usuario</Badge>;
    }
  };

  const getPopularityBadge = (score: number) => {
    if (score >= 10) return <Badge className="bg-red-100 text-red-800">🔥 Muy Popular</Badge>;
    if (score >= 6) return <Badge className="bg-orange-100 text-orange-800">⭐ Popular</Badge>;
    if (score >= 3) return <Badge className="bg-yellow-100 text-yellow-800">📈 En Tendencia</Badge>;
    return <Badge variant="outline">💡 Emergente</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-8 bg-gray-200 rounded w-1/2" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de préstamos</p>
                <p className="text-2xl font-bold">{overallStats.totalBorrows}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Devoluciones</p>
                <p className="text-2xl font-bold">{overallStats.totalReturns}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tiempo promedio</p>
                <p className="text-2xl font-bold">{overallStats.averageBorrowTime}d</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tasa de utilización</p>
                <p className="text-2xl font-bold">{overallStats.bookUtilizationRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Popular Books with Pagination */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Libros más populares
              </CardTitle>
              <div className="text-sm text-gray-500">{allPopularBooks.length} libros activos</div>
            </div>
            <div className="text-xs text-gray-400">
              Puntuación: Préstamos ×{POPULARITY_WEIGHTS.BORROW_REQUEST} + Corazones ×
              {POPULARITY_WEIGHTS.HEART}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getCurrentBooks().length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay datos de popularidad disponibles
                </p>
              ) : (
                getCurrentBooks().map((book, index) => {
                  const globalRank = currentBooksPage * BOOKS_PER_PAGE + index + 1;
                  return (
                    <div
                      key={book.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                          <span className="text-sm font-bold text-blue-600">#{globalRank}</span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{book.title}</h4>
                          <p className="text-sm text-gray-600">{book.author}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {getPopularityBadge(book.popularity_score)}
                            {getStatusBadge(book.status)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold">{book.borrow_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4 text-red-500" />
                            <span className="font-semibold">{book.hearts_count}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Puntuación: {book.popularity_score}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Books Pagination */}
            {totalBooksPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentBooksPage(Math.max(0, currentBooksPage - 1))}
                  disabled={currentBooksPage === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {currentBooksPage + 1} de {totalBooksPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentBooksPage(Math.min(totalBooksPages - 1, currentBooksPage + 1))
                  }
                  disabled={currentBooksPage === totalBooksPages - 1}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Users with Pagination */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuarios más activos
              </CardTitle>
              <div className="text-sm text-gray-500">{activeUsers.length} usuarios activos</div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {getCurrentUsers().length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay datos de usuarios disponibles
                </p>
              ) : (
                getCurrentUsers().map((user, index) => {
                  const globalRank = currentUsersPage * BOOKS_PER_PAGE + index + 1;
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full">
                          <span className="text-sm font-bold text-green-600">#{globalRank}</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">{user.name}</h4>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">{getRoleBadge(user.role)}</div>
                        <p className="text-sm text-gray-600 mt-1">{user.borrow_count} préstamos</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Users Pagination */}
            {totalUsersPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentUsersPage(Math.max(0, currentUsersPage - 1))}
                  disabled={currentUsersPage === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>
                <span className="text-sm text-gray-600">
                  Página {currentUsersPage + 1} de {totalUsersPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentUsersPage(Math.min(totalUsersPages - 1, currentUsersPage + 1))
                  }
                  disabled={currentUsersPage === totalUsersPages - 1}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Actividad mensual (últimos 6 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((month, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{month.month}</span>
                  <span className="text-sm text-gray-600">
                    {month.borrows} préstamos • {month.returns} devoluciones
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Préstamos</span>
                    <span>{month.borrows}</span>
                  </div>
                  <Progress
                    value={
                      (month.borrows / Math.max(...monthlyData.map((m) => m.borrows), 1)) * 100
                    }
                    className="h-2"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Devoluciones</span>
                    <span>{month.returns}</span>
                  </div>
                  <Progress
                    value={
                      (month.returns / Math.max(...monthlyData.map((m) => m.returns), 1)) * 100
                    }
                    className="h-2 bg-green-100"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen de rendimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tasa de devolución</span>
                <span className="font-semibold">
                  {overallStats.totalBorrows > 0
                    ? Math.round((overallStats.totalReturns / overallStats.totalBorrows) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Libros populares</span>
                <span className="font-semibold">
                  {allPopularBooks.filter((book) => book.popularity_score >= 6).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Usuarios activos</span>
                <span className="font-semibold">{activeUsers.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tendencias</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Mes más activo</span>
                <span className="font-semibold text-sm">
                  {overallStats.mostActiveMonth || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Crecimiento de usuarios</span>
                <span className="font-semibold text-green-600">
                  +{overallStats.userGrowthRate}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tiempo promedio de préstamo</span>
                <span className="font-semibold">{overallStats.averageBorrowTime} días</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Estado de la colección</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Puntuación promedio</span>
                <span className="font-semibold">
                  {allPopularBooks.length > 0
                    ? Math.round(
                        (allPopularBooks.reduce((sum, book) => sum + book.popularity_score, 0) /
                          allPopularBooks.length) *
                          10,
                      ) / 10
                    : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Muy populares</span>
                <span className="font-semibold text-red-600">
                  {allPopularBooks.filter((book) => book.popularity_score >= 10).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Necesitan promoción</span>
                <span className="font-semibold text-orange-600">
                  {allPopularBooks.filter((book) => book.popularity_score === 0).length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
