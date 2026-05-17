import { revalidatePath } from "next/cache";
import {
  getBookActivity,
  getActiveUsers,
  getMonthlyActivity,
  updateBorrowRequestStatus,
  setBookStatus,
} from "./repository";

export async function getDetailedAdminStatsService() {
  const bookActivity = await getBookActivity();

  const popularBooks = bookActivity
    .map((book) => ({
      ...book,
      popularityScore: book.borrowCount * 3 + book.heartsCount,
    }))
    .filter((book) => book.popularityScore > 0)
    .sort((a, b) => b.popularityScore - a.popularityScore);

  const activeUsers = await getActiveUsers();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlyActivity = await getMonthlyActivity(sixMonthsAgo);
  const monthlyData = monthlyActivity.map((m) => {
    const d = new Date(m.month + "-01");
    return {
      month: d.toLocaleDateString("es-ES", { month: "long", year: "numeric" }),
      borrows: Number(m.borrows),
      returns: Number(m.returns),
    };
  });

  return {
    popularBooks,
    activeUsers: activeUsers.filter((u) => u.borrowCount > 0),
    monthlyData,
    overallStats: {
      totalBorrows: popularBooks.reduce((sum, b) => sum + b.borrowCount, 0),
      totalReturns: monthlyData.reduce((sum, m) => sum + m.returns, 0),
      bookUtilizationRate:
        popularBooks.length > 0
          ? Math.round(
              (popularBooks.reduce((sum, b) => sum + b.borrowCount, 0) / popularBooks.length) * 10,
            ) / 10
          : 0,
      mostActiveMonth:
        monthlyData.length > 0
          ? monthlyData.reduce((max, m) => (m.borrows > max.borrows ? m : max)).month
          : "N/A",
    },
  };
}

export async function updateBorrowStatusService(
  requestId: string,
  status: "approved" | "rejected",
  librarianId: string,
) {
  const updateData: {
    status: "approved" | "rejected";
    librarianId: string;
    updatedAt: Date;
    approvedDate?: Date;
    dueDate?: Date;
  } = {
    status,
    librarianId,
    updatedAt: new Date(),
  };

  if (status === "approved") {
    updateData.approvedDate = new Date();
    updateData.dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  }

  const request = await updateBorrowRequestStatus(requestId, updateData);
  if (status === "approved" && request) {
    await setBookStatus(request.bookId, "borrowed");
  }

  revalidatePath("/");
  return { success: true };
}
