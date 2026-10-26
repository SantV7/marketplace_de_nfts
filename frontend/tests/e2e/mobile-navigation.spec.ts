import { expect, test } from '@playwright/test';

test('the mobile market shortcut keeps the mobile search and filters', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium');

  await page.goto('/');
  await page.getByRole('link', { name: 'Explorar mercado' }).click();

  await expect(page).toHaveURL(/\/market$/);
  await expect(page.getByRole('searchbox', { name: 'Explorar coleções' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Abrir filtros' })).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Navegação mobile' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'KURIO' })).toBeHidden();

  await page.getByRole('button', { name: 'Abrir filtros' }).click();
  await expect(page.locator('aside')).toBeVisible();
  await page.getByRole('searchbox', { name: 'Explorar coleções' }).fill('Emerald');
  await page.getByRole('searchbox', { name: 'Explorar coleções' }).press('Enter');
  await expect(page).toHaveURL(/q=Emerald/);
});

test('mobile NFT detail allows selecting edition and adding an item to cart', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile-chromium');

  await page.goto('/nft/42');

  await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Voltar ao mercado' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'KURIO' })).toBeHidden();
  await page.getByRole('button', { name: '1/10' }).first().click();
  await expect(page.getByRole('button', { name: '1/10' }).first()).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Aumentar quantidade, máximo 10' }).click();
  await expect(
    page.getByRole('region', { name: 'Detalhes de Emerald Ape' }).getByText('2', { exact: true }),
  ).toHaveText('2');

  await page.getByRole('button', { name: 'Comprar NFT' }).click();
  await expect(page).toHaveURL(/\/cart$/);
  await expect(page.getByRole('heading', { name: 'Carrinho de NFTs' })).toBeVisible();
});

test('desktop market retains its desktop navigation', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop-chromium');

  await page.goto('/market');

  await expect(page.getByRole('link', { name: 'KURIO' })).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Explorar coleções' })).toBeHidden();
  await expect(page.getByRole('navigation', { name: 'Navegação mobile' })).toBeHidden();
});
