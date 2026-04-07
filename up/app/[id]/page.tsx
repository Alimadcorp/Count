import { Suspense } from 'react';
import { Client } from './app';

export const metadata = {
  title: 'CountMad',
  description: 'Count up together!',
};

export default async function Home({ params }: { params: { id: string } }) {
  const name = (await params).id;

  return (
    <main style={{ padding: 0 }}>
      <Suspense fallback={<div>Loading...</div>}>
        <Client name={name} />
      </Suspense>
    </main>
  );
}