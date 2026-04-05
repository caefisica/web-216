import { BookDetailed } from "../books/types";
import { BorrowRequest, User } from "../users/types";
import { Role } from "@/lib/db/schema";

export interface AdminStats {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  totalUsers: number;
  pendingRequests: number;
  totalBorrows: number;
  activeUsers: number;
}

export type PendingRequest = BorrowRequest & {
  book: BookDetailed;
  user: User;
};

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
  role: Role;
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
