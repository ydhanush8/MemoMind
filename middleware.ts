import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/welcome',
  '/pricing',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
]);

export default clerkMiddleware(
  async (auth, request) => {
    const { userId } = await auth();

    if (userId && request.nextUrl.pathname === '/welcome') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    if (!userId && !isPublicRoute(request)) {
      return NextResponse.redirect(new URL('/welcome', request.url));
    }

    if (!isPublicRoute(request)) {
      await auth.protect();
    }
  },
  {
    signInUrl: '/sign-in',
    signUpUrl: '/sign-up',
    afterSignInUrl: '/',
    afterSignUpUrl: '/',
  },
);

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
