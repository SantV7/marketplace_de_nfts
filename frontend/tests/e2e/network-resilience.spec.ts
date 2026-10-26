import { expect, test, type Page } from '@playwright/test';

type ApiData = Record<string, unknown> & { items?: Array<Record<string, unknown>>; ids?: number[]; total?: string; discount?: string; status?: string; orderId?: string; version?: number; expiresAt?: string; coupon?: string };

const request = (page: Page, path: string, method = 'GET', body?: unknown, key?: string) => page.evaluate(async ({ path, method, body, key }) => {
  await navigator.serviceWorker.ready;
  return new Promise<{ status: number; data: ApiData }>((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open(method, path);
  xhr.timeout = 15_000;
  xhr.setRequestHeader('content-type', 'application/json');
  let guestId = localStorage.getItem('kurio_guest_id');
  if (!guestId) { guestId = crypto.randomUUID(); localStorage.setItem('kurio_guest_id', guestId); }
  xhr.setRequestHeader('x-guest-id', guestId);
  const token = localStorage.getItem('kurio_token');
  if (token) xhr.setRequestHeader('authorization', `Bearer ${token}`);
  if (key) xhr.setRequestHeader('idempotency-key', key);
  xhr.onloadend = () => {
    let data: ApiData;
    try { data = xhr.responseText ? JSON.parse(xhr.responseText) as ApiData : {}; } catch { data = { raw: xhr.responseText }; }
    resolve({ status: xhr.status, data });
  };
  xhr.ontimeout = () => reject(new Error(`Timed out waiting for ${method} ${path}`));
  xhr.onerror = () => resolve({ status: 0, data: {} });
  xhr.send(body === undefined ? undefined : JSON.stringify(body));
  });
}, { path, method, body, key });

const login = async (page: Page, email = 'contato@email.com', password = 'Kurio123') => {
  const result = await request(page, '/api/auth/login', 'POST', { email, password });
  expect(result.status, 'A preparação da sessão deve receber HTTP 200').toBe(200);
  if (result.status === 200) {
    await page.evaluate((token) => { localStorage.setItem('kurio_token', token); window.dispatchEvent(new Event('kurio:session-changed')); }, String(result.data.token));
    await request(page, '/api/cart/merge-guest', 'POST');
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
  const response = await request(page, '/api/wallets');
  const wallet = (response.data.wallets as Array<{ address: string; network: string }>)[0];
  return { items: cart.data.items, total: quote.data.total, discount: quote.data.discount, networkFee: quote.data.networkFee, coupon: quote.data.coupon, quoteVersion: quote.data.version, quoteExpiresAt: quote.data.expiresAt, wallet: wallet.address, provider: 'metamask', network: wallet.network };
};

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-10-26T12:00:00Z'));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /SEJA DONO/ })).toBeVisible({ timeout: 15_000 });
  await expect(page.getByRole('link', { name: 'Ver Emerald Ape #042' })).toBeVisible();
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  expect((await request(page, '/api/mock/reset', 'POST')).status).toBe(200);
});

test('visitor cart and quote work without a session while private checkout rejects expired sessions', async ({ page }) => {
  expect((await request(page, '/api/cart')).status).toBe(200);
  expect((await request(page, '/api/quotes', 'POST', {})).status).toBe(200);
  await page.evaluate(() => localStorage.setItem('kurio_token', 'mock-expired'));
  expect((await request(page, '/api/auth/session')).status).toBe(401);
  await page.goto('/payment');
  await expect(page).toHaveURL(/\/login\?redirect=/);
});

test('visitor cart is preserved and merged into the account at login', async ({ page }) => {
  expect((await addItem(page)).status).toBe(201);
  expect((await request(page, '/api/cart')).data.items).toHaveLength(1);
  await page.reload();
  await expect(page.getByRole('heading', { name: /SEJA DONO/ })).toBeVisible();
  expect((await login(page)).status).toBe(200);
  expect((await request(page, '/api/cart')).data.items).toHaveLength(1);
});

