import type { MetadataRoute } from 'next';
import { allowIndexing } from '@/lib/config';
import { absolute } from '@/lib/seo';
export const dynamic = 'force-dynamic';
export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing()) return { rules: { userAgent: '*', disallow: '/' } };
  return { rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] }, sitemap: absolute('/sitemap.xml'), host: absolute('/') };
}
