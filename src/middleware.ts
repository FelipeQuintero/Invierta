import type { MiddlewareHandler } from 'astro';
import { checkRateLimit, getAdminRateLimitConfig } from './lib/rateLimit';
import {
  getAdminAuthState,
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

function tooManyRequestsResponse(isApi: boolean, retryAfterSeconds: number): Response {
  if (isApi) {
    return new Response(JSON.stringify({ error: 'Demasiadas solicitudes. Intenta de nuevo en unos segundos.' }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
      },
    });
  }

  return new Response('Demasiadas solicitudes. Intenta de nuevo en unos segundos.', {
    status: 429,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Retry-After': String(retryAfterSeconds),
    },
  });
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return 'unknown';
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { url, request, cookies } = context;

  if (!isProtectedPath(url.pathname)) return next();

  const tokenFromQuery = url.searchParams.get('token');
  if (tokenFromQuery && isValidAdminToken(tokenFromQuery)) {
    setAdminAuthCookie(cookies, tokenFromQuery);
    const cleanUrl = new URL(url.pathname, url.origin);
    return Response.redirect(cleanUrl.toString(), 302);
  }

  const { maxRequests, windowMs } = getAdminRateLimitConfig();
  const ip = getClientIp(request);
  const { allowed, retryAfterSeconds } = checkRateLimit({
    key: `${ip}:${url.pathname}`,
    maxRequests,
    windowMs,
  });

  if (!allowed) {
    return tooManyRequestsResponse(url.pathname.startsWith('/api/'), retryAfterSeconds);
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
