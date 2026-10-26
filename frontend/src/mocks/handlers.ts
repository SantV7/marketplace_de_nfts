import { http, HttpResponse } from 'msw';
import { disconnectMockRealtime, emitMockRealtime, emitMockRealtimeForTest, getMockRealtimeSubscriptions, realtimeHandlers } from './realtime';
import { hashMockPassword, idempotentOrders, mockFavorites, mockNfts, mockProfiles, mockSessions, mockUserCarts, mockUsers, mockWallets, persistMockState, resetMockState, type MockCartItem } from './fixtures';

const apiError = (message: string, status: number) => HttpResponse.json({ message }, { status });
const toUnits = (value: string) => {
  const [whole = '0', fraction = ''] = value.split('.');
  return BigInt(whole) * 100_000_000n + BigInt(fraction.padEnd(8, '0').slice(0, 8));
};
const fromUnits = (value: bigint) => `${value / 100_000_000n}.${(value % 100_000_000n).toString().padStart(8, '0')}`;
const quoteVersion = (items: MockCartItem[], coupon?: string) => {
  const source = JSON.stringify({ items: items.map(({ id, price, quantity, availableQuantity }) => ({ id, price, quantity, availableQuantity })), coupon: coupon ?? '' });
  let hash = 2166136261;
  for (const character of source) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
};
const getUser = (request: Request) => {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const email = token ? mockSessions.get(token) : undefined;
  return mockUsers.find((user) => user.email === email);
};
const userFor = (request: Request) => getUser(request);
const cartOwner = (request: Request) => {
  const user = userFor(request);
  if (user) return user.id;
  const guestId = request.headers.get('x-guest-id');
  return guestId && /^[\w-]{16,80}$/.test(guestId) ? `guest:${guestId}` : undefined;
};
const cartFor = (userId: string) => {
  let cart = mockUserCarts.get(userId);
  if (!cart) { cart = []; mockUserCarts.set(userId, cart); }
  return cart;
};
const save = () => persistMockState();
const editionAvailability = (nftId: number, edition: string) => {
  const nft = mockNfts.find((item) => item.id === nftId);
  const selected = nft && 'editions' in nft && Array.isArray(nft.editions)
    ? nft.editions.find((item) => item.name === edition)
    : undefined;
  return selected?.available ?? nft?.available ?? 0;
};
const timedOutOrderKeys = new Set<string>();
const favoriteFailureConsumed = new Set<string>();
const shouldFailFavorite = (request: Request, userId: string) => {
  const scenario = new URL(request.url).searchParams.get('scenario') ?? localStorage.getItem('kurio_mock_scenario');
  if (scenario === 'favorite-error') return true;
  if (scenario === 'favorite-failure-once' && !favoriteFailureConsumed.has(userId)) {
    favoriteFailureConsumed.add(userId);
    localStorage.removeItem('kurio_mock_scenario');
    return true;
  }
  return false;
};

const requestDelay = async (request: Request) => {
  const scenario = new URL(request.url).searchParams.get('scenario') ?? localStorage.getItem('kurio_mock_scenario');
  if (scenario === 'slow') await new Promise((resolve) => setTimeout(resolve, 1200));
  if (scenario === 'variable') await new Promise((resolve) => setTimeout(resolve, 150 + (Number(new URL(request.url).searchParams.get('page') ?? '1') % 3) * 300));
  return scenario;
};

