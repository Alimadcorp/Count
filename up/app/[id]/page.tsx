import { Suspense } from 'react';
import { Client } from './app';

export const metadata = {
  title: 'CountMad',
  description: 'Count up together!',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main style={{ padding: 0 }}>
      <Suspense fallback={<div>Loading...</div>}>
        <Client name={id} />
      </Suspense>
    </main>
  );
}