test('catalog combines category, network, sort and page in URL history and API requests', async ({ page }) => {
  const catalogRequests: string[] = [];
  page.on('request', (requestEvent) => { if (requestEvent.url().includes('/api/nfts?')) catalogRequests.push(requestEvent.url()); });
  await page.goto('/market?page=2');
  await expect(page.getByRole('heading', { name: 'Mercado de NFTs' })).toBeAttached();
  if (await page.getByRole('button', { name: 'Abrir filtros' }).isVisible().catch(() => false)) await page.getByRole('button', { name: 'Abrir filtros' }).click();
  await page.getByRole('button', { name: /Arte digital/ }).first().click();
  await expect(page).not.toHaveURL(/page=2/);
  await page.getByRole('button', { name: /Ethereum/ }).first().click();
  await page.getByRole('combobox', { name: 'Ordenar NFTs' }).selectOption('price-asc');
  await expect(page).toHaveURL(/category=Arte/);
  await expect.poll(() => page.evaluate(() => new URL(location.href).searchParams.get('network'))).toContain('Ethereum');
  await expect(page).toHaveURL(/sort=price-asc/);
  expect(catalogRequests.some((url) => {
    const params = decodeURIComponent(new URL(url).search);
    return params.includes('category=Arte') && params.includes('Ethereum') && params.includes('sort=price-asc');
  })).toBeTruthy();
  await page.goBack();
  await expect(page).not.toHaveURL(/sort=price-asc/);
  await page.reload();
  await expect(page).toHaveURL(/category=Arte/);
});

test('slow loading, transient catalog failure and retry recover in the interface', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('kurio_mock_scenario', 'slow'));
  await page.goto('/market');
  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible({ timeout: 8_000 });
  await page.evaluate(() => localStorage.setItem('kurio_mock_scenario', 'server-error'));
  await page.goto('/market?q=server-failure');
  await expect(page.getByRole('alert')).toContainText('Não foi possível carregar os NFTs.');
  await page.evaluate(() => localStorage.removeItem('kurio_mock_scenario'));
  await page.goto('/market');
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible();
});

