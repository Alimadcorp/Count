'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useTable } from 'spacetimedb/react';
import { tables } from "../src/module_bindings";
import LiveStatus from '@/components/live';

function TopChannels() {
  const router = useRouter();
  const [data] = useTable(tables.channel);

  const top10 = [...data]
    .sort((a, b) => Number((b.count ?? 0n) - (a.count ?? 0n)))
    .slice(0, 5);

  return (
    <div style={{ padding: '0 0', fontFamily: 'inherit', display: 'grid', gap: '3px' }}>
      {top10.map((ch) => {
        return (
          <div
            key={ch.name}
            onClick={() => router.push(`/${ch.name}`)}
            style={{ display: 'flex', alignItems: 'start', gap: 12, padding: '7px 8px', borderRadius: 7, cursor: 'pointer', transition: 'all 0.2s ease-in-out' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f922')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: 12, minWidth: 72, flexShrink: 0, textAlign: 'left' }}>{ch.name}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)', minWidth: 44, textAlign: 'right' }}>
              {Number(ch.count ?? 0n).toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [channel, setChannel] = useState('');

  const goToChannel = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = channel.trim();
    if (trimmed) router.push(`/${trimmed}`);
  };

  return (
    <main
      style={{
        padding: '2rem',
        fontFamily: 'system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100dvh',
        gap: '1rem',
        textAlign: 'center'
      }}
    >
      <h1 style={{ fontSize: '2.5rem' }}>CountMad</h1>
      <p style={{ color: '#64748b' }}>A simple counting app based on SpacetimeDB</p>

      <form onSubmit={goToChannel} style={{ display: 'flex', gap: '0.5rem', width: '100%', maxWidth: '400px' }}>
        <input
          type="text"
          placeholder="Enter channel name"
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid #cbd5e1',
            fontSize: '1rem',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            backgroundColor: '#16a34a',
            color: 'white',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Go
        </button>
      </form>
      <TopChannels/>
      <p style={{ color: '#94949b' }}>Made by <u><a href="https://alimad.co">Muhammad Ali</a></u></p>
      <LiveStatus/>
    </main>
  );
}