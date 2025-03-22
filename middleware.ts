import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Secret key for JWT verification
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Define protected routes that require authentication
const protectedRoutes = ["/dashboard", "/settings", "/profile"];

// Define auth routes (login, register, etc.)
const authRoutes = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // Get the session token from cookies
  const sessionToken = request.cookies.get("session")?.value;

  // Verify session function
  const verifySession = async () => {
    if (!sessionToken) return null;

    try {
      const { payload } = await jwtVerify(
        sessionToken,
        new TextEncoder().encode(JWT_SECRET)
      );
      return payload;
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
  };

  // Get user session
  const session = await verifySession();

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedRoute && !session) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users from auth routes to dashboard
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Continue for all other cases
  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes that don't require authentication
     */
    "/((?!_next/static|_next/image|favicon.ico|public|api/public).*)",
  ],
};