test('login dialog exposes keyboard focus and required fields accessibly', async ({ page }) => {
  await page.goto('/login');
  const dialog = page.getByRole('dialog', { name: 'Entrar' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(dialog.locator(':focus')).toBeVisible();
  await expect(dialog.getByRole('textbox', { name: 'contato@email.com' })).toHaveAttribute('aria-required', 'true');
  await expect(dialog.getByRole('textbox', { name: 'Senha' })).toHaveAttribute('aria-required', 'true');
});

test('visitor cart quantity, coupon removal and item removal work through the interface', async ({ page }) => {
  await addItem(page);
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Carrinho de NFTs' })).toBeVisible();
  await page.getByRole('button', { name: 'Aumentar quantidade de Emerald Ape' }).first().click();
  await expect(page.locator('span[aria-live="polite"]:visible').filter({ hasText: /^2$/ })).toBeVisible();
  await page.locator('input#cart-coupon:visible').fill('KURIO10');
  await page.getByRole('button', { name: 'Aplicar' }).click();
  await expect(page.locator('#coupon-feedback')).toContainText('Cupom aplicado');
  await page.getByRole('button', { name: 'Remover cupom' }).click();
  await expect(page.locator('#coupon-feedback')).toContainText('Cupom removido');
  await page.getByRole('button', { name: 'Remover Emerald Ape do carrinho' }).first().click();
  await expect(page.locator('h2:visible').filter({ hasText: 'Seu carrinho está vazio' })).toBeVisible();
});

test('authenticated cart and mock session survive a page refresh', async ({ page }) => {
  expect((await login(page)).status).toBe(200);
  expect(await page.evaluate(() => localStorage.getItem('kurio_token'))).toBeTruthy();
  expect((await addItem(page)).status).toBe(201);
  expect((await request(page, '/api/auth/session')).status).toBe(200);
  await page.reload();
  const persisted = await page.evaluate(() => ({ token: localStorage.getItem('kurio_token'), state: localStorage.getItem('kurio_mock_state_v1') }));
  await expect(page.getByRole('heading', { name: /SEJA DONO/ })).toBeVisible();
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

test('favorite mutation rolls back after a failure and succeeds on retry', async ({ page }) => {
  await login(page);
  await page.goto('/nft/42');
  const favorite = page.getByRole('button', { name: 'Adicionar aos favoritos' });
  await expect(favorite).toBeVisible();
  await page.evaluate(() => localStorage.setItem('kurio_mock_scenario', 'favorite-failure-once'));
  await favorite.click();
  await expect(page.getByRole('alert')).toContainText('Não foi possível atualizar os favoritos.');
  await expect(page.getByRole('button', { name: 'Adicionar aos favoritos' })).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Adicionar aos favoritos' }).click();
  await expect(page.getByRole('button', { name: 'Remover dos favoritos' })).toHaveAttribute('aria-pressed', 'true');
});

test('profile, password and wallet changes validate and persist after refresh', async ({ page }) => {
  await login(page);
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Perfil do colecionador' })).toBeVisible({ timeout: 15_000 });
  await page.locator('input[name="name"]').fill('Vinicius Atualizado');
  await page.locator('input[name="avatar"]').fill('https://example.test/avatar.png');
  await page.getByRole('button', { name: 'Salvar perfil' }).click();
  await expect(page.getByText('Perfil atualizado.', { exact: true })).toBeVisible();
  expect((await request(page, '/api/profile', 'PATCH', { name: 'X', username: 'bad', avatar: 'not-a-url' })).status).toBe(422);

  await page.locator('input[name="currentPassword"]').fill('Kurio123');
  await page.locator('input[name="newPassword"]').fill('Kurio456');
  await page.locator('input[name="confirmPassword"]').fill('Kurio456');
  await page.getByRole('button', { name: 'Atualizar senha' }).click();
  await expect(page.getByText('Senha alterada.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('input[name="name"]')).toHaveValue('Vinicius Atualizado');
  await expect(page.locator('input[name="avatar"]')).toHaveValue('https://example.test/avatar.png');

  await page.goto('/wallets');
  await expect(page.getByRole('heading', { name: 'Carteiras', exact: true })).toBeVisible();
  await page.locator('input[name="label"]').last().fill('Coleção');
  await page.locator('input[name="address"]').last().fill('0x9999000000000000000000000000000000009999');
  await page.getByRole('button', { name: 'Adicionar carteira' }).click();
  await expect(page.getByText('Carteira cadastrada.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('input[name="address"]').nth(2)).toHaveValue('0x9999000000000000000000000000000000009999');
  await page.locator('input[name="label"]').first().fill('Carteira principal editada');
  await page.getByRole('button', { name: 'Salvar carteira' }).first().click();
  await expect(page.getByText('Carteira atualizada.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('input[name="label"]').first()).toHaveValue('Carteira principal editada');
  await request(page, '/api/auth/logout', 'POST');
  expect((await login(page, 'contato@email.com', 'Kurio456')).status).toBe(200);
});

test('checkout simulates wallet connection, refusal and disconnection using a saved wallet', async ({ page }) => {
  await login(page);
  await addItem(page);
  await page.goto('/payment');
  await expect(page.getByRole('button', { name: 'Conectar carteira' })).toBeVisible();
  await page.evaluate(() => localStorage.setItem('kurio_mock_scenario', 'wallet-connection-rejected'));
  await page.getByRole('button', { name: 'Conectar carteira' }).click();
  await expect(page.getByRole('status')).toContainText('conexão da carteira foi recusada');
  await page.evaluate(() => localStorage.removeItem('kurio_mock_scenario'));
  await page.getByRole('button', { name: 'Conectar carteira' }).click();
  await expect(page.getByRole('button', { name: 'Desconectar carteira' })).toBeVisible();
  await page.getByRole('button', { name: 'Desconectar carteira' }).click();
  await expect(page.getByRole('button', { name: 'Conectar carteira' })).toBeVisible();
});

test('purchase completes from NFT detail to confirmed receipt without duplicate orders', async ({ page }) => {
  await login(page);
  await page.goto('/nft/42');
  const buy = page.getByRole('button', { name: /COMPRAR|Comprar NFT/i }).first();
  await expect(buy).toBeVisible();
  await buy.click();
  await expect(page).toHaveURL(/\/cart$/);
  await page.goto('/payment');
  await expect(page.getByRole('button', { name: 'Conectar carteira' })).toBeVisible();
  {
    await page.locator('input[name="displayName"]').fill('Vinicius');
    await page.locator('input[name="username"]').fill('santv7');
    await page.locator('select[name="network"]').selectOption('Ethereum');
    await page.locator('input[name="profileName"]').fill('Colecionador');
    await page.locator('input[name="referralCode"]').fill('KURIO');
    await page.locator('input[name="email"]').fill('contato@email.com');
    await page.locator('input[name="ensName"]').fill('vinicius');
  }
  await page.getByRole('button', { name: 'Conectar carteira' }).click();
  await expect(page.getByRole('button', { name: 'Desconectar carteira' })).toBeVisible();
  const submit = page.getByRole('button', { name: 'Confirmar compra' });
  await submit.dblclick();
  await expect(page).toHaveURL(/\/order-confirmation$/);
  await expect(page.getByRole('heading', { name: 'Recibo demonstrativo do pedido' })).toBeVisible();
  const orderId = await page.evaluate(() => localStorage.getItem('kurio-order-id'));
  expect(orderId).toBeTruthy();
  expect((await request(page, '/api/orders/' + orderId)).data.status).toBe('confirmed');
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
  await request(page, '/api/mock/scenarios/replay-nft-events', 'POST', {});
  await request(page, '/api/mock/scenarios/foreign-user-event', 'POST', {});
  await expect(page.locator('span:visible').filter({ hasText: '2.39 ETH' }).first()).toBeVisible();
});

test('Socket.IO reconnects, resubscribes active NFTs and reconciles REST state', async ({ page }) => {
  await login(page);
  await page.goto('/nft/42');
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible();
  const before = await request(page, '/api/mock/scenarios/socket-status');
  const initialConnections = Number((before.data.subscriptions as { connectionCount: number }).connectionCount);
  await request(page, '/api/mock/scenarios/socket-disconnect', 'POST', {});
  await expect.poll(async () => {
    const result = await request(page, '/api/mock/scenarios/socket-status');
    const state = result.data.subscriptions as { connectionCount: number; clients: Array<{ userId: string; nftIds: number[] }> };
    return state.connectionCount > initialConnections && state.clients.some((client) => client.userId === 'usr_1' && client.nftIds.includes(42));
  }, { timeout: 15_000 }).toBeTruthy();
});

test('Socket.IO terminal order events update the API-backed receipt after reload', async ({ page }) => {
  await login(page);
  await addItem(page);
  const payload = await orderPayload(page);
  await page.evaluate(() => localStorage.setItem('kurio_mock_scenario', 'payment-pending'));
  const created = await request(page, '/api/orders?scenario=payment-pending', 'POST', payload, 'pending-transaction-001');
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

const prepareCheckout = async (page: Page) => {
  await login(page);
  await addItem(page);
  await page.goto('/payment');
  await page.locator('input[name="displayName"]').fill('Colecionador de teste');
  await page.locator('input[name="username"]').fill('santv7');
  await page.locator('input[name="profileName"]').fill('Minha coleção');
  await page.locator('input[name="referralCode"]').fill('KURIO');
  await page.locator('input[name="email"]').fill('contato@email.com');
  await page.locator('input[name="ensName"]').fill('colecionador');
  await page.getByRole('button', { name: 'Conectar carteira' }).click();
  await expect(page.getByRole('button', { name: 'Desconectar carteira' })).toBeVisible();
};

test('checkout recovers a timed-out transaction through the interface after refresh', async ({ page }) => {
  await prepareCheckout(page);
  const keys: string[] = [];
  page.on('request', (req) => { if (req.method() === 'POST' && req.url().endsWith('/api/orders')) keys.push(req.headers()['idempotency-key']); });
  await page.evaluate(() => localStorage.setItem('kurio_mock_scenario', 'timeout-after-create'));
  await page.getByRole('button', { name: 'Confirmar compra' }).click();
  await expect(page.getByRole('status')).toContainText('tentativa foi guardada');
  await page.reload();
  await expect(page.locator('input[name="displayName"]')).toHaveValue('Colecionador de teste');
  await page.getByRole('button', { name: 'Confirmar compra' }).click();
  await expect(page.getByRole('heading', { name: 'Recibo demonstrativo do pedido' })).toBeVisible();
  expect(keys).toHaveLength(2);
  expect(keys[1]).toBe(keys[0]);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Recibo demonstrativo do pedido' })).toBeVisible();
});

test('checkout displays payment refusal and preserves the cart after refresh', async ({ page }) => {
  await prepareCheckout(page);
  await page.evaluate(() => localStorage.setItem('kurio_mock_scenario', 'payment-rejected'));
  await page.getByRole('button', { name: 'Confirmar compra' }).click();
  await expect(page.getByRole('status')).toContainText('Pagamento recusado');
  await page.reload();
  await expect(page.getByRole('status')).toContainText('Pagamento recusado');
  await page.goto('/cart');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Remover Emerald Ape do carrinho' })).toBeVisible();
  expect((await request(page, '/api/cart')).data.items).toHaveLength(1);
});

test('checkout requires a second confirmation after a Socket.IO price change', async ({ page }) => {
  await prepareCheckout(page);
  let orders = 0;
  page.on('request', (req) => { if (req.method() === 'POST' && req.url().endsWith('/api/orders')) orders++; });
  await request(page, '/api/mock/scenarios/nft-price-change', 'POST');
  await expect(page.getByRole('status')).toContainText('Preço ou disponibilidade alterados');
  await expect(page.getByText('2.406 ETH', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar compra' }).click();
  await expect(page.getByRole('status')).toContainText('confirme novamente');
  expect(orders).toBe(0);
  await page.getByRole('button', { name: 'Confirmar compra' }).click();
  await expect(page).toHaveURL(/order-confirmation/);
  expect(orders).toBe(1);
});

test('sold-out editions block checkout and preserve the order draft', async ({ page }) => {
  await prepareCheckout(page);
  await request(page, '/api/mock/scenarios/nft-sold-out', 'POST');
  await expect(page.getByRole('status')).toContainText('Preço ou disponibilidade alterados');
  await page.getByRole('button', { name: 'Confirmar compra' }).click();
  await expect(page.getByRole('status')).toContainText('Não foi possível validar');
  await expect(page).toHaveURL(/payment/);
  expect((await request(page, '/api/cart')).data.items).toHaveLength(1);
});

test('session expiration during checkout restores collector context after login', async ({ page }) => {
  await prepareCheckout(page);
  await request(page, '/api/auth/expire', 'POST');
  await page.getByRole('button', { name: 'Confirmar compra' }).click();
  await expect(page).toHaveURL(/login\?redirect=/);
  await page.getByRole('textbox', { name: 'contato@email.com' }).fill('contato@email.com');
  await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('Kurio123');
  await page.locator('form').getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/payment/);
  await expect(page.locator('input[name="displayName"]')).toHaveValue('Colecionador de teste');
  await expect(page.locator('input[name="referralCode"]')).toHaveValue('KURIO');
});

test('pending checkout reconciles its confirmed state after socket interruption', async ({ page }) => {
  await prepareCheckout(page);
  await page.evaluate(() => localStorage.setItem('kurio_mock_scenario', 'payment-pending'));
  const created = page.waitForResponse((response) => response.url().endsWith('/api/orders') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Confirmar compra' }).click();
  const order = await (await created).json() as { orderId: string };
  await expect(page.getByRole('status')).toContainText('Pedido pendente');
  await request(page, '/api/mock/scenarios/socket-disconnect', 'POST');
  await request(page, `/api/mock/scenarios/orders/${order.orderId}/confirmed`, 'POST');
  await expect(page.getByRole('heading', { name: 'Recibo demonstrativo do pedido' })).toBeVisible({ timeout: 15_000 });
  await request(page, `/api/mock/scenarios/orders/${order.orderId}/rejected`, 'POST');
  expect((await request(page, `/api/orders/${order.orderId}`)).data.status).toBe('confirmed');
});

test('late catalog responses cannot replace the latest search', async ({ page }) => {
  await page.evaluate(() => localStorage.setItem('kurio_mock_scenario', 'variable'));
  await page.goto('/market?page=2');
  await page.goto('/market?q=Emerald&page=1');
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Golden Beat #207' })).not.toBeVisible();
  await expect(page).toHaveURL(/q=Emerald/);
});

test('gallery dialog traps keyboard focus and returns it on Escape', async ({ page }) => {
  test.skip(test.info().project.name === 'mobile-chromium', 'Ampliação pertence ao frame desktop; o detalhe mobile tem galeria inline.');
  await page.goto('/nft/42');
  const trigger = page.getByRole('button', { name: 'Ampliar imagem' });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(dialog.locator(':focus')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('registration, logout and account switch clear private interface data', async ({ page }) => {
  const routeErrors: string[] = [];
  page.on('pageerror', (error) => routeErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error' && message.text().includes('Could not find an active match')) routeErrors.push(message.text());
  });
  await page.goto('/register');
  await page.getByPlaceholder('Nome de usuário').fill('novo_colecionador');
  await page.getByPlaceholder('Digite seu e-mail').fill('novo@example.test');
  await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('Kurio456');
  await page.getByPlaceholder('Confirmar senha').fill('Kurio456');
  await page.locator('form').getByRole('button', { name: /Criar perfil|Criar conta/ }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/nft/42');
  await page.getByRole('button', { name: 'Adicionar aos favoritos' }).click();
  await expect(page.getByRole('button', { name: 'Remover dos favoritos' })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/profile');
  await expect(page.locator('#favorites')).toContainText('Emerald Ape');
  await page.getByRole('button', { name: 'Sair da conta' }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'contato@email.com' }).fill('colecionador@email.com');
  await page.getByRole('textbox', { name: 'Senha', exact: true }).fill('Kurio123');
  await page.locator('form').getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto('/profile');
  await expect(page.locator('input[name="name"]')).toHaveValue('Marina Costa');
  await expect(page.locator('#favorites')).toContainText('Nenhum NFT favorito');
  expect(routeErrors).toEqual([]);
});

test('layouts reflow at mobile, tablet, desktop and equivalent 200 percent zoom', async ({ page }) => {
  test.setTimeout(90_000);
  test.skip(test.info().project.name !== 'desktop-chromium', 'Matriz de larguras executada uma vez.');
  await login(page);
  await addItem(page);
  for (const width of [390, 768, 1440, 720]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/nft/42', '/cart', '/payment', '/profile', '/wallets']) {
      await page.goto(path);
      await expect(page.locator('h1:visible').first()).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${path} at ${width}px`).toBeTruthy();
    }
  }
});
