import { user, borrowRequests } from "@/lib/db/schema";
import type { BookDetailed } from "../books/types";

export type UserBase = typeof user.$inferSelect;
export type BorrowRequestBase = typeof borrowRequests.$inferSelect;

export interface User extends UserBase {
  // Numeric types from Drizzle/Postgres infer as strings
  totalDonations: string;
}

export interface BorrowRequest extends BorrowRequestBase {
  book: BookDetailed | null;
  user?: User;
}
