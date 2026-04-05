import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { TOAST_MESSAGES } from "../constants/book-constants";
import type { User } from "@/features/users/types";
import { createBorrowRequest, updateBook, toggleHeart } from "@/features/books/actions";
import { UpdateBookSchema } from "@/features/books/schemas";
import { z } from "zod";
import { useRouter } from "next/navigation";
import type { BookFormData } from "../types/book-types";

export function useBookActions(
  user: User | null,
  bookId: string,
  initialBook?: { id: string; isHearted?: boolean; heartsCount?: number },
) {
  const router = useRouter();
  const [borrowing, setBorrowing] = useState(false);
  const [borrowNote, setBorrowNote] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isHearted, setIsHearted] = useState(initialBook?.isHearted || false);
  const [heartsCount, setHeartsCount] = useState(initialBook?.heartsCount || 0);

  const handleToggleHeart = async () => {
    if (!user) {
      toast({
        ...TOAST_MESSAGES.SIGN_IN_REQUIRED,
        ...TOAST_MESSAGES.HEART_SIGN_IN,
      });
      return;
    }

    try {
      const result = await toggleHeart({ bookId });
      setIsHearted(result.hearted);
      setHeartsCount((prev) => (result.hearted ? prev + 1 : prev - 1));
      router.refresh();
    } catch (error) {
      console.error("Error toggling heart:", error);
      toast({
        ...TOAST_MESSAGES.ERROR,
        title: "Error",
        description: "No se pudo actualizar el corazón.",
      });
    }
  };
  const handleBorrowRequest = async () => {
    if (!user) {
      toast({
        ...TOAST_MESSAGES.SIGN_IN_REQUIRED,
        ...TOAST_MESSAGES.BORROW_SIGN_IN,
      });
      return;
    }

    setBorrowing(true);
    try {
      const result = await createBorrowRequest({ bookId, note: borrowNote });

      if (result.success) {
        toast(TOAST_MESSAGES.REQUEST_SUBMITTED);
        setBorrowNote("");
        setDialogOpen(false);
        router.refresh();
      }
    } catch (error) {
      console.error("Error submitting borrow request:", error);
      toast({
        ...TOAST_MESSAGES.ERROR,
        ...TOAST_MESSAGES.BORROW_ERROR,
      });
    } finally {
      setBorrowing(false);
    }
  };

  const handleUpdateBook = async (editForm: BookFormData, onSuccess?: () => void) => {
    try {
      const data: z.infer<typeof UpdateBookSchema> = {
        id: bookId,
        title: editForm.title || "",
        author: editForm.author || "",
        status: editForm.status || "available",
        isbn: editForm.isbn || null,
        publisher: editForm.publisher || null,
        location: editForm.location || null,
        description: editForm.description || null,
        categoryId: editForm.categoryId || null,
        publicationYear: editForm.publicationYear ? Number(editForm.publicationYear) : null,
        pages: editForm.pages ? Number(editForm.pages) : null,
      };

      const result = await updateBook(data);

      if (result.success) {
        toast(TOAST_MESSAGES.BOOK_UPDATED);
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error updating book:", error);
      toast({
        ...TOAST_MESSAGES.ERROR,
        ...TOAST_MESSAGES.UPDATE_ERROR,
      });
    }
  };

  return {
    borrowing,
    borrowNote,
    setBorrowNote,
    dialogOpen,
    setDialogOpen,
    isHearted,
    heartsCount,
    handleBorrowRequest,
    handleUpdateBook,
    handleToggleHeart,
  };
}
