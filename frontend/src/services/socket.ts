import { io, type Socket } from 'socket.io-client';

export interface NftUpdatedEvent { id: number; price: string; available: number; version: number; userId: string }
export interface OrderUpdatedEvent { orderId: string; userId: string; status: 'pending' | 'confirmed' | 'rejected'; version: number }

let socket: Socket | undefined;
export const getMarketplaceSocket = () => {
  socket ??= io('/', { path: '/socket.io', autoConnect: false, transports: ['websocket'], reconnection: true, reconnectionAttempts: 5, reconnectionDelay: 500, reconnectionDelayMax: 2000 });
  return socket;
};
export const disconnectMarketplaceSocket = () => { socket?.disconnect(); socket = undefined; };
