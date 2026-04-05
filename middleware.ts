import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    // If user is not logged in and trying to access protected routes
    if (request.nextUrl.pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    // You can add more protected routes here
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
