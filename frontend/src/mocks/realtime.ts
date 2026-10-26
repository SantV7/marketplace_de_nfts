import { ws } from 'msw';
import { toSocketIo } from '@mswjs/socket.io-binding';

interface ClientSubscription {
  userId: string;
  nftIds: number[];
  orderIds: string[];
  socket: ReturnType<typeof toSocketIo>['client'];
}

const clients = new Set<ClientSubscription>();
let connectionCount = 0;
const socketOrigin = typeof location === 'undefined' ? 'ws://localhost:5181' : location.origin.replace(/^http/, 'ws');
const socketLink = ws.link(`${socketOrigin}/`);

export const emitMockRealtime = (userId: string, name: 'nft.updated' | 'order.updated', data: Record<string, unknown>) => {
  for (const client of clients) {
    if (client.userId !== userId) continue;
    const resourceId = name === 'nft.updated' ? Number(data.id) : String(data.orderId);
    const subscribed = name === 'nft.updated' ? client.nftIds.includes(resourceId as number) : client.orderIds.includes(resourceId as string);
    if (subscribed) client.socket.emit(name, { ...data, userId });
  }
};

export const getMockRealtimeSubscriptions = () => ({ connectionCount, clients: [...clients].map(({ userId, nftIds, orderIds }) => ({ userId, nftIds, orderIds })) });

export const realtimeHandlers = [
  socketLink.addEventListener('connection', (connection) => {
    connectionCount += 1;
    const { client } = toSocketIo(connection);
    window.setTimeout(() => connection.server.connect(), 0);
    let subscription: ClientSubscription | undefined;
    client.on('subscribe', (_event, resource: { userId?: string; nftIds?: number[]; orderIds?: string[] }) => {
      if (subscription) clients.delete(subscription);
      if (!resource.userId) { subscription = undefined; return; }
      subscription = { userId: resource.userId, nftIds: resource.nftIds ?? [], orderIds: resource.orderIds ?? [], socket: client };
      clients.add(subscription);
      client.emit('subscribed', { version: Date.now() });
    });
    client.on('scenario.emit', (_event, payload: { userId: string; name: 'nft.updated' | 'order.updated'; data: Record<string, unknown> }) => {
      if (!subscription || subscription.userId !== payload.userId) return;
      emitMockRealtime(payload.userId, payload.name, payload.data);
    });
    connection.server.addEventListener('close', () => { if (subscription) clients.delete(subscription); });
  }),
];
