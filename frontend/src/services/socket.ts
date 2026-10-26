import { io, type Socket } from 'socket.io-client';

export interface NftUpdatedEvent { id: number; price: string; available: number; version: number }
export interface OrderUpdatedEvent { orderId: string; status: 'pending' | 'confirmed' | 'rejected'; version: number }

let socket: Socket | undefined;
export const getMarketplaceSocket = () => {
  socket ??= io('/', { path: '/socket.io', autoConnect: false, transports: ['websocket'], reconnection: true, reconnectionAttempts: Infinity });
  return socket;
};
export const disconnectMarketplaceSocket = () => { socket?.disconnect(); socket = undefined; };
