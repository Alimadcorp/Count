import { schema, table, t } from 'spacetimedb/server';

const spacetimedb = schema({
  channel: table(
    { public: true },
    {
      name: t.string().unique().primaryKey(),
      count: t.u256().default(0n),
    }
  ),
});
export default spacetimedb;

export const init = spacetimedb.init(_ctx => {
  // Called when the module is initially published
});

export const onConnect = spacetimedb.clientConnected(_ctx => {
  // Called every time a new client connects
});

export const onDisconnect = spacetimedb.clientDisconnected(_ctx => {
  // Called every time a client disconnects
});

export const add = spacetimedb.reducer(
  { name: t.string() },
  (ctx, { name }) => {
    const channel = ctx.db.channel.name.find(name);
    if(channel) {
      ctx.db.channel.name.update( { name, count: channel.count + 1n } );
    } else {
      ctx.db.channel.insert({ name, count: 1n });
    }
  }
);
