// middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  '/',
  '/auth/login',
  '/signup',
  '/auth/signup',
  '/forgot-password',
  '/reset-password'
];

// Middleware function to handle authentication
export async function middleware(request) {
  // Log the current path being accessed with more details
  console.log("🔒 Middleware running for path:", request.nextUrl.pathname);
  console.log("🔍 Full URL:", request.url);
  console.log("📝 Request method:", request.method);

  const { pathname } = request.nextUrl;
  console.log("🔍 Normalized pathname:", pathname);

  // Check if the path is public with detailed logging
  const isPublicPath = PUBLIC_PATHS.includes(pathname);
  console.log("🔍 Is public path:", isPublicPath);
  console.log("📋 Available public paths:", PUBLIC_PATHS);

  // Check if the path is public
//   if (isPublicPath) {
    console.log("✅ Public path accessed:", pathname);
    return NextResponse.next();
//   }

//   // Get the token from cookies
//   const token = request.cookies.get('token')?.value;
//   console.log("🔑 Token present:", !!token);

//   // If no token is present, redirect to login
//   if (!token) {
//     console.log("❌ No token found, redirecting to login");
//     const loginUrl = new URL('/auth/login', request.url);
//     // Add the current path as a redirect parameter
//     loginUrl.searchParams.set('redirect', pathname);
//     return NextResponse.redirect(loginUrl);
//   }

  try {
    // Verify the JWT token
    // const secret = new TextEncoder().encode(process.env.NEXT_PUBLIC_JWT_SECRET);
    // const { payload } = await jwtVerify(token, secret);

    // // Create response and attach user data to headers
    // const response = NextResponse.next();
    // response.headers.set('x-user-id', payload.id);
    // response.headers.set('x-user-role', payload.role);
    // response.headers.set('x-user-email', payload.email);

    // console.log("✅ Token verified successfully for user:", payload.id);
    // return response;
  } catch (err) {
    console.error('❌ JWT verification failed:', err);
    // Clear the invalid token
    const response = NextResponse.redirect(new URL('/auth/login', request.url));
    response.cookies.delete('token');
    return response;
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ]
};


