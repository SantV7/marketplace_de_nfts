import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getMarketplaceSocket, type NftUpdatedEvent, type OrderUpdatedEvent } from './socket';
import { queryKeys } from './queries';
import type { Nft, NftPage, Order } from './contracts';

export const RealtimeSync = () => {
  const client = useQueryClient();
  useEffect(() => {
    const socket = getMarketplaceSocket();
    const versions = new Map<string, number>();
    const onNftUpdated = (event: NftUpdatedEvent) => {
      const key = `nft:${event.id}`;
      if ((versions.get(key) ?? -1) >= event.version) return;
      versions.set(key, event.version);
      client.setQueriesData<NftPage>({ queryKey: ['nfts'] }, (page) => page && ({ ...page, data: page.data.map((nft) => nft.id === event.id ? { ...nft, price: event.price, available: event.available } : nft) }));
      client.setQueryData<Nft>(queryKeys.nft(String(event.id)), (nft) => nft && ({ ...nft, price: event.price, available: event.available }));
      client.invalidateQueries({ queryKey: queryKeys.cart });
    };
    const onOrderUpdated = (event: OrderUpdatedEvent) => {
      const key = `order:${event.orderId}`;
      if ((versions.get(key) ?? -1) >= event.version) return;
      versions.set(key, event.version);
      client.setQueryData<Order>(queryKeys.order(event.orderId), (order) => order && (order.version > event.version ? order : { ...order, status: event.status, version: event.version }));
    };
    const onConnect = () => { void client.invalidateQueries({ queryKey: ['nfts'] }); void client.invalidateQueries({ queryKey: queryKeys.cart }); void client.invalidateQueries({ queryKey: ['order'] }); socket.emit('subscribe', { nftIds: [], orderIds: [] }); };
    socket.on('nft.updated', (_message, payload) => onNftUpdated((payload ?? _message) as NftUpdatedEvent));
    socket.on('order.updated', (_message, payload) => onOrderUpdated((payload ?? _message) as OrderUpdatedEvent));
    socket.on('connect', onConnect);
    socket.connect();
    return () => { socket.off('nft.updated'); socket.off('order.updated'); socket.off('connect', onConnect); socket.disconnect(); };
  }, [client]);
  return null;
};
