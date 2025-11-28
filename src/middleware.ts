// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Define protected routes
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/profile(.*)',
  // Add other protected routes here
]);

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/api/webhook/clerk',
  // Add other public routes here
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const response = NextResponse.next();

  // Handle API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return response;
  }

  // Handle sign-up route - redirect to sign-in
  if (req.nextUrl.pathname.startsWith('/sign-up')) {
    return NextResponse.redirect(new URL('/sign-in', req.url));
  }

  // Handle protected routes
  if (isProtectedRoute(req)) {
    if (!userId) {
      // Redirect to sign-in if not authenticated
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  return response;
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};