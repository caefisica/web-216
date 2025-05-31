import type { Book } from "@/lib/types";

export interface BookWithRelations extends Omit<Book, "category"> {
  category?: { name: string };
  hearts_count?: { count: number }[];
}

export interface BookFormData {
  title?: string;
  author?: string;
  isbn?: string;
  publisher?: string;
  location?: string;
  description?: string;
}

export interface BookInfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
}
