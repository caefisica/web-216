import { getCurrentSession } from "@/features/auth/core/session";
import { redirect } from "next/navigation";
import { NewBookClient } from "./new-book-client";

export default async function NewBookPage() {
  const { user } = await getCurrentSession();
  if (!user || (user.role !== "librarian" && user.role !== "admin")) {
    redirect("/");
  }
  return <NewBookClient />;
}
