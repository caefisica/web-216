import { useState, useEffect } from "react";
import { getBookById } from "@/lib/actions/books";
import { toast } from "@/hooks/use-toast";
import type { Book } from "@/lib/types";

export function useBookData(bookId: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBookData = async () => {
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
    } catch (error) {
      console.error("Error fetching book data:", error);
      toast({
        title: "Error.",
        description: "No se pudieron cargar los datos del libro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (bookId) {
      fetchBookData();
    }
  }, [bookId]);

  return {
    book,
    loading,
    refreshBookData: fetchBookData,
  };
}
