import type { APIRoute } from 'astro';
import { db } from '../../db';
import { sql } from 'drizzle-orm';

export const GET: APIRoute = async () => {
  try {
    await db.execute(sql`SELECT 1`);
    return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ status: 'error', error: err.message, timestamp: new Date().toISOString() }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    });
  }
};
