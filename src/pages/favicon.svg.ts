import type { APIRoute } from 'astro';
import { svgFavicon } from '../lib/favicon.ts';

export const GET: APIRoute = () => new Response(svgFavicon(), { headers: { 'Content-Type': 'image/svg+xml' } });
