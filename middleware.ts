import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/study',
  '/settings',
  '/api/pdf',
  '/api/chat',
];

// Paths that are always public
const publicPaths = [
  '/auth/login',
  '/auth/register',
  '/',
  '/api/auth',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public or doesn't need to be protected
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Check if the path should be protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath) {
    // Get the session token from the request
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    // If there's no token, redirect to login
    if (!token) {
      const url = new URL('/auth/login', request.url);
      // Add the original URL as a callback parameter
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }
  
  // Continue with the request
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public directory (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};