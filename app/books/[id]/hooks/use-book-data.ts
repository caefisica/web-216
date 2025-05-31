"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Book } from "@/lib/types";

export function useBookData(bookId: string) {
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBook = useCallback(async () => {
    setLoading(true);
    try {
      // First, fetch the book details
      const { data: bookData, error } = await supabase
        .from("books")
        .select(
          `
          *,
          hearts_count:user_book_hearts(count)
        `,
        )
        .eq("id", bookId)
        .single();

      if (error) throw error;

      // Then, fetch images for this book
      const { data: images, error: imagesError } = await supabase
        .from("book_images")
        .select("*")
        .eq("book_id", bookId)
        .order("display_order");

      if (!imagesError && images && images.length > 0) {
        // If we have images in the book_images table, use those
        bookData.images = images;
      } else if (bookData.image_url) {
        // If no images in book_images table but we have a legacy image_url, use that
        bookData.images = [
          {
            id: "legacy",
            book_id: bookId,
            image_url: bookData.image_url,
            is_cover: true,
            display_order: 0,
          },
        ];
      } else {
        // No images at all
        bookData.images = [];
      }

      // Fetch categories for this book
      try {
        const { data: bookCategories, error: categoriesError } = await supabase
          .from("book_categories")
          .select("category_id, categories(*)")
          .eq("book_id", bookId);

        if (!categoriesError && bookCategories && bookCategories.length > 0) {
          bookData.categories = bookCategories.map((bc) => bc.categories);
        }
      } catch (err) {
        console.warn("Could not fetch multiple categories:", err);
      }

      setBook(bookData);
    } catch (error) {
      console.error("Error fetching book:", error);
      setBook(null);
    } finally {
      setLoading(false);
    }
  }, [bookId]);

  return { book, loading, fetchBook };
}
