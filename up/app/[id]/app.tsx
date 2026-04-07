'use client';

import { useState, useEffect, useRef } from 'react';
import { tables, reducers } from '../../src/module_bindings';
import { useSpacetimeDB, useTable, useReducer } from 'spacetimedb/react';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'timeago.js';
import LiveStatus from '@/components/live';

export function Client({ name }: { name: string }) {
  const conn = useSpacetimeDB();
  const { isActive: connected } = conn;
  const [data] = useTable(tables.channel);
  const router = useRouter();
  const [isLoading, setLoading] = useState(true);

  const [count, setCount] = useState(0n);
  const [localCount, setLocalCount] = useState(0n);
  const [displayCount, setDisplayCount] = useState(0n);
  const [exists, setExists] = useState(false);

  const [created, setCreated] = useState<Date | null>(null);
  const [last, setLast] = useState<Date | null>(new Date(0));

  const raf = useRef<number | null>(null);
  const hasAnimated = useRef(false);
  const animationLocked = useRef(false);
  const hasLoadedInitial = useRef(false);

  useEffect(() => {
    if (data.length == 0)
      setLoading(false);
    const row = data.find((r) => r.name === name);
    setExists(!!row);
    if (!row) return;
    if (!!row) {
      const n = row.count ?? 0n;
      if (!hasLoadedInitial.current) {
        hasLoadedInitial.current = true;
        setCount(n);
        setDisplayCount(n);
        setLocalCount(0n);
        setLast(row.last.toDate());
        animateOnce(n);
      } else {
        if (n >= count + localCount) {
          setCount(n);
          setLocalCount(0n);
          setDisplayCount(n);
        }
      }
      setCreated(row.created.toDate());
    }
  }, [data]);

  const animateOnce = (target: bigint) => {
    if (hasAnimated.current || animationLocked.current) return;

    hasAnimated.current = true;
    if(target < 5) {
      setDisplayCount(target);
      return;
    }

    const startTime = performance.now();
    const targetNum = Number(target);

    const tick = (t: number) => {
      if (animationLocked.current) return;

      const p = Math.min((t - startTime) / 600, 1);
      const value = Math.floor(targetNum * p);

      setDisplayCount(BigInt(value));

      if (p < 1) raf.current = requestAnimationFrame(tick);
    };

    raf.current = requestAnimationFrame(tick);
  };

  const addReducer = useReducer(reducers.add);

  const add = () => {
    if (!name.trim() || !connected) return;
    animationLocked.current = true;
    if (raf.current) cancelAnimationFrame(raf.current);
    addReducer({ name });
    setLocalCount((p) => {
      const nextLocal = p + 1n;
      setDisplayCount(count + nextLocal);
      return nextLocal;
    });
    setLast(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        add();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [add]);

  return (
    <div className="app">
      <div className="top">
        <button className="iconBtn" onClick={() => router.push('/')}>
          <ArrowLeft size={20} />
        </button>

        <div className="right">
          <LiveStatus/>
          {connected ? (
            <Wifi size={16} />
          ) : (
            <WifiOff size={16} />
          )}
        </div>
      </div>

      <div className="center" onClick={add}>
        <div className="inner">
          <h1
            style={!exists ? { opacity: 0.4 } : localCount > 0n ? { color: '#ccf', textShadow: '0 0 5px #ccf5' } : {}}
          >
            {displayCount}
          </h1>
          <p>{name}</p>
        </div>
      </div>

      <div className="info">
        {created && <span>created {format(created)}</span>}
        {exists && last && <span>last {format(last)}</span>}
        {isLoading && <span>Connecting...</span>}
        {!exists && !isLoading && <span>Click to start counting</span>}
      </div>

      <style jsx>{`
        .app {
          height: 100dvh;
          width: 100vw;
          overflow: hidden;
          background: var(--bg);
          color: var(--fg);
          font-family: Inter, ui-sans-serif, system-ui, -apple-system,
            Segoe UI, Roboto, Helvetica, Arial, sans-serif;
          display: flex;
          flex-direction: column;
          user-select: none; 
          cursor: pointer;
        }

        :root {
          --bg: #ffffff;
          --fg: #0f172a;
          --muted: #64748b;
          --accent: #16a34a;
        }

        @media (prefers-color-scheme: dark) {
          :root {
            --bg: #020617;
            --fg: #e2e8f0;
            --muted: #94a3b8;
            --accent: #22c55e;
          }
        }

        .top {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .right {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .iconBtn {
          background: none;
          border: none;
          color: var(--fg);
          cursor: pointer;
        }

        .spin {
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .center {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.4rem;
        }

        h1 {
          font-size: clamp(3.5rem, 14vw, 7rem);
          margin: 0;
          line-height: 1;
          letter-spacing: -0.04em;
          transition: color 0.2s, opacity 0.2s;
        }

        p {
          margin: 0;
          font-size: 0.95rem;
          color: var(--muted);
        }

        .info {
          position: absolute;
          bottom: env(safe-area-inset-bottom, 1rem);
          left: 0;
          right: 0;
          display: flex;
          justify-content: center;
          gap: 1rem;
          font-size: 0.75rem;
          color: var(--muted);
          padding: 0.75rem;
        }

        @media (min-width: 768px) {
          .info {
            justify-content: flex-end;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}