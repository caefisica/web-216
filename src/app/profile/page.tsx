import { getCurrentSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { ProfileClient } from "./profile-client";

export default async function ProfilePage() {
  const { user } = await getCurrentSession();
  if (!user) redirect("/auth/signin");
  return <ProfileClient user={user} />;
}
