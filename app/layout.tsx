import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import DefaultProvider from '@/components/providers/DefaultProvider';
import { Suspense } from 'react';
import Loading from '@/components/shared/loading/Loading';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Australian Dance Music Chart',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <DefaultProvider>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </DefaultProvider>
      </body>
    </html>
  );
}
