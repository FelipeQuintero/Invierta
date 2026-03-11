import type { MiddlewareHandler } from 'astro';
import {
  getAdminAuthState,
  isAdminTokenFallbackEnabled,
  isValidAdminToken,
  setAdminAuthCookie,
} from './lib/adminAuth';

function isProtectedPath(pathname: string): boolean {
  return pathname === '/admin/kuula' || pathname.startsWith('/api/admin/kuula');
}

function unauthorizedApiResponse(): Response {
  return new Response(JSON.stringify({ error: 'No autorizado' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { url, request, cookies } = context;

  if (!isProtectedPath(url.pathname)) return next();

  if (isAdminTokenFallbackEnabled()) {
    const tokenFromQuery = url.searchParams.get('token');
    if (tokenFromQuery && isValidAdminToken(tokenFromQuery)) {
      setAdminAuthCookie(cookies, tokenFromQuery);
      const cleanUrl = new URL(url.pathname, url.origin);
      return Response.redirect(cleanUrl.toString(), 302);
    }
  }

  const auth = await getAdminAuthState(request, cookies, ['admin', 'editor']);
  if (auth.isAuthenticated) return next();

  if (url.pathname.startsWith('/api/')) {
    return unauthorizedApiResponse();
  }

  const loginUrl = new URL('/admin/login', url.origin);
  loginUrl.searchParams.set('next', url.pathname);
  return Response.redirect(loginUrl.toString(), 302);
};
