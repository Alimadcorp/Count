import { DbConnection, tables } from '../src/module_bindings';
import { Channel } from '../src/module_bindings/types';
import type { Infer } from 'spacetimedb';

const HOST = process.env.SPACETIMEDB_HOST ?? 'wss://maincloud.spacetimedb.com';
const DB_NAME = process.env.SPACETIMEDB_DB_NAME ?? 'nextjs-ts';

export type ChannelData = Infer<typeof Channel>;

/**
 * Fetches the initial list of channels from SpacetimeDB.
 * This function is designed for use in Next.js Server Components.
 *
 * It establishes a WebSocket connection, subscribes to the channel table,
 * waits for the initial data, and then disconnects.
 */
export async function fetchChannels(): Promise<ChannelData[]> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('SpacetimeDB connection timeout'));
    }, 10000);

    const connection = DbConnection.builder()
      .withUri(HOST)
      .withDatabaseName(DB_NAME)
      .onConnect(conn => {
        // Subscribe to all people
        conn
          .subscriptionBuilder()
          .onApplied(() => {
            clearTimeout(timeoutId);
            // Get all channels from the cache
            const channels = Array.from(conn.db.channel.iter());
            conn.disconnect();
            resolve(channels);
          })
          .onError((ctx) => {
            clearTimeout(timeoutId);
            conn.disconnect();
            reject(ctx.event ?? new Error('Subscription error'));
          })
          .subscribe(tables.channel);
      })
      .onConnectError((_ctx, error) => {
        clearTimeout(timeoutId);
        reject(error);
      })
      .build();
  });
}
