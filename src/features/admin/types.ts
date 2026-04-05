import { BookDetailed } from "../books/types";

export interface AdminStats {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  totalUsers: number;
  pendingRequests: number;
  totalBorrows: number;
  activeUsers: number;
}

export interface PendingRequest {
  id: string;
  requestDate: Date;
  status: string;
  bookId: string;
  userId: string;
  book: BookDetailed;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export interface BookStats {
  id: string;
  title: string;
  author: string;
  borrowCount: number;
  heartsCount: number;
  popularityScore: number;
  status: string;
}

export interface UserStats {
  id: string;
  name: string;
  email: string;
  borrowCount: number;
  role: string;
}

export interface MonthlyStats {
  month: string;
  borrows: number;
  returns: number;
}

export interface DetailedStats {
  popularBooks: BookStats[];
  activeUsers: UserStats[];
  monthlyData: MonthlyStats[];
  overallStats: {
    totalBorrows: number;
    totalReturns: number;
    bookUtilizationRate: number;
    mostActiveMonth: string;
  };
}
