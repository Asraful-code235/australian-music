'use client';

import Loading from '@/components/shared/loading/Loading';
import { useSession } from 'next-auth/react';
import { redirect, usePathname } from 'next/navigation';

export default function PrivateLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const nextURL = { callbackUrl: pathname };
  const queryParams = new URLSearchParams(nextURL).toString();
  if (status === 'loading') {
    return <Loading />;
  }

  if (!session) {
    redirect(`/login?${queryParams}`);
    return null;
  }
  return <>{session && children}</>;
}
