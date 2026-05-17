import { getCurrentSession } from "@/features/auth/core/session";
import { redirect } from "next/navigation";
import { EditBookClient } from "./edit-book-client";

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { user } = await getCurrentSession();
  if (!user || (user.role !== "librarian" && user.role !== "admin")) {
    redirect("/");
  }
  const { id } = await params;
  return <EditBookClient bookId={id} />;
}
