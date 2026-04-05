import { useState, useEffect, useCallback } from "react";
import { getBookById } from "@/src/features/books/actions";
import { toast } from "@/hooks/use-toast";
import type { BookDetailed } from "@/src/features/books/types";

export function useBookData(bookId: string) {
  const [book, setBook] = useState<BookDetailed | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBookData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBookById(bookId);

      if (data) {
        setBook(data);
      } else {
        toast({
          title: "Libro no encontrado.",
          description: "El libro solicitado no existe.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error fetching book data:", err);
      toast({
        title: "Error.",
        description: "No se pudieron cargar los datos del libro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    if (bookId) {
      fetchBookData();
    }
  }, [bookId, fetchBookData]);

  return {
    book,
    loading,
    refreshBookData: fetchBookData,
  };
}
