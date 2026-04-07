import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';
import LiveStatus from '@/components/live';

export const metadata: Metadata = {
  title: 'CountMad',
  description: 'A counting app powered by SpacetimeDB',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
