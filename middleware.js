// middleware.js
import { NextResponse } from 'next/server';

// Define public paths that don't require authentication
const PUBLIC_PATHS = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api/auth/login',  // Allow backend auth endpoints
  '/api/auth/register',
  '/api/auth/forgot-password'
];

// Middleware function to handle authentication
export async function middleware(request) {
  // Log the current path being accessed with more details
  // console.log("🔒 Middleware running for path:", request.nextUrl.pathname);
  // console.log("🔍 Full URL:", request.url);
  // console.log("📝 Request method:", request.method);

  // const { pathname } = request.nextUrl;
  // console.log("🔍 Normalized pathname:", pathname);

  // // Check if the path is public with detailed logging
  // const isPublicPath = PUBLIC_PATHS.includes(pathname);
  // console.log("🔍 Is public path:", isPublicPath);
  // console.log("📋 Available public paths:", PUBLIC_PATHS);

  // const token = request.cookies.get('token')?.value;

  // If the path is public and user is logged in, redirect to dashboard
  // if (isPublicPath && token) {
  //   return NextResponse.redirect(new URL('/client-dashboard', request.url));
  // }

  // // If the path is protected and user is not logged in, redirect to login
  // if (!isPublicPath && !token) {
  //   return NextResponse.redirect(new URL('/auth/login', request.url));
  // }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ]
};


