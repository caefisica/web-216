import { getSession } from "@/features/auth/protected-action";
import { getBooks, getCategories } from "@/features/books/actions";
import { getAdminStats, getPendingBorrowRequests } from "@/features/admin/actions";
import { BookCatalog } from "@/features/books/components/book-catalog";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";
import type { User } from "@/features/users/types";
import type { BookDetailed } from "@/features/books/types";

export default async function HomePage() {
  const session = await getSession();
  const user = session.user as unknown as User | undefined;
  const userRole = user?.role;
  const isAdmin = user && (userRole === "librarian" || userRole === "admin");

  // Fetch base data for the catalog
  const [initialBooks, initialCategories] = await Promise.all([getBooks(), getCategories()]);

  if (isAdmin) {
    // Admin View Orchestration
    const [initialStats, initialPendingRequests] = await Promise.all([
      getAdminStats(),
      getPendingBorrowRequests(),
    ]);

    return (
      <main className="container mx-auto px-6 py-12">
        <AdminDashboard
          initialBooks={initialBooks as BookDetailed[]}
          initialPendingRequests={initialPendingRequests}
          initialStats={initialStats}
        />
      </main>
    );
  }

  // Regular User View Orchestration
  return (
    <main className="container mx-auto px-6 py-12">
      <BookCatalog
        initialBooks={initialBooks as BookDetailed[]}
        initialCategories={initialCategories}
      />
    </main>
  );
}
