import type { APIRoute } from 'astro';

export const prerender = false;

const SITE_URL = (import.meta.env.SITE_URL || 'https://www.invierta.com.co').replace(/\/+$/, '');

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
