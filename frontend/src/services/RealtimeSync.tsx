import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getMarketplaceSocket, type NftUpdatedEvent, type OrderUpdatedEvent } from './socket';
import { queryKeys } from './queries';
import type { CartItem, Nft, NftPage, Order, Session } from './contracts';

export const RealtimeSync = () => {
  const client = useQueryClient();
  useEffect(() => {
    const socket = getMarketplaceSocket();
    const versions = new Map<string, number>();
    let subscribed = '';
    let queued = false;
    let connectedBefore = false;
    let disposed = false;
    const owner = () => localStorage.getItem('kurio_token')
      ? client.getQueryData<Session>(queryKeys.session)?.user.id
      : `guest:${localStorage.getItem('kurio_guest_id')}`;

    const onNftUpdated = (event: NftUpdatedEvent) => {
      if (event.userId !== owner()) return;
      const key = `nft:${event.id}`;
      const cachedVersion = Math.max(
        ...client.getQueriesData<NftPage>({ queryKey: ['nfts'] }).flatMap(([, page]) => page?.data.filter((nft) => nft.id === event.id).map((nft) => nft.version ?? 1) ?? []),
        client.getQueryData<Nft>(queryKeys.nft(String(event.id)))?.version ?? 1,
      );
      if (Math.max(versions.get(key) ?? 1, cachedVersion) >= event.version) return;
      versions.set(key, event.version);
      const update = (nft: Nft): Nft => nft.id === event.id ? { ...nft, price: event.price, available: event.available, editions: event.editions ?? nft.editions?.map((edition) => ({ ...edition, available: Math.min(edition.available, event.available) })), version: event.version } : nft;
      client.setQueriesData<NftPage>({ queryKey: ['nfts'] }, (page) => page && ({ ...page, data: page.data.map(update) }));
      client.setQueryData<Nft>(queryKeys.nft(String(event.id)), (nft) => nft && update(nft));
      void client.invalidateQueries({ queryKey: ['nfts'] });
      void client.invalidateQueries({ queryKey: queryKeys.cart });
      void client.invalidateQueries({ queryKey: ['quote'] });
      window.dispatchEvent(new CustomEvent('kurio:nft-updated', { detail: event }));
    };
    const onOrderUpdated = (event: OrderUpdatedEvent) => {
      if (event.userId !== owner()) return;
      const key = `order:${event.orderId}`;
      const order = client.getQueryData<Order>(queryKeys.order(event.orderId));
      if (order?.status === 'confirmed' || order?.status === 'rejected' || Math.max(versions.get(key) ?? 1, order?.version ?? 1) >= event.version) return;
      versions.set(key, event.version);
      void client.invalidateQueries({ queryKey: queryKeys.order(event.orderId) });
      void client.invalidateQueries({ queryKey: queryKeys.cart });
      void client.invalidateQueries({ queryKey: ['quote'] });
    };
    const subscribe = () => {
      if (disposed || !socket.connected) return;
      const queries = client.getQueryCache().getAll().filter((query) => query.getObserversCount() > 0);
      const nftIds = [...new Set(queries.flatMap((query) => {
        if (query.queryKey[0] === 'nft') return [Number(query.queryKey[1])];
        if (query.queryKey[0] === 'nfts') return ((query.state.data as NftPage | undefined)?.data ?? []).map((nft) => nft.id);
        if (query.queryKey[0] === 'cart') return ((query.state.data as CartItem[] | undefined) ?? []).map((item) => Number(item.nftId));
        return [];
      }).filter(Number.isFinite))].sort((a, b) => a - b);
      const orderIds = queries.filter((query) => query.queryKey[0] === 'order' && query.queryKey[1]).map((query) => String(query.queryKey[1])).sort();
      const resource = { token: localStorage.getItem('kurio_token') ?? undefined, guestId: localStorage.getItem('kurio_guest_id') ?? undefined, nftIds, orderIds };
      const fingerprint = JSON.stringify(resource);
      if (fingerprint === subscribed) return;
      subscribed = fingerprint;
      socket.emit('subscribe', resource);
    };
    const scheduleSubscription = () => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => { queued = false; subscribe(); });
    };
    const onConnect = () => {
      subscribed = '';
      if (connectedBefore) {
        for (const key of ['nfts', 'nft', 'cart', 'quote', 'order', 'order-attempt', 'session']) void client.invalidateQueries({ queryKey: [key], refetchType: 'active' });
      }
      connectedBefore = true;
      subscribe();
    };
    const onSessionChanged = () => { versions.clear(); subscribed = ''; subscribe(); };
    const unsubscribeCache = client.getQueryCache().subscribe(scheduleSubscription);
    socket.on('nft.updated', onNftUpdated);
    socket.on('order.updated', onOrderUpdated);
    socket.on('connect', onConnect);
    window.addEventListener('kurio:session-changed', onSessionChanged);
    socket.connect();
    return () => {
      disposed = true;
      unsubscribeCache();
      socket.off('nft.updated', onNftUpdated);
      socket.off('order.updated', onOrderUpdated);
      socket.off('connect', onConnect);
      window.removeEventListener('kurio:session-changed', onSessionChanged);
      socket.disconnect();
    };
  }, [client]);
  return null;
};
