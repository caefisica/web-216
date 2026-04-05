"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { getFavoriteBooks } from "@/lib/actions/books";
import type { Book } from "@/lib/types";
import { BookCard } from "@/components/books/book-card";
import { Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FavoritesPage() {
  const { data: session, isPending: authLoading } = authClient.useSession();
  const user = session?.user;
  const router = useRouter();

  const [favoriteBooks, setFavoriteBooks] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/signin");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchFavoriteBooks();
    }
  }, [user]);

  const fetchFavoriteBooks = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const data = await getFavoriteBooks();
      setFavoriteBooks(data || []);
    } catch (error) {
      console.error("Error fetching favorite books:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-medium">
        <p>Cargando favoritos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-3">Mis libros favoritos</h1>
          <p className="text-gray-600">
            Libros que no puedes dejar de leer o que quieres leer pronto.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {loadingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg border border-gray-200 animate-pulse h-64"
              />
            ))}
          </div>
        ) : favoriteBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Heart className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aún no tienes favoritos</h3>
            <p className="text-gray-600">
              Comienza a explorar y marca con un corazón los libros que te gusten.
            </p>
            <Button asChild className="mt-6">
              <Link href="/">
                <BookOpen className="h-4 w-4 mr-2" /> Explorar libros
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteBooks.map((book) => (
              <BookCard key={book.id} book={book as any} onHeartChange={fetchFavoriteBooks} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
