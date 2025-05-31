"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { supabase } from "@/lib/supabase";
import type { Book } from "@/lib/types";
import { BookCard } from "@/components/books/book-card";
import { Heart, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [favoriteBooks, setFavoriteBooks] = useState<Book[]>([]);
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
      const { data: hearts, error: heartsError } = await supabase
        .from("user_book_hearts")
        .select("book_id")
        .eq("user_id", user.id);

      if (heartsError) throw heartsError;

      if (hearts && hearts.length > 0) {
        const bookIds = hearts.map((heart) => heart.book_id);

        const { data: booksData, error: booksError } = await supabase
          .from("books")
          .select(
            `
            *,
            category:categories(*),
            hearts_count:user_book_hearts(count)
          `,
          )
          .in("id", bookIds)
          .order("created_at", { ascending: false });

        if (booksError) throw booksError;

        // Manually set is_hearted for these books as they are inherently favorites
        const booksWithHeartedStatus =
          booksData?.map((book) => ({ ...book, is_hearted: true })) || [];
        setFavoriteBooks(booksWithHeartedStatus);
      } else {
        setFavoriteBooks([]);
      }
    } catch (error) {
      console.error("Error fetching favorite books:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Cargando favoritos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold tracking-tight mb-3">
            Mis libros favoritos
          </h1>
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
        ) : favoriteBooks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Heart className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aún no tienes favoritos
            </h3>
            <p className="text-gray-600">
              Comienza a explorar y marca con un corazón los libros que te
              gusten o te interesen. ¡Aparecerán aquí!
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
              <BookCard
                key={book.id}
                book={book}
                onHeartChange={fetchFavoriteBooks}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
