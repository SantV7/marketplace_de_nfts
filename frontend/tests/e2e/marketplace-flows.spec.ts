import { expect, test } from '@playwright/test';

test('catalog search is sent to the HTTP mock and preserved in the URL', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile-chromium');
  const calls: string[] = [];
  page.on('request', (request) => { if (request.url().includes('/api/nfts')) calls.push(request.url()); });
  await page.goto('/market');
  const search = page.getByRole('searchbox', { name: 'Explorar coleções' });
  await search.fill('Emerald');
  await search.press('Enter');
  await expect(page).toHaveURL(/q=Emerald/);
  await expect(page.getByText('Emerald Ape').first()).toBeVisible();
  expect(calls.some((url) => url.includes('search=Emerald'))).toBeTruthy();
});

test('changing a catalog tab keeps the current scroll position', async ({ page }) => {
  await page.goto('/market');
  const tab = page.getByRole('tab', { name: 'Novos lançamentos' });
  await tab.scrollIntoViewIfNeeded();
  const scrollBefore = await page.evaluate(() => window.scrollY);
  await tab.click();
  await expect(page).toHaveURL(/tab=new/);
  const scrollAfter = await page.evaluate(() => window.scrollY);
  expect(Math.abs(scrollAfter - scrollBefore)).toBeLessThan(20);
});

test('detail displays API not-found state for an unknown NFT', async ({ page }) => {
  await page.goto('/nft/404404');
  await expect(page.getByRole('heading', { name: /NFT não encontrado/i })).toBeVisible();
});

test('login uses the MSW session endpoint', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile-chromium');
  await page.goto('/login');
  await page.getByRole('textbox', { name: 'contato@email.com' }).fill('contato@email.com');
  await page.getByRole('textbox', { name: 'Senha' }).first().fill('Kurio123');
  const login = page.waitForResponse((response) => response.url().includes('/api/auth/login'));
  await page.getByRole('button', { name: 'Entrar', exact: true }).last().click();
  expect((await login).ok()).toBeTruthy();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('kurio_token'))).toBeTruthy();
});

test('payment redirects to login, then resumes the requested route', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile-chromium');
  await page.goto('/payment');
  await expect(page).toHaveURL(/\/login\?redirect=%2Fpayment/);
  await expect(page.getByRole('dialog', { name: 'Entrar' })).toBeVisible();
  await page.getByRole('textbox', { name: 'contato@email.com' }).fill('contato@email.com');
  await page.getByRole('textbox', { name: 'Senha' }).fill('Kurio123');
  await page.locator('form').getByRole('button', { name: 'Entrar', exact: true }).click();
  await expect(page).toHaveURL(/\/payment$/);
});

test('duplicate registration displays the API conflict', async ({ page }) => {
  test.skip(test.info().project.name !== 'mobile-chromium');
  await page.goto('/register');
  await page.getByPlaceholder('Nome de usuário').first().fill('santv7');
  await page.getByPlaceholder('Digite seu e-mail').first().fill('contato@email.com');
  await page.getByRole('textbox', { name: 'Senha' }).first().fill('Kurio123');
  await page.getByPlaceholder('Confirmar senha').first().fill('Kurio123');
  await page.getByRole('button', { name: 'Criar perfil' }).click();
  await expect(page.getByRole('status')).toContainText(/já cadastrado/i);
});

