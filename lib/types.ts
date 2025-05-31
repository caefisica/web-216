export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "librarian" | "admin" | "suspended";
  total_donations: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  created_at: string;
}

export interface BookImage {
  id: string;
  book_id: string;
  image_url: string;
  is_cover: boolean;
  alt_text?: string;
  display_order: number;
  created_at: string;
}

export interface BookCategory {
  id: string;
  book_id: string;
  category_id: string;
  category?: Category;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publication_year?: number;
  pages?: number;
  description?: string;
  status: "available" | "borrowed" | "maintenance";
  location?: string;
  created_at: string;
  updated_at: string;

  // Relations
  categories?: Category[];
  book_categories?: BookCategory[];
  images?: BookImage[];
  cover_image?: BookImage;
  is_hearted?: boolean;
  hearts_count?: { count: number }[];
}

export interface BorrowRequest {
  id: string;
  user_id: string;
  book_id: string;
  status: "pending" | "approved" | "rejected" | "returned";
  request_date: string;
  approved_date?: string;
  due_date?: string;
  returned_date?: string;
  notes?: string;
  librarian_id?: string;
  user?: User;
  book?: Book;
}

export interface Donation {
  id: string;
  user_id: string;
  amount: number;
  description?: string;
  created_at: string;
  user?: User;
}
