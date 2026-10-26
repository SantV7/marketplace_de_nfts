import { ws } from 'msw';
import { toSocketIo } from '@mswjs/socket.io-binding';
import { mockSessions, mockUsers } from './fixtures';

interface ClientSubscription {
  userId: string;
  nftIds: number[];
  orderIds: string[];
  socket: ReturnType<typeof toSocketIo>['client'];
  disconnect: () => void;
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
export const emitMockRealtimeForTest = (userId: string, name: 'nft.updated', data: Record<string, unknown>) => {
  const resourceId = Number(data.id);
  for (const client of clients) {
    if (client.userId === userId && client.nftIds.includes(resourceId)) client.socket.emit(name, data);
  }
};

export const broadcastNftUpdate = (data: Record<string, unknown>) => {
  for (const userId of new Set([...clients].map((client) => client.userId))) emitMockRealtime(userId, 'nft.updated', data);
};

export const getMockRealtimeSubscriptions = () => ({ connectionCount, clients: [...clients].map(({ userId, nftIds, orderIds }) => ({ userId, nftIds, orderIds })) });
export const disconnectMockRealtime = (userId: string) => {
  for (const client of clients) if (client.userId === userId) client.disconnect();
};

export const realtimeHandlers = [
  socketLink.addEventListener('connection', (connection) => {
    connectionCount += 1;
    const { client } = toSocketIo(connection);
    const heartbeat = window.setInterval(() => connection.client.send('2'), 20_000);
    let subscription: ClientSubscription | undefined;
    client.on('subscribe', (_event, resource: { token?: string; guestId?: string; nftIds?: number[]; orderIds?: string[] }) => {
      if (subscription) clients.delete(subscription);
      const email = resource.token ? mockSessions.get(resource.token) : undefined;
      const user = mockUsers.find((entry) => entry.email === email);
      const userId = user?.id ?? (!resource.token && resource.guestId ? `guest:${resource.guestId}` : undefined);
      if (!userId) { subscription = undefined; return; }
      subscription = { userId, nftIds: resource.nftIds ?? [], orderIds: user ? resource.orderIds ?? [] : [], socket: client, disconnect: () => connection.client.close(1012, 'Reconexão simulada') };
      clients.add(subscription);
      client.emit('subscribed', { version: Date.now() });
    });
    connection.client.addEventListener('close', () => {
      window.clearInterval(heartbeat);
      if (subscription) clients.delete(subscription);
    });
  }),
];
