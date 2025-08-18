import { redirect } from 'next/navigation';

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  // Server redirect to canonical /u?share= for the client component to pick up, while still supporting short paths
  const { token } = await params;
  redirect(`/u?share=${encodeURIComponent(token)}`);
}


