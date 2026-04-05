import { getSession } from "@/lib/protected-action";
import { getBooks, getCategories } from "@/features/books/actions";
import { getAdminStats, getPendingBorrowRequests } from "@/features/admin/actions";
import { BookCatalog } from "@/features/books/components/book-catalog";
import { AdminDashboard } from "@/features/admin/components/admin-dashboard";
import type { User } from "@/features/users/types";
import type { BookDetailed } from "@/features/books/types";

export default async function HomePage() {
  const session = await getSession();
  const user = session?.user as unknown as User | undefined;
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
      <div className="mb-12 space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 leading-tight translate-y-[-1px]">
          Física <span className="text-blue-600">Interactiva</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl font-medium leading-relaxed">
          Explora la colección bibliográfica más completa de nuestra facultad, diseñada para
          potenciar tu investigación y aprendizaje.
        </p>
      </div>

      <BookCatalog
        initialBooks={initialBooks as BookDetailed[]}
        initialCategories={initialCategories}
      />
    </main>
  );
}
