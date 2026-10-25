# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile-navigation.spec.ts >> mobile NFT detail allows selecting edition and adding an item to cart
- Location: tests\e2e\mobile-navigation.spec.ts:22:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: locator('[aria-live="polite"]')
Expected: "2"
Error: strict mode violation: locator('[aria-live="polite"]') resolved to 2 elements:
    1) <span aria-live="polite" class="min-w-4 text-center text-xl text-[#F5F1EB]">2</span> aka getByRole('region', { name: 'Detalhes de Emerald Ape' }).getByText('2', { exact: true })
    2) <span aria-live="polite" class="px-3 text-[14px] font-bold text-[#F5F1EB]">2</span> aka getByText('2').nth(5)

Call log:
  - Expect "toHaveText" locator('[aria-live="polite"]') with timeout 5000ms
  - waiting for locator('[aria-live="polite"]')

```

# Page snapshot

```yaml
- main [ref=e4]:
  - region "Detalhes de Emerald Ape" [ref=e5]:
    - generic [ref=e6]:
      - button "Voltar ao mercado" [ref=e7]
      - button "Adicionar aos favoritos" [ref=e10]
    - 'img "Emerald Ape #042" [ref=e13]'
    - generic [ref=e14]:
      - generic [ref=e15]:
        - 'heading "Emerald Ape #042" [level=1] [ref=e16]'
        - generic [ref=e17]: 5.0 (3)
      - paragraph [ref=e20]: Um colecionável digital 1/10 finalizado à mão da coleção Kurio Editions, verificado na Ethereum.
      - generic [ref=e21]:
        - heading "Edição:" [level=2] [ref=e22]
        - generic [ref=e23]:
          - button "1/1" [ref=e24]
          - button "1/10" [pressed] [ref=e25]
          - button "1/50" [ref=e26]
          - button "ABERTA" [ref=e27]
      - generic [ref=e28]:
        - paragraph [ref=e29]: "ID do token: #042"
        - paragraph [ref=e30]: "Coleção: Kurio Editions"
        - paragraph [ref=e31]: "Atributos: Arte Digital, Verificado, Raro"
      - generic [ref=e32]:
        - generic [ref=e33]:
          - generic [ref=e34]:
            - generic [ref=e35]: Qtd.
            - button "Diminuir quantidade" [ref=e36]
            - generic [ref=e38]: "2"
            - button "Aumentar quantidade, máximo 10" [active] [ref=e39]
          - generic [ref=e41]: 1.19 ETH
        - generic [ref=e42]:
          - button "Comprar NFT" [ref=e43]
          - button "Adicionar NFT ao carrinho" [ref=e44]
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | test('the mobile market shortcut keeps the mobile search and filters', async ({ page }, testInfo) => {
  4  |   test.skip(testInfo.project.name !== 'mobile-chromium');
  5  | 
  6  |   await page.goto('/');
  7  |   await page.getByRole('link', { name: 'Explorar mercado' }).click();
  8  | 
  9  |   await expect(page).toHaveURL(/\/market$/);
  10 |   await expect(page.getByRole('searchbox', { name: 'Explorar coleções' })).toBeVisible();
  11 |   await expect(page.getByRole('button', { name: 'Abrir filtros' })).toBeVisible();
  12 |   await expect(page.getByRole('navigation', { name: 'Navegação mobile' })).toBeVisible();
  13 |   await expect(page.getByRole('link', { name: 'KURIO' })).toBeHidden();
  14 | 
  15 |   await page.getByRole('button', { name: 'Abrir filtros' }).click();
  16 |   await expect(page.locator('aside')).toBeVisible();
  17 |   await page.getByRole('searchbox', { name: 'Explorar coleções' }).fill('Emerald');
  18 |   await page.getByRole('searchbox', { name: 'Explorar coleções' }).press('Enter');
  19 |   await expect(page).toHaveURL(/q=Emerald/);
  20 | });
  21 | 
  22 | test('mobile NFT detail allows selecting edition and adding an item to cart', async ({ page }, testInfo) => {
  23 |   test.skip(testInfo.project.name !== 'mobile-chromium');
  24 | 
  25 |   await page.goto('/nft/42');
  26 | 
  27 |   await expect(page.getByRole('heading', { name: 'Emerald Ape #042' })).toBeVisible();
  28 |   await expect(page.getByRole('button', { name: 'Voltar ao mercado' })).toBeVisible();
  29 |   await expect(page.getByRole('link', { name: 'KURIO' })).toBeHidden();
  30 |   await page.getByRole('button', { name: '1/10' }).first().click();
  31 |   await expect(page.getByRole('button', { name: '1/10' }).first()).toHaveAttribute('aria-pressed', 'true');
  32 |   await page.getByRole('button', { name: 'Aumentar quantidade, máximo 10' }).click();
> 33 |   await expect(page.locator('[aria-live="polite"]')).toHaveText('2');
     |                                                      ^ Error: expect(locator).toHaveText(expected) failed
  34 | 
  35 |   await page.getByRole('button', { name: 'Comprar NFT' }).click();
  36 |   await expect(page).toHaveURL(/\/cart$/);
  37 |   await expect(page.getByRole('heading', { name: 'Carrinho de NFTs' })).toBeVisible();
  38 | });
  39 | 
  40 | test('desktop market retains its desktop navigation', async ({ page }, testInfo) => {
  41 |   test.skip(testInfo.project.name !== 'desktop-chromium');
  42 | 
  43 |   await page.goto('/market');
  44 | 
  45 |   await expect(page.getByRole('link', { name: 'KURIO' })).toBeVisible();
  46 |   await expect(page.getByRole('searchbox', { name: 'Explorar coleções' })).toBeHidden();
  47 |   await expect(page.getByRole('navigation', { name: 'Navegação mobile' })).toBeHidden();
  48 | });
  49 | 
```