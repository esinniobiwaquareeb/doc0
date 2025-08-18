import type { Metadata } from 'next';
import ClientPage from './ClientPage';

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const sp = await searchParams;
  const shareParam = sp?.share;
  const token = Array.isArray(shareParam) ? shareParam[0] : shareParam;
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

  const payload = decode(token);
  if (!payload) return {};

  const titleBase = payload.projectName || 'Shared Document';
  const title = `${titleBase} – Doc0`;
  const description = `View ${payload.accessType === 'edit' ? 'and edit' : 'read'} shared documentation: ${titleBase}`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || ''}/u?share=${encodeURIComponent(token)}`;
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
