import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getBooks, getCategories } from "@/lib/actions/books";
import { getAdminStats, getPendingBorrowRequests } from "@/lib/actions/admin";
import HomeClient from "./home-client";

export default async function HomePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;
  const userRole = (user as any)?.role;
  const isAdmin = user && (userRole === "librarian" || userRole === "admin");

  // Fetch base data
  const [initialBooks, initialCategories] = await Promise.all([getBooks(), getCategories()]);

  // Fetch admin specific data if needed
  let initialStats = null;
  let initialRequests: any[] = [];

  if (isAdmin) {
    const [stats, requests] = await Promise.all([getAdminStats(), getPendingBorrowRequests()]);
    initialStats = stats;
    initialRequests = requests;
  }

  return (
    <HomeClient
      initialBooks={initialBooks}
      initialCategories={initialCategories}
      initialStats={initialStats}
      initialPendingRequests={initialRequests}
      user={user}
    />
  );
}
