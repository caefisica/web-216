import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { TOAST_MESSAGES } from "../constants/book-constants";
import type { User } from "@/lib/types";

export function useHeartStatus(user: User | null, bookId: string) {
  const [isHearted, setIsHearted] = useState(false);

  const checkHeartStatus = useCallback(async () => {
    if (!user || !bookId) return;

    try {
      const { data, error } = await supabase
        .from("user_book_hearts")
        .select("id")
        .eq("user_id", user.id)
        .eq("book_id", bookId)
        .maybeSingle();

      if (error) {
        console.error("Error checking heart status:", error);
        return;
      }

      setIsHearted(!!data);
    } catch (error) {
      console.error("Error checking heart status:", error);
    }
  }, [user, bookId]);

  const handleHeart = useCallback(
    async (onSuccess?: () => void) => {
      if (!user) {
        toast({
          ...TOAST_MESSAGES.SIGN_IN_REQUIRED,
          ...TOAST_MESSAGES.HEART_SIGN_IN,
        });
        return;
      }

      try {
        if (isHearted) {
          const { error } = await supabase
            .from("user_book_hearts")
            .delete()
            .eq("user_id", user.id)
            .eq("book_id", bookId);

          if (error) throw error;
          setIsHearted(false);
        } else {
          const { error } = await supabase
            .from("user_book_hearts")
            .insert([{ user_id: user.id, book_id: bookId }]);

          if (error) throw error;
          setIsHearted(true);
        }

        onSuccess?.();
      } catch (error) {
        console.error("Error updating heart:", error);
        toast({
          ...TOAST_MESSAGES.ERROR,
          description: "Failed to update heart status.",
        });
      }
    },
    [user, bookId, isHearted],
  );

  return { isHearted, checkHeartStatus, handleHeart };
}
