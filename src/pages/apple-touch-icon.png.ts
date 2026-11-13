import type { APIRoute } from 'astro';
import { pngFavicon } from '../lib/favicon.ts';

export const GET: APIRoute = async () =>
  new Response(await pngFavicon(180), { headers: { 'Content-Type': 'image/png' } });
