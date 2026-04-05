import { useState, useCallback, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { TOAST_MESSAGES } from "../constants/book-constants";
import type { User } from "@/src/features/users/types";
import { toggleHeart } from "@/src/features/books/actions";

export function useHeartStatus(user: User | null, bookId: string, initialHearted = false) {
  const [isHearted, setIsHearted] = useState(initialHearted);

  // Sync with initial state if provided
  useEffect(() => {
    setIsHearted(initialHearted);
  }, [initialHearted]);

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
        const result = await toggleHeart({ bookId });
        setIsHearted(result.hearted);
        onSuccess?.();
      } catch (error) {
        console.error("Error updating heart:", error);
        toast({
          ...TOAST_MESSAGES.ERROR,
          description: "No se pudo actualizar el estado de favorito.",
        });
      }
    },
    [user, bookId],
  );

  return { isHearted, handleHeart };
}
