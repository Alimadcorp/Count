'use client';

import { useState, useEffect } from 'react';
import { tables, reducers } from '../../src/module_bindings';
import { useSpacetimeDB, useTable, useReducer } from 'spacetimedb/react';
export function Client({name}: {name: string}) {
  const [isHydrated, setIsHydrated] = useState(false);
  const conn = useSpacetimeDB();
  const { isActive: connected } = conn;
  const [data, isLoading] = useTable(tables.channel);
  const [count, setCount] = useState(0n);
  const [exists, setExists] = useState(false);
  useEffect(() => {
    if (connected && !isLoading) {
      setIsHydrated(true);
    }
  }, [connected, isLoading]);

  useEffect(() => {
    if (isHydrated) {
      setCount(data.find((row) => row.name === name)?.count || 0n);
      setExists(data.some((row) => row.name === name));
    }
  }, [isHydrated, data]);

  const addReducer = useReducer(reducers.add);
  const add = () => {
    if (!name.trim() || !connected) return;
    addReducer({ name });
  };

  return (
    <>
      <div style={{ marginBottom: '1rem' }}>
        Status:{' '}
        <strong style={{ color: connected ? 'green' : 'red' }}>
          {connected ? 'Connected' : 'Connecting...'}
        </strong>
      </div>

        <button
          onClick={add}
          style={{ padding: '0.5rem 1rem' }}
          disabled={!connected}
        >
          Add
        </button>

      <div>
        <h2>Channel: {name}</h2>
        {exists ? <h1>{count}</h1> : <h1>Channel does not exist</h1>}
      </div>
    </>
  );
}
