import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getMarketplaceSocket, type NftUpdatedEvent, type OrderUpdatedEvent } from './socket';
import { queryKeys } from './queries';
import type { CartItem, Nft, NftPage, Order } from './contracts';

export const RealtimeSync = () => {
  const client = useQueryClient();
  useEffect(() => {
    const socket = getMarketplaceSocket();
    const versions = new Map<string, number>();
    const onNftUpdated = (event: NftUpdatedEvent) => {
      const userId = localStorage.getItem('kurio_token')?.replace(/^mock-/, '');
      if (!userId || event.userId !== userId) return;
      const key = `nft:${event.id}`;
      const cachedVersion = Math.max(
        client.getQueriesData<NftPage>({ queryKey: ['nfts'] }).flatMap(([, page]) => page?.data.filter((nft) => nft.id === event.id).map((nft) => nft.version ?? 1) ?? []).reduce((max, value) => Math.max(max, value), 1),
        client.getQueryData<Nft>(queryKeys.nft(String(event.id)))?.version ?? 1,
      );
      if (Math.max(versions.get(key) ?? 1, cachedVersion) >= event.version) return;
      versions.set(key, event.version);
      client.setQueriesData<NftPage>({ queryKey: ['nfts'] }, (page) => page && ({ ...page, data: page.data.map((nft) => nft.id === event.id ? { ...nft, price: event.price, available: event.available, editions: nft.editions?.map((edition) => ({ ...edition, available: Math.min(edition.available, event.available) })), version: event.version } : nft) }));
      client.setQueryData<Nft>(queryKeys.nft(String(event.id)), (nft) => nft && ({ ...nft, price: event.price, available: event.available, editions: nft.editions?.map((edition) => ({ ...edition, available: Math.min(edition.available, event.available) })), version: event.version }));
      client.invalidateQueries({ queryKey: queryKeys.cart });
      void client.invalidateQueries({ queryKey: ['quote'] });
      window.dispatchEvent(new CustomEvent('kurio:nft-updated', { detail: event }));
    };
    const onOrderUpdated = (event: OrderUpdatedEvent) => {
      const userId = localStorage.getItem('kurio_token')?.replace(/^mock-/, '');
      if (!userId || event.userId !== userId) return;
      const key = `order:${event.orderId}`;
      const order = client.getQueryData<Order>(queryKeys.order(event.orderId));
      if (order?.status === 'confirmed' || order?.status === 'rejected' || Math.max(versions.get(key) ?? 1, order?.version ?? 1) >= event.version) return;
      versions.set(key, event.version);
      client.setQueryData<Order>(queryKeys.order(event.orderId), (order) => order && (order.version > event.version ? order : { ...order, status: event.status, version: event.version }));
    };
    const subscribe = () => {
      const userId = localStorage.getItem('kurio_token')?.replace(/^mock-/, '');
      if (!socket.connected) return;
      if (!userId) { socket.emit('subscribe', { userId: '' }); return; }
      const nftIds = [...new Set(client.getQueryCache().getAll().flatMap((query) => {
        if (query.queryKey[0] === 'nft') return [Number(query.queryKey[1])];
        if (query.queryKey[0] === 'nfts') return ((query.state.data as NftPage | undefined)?.data ?? []).map((nft) => nft.id);
        if (query.queryKey[0] === 'cart') return ((query.state.data as CartItem[] | undefined) ?? []).map((item) => Number(item.nftId));
        return [];
      }).filter(Number.isFinite))];
      const orderIds = client.getQueryCache().getAll().filter((query) => query.queryKey[0] === 'order').map((query) => String(query.queryKey[1]));
      socket.emit('subscribe', { userId, nftIds, orderIds });
    };
    const onConnect = () => { void client.invalidateQueries({ queryKey: ['nfts'] }); void client.invalidateQueries({ queryKey: queryKeys.cart }); void client.invalidateQueries({ queryKey: ['order'] }); subscribe(); };
    const onSessionChanged = () => subscribe();
    const onCacheChanged = () => subscribe();
    const unsubscribeCache = client.getQueryCache().subscribe(onCacheChanged);
    socket.on('nft.updated', (_message, payload) => onNftUpdated((payload ?? _message) as NftUpdatedEvent));
    socket.on('order.updated', (_message, payload) => onOrderUpdated((payload ?? _message) as OrderUpdatedEvent));
    socket.on('connect', onConnect);
    window.addEventListener('kurio:session-changed', onSessionChanged);
    socket.connect();
    return () => { unsubscribeCache(); socket.off('nft.updated'); socket.off('order.updated'); socket.off('connect', onConnect); window.removeEventListener('kurio:session-changed', onSessionChanged); socket.disconnect(); };
  }, [client]);
  return null;
};
