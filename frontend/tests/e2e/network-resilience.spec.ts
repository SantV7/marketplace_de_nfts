import { expect, test, type Page } from '@playwright/test';

type ApiData = Record<string, unknown> & { items?: Array<Record<string, unknown>>; ids?: number[]; total?: string; discount?: string; status?: string; orderId?: string; version?: number; expiresAt?: string; coupon?: string };

const request = (page: Page, path: string, method = 'GET', body?: unknown, key?: string) => page.evaluate(({ path, method, body, key }) => new Promise<{ status: number; data: ApiData }>((resolve) => {
  const xhr = new XMLHttpRequest();
  xhr.open(method, path);
  xhr.setRequestHeader('content-type', 'application/json');
  const token = localStorage.getItem('kurio_token');
  if (token) xhr.setRequestHeader('authorization', `Bearer ${token}`);
  if (key) xhr.setRequestHeader('idempotency-key', key);
  xhr.onloadend = () => {
    let data: ApiData;
    try { data = xhr.responseText ? JSON.parse(xhr.responseText) as ApiData : {}; } catch { data = { raw: xhr.responseText }; }
    resolve({ status: xhr.status, data });
  };
  xhr.onerror = () => resolve({ status: 0, data: {} });
  xhr.send(body === undefined ? undefined : JSON.stringify(body));
}), { path, method, body, key });

const login = async (page: Page, email = 'contato@email.com', password = 'Kurio123') => {
  const result = await request(page, '/api/auth/login', 'POST', { email, password });
  if (result.status === 200) {
    await page.evaluate((token) => { localStorage.setItem('kurio_token', token); window.dispatchEvent(new Event('kurio:session-changed')); }, String(result.data.token));
  }
  return result;
};

const addItem = async (page: Page, quantity = 1) => {
  const nft = await request(page, '/api/nfts/42');
  return request(page, '/api/cart/items', 'POST', { nftId: '42', name: nft.data.name, image: nft.data.image, price: nft.data.price, edition: '1/10', quantity, availableQuantity: 10 });
};

const orderPayload = async (page: Page) => {
  const cart = await request(page, '/api/cart');
  const quote = await request(page, '/api/quotes', 'POST', {});
  return { items: cart.data.items, total: quote.data.total, discount: quote.data.discount, networkFee: quote.data.networkFee, coupon: quote.data.coupon, quoteVersion: quote.data.version, quoteExpiresAt: quote.data.expiresAt, wallet: '0xmock-wallet', provider: 'metamask', network: 'Ethereum' };
};

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /SEJA DONO/ })).toBeVisible();
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await request(page, '/api/mock/reset', 'POST');
});

test('cart and quote reject unauthenticated or expired sessions', async ({ page }) => {
  expect((await request(page, '/api/cart')).status).toBe(401);
  expect((await request(page, '/api/quotes', 'POST', {})).status).toBe(401);
  await page.evaluate(() => localStorage.setItem('kurio_token', 'mock-expired'));
  expect((await request(page, '/api/auth/session')).status).toBe(401);
  await page.goto('/cart');
  await expect(page).toHaveURL(/\/login\?redirect=/);
});

test('authenticated cart and mock session survive a page refresh', async ({ page }) => {
  expect((await login(page)).status).toBe(200);
  expect(await page.evaluate(() => localStorage.getItem('kurio_token'))).toBeTruthy();
  expect((await addItem(page)).status).toBe(201);
  expect((await request(page, '/api/auth/session')).status).toBe(200);
  await page.reload();
  const persisted = await page.evaluate(() => ({ token: localStorage.getItem('kurio_token'), state: localStorage.getItem('kurio_mock_state_v1') }));
  expect(persisted.token).toBeTruthy();
  expect((await request(page, '/api/auth/session')).status).toBe(200);
  const cart = await request(page, '/api/cart');
  expect(cart.status).toBe(200);
  expect(cart.data.items).toHaveLength(1);
  expect((await request(page, '/api/auth/session')).status).toBe(200);
});

test('favorites and private cart data stay isolated when the account changes', async ({ page }) => {
  await login(page);
  expect((await request(page, '/api/favorites/42', 'PUT')).status).toBe(200);
  await addItem(page);
  await request(page, '/api/auth/logout', 'POST');
  await login(page, 'colecionador@email.com');
  expect((await request(page, '/api/favorites')).data.ids).toEqual([]);
  expect((await request(page, '/api/cart')).data.items).toEqual([]);
});

