'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import LoginForm from '@/components/auth/login-form';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (status === 'authenticated') {
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
      router.replace(callbackUrl);
    }
  }, [status, router, searchParams]);

  if (status === 'authenticated') {
    return null;
  }

  return <LoginForm />;
}
