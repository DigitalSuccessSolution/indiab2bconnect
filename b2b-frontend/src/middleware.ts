import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Read the userRole cookie set by the backend
  const userRole = request.cookies.get('userRole')?.value;
  const path = request.nextUrl.pathname;

  // We only intercept requests to the root homepage.
  // This allows vendors/admins to still browse the marketplace (/search, /product) if they want,
  // but visiting the homepage will instantly drop them into their dashboard.
  if (path === '/' && userRole && userRole !== 'loggedout') {
    if (userRole === 'SUPERADMIN') {
      return NextResponse.redirect(new URL('/b2b-india/super-admin/dashboard', request.url));
    }
    if (userRole === 'ADMIN' || userRole === 'SUBADMIN') {
      return NextResponse.redirect(new URL(`/b2b-india/${userRole.toLowerCase()}/dashboard`, request.url));
    }
    if (userRole === 'VENDOR') {
      return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    }
  }

  // Optional: If they try to go to login page but are already logged in
  if ((path === '/login' || path === '/secure-login') && userRole && userRole !== 'loggedout') {
    if (userRole === 'SUPERADMIN') return NextResponse.redirect(new URL('/b2b-india/super-admin/dashboard', request.url));
    if (userRole === 'ADMIN' || userRole === 'SUBADMIN') return NextResponse.redirect(new URL(`/b2b-india/${userRole.toLowerCase()}/dashboard`, request.url));
    if (userRole === 'VENDOR') return NextResponse.redirect(new URL('/vendor/dashboard', request.url));
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Specify which routes the middleware should run on.
  // We only need it for the homepage and login page for now.
  matcher: ['/', '/login', '/secure-login'],
};