test('invalid and valid coupon responses reflect the authenticated cart quote', async ({ page }) => {
  await login(page);
  await addItem(page);
  expect((await request(page, '/api/quotes', 'POST', { coupon: 'EXPIRED' })).status).toBe(422);
  const quote = await request(page, '/api/quotes', 'POST', { coupon: 'KURIO10' });
  expect(quote.status).toBe(200);
  expect(quote.data.discount).toBe('0.11900000');
  expect(BigInt(Math.round(Number(quote.data.total) * 100_000_000))).toBeGreaterThan(0n);
});

test('catalog changes reject an order built from stale price and availability', async ({ page }) => {
  await login(page);
  await addItem(page);
  const staleOrder = await orderPayload(page);
  expect((await request(page, '/api/mock/scenarios/nft-price-change', 'POST', {})).status).toBe(200);
  expect((await request(page, '/api/orders', 'POST', staleOrder, 'stale-price-key')).status).toBe(409);
});

test('quote rejects a cart quantity that exceeds updated edition availability', async ({ page }) => {
  await login(page);
  expect((await addItem(page, 4)).status).toBe(201);
  expect((await request(page, '/api/mock/scenarios/nft-price-change', 'POST', {})).status).toBe(200);
  expect((await request(page, '/api/quotes', 'POST', {})).status).toBe(409);
});

test('same idempotency key recovers the created order after a timeout and refresh', async ({ page }) => {
  await login(page);
  await addItem(page);
  const payload = await orderPayload(page);
  await page.evaluate(() => localStorage.setItem('kurio_mock_scenario', 'timeout-after-create'));
  const first = await request(page, '/api/orders', 'POST', payload, 'timeout-transaction-001');
  expect(first.status).toBe(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: /SEJA DONO/ })).toBeVisible();
  const recovered = await request(page, '/api/orders', 'POST', payload, 'timeout-transaction-001');
  expect(recovered.status).toBe(200);
  expect(recovered.data.status).toBe('confirmed');
  expect((await request(page, '/api/cart')).data.items).toEqual([]);
});

test('rejected payment preserves cart contents', async ({ page }) => {
  await login(page);
  await addItem(page);
  const payload = await orderPayload(page);
  await page.evaluate(() => localStorage.setItem('kurio_mock_scenario', 'payment-rejected'));
  const order = await request(page, '/api/orders', 'POST', payload, 'rejected-transaction-001');
  expect(order.status).toBe(201);
  expect(order.data.status).toBe('rejected');
  expect((await request(page, '/api/cart')).data.items).toHaveLength(1);
});

test('reusing an idempotency key with different order data returns a conflict', async ({ page }) => {
  await login(page);
  await addItem(page);
  const payload = await orderPayload(page);
  const first = await request(page, '/api/orders', 'POST', payload, 'fixed-key-conflict-001');
  expect(first.status).toBe(201);
  expect((await request(page, '/api/orders', 'POST', { ...payload, total: '99' }, 'fixed-key-conflict-001')).status).toBe(409);
});

test('price events arrive through Socket.IO and update the NFT screen', async ({ page }) => {
  await login(page);
  await page.goto('/nft/42');
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible();
  const subscriptions = await request(page, '/api/mock/scenarios/socket-status');
  expect(JSON.stringify(subscriptions.data)).toContain('42');
  const update = await request(page, '/api/mock/scenarios/nft-price-change', 'POST', {});
  expect(update.status, JSON.stringify(update.data)).toBe(200);
  await expect(page.locator('span:visible').filter({ hasText: '2.39 ETH' }).first()).toBeVisible({ timeout: 8_000 });
});

test('Socket.IO terminal order events update the API-backed receipt after reload', async ({ page }) => {
  await login(page);
  await addItem(page);
  const payload = await orderPayload(page);
  await page.evaluate(() => localStorage.setItem('kurio_mock_scenario', 'payment-pending'));
  const created = await request(page, '/api/orders', 'POST', payload, 'pending-transaction-001');
  expect(created.data.status).toBe('pending');
  await page.evaluate((id) => localStorage.setItem('kurio-order-id', id), created.data.orderId);
  await page.reload();
  await page.goto('/order-confirmation');
  await expect(page.getByText('O pedido ainda está pendente.')).toBeVisible();
  await request(page, `/api/mock/scenarios/orders/${created.data.orderId}/confirmed`, 'POST', {});
  await expect(page.getByRole('heading', { name: 'Recibo demonstrativo do pedido' })).toBeVisible({ timeout: 8_000 });
});

test('private order retrieval does not disclose another user’s order', async ({ page }) => {
  await login(page);
  await addItem(page);
  const payload = await orderPayload(page);
  const created = await request(page, '/api/orders', 'POST', payload, 'private-order-transaction');
  await request(page, '/api/auth/logout', 'POST');
  await login(page, 'colecionador@email.com');
  expect((await request(page, `/api/orders/${created.data.orderId}`)).status).toBe(404);
});
