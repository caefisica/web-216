import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { FavoritesClient } from "./favorites-client";

export default async function FavoritesPage() {
  const { user } = await getCurrentSession();
  if (!user) redirect("/auth/signin");
  return <FavoritesClient />;
}
