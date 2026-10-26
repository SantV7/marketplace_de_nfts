import { http, HttpResponse } from 'msw';
import { realtimeHandlers } from './realtime';
import { idempotentOrders, mockCartItems, mockFavorites, mockNfts, mockProfiles, mockSessions, mockUsers, mockWallets, resetMockState, type MockCartItem } from './fixtures';

const apiError = (message: string, status: number) => HttpResponse.json({ message }, { status });
const getUser = (request: Request) => {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const email = token ? mockSessions.get(token) : undefined;
  return mockUsers.find((user) => user.email === email);
};
const cartFor = () => mockCartItems;
const editionAvailability = (nftId: number, edition: string) => {
  const nft = mockNfts.find((item) => item.id === nftId);
  const selected = nft && 'editions' in nft && Array.isArray(nft.editions)
    ? nft.editions.find((item) => item.name === edition)
    : undefined;
  return selected?.available ?? nft?.available ?? 0;
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
    return HttpResponse.json({ data: rows.slice((page - 1) * limit, page * limit), total: scenario === 'empty' ? 0 : total, page, pageCount: Math.ceil(total / limit) });
  }),
  http.get('/api/nfts/:id', ({ params }) => {
    const nft = mockNfts.find((item) => String(item.id) === params.id);
    return nft ? HttpResponse.json(nft) : apiError('NFT não encontrado', 404);
  }),
  http.get('/api/favorites', ({ request }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    return HttpResponse.json({ ids: [...(mockFavorites.get(user.id) ?? new Set<number>())] });
  }),
  http.put('/api/favorites/:id', ({ request, params }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    const id = Number(params.id);
    if (!mockNfts.some((item) => item.id === id)) return apiError('NFT não encontrado', 404);
    const favorites = mockFavorites.get(user.id) ?? new Set<number>();
    favorites.add(id);
    mockFavorites.set(user.id, favorites);
    return HttpResponse.json({ ids: [...favorites] });
  }),
  http.delete('/api/favorites/:id', ({ request, params }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    const favorites = mockFavorites.get(user.id) ?? new Set<number>();
    favorites.delete(Number(params.id));
    mockFavorites.set(user.id, favorites);
    return HttpResponse.json({ ids: [...favorites] });
  }),
  http.get('/api/cart', () => HttpResponse.json({ items: cartFor() })),
  http.post('/api/cart/items', async ({ request }) => {
    const item = await request.json() as Omit<MockCartItem, 'id'>;
    const nftId = Number(item.nftId);
    const availability = editionAvailability(nftId, item.edition);
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > availability) return apiError('Disponibilidade insuficiente', 409);
    const existing = mockCartItems.find((row) => row.nftId === item.nftId && row.edition === item.edition && (row.styleId ?? 'normal') === (item.styleId ?? 'normal'));
    if (existing) {
      if (existing.quantity + item.quantity > availability) return apiError('Disponibilidade insuficiente', 409);
      existing.quantity += item.quantity;
      existing.availableQuantity = availability;
    } else mockCartItems.push({ ...item, id: `${item.nftId}:${item.edition}:${item.styleId ?? 'normal'}`, availableQuantity: availability });
    return HttpResponse.json({ items: mockCartItems }, { status: 201 });
  }),
  http.patch('/api/cart/items/:id', async ({ request, params }) => {
    const item = mockCartItems.find((row) => row.id === params.id);
    if (!item) return apiError('Item não encontrado', 404);
    const body = await request.json() as { quantity: number };
    if (!Number.isInteger(body.quantity) || body.quantity < 1 || body.quantity > editionAvailability(Number(item.nftId), item.edition)) return apiError('Disponibilidade insuficiente', 409);
    item.quantity = body.quantity;
    return HttpResponse.json({ items: mockCartItems });
  }),
  http.delete('/api/cart/items/:id', ({ params }) => {
    const index = mockCartItems.findIndex((row) => row.id === params.id);
    if (index < 0) return apiError('Item não encontrado', 404);
    mockCartItems.splice(index, 1);
    return HttpResponse.json({ items: mockCartItems });
  }),
  http.post('/api/quotes', async ({ request }) => {
    const body = await request.json() as { coupon?: string };
    const subtotal = mockCartItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
    const valid = !body.coupon || body.coupon.toUpperCase() === 'KURIO10';
    if (!valid) return apiError('Cupom inválido ou expirado', 422);
    const discount = body.coupon ? (subtotal * 10 / 100).toFixed(8) : '0';
    const fee = mockCartItems.length ? '0.016' : '0';
    return HttpResponse.json({ subtotal: subtotal.toFixed(8), discount, networkFee: fee, total: (subtotal - Number(discount) + Number(fee)).toFixed(8), currency: 'ETH', expiresAt: new Date(Date.now() + 60_000).toISOString(), version: 1 });
  }),
  http.get('/api/auth/session', ({ request }) => {
    const user = getUser(request) ?? mockUsers[0];
    return HttpResponse.json({ user: { id: user.id, email: user.email, name: user.name, username: user.username } });
  }),
  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as { email: string; username: string; password: string; name?: string };
    if (mockUsers.some((user) => user.email === body.email || user.username === body.username)) return apiError('E-mail ou usuário já cadastrado', 409);
    const user = { id: `usr_${Date.now()}`, email: body.email, username: body.username, name: body.name ?? body.username, password: body.password };
    mockUsers.push(user);
    const token = `mock-${user.id}`;
    mockSessions.set(token, user.email);
    return HttpResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, username: user.username } }, { status: 201 });
  }),
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    const user = mockUsers.find((row) => row.email === body.email && row.password === body.password);
    if (!user) return apiError('Credenciais inválidas', 401);
    const token = `mock-${user.id}`;
    mockSessions.set(token, user.email);
    return HttpResponse.json({ token, user: { id: user.id, email: user.email, name: user.name, username: user.username } });
  }),
  http.post('/api/auth/logout', ({ request }) => {
    const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    if (token) mockSessions.delete(token);
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
    const profile = { ...(mockProfiles.get(user.id) ?? {}), ...changes };
    mockProfiles.set(user.id, profile);
    return HttpResponse.json(profile);
  }),
  http.put('/api/profile/password', async ({ request }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    const body = await request.json() as { currentPassword: string; newPassword: string };
    if (body.currentPassword !== user.password || body.newPassword.length < 8) return apiError('Dados de senha inválidos', 422);
    user.password = body.newPassword;
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
    if (wallets.some((row) => row.address === wallet.address)) return apiError('Carteira já cadastrada', 409);
    wallets.push({ ...wallet, id: `wallet_${Date.now()}` });
    mockWallets.set(user.id, wallets);
    return HttpResponse.json({ wallets }, { status: 201 });
  }),
  http.patch('/api/wallets/:id', async ({ request, params }) => {
    const user = getUser(request);
    if (!user) return apiError('Autenticação necessária', 401);
    const wallets = mockWallets.get(user.id) ?? [];
    const index = wallets.findIndex((wallet) => wallet.id === params.id);
    if (index < 0) return apiError('Carteira não encontrada', 404);
    wallets[index] = { ...wallets[index], ...(await request.json() as Record<string, unknown>) };
    return HttpResponse.json({ wallets });
  }),
  http.post('/api/orders', async ({ request }) => {
    const key = request.headers.get('idempotency-key');
    if (!key) return apiError('Chave de idempotência ausente', 400);
    const body = await request.json() as Record<string, unknown>;
    const fingerprint = JSON.stringify(body);
    const existing = idempotentOrders.get(key);
    if (existing) return existing.fingerprint === fingerprint ? HttpResponse.json(existing.order) : apiError('Chave reutilizada com conteúdo diferente', 409);
    if (!getUser(request)) return apiError('Autenticação necessária', 401);
    const order = { orderId: `ORD-${key.slice(0, 12)}`, status: 'confirmed', items: mockCartItems.map((item) => ({ ...item })), total: body.total, discount: body.discount ?? '0', networkFee: body.networkFee ?? '0', txHash: '0xA91FE82C', version: 1, date: new Date().toISOString() };
    idempotentOrders.set(key, { fingerprint, order });
    mockCartItems.splice(0);
    return HttpResponse.json(order, { status: 201 });
  }),
  http.get('/api/orders/:id', ({ request, params }) => {
    if (!getUser(request)) return apiError('Autenticação necessária', 401);
    const order = [...idempotentOrders.values()].find((entry) => entry.order.orderId === params.id)?.order;
    return order ? HttpResponse.json(order) : apiError('Pedido não encontrado', 404);
  }),
  http.post('/api/mock/reset', () => { resetMockState(); return HttpResponse.json({ reset: true }); }),
  http.get('/api/mock/reset', () => { resetMockState(); return HttpResponse.json({ reset: true }); }),
  http.post('*/api/mock/reset', () => { resetMockState(); return HttpResponse.json({ reset: true }); }),
  http.get('*/api/mock/reset', () => { resetMockState(); return HttpResponse.json({ reset: true }); }),
];
