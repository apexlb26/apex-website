import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const isArabic = request.nextUrl.pathname === "/ar" || request.nextUrl.pathname.startsWith("/ar/");
  requestHeaders.set("x-apex-locale", isArabic ? "ar" : "en");
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
