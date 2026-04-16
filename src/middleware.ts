import type { MiddlewareHandler } from 'astro';
import { checkRateLimit, getAdminRateLimitConfig } from './lib/rateLimit';
import {
  getAdminAuthState,
  isValidAdminToken,
  setAdminAuthCookie,
} from './lib/adminAuth';

function isProtectedPath(pathname: string): boolean {
  if (pathname === '/admin/login' || pathname === '/admin/logout') return false;
  return pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
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
    return new Response(null, { status: 302, headers: { Location: url.pathname } });
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

  const nextParam = encodeURIComponent(url.pathname);
  return new Response(null, { status: 302, headers: { Location: `/admin/login?next=${nextParam}` } });
};
