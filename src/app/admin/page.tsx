import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const { user } = await getCurrentSession();
  if (!user || (user.role !== "librarian" && user.role !== "admin")) {
    redirect("/");
  }
  redirect("/");
}
