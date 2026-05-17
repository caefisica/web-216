import { getCurrentSession } from "@/lib/auth/session";
import { HeaderClient } from "./header-client";

export async function Header() {
  const { user } = await getCurrentSession();
  return <HeaderClient user={user} />;
}
