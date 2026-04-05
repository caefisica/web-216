"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending) {
      // All admin functionality has been moved to the individual management components
      // or the enhanced main dashboard.
      router.replace("/");
    }
  }, [session, isPending, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600 mb-4" />
        <h1 className="text-xl font-semibold">Redirigiendo al panel de control...</h1>
      </div>
    </div>
  );
}
