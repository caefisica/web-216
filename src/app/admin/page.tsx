import { getCurrentSession } from "@/features/auth/core/session";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { user } = await getCurrentSession();
  if (!user || (user.role !== "librarian" && user.role !== "admin")) {
    redirect("/");
  }
  redirect("/");
}
