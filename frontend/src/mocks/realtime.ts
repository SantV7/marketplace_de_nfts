import { ws } from 'msw';
import { toSocketIo } from '@mswjs/socket.io-binding';

const socketLink = ws.link('ws://localhost:5181/socket.io/?EIO=4&transport=websocket');

export const realtimeHandlers = [
  socketLink.addEventListener('connection', (connection) => {
    const socket = toSocketIo(connection).server;
    socket.on('subscribe', (_event, resource: { nftIds?: number[]; orderIds?: string[] }) => {
      socket.emit('subscribed', { resource, version: Date.now() });
    });
    socket.on('scenario.emit', (_event, payload: { name: string; data: Record<string, unknown> }) => {
      socket.emit(payload.name, payload.data);
    });
  }),
];
