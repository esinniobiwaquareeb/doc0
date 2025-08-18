import type { Metadata } from 'next';
import ClientPage from './ClientPage';

export async function generateMetadata({ params, searchParams }: { params: Promise<{ token?: string }>, searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const [sp, pr] = await Promise.all([searchParams, params]);
  const shareParam = sp?.share;
  const qsToken = Array.isArray(shareParam) ? shareParam[0] : shareParam;
  const pathToken = pr?.token;
  const token = pathToken || qsToken;
  if (!token) return {};

  const decode = (t: string) => {
    try {
      const base64 = t.replace(/-/g, '+').replace(/_/g, '/');
      const json = Buffer.from(base64, 'base64').toString('utf-8');
      return JSON.parse(json) as { projectName?: string; accessType?: 'view' | 'edit'; expiresAt?: string };
    } catch {
      return null;
    }
  };

  // Prefer stateless token decoding; if not available, try server-stored mapping
  let payload = decode(token) as null | { projectName?: string; accessType?: 'view' | 'edit'; expiresAt?: string };
  if (!payload) {
    try {
      const apiBase = process.env.NEXT_PUBLIC_SITE_URL ? process.env.NEXT_PUBLIC_SITE_URL : '';
      const res = await fetch(`${apiBase}/api/shared-links`, { cache: 'no-store' });
      if (res.ok) {
        const map = (await res.json()) as Record<string, { projectName?: string; accessType?: 'view' | 'edit'; expiresAt?: string }>;
        if (map && map[token]) payload = map[token];
      }
    } catch {
      // ignore
    }
  }
  if (!payload) return {};

  const titleBase = payload.projectName || 'Shared Document';
  const title = `${titleBase} – Doc0`;
  const description = `View ${payload.accessType === 'edit' ? 'and edit' : 'read'} shared documentation: ${titleBase}`;
  const base = process.env.NEXT_PUBLIC_SITE_URL || '';
  const url = pathToken
    ? `${base}/u/${encodeURIComponent(token)}`
    : `${base}/u?share=${encodeURIComponent(token)}`;
  const image = '/og-image.png';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      images: [{ url: image, width: 1200, height: 630 }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  };
}

export default function Page() {
  return <ClientPage />;
}