export const handlers = [
  ...realtimeHandlers,
  http.get('/api/nfts', async ({ request }) => {
    const scenario = await requestDelay(request);
    if (scenario === 'offline') return HttpResponse.error();
    if (scenario === 'server-error') return apiError('Falha transitória simulada', 503);
    const url = new URL(request.url);
    const search = url.searchParams.get('search') ?? '';
    const category = url.searchParams.get('category');
    const network = url.searchParams.getAll('network');
    const tab = url.searchParams.get('tab') ?? 'all';
    const sort = url.searchParams.get('sort') ?? 'recent';
    const min = Number(url.searchParams.get('min') ?? 0);
    const max = Number(url.searchParams.get('max') ?? Number.MAX_SAFE_INTEGER);
    const page = Math.max(1, Number(url.searchParams.get('page') ?? 1));
    const limit = Math.max(1, Number(url.searchParams.get('limit') ?? 9));
    let rows = mockNfts.filter((nft) => {
      const matchesText = !search || nft.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()) || String(nft.id).includes(search);
      return matchesText && (!category || nft.category === category) && (!network.length || network.includes(nft.network)) && Number(nft.price) >= min && Number(nft.price) <= max && (tab === 'all' || (tab === 'new' && nft.isNew) || (tab === 'trending' && nft.isTrending));
    });
    if (sort === 'price-asc') rows = rows.toSorted((a, b) => Number(a.price) - Number(b.price));
    if (sort === 'price-desc') rows = rows.toSorted((a, b) => Number(b.price) - Number(a.price));
    const total = rows.length;
    if (scenario === 'empty') rows = [];
    return HttpResponse.json({ data: rows.slice((page - 1) * limit, page * limit).map((nft) => ({ ...nft, version: nft.version ?? 1 })), total: scenario === 'empty' ? 0 : total, page, pageCount: Math.ceil(total / limit) });
  }),
  http.get('/api/nfts/:id', ({ params }) => {
    const nft = mockNfts.find((item) => String(item.id) === params.id);
    return nft ? HttpResponse.json({ ...nft, version: nft.version ?? 1 }) : apiError('NFT não encontrado', 404);
  }),
  http.get('/api/favorites', ({ request }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    return HttpResponse.json({ ids: [...(mockFavorites.get(user.id) ?? new Set<number>())] });
  }),
  http.put('/api/favorites/:id', async ({ request, params }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    if (shouldFailFavorite(request, user.id)) return apiError('Falha transitória ao atualizar favoritos.', 503);
    const id = Number(params.id);
    if (!mockNfts.some((item) => item.id === id)) return apiError('NFT não encontrado', 404);
    const favorites = mockFavorites.get(user.id) ?? new Set<number>();
    favorites.add(id);
    mockFavorites.set(user.id, favorites);
    await save();
    return HttpResponse.json({ ids: [...favorites] });
  }),
  http.delete('/api/favorites/:id', async ({ request, params }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    if (shouldFailFavorite(request, user.id)) return apiError('Falha transitória ao atualizar favoritos.', 503);
    const favorites = mockFavorites.get(user.id) ?? new Set<number>();
    favorites.delete(Number(params.id));
    mockFavorites.set(user.id, favorites);
    await save();
    return HttpResponse.json({ ids: [...favorites] });
  }),
  http.get('/api/cart', ({ request }) => {
    const owner = cartOwner(request);
    if (!owner) return apiError('Identificação do carrinho necessária', 400);
    return HttpResponse.json({ items: cartFor(owner) });
  }),
  http.post('/api/cart/items', async ({ request }) => {
    const owner = cartOwner(request);
    if (!owner) return apiError('Identificação do carrinho necessária', 400);
    const item = await request.json() as Omit<MockCartItem, 'id'>;
    const cart = cartFor(owner);
    const nftId = Number(item.nftId);
    const availability = editionAvailability(nftId, item.edition);
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > availability) return apiError('Disponibilidade insuficiente', 409);
    const existing = cart.find((row) => row.nftId === item.nftId && row.edition === item.edition && (row.styleId ?? 'normal') === (item.styleId ?? 'normal'));
    if (existing) {
      if (existing.quantity + item.quantity > availability) return apiError('Disponibilidade insuficiente', 409);
      existing.quantity += item.quantity;
      existing.availableQuantity = availability;
    } else cart.push({ ...item, id: `${item.nftId}:${item.edition}:${item.styleId ?? 'normal'}`, availableQuantity: availability });
    await save();
    return HttpResponse.json({ items: cart }, { status: 201 });
  }),
  http.patch('/api/cart/items/:id', async ({ request, params }) => {
    const owner = cartOwner(request);
    if (!owner) return apiError('Identificação do carrinho necessária', 400);
    const cart = cartFor(owner);
    const item = cart.find((row) => row.id === params.id);
    if (!item) return apiError('Item não encontrado', 404);
    const body = await request.json() as { quantity: number };
    if (!Number.isInteger(body.quantity) || body.quantity < 1 || body.quantity > editionAvailability(Number(item.nftId), item.edition)) return apiError('Disponibilidade insuficiente', 409);
    item.quantity = body.quantity;
    await save();
    return HttpResponse.json({ items: cart });
  }),
  http.delete('/api/cart/items/:id', async ({ request, params }) => {
    const owner = cartOwner(request);
    if (!owner) return apiError('Identificação do carrinho necessária', 400);
    const cart = cartFor(owner);
    const index = cart.findIndex((row) => row.id === params.id);
    if (index < 0) return apiError('Item não encontrado', 404);
    cart.splice(index, 1);
    await save();
    return HttpResponse.json({ items: cart });
  }),
  http.post('/api/cart/merge-guest', async ({ request }) => {
    const user = userFor(request);
    const guestId = request.headers.get('x-guest-id');
    if (!user) return apiError('Autenticação necessária', 401);
    if (!guestId) return apiError('Identificação do carrinho visitante necessária', 400);
    const guestOwner = `guest:${guestId}`;
    const guestCart = cartFor(guestOwner);
    const userCart = cartFor(user.id);
    for (const guestItem of guestCart) {
      const available = editionAvailability(Number(guestItem.nftId), guestItem.edition);
      const existing = userCart.find((item) => item.nftId === guestItem.nftId && item.edition === guestItem.edition && (item.styleId ?? 'normal') === (guestItem.styleId ?? 'normal'));
      if (guestItem.quantity + (existing?.quantity ?? 0) > available) return apiError('Não foi possível mesclar: disponibilidade insuficiente.', 409);
    }
    for (const guestItem of guestCart) {
      const existing = userCart.find((item) => item.nftId === guestItem.nftId && item.edition === guestItem.edition && (item.styleId ?? 'normal') === (guestItem.styleId ?? 'normal'));
      if (existing) existing.quantity += guestItem.quantity;
      else userCart.push({ ...guestItem });
    }
    mockUserCarts.delete(guestOwner);
    await save();
    return HttpResponse.json({ items: userCart });
  }),
  http.post('/api/quotes', async ({ request }) => {
    const owner = cartOwner(request);
    if (!owner) return apiError('Identificação do carrinho necessária', 400);
    const body = await request.json() as { coupon?: string };
    const cart = cartFor(owner);
    for (const item of cart) {
      const nft = mockNfts.find((entry) => String(entry.id) === item.nftId);
      if (!nft || nft.price !== item.price || item.quantity > editionAvailability(Number(item.nftId), item.edition)) {
        return apiError('PreÃ§o ou disponibilidade alterados. Atualize o carrinho antes de cotar.', 409);
      }
    }
    const subtotal = cart.reduce((sum, item) => sum + toUnits(item.price) * BigInt(item.quantity), 0n);
    const valid = !body.coupon || body.coupon.toUpperCase() === 'KURIO10';
    if (!valid) return apiError('Cupom inválido ou expirado', 422);
    const discount = body.coupon ? subtotal * 10n / 100n : 0n;
    const fee = cart.length ? 1_600_000n : 0n;
    return HttpResponse.json({ subtotal: fromUnits(subtotal), discount: fromUnits(discount), networkFee: fromUnits(fee), total: fromUnits(subtotal - discount + fee), currency: 'ETH', coupon: body.coupon?.toUpperCase(), expiresAt: new Date(Date.now() + 60_000).toISOString(), version: quoteVersion(cart, body.coupon?.toUpperCase()) });
  }),
  http.get('/api/auth/session', ({ request }) => {
    const user = getUser(request);
    if (!user) return apiError('Sessão inválida ou expirada', 401);
    return HttpResponse.json({ user: { id: user.id, email: user.email, name: user.name, username: user.username } });
  }),
  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as { email: string; username: string; password: string; name?: string };
    if (mockUsers.some((user) => user.email === body.email || user.username === body.username)) return apiError('E-mail ou usuário já cadastrado', 409);
    const user = { id: `usr_${Date.now()}`, email: body.email, username: body.username, name: body.name ?? body.username, passwordHash: await hashMockPassword(body.password) };
    mockUsers.push(user);
    const token = `mock-${user.id}`;
    mockSessions.set(token, user.email);
    await save();
    return HttpResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, username: user.username } }, { status: 201 });
  }),
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    const passwordHash = await hashMockPassword(body.password);
    const user = mockUsers.find((row) => row.email === body.email && (row.password === body.password || row.passwordHash === passwordHash));
    if (!user) return apiError('Credenciais inválidas', 401);
    const token = `mock-${user.id}`;
    mockSessions.set(token, user.email);
    await save();
    return HttpResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, username: user.username } });
  }),
  http.post('/api/auth/logout', async ({ request }) => {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (token) mockSessions.delete(token);
    await save();
    return new HttpResponse(null, { status: 204 });
  }),
  http.get('/api/profile', ({ request }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    return HttpResponse.json({ id: user.id, email: user.email, name: user.name, username: user.username, ...(mockProfiles.get(user.id) ?? {}) });
  }),
  http.patch('/api/profile', async ({ request }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    const changes = await request.json() as Record<string, unknown>;
    if (typeof changes.name !== 'string' || changes.name.trim().length < 2 || typeof changes.username !== 'string' || !/^[\w.-]{3,24}$/.test(changes.username)) return apiError('Nome ou nome de usuário inválido.', 422);
    if (changes.avatar && (typeof changes.avatar !== 'string' || !/^https?:\/\//i.test(changes.avatar))) return apiError('O avatar deve ser uma URL HTTP válida.', 422);
    const profile = { ...(mockProfiles.get(user.id) ?? {}), ...changes };
    mockProfiles.set(user.id, profile);
    await save();
    return HttpResponse.json(profile);
  }),
  http.put('/api/profile/password', async ({ request }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    const body = await request.json() as { currentPassword: string; newPassword: string };
    const currentPasswordHash = await hashMockPassword(body.currentPassword);
    if ((body.currentPassword !== user.password && currentPasswordHash !== user.passwordHash) || body.newPassword.length < 8) return apiError('Dados de senha inválidos', 422);
    user.password = undefined;
    user.passwordHash = await hashMockPassword(body.newPassword);
    await save();
    return HttpResponse.json({ updated: true });
  }),
  http.get('/api/wallets', ({ request }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    return HttpResponse.json({ wallets: mockWallets.get(user.id) ?? [] });
  }),
  http.post('/api/wallets', async ({ request }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    const wallet = await request.json() as Record<string, unknown>;
    const wallets = mockWallets.get(user.id) ?? [];
    if (typeof wallet.label !== 'string' || wallet.label.trim().length < 2 || typeof wallet.address !== 'string' || wallet.address.trim().length < 8 || !['Ethereum', 'Polygon', 'Solana'].includes(String(wallet.network))) return apiError('Dados da carteira inválidos.', 422);
    if (wallets.some((row) => row.address === wallet.address)) return apiError('Carteira já cadastrada', 409);
    wallets.push({ ...wallet, primary: wallets.length === 0, id: `wallet_${Date.now()}` });
    mockWallets.set(user.id, wallets);
    await save();
    return HttpResponse.json({ wallets }, { status: 201 });
  }),
  http.patch('/api/wallets/:id', async ({ request, params }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    const wallets = mockWallets.get(user.id) ?? [];
    const index = wallets.findIndex((wallet) => wallet.id === params.id);
    if (index < 0) return apiError('Carteira não encontrada', 404);
    const changes = await request.json() as Record<string, unknown>;
    const updated = { ...wallets[index], ...changes };
    if (typeof updated.label !== 'string' || updated.label.trim().length < 2 || typeof updated.address !== 'string' || updated.address.trim().length < 8 || !['Ethereum', 'Polygon', 'Solana'].includes(String(updated.network))) return apiError('Dados da carteira inválidos.', 422);
    if (wallets.some((wallet, walletIndex) => walletIndex !== index && wallet.address === updated.address)) return apiError('Carteira já cadastrada', 409);
    if (changes.primary === true) wallets.forEach((wallet, walletIndex) => { if (walletIndex !== index) wallet.primary = false; });
    wallets[index] = updated;
    await save();
    return HttpResponse.json({ wallets });
  }),
  http.post('/api/wallets/:id/connect', ({ request, params }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    if (!(mockWallets.get(user.id) ?? []).some((wallet) => wallet.id === params.id)) return apiError('Carteira não encontrada', 404);
    if (localStorage.getItem('kurio_mock_scenario') === 'wallet-connection-rejected') return apiError('Conexão recusada pelo utilizador.', 409);
    return HttpResponse.json({ connected: true, walletId: params.id });
  }),
  http.post('/api/wallets/:id/disconnect', ({ request, params }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    if (!(mockWallets.get(user.id) ?? []).some((wallet) => wallet.id === params.id)) return apiError('Carteira não encontrada', 404);
    return HttpResponse.json({ connected: false, walletId: params.id });
  }),
  http.post('/api/orders', async ({ request }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    const key = request.headers.get('idempotency-key');
    if (!key) return apiError('Chave de idempotência ausente', 400);
    const body = await request.json() as Record<string, unknown>;
    const fingerprint = JSON.stringify(Object.fromEntries(Object.entries(body).filter(([field]) => field !== 'quoteExpiresAt')));
    const scenario = new URL(request.url).searchParams.get('scenario') ?? localStorage.getItem('kurio_mock_scenario');
    const existing = idempotentOrders.get(key);
    if (existing) {
      if (existing.order.userId !== user.id) return apiError('Chave de idempotência de outro utilizador', 409);
      if (existing.fingerprint !== fingerprint) return apiError('Chave reutilizada com conteúdo diferente', 409);
      if (timedOutOrderKeys.has(key) || (existing.order.status === 'pending' && scenario === 'timeout-after-create')) {
        timedOutOrderKeys.delete(key);
    const order: Record<string, unknown> = { ...existing.order, status: 'confirmed', version: Number(existing.order.version) + 1 };
        idempotentOrders.set(key, { ...existing, order });
        const purchased = new Map((order.items as MockCartItem[]).map((item) => [item.id, item.quantity]));
        mockUserCarts.set(user.id, cartFor(user.id).flatMap((item) => { const quantity = item.quantity - (purchased.get(item.id) ?? 0); return quantity > 0 ? [{ ...item, quantity }] : []; }));
        await save();
        emitMockRealtime(user.id, 'order.updated', { orderId: String(order.orderId), status: 'confirmed', version: order.version });
        return HttpResponse.json(order);
      }
      return HttpResponse.json(existing.order);
    }
    const cart = cartFor(user.id);
    const items = Array.isArray(body.items) ? body.items as MockCartItem[] : [];
    if (!items.length || JSON.stringify(items) !== JSON.stringify(cart)) return apiError('Carrinho alterado. Revise a compra.', 409);
    for (const item of items) {
      const nft = mockNfts.find((entry) => String(entry.id) === item.nftId);
      if (!nft || nft.price !== item.price || item.quantity > editionAvailability(Number(item.nftId), item.edition)) return apiError('Preço ou disponibilidade alterados. Revise a compra.', 409);
    }
    const subtotal = items.reduce((sum, item) => sum + toUnits(item.price) * BigInt(item.quantity), 0n);
    const fee = items.length ? 1_600_000n : 0n;
    const coupon = typeof body.coupon === 'string' ? body.coupon : undefined;
    if ((coupon && coupon !== 'KURIO10') || Number(body.quoteVersion) !== quoteVersion(cart, coupon) || Date.parse(String(body.quoteExpiresAt)) <= Date.now()) return apiError('Cotação, cupom ou expiração inválidos. Revise a compra.', 409);
    const expectedDiscount = coupon ? subtotal * 10n / 100n : 0n;
    if (toUnits(String(body.discount ?? '0')) !== expectedDiscount || toUnits(String(body.total)) !== subtotal - expectedDiscount + fee || toUnits(String(body.networkFee)) !== fee) return apiError('Cotação desatualizada. Revise os valores.', 409);
    const rejected = scenario === 'payment-rejected';
    const order = { userId: user.id, orderId: `ORD-${key.slice(0, 12)}`, status: rejected ? 'rejected' : scenario === 'timeout-after-create' || scenario === 'payment-pending' ? 'pending' : 'confirmed', items: items.map((item) => ({ ...item })), total: body.total, discount: body.discount ?? '0', networkFee: body.networkFee ?? '0', txHash: rejected ? '' : '0xA91FE82C', wallet: body.wallet, provider: body.provider, network: body.network, version: 1, date: new Date().toISOString() };
    idempotentOrders.set(key, { fingerprint, order });
    if (scenario === 'timeout-after-create') timedOutOrderKeys.add(key);
    if (order.status === 'confirmed') {
      const purchased = new Map(items.map((item) => [item.id, item.quantity]));
      const remaining = cart.flatMap((item) => {
        const quantity = item.quantity - (purchased.get(item.id) ?? 0);
        return quantity > 0 ? [{ ...item, quantity }] : [];
      });
      mockUserCarts.set(user.id, remaining);
    }
    await save();
    if (scenario === 'timeout-after-create') return HttpResponse.error();
    return HttpResponse.json(order, { status: 201 });
  }),
  http.get('/api/orders/:id', ({ request, params }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    const order = [...idempotentOrders.values()].find((entry) => entry.order.orderId === params.id && entry.order.userId === user.id)?.order;
    return order ? HttpResponse.json(order) : apiError('Pedido não encontrado', 404);
  }),
  http.post('/api/mock/scenarios/nft-price-change', async ({ request }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    const nft = mockNfts.find((item) => item.id === 42);
    if (!nft) return apiError('NFT não encontrado', 404);
    nft.price = '2.39';
    nft.available = 3;
    nft.version = (nft.version ?? 1) + 1;
    if (nft.editions) nft.editions = nft.editions.map((edition) => ({ ...edition, available: Math.min(edition.available, 3) }));
    const userCart = cartFor(user.id);
    for (const item of userCart) {
      if (item.nftId === String(nft.id)) { item.price = nft.price; item.availableQuantity = editionAvailability(nft.id, item.edition); }
    }
    await save();
    emitMockRealtime(user.id, 'nft.updated', { id: nft.id, price: nft.price, available: nft.available, version: nft.version });
    return HttpResponse.json({ updated: true, nft });
  }),
  http.get('/api/mock/scenarios/socket-status', () => HttpResponse.json({ subscriptions: getMockRealtimeSubscriptions() })),
  http.post('/api/mock/scenarios/replay-nft-events', ({ request }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    const nft = mockNfts.find((item) => item.id === 42);
    if (!nft) return apiError('NFT não encontrado', 404);
    const version = nft.version ?? 1;
    const available = nft.available;
    const current = { id: nft.id, price: nft.price, available, version };
    emitMockRealtime(user.id, 'nft.updated', current);
    emitMockRealtime(user.id, 'nft.updated', { ...current, price: '0.01', version: Math.max(0, version - 1) });
    emitMockRealtime(user.id, 'nft.updated', current);
    return HttpResponse.json({ emitted: ['current', 'stale', 'duplicate'], version });
  }),
  http.post('/api/mock/scenarios/foreign-user-event', ({ request }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    const otherUserId = user.id === 'usr_1' ? 'usr_2' : 'usr_1';
    emitMockRealtimeForTest(user.id, 'nft.updated', { id: 42, price: '9.99', available: 1, version: 999, userId: otherUserId });
    return HttpResponse.json({ emitted: true });
  }),
  http.post('/api/mock/scenarios/socket-disconnect', ({ request }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    disconnectMockRealtime(user.id);
    return HttpResponse.json({ disconnected: true });
  }),
  http.post('/api/mock/scenarios/orders/:id/:status', async ({ request, params }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    const status = params.status;
    if (status !== 'confirmed' && status !== 'rejected') return apiError('Estado terminal inválido', 422);
    const found = [...idempotentOrders.entries()].find(([, entry]) => entry.order.orderId === params.id && entry.order.userId === user.id);
    if (!found) return apiError('Pedido não encontrado', 404);
    const [key, entry] = found;
    if (entry.order.status !== 'pending') return HttpResponse.json(entry.order);
    const order: Record<string, unknown> = { ...entry.order, status, version: Number(entry.order.version) + 1, txHash: status === 'confirmed' ? '0xA91FE82C' : '' };
    idempotentOrders.set(key, { ...entry, order });
    if (status === 'confirmed') {
      const purchased = new Map((order.items as MockCartItem[]).map((item) => [item.id, item.quantity]));
      mockUserCarts.set(user.id, cartFor(user.id).flatMap((item) => { const quantity = item.quantity - (purchased.get(item.id) ?? 0); return quantity > 0 ? [{ ...item, quantity }] : []; }));
    }
    await save();
    emitMockRealtime(user.id, 'order.updated', { orderId: String(order.orderId), status, version: order.version });
    return HttpResponse.json(order);
  }),
  http.post('/api/mock/reset', () => { resetMockState(); timedOutOrderKeys.clear(); favoriteFailureConsumed.clear(); return HttpResponse.json({ reset: true }); }),
  http.get('/api/mock/reset', () => { resetMockState(); timedOutOrderKeys.clear(); favoriteFailureConsumed.clear(); return HttpResponse.json({ reset: true }); }),
  http.post('*/api/mock/reset', () => { resetMockState(); timedOutOrderKeys.clear(); favoriteFailureConsumed.clear(); return HttpResponse.json({ reset: true }); }),
  http.get('*/api/mock/reset', () => { resetMockState(); timedOutOrderKeys.clear(); favoriteFailureConsumed.clear(); return HttpResponse.json({ reset: true }); }),
];
