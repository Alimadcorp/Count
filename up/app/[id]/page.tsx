import { Suspense } from 'react';
import { Client } from './app';

export default async function Home({ params }: { params: { id: string } }) {
    const name = (await params).id;
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>SpacetimeDB Next.js App</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Client name={name} />
      </Suspense>
    </main>
  );
}
