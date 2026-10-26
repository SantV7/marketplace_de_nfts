import { expect, test, type Page } from '@playwright/test';

const apiRequest = (page: Page, path: string, method = 'GET', body?: unknown) => page.evaluate(async ({ path, method, body }) => {
  await navigator.serviceWorker.ready;
  return new Promise<{ data: Record<string, unknown> }>((resolve, reject) => {
  const xhr = new XMLHttpRequest();
  xhr.open(method, path);
  xhr.timeout = 15_000;
  xhr.setRequestHeader('content-type', 'application/json');
  let guestId = localStorage.getItem('kurio_guest_id');
  if (!guestId) { guestId = crypto.randomUUID(); localStorage.setItem('kurio_guest_id', guestId); }
  xhr.setRequestHeader('x-guest-id', guestId);
  const token = localStorage.getItem('kurio_token');
  if (token) xhr.setRequestHeader('authorization', `Bearer ${token}`);
  xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve({ data: xhr.responseText ? JSON.parse(xhr.responseText) as Record<string, unknown> : {} }) : reject(new Error(`Request failed: ${xhr.status}`));
  xhr.onerror = () => reject(new Error('Mock API is unavailable.'));
  xhr.ontimeout = () => reject(new Error(`Timed out waiting for ${method} ${path}`));
  xhr.send(body === undefined ? undefined : JSON.stringify(body));
  });
}, { path, method, body });

const reset = async (page: Page) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /SEJA DONO/ })).toBeVisible();
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await apiRequest(page, '/api/mock/reset', 'POST');
};

const addFixture = async (page: Page, authenticated: boolean) => {
  if (authenticated) {
    const response = await apiRequest(page, '/api/auth/login', 'POST', { email: 'contato@email.com', password: 'Kurio123' });
    await page.evaluate((token) => localStorage.setItem('kurio_token', token), String(response.data.token));
    await apiRequest(page, '/api/cart/merge-guest', 'POST');
  }
  const nft = await apiRequest(page, '/api/nfts/42');
  await apiRequest(page, '/api/cart/items', 'POST', { nftId: '42', name: nft.data.name, image: nft.data.image, price: nft.data.price, edition: '1/10', quantity: 1, availableQuantity: 10 });
};

test('home visual baseline', async ({ page }) => {
  await reset(page);
  await expect(page.getByRole('heading', { name: /SEJA DONO/ })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('home.png', { fullPage: true, animations: 'disabled' });
});

test('NFT detail visual baseline', async ({ page }) => {
  await reset(page);
  await page.goto('/nft/42');
  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('nft-detail.png', { fullPage: true, animations: 'disabled' });
});

test('cart visual baseline', async ({ page }) => {
  await reset(page);
  await addFixture(page, false);
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'Carrinho de NFTs' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('cart.png', { fullPage: true, animations: 'disabled' });
});

test('payment visual baseline', async ({ page }) => {
  await reset(page);
  await addFixture(page, true);
  await page.goto('/payment');
  await expect(page.getByRole('button', { name: 'Conectar carteira' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect(page).toHaveScreenshot('payment.png', { fullPage: true, animations: 'disabled' });
});
