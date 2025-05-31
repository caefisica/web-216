import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { TOAST_MESSAGES } from "../constants/book-constants";
import type { User } from "@/lib/types";
import type { BookFormData } from "../types/book-types";

export function useBookActions(user: User | null, bookId: string) {
  const [borrowing, setBorrowing] = useState(false);
  const [borrowNote, setBorrowNote] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

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
      const { error } = await supabase.from("borrow_requests").insert([
        {
          user_id: user.id,
          book_id: bookId,
          notes: borrowNote,
        },
      ]);

      if (error) throw error;

      toast(TOAST_MESSAGES.REQUEST_SUBMITTED);
      setBorrowNote("");
      setDialogOpen(false);
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

  const handleUpdateBook = async (
    editForm: BookFormData,
    onSuccess?: () => void,
  ) => {
    try {
      const updateData = {
        title: editForm.title,
        author: editForm.author,
        isbn: editForm.isbn,
        publisher: editForm.publisher,
        location: editForm.location,
        description: editForm.description,
      };

      const { error } = await supabase
        .from("books")
        .update(updateData)
        .eq("id", bookId);

      if (error) throw error;

      toast(TOAST_MESSAGES.BOOK_UPDATED);
      onSuccess?.();
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
    handleBorrowRequest,
    handleUpdateBook,
  };
}
