import { books, categories, bookImages } from "@/lib/db/schema";

export type Book = typeof books.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type BookImage = typeof bookImages.$inferSelect;

export interface BookDetailed extends Book {
  categories?: Category[];
  category?: Category;
  images?: BookImage[];
  coverImage?: BookImage;
  isHearted?: boolean;
  heartsCount?: number;
}
