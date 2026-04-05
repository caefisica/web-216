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
  publicationYear?: number | string;
  pages?: number | string;
  status?: string;
  location?: string;
  description?: string;
  category_id?: string;
}

export interface BookInfoItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  className?: string;
}
