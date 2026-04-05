import { Book } from "@/src/features/books/types";

export type BookFormData = Partial<Book>;

export interface BookInfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
}
