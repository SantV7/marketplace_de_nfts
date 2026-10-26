# KURIO NFT Marketplace

Frontend responsivo do desafio descrito em [about_test.md](about_test.md), construído com React, TypeScript, TanStack Router/Query, Axios, Tailwind, MSW e Socket.IO. Os fluxos de descoberta, conta, carrinho, pagamento e recibo usam APIs REST simuladas.

## Execução local

Requer Node.js compatível com Vite 8 e npm.

```bash
npm ci
npm run dev
```

Credenciais de demonstração: `contato@email.com` / `Kurio123` e `colecionador@email.com` / `Kurio123`.

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desenvolvimento com MSW |
| `npm run typecheck` | Verificar TypeScript |
| `npm run lint` | ESLint |
| `npm run build` | Build de produção |
| `npm run build:demo` | Build de demonstração com MSW habilitado |
| `npm run preview` | Preview do build |
| `npx playwright test` | Playwright desktop/mobile e relatório HTML |
| `npm run test:e2e:report` | Abrir o relatório Playwright |
| `npm run audit:lighthouse` | Build com mocks e 3 auditorias por rota/perfil |
| `npm run audit:lighthouse:summary` | Regenerar medianas a partir dos relatórios JSON existentes |

## Mocks e cenários

O MSW é ativado em desenvolvimento. Use `npm run build:demo` para gerar a demonstração pronta para publicar, com os mocks habilitados pelo `.env.demo`. `POST /api/mock/reset` restaura os fixtures. Estado de demonstração persiste em `localStorage` para permitir refresh. A chave `kurio_mock_scenario` aceita `slow`, `variable`, `empty`, `offline`, `server-error`, `favorite-failure-once`, `wallet-connection-rejected`, `timeout-after-create`, `payment-pending` e `payment-rejected`.

O carrinho visitante é identificado localmente e mesclado na conta após login. Checkout, perfil, carteiras, favoritos e pedidos exigem sessão. Contratos REST, política de cache, eventos e limites do transporte estão em [ARCHITECTURE.md](ARCHITECTURE.md).

## Evidências e entrega

### Resultados da auditoria Lighthouse

Mediana de tres execucoes por pagina e perfil, em build com mocks (Lighthouse 13.5.0, Headless Chrome 156, Node 24.14.1, Windows):

| Pagina | Perfil | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Inicio | Mobile | 65 | 95 | 96 | 100 | 5014 ms | 0.000 | 463 ms |
| Inicio | Desktop | 38 | 97 | 96 | 100 | 4892 ms | 0.007 | 570 ms |
| Detalhe NFT | Mobile | 76 | 100 | 96 | 100 | 4807 ms | 0.000 | 180 ms |
| Detalhe NFT | Desktop | 58 | 95 | 96 | 100 | 4876 ms | 0.002 | 159 ms |

Performance ficou abaixo de 90 nas quatro combinacoes. O LCP mediano ficou entre 4.8 s e 5.0 s. A imagem LCP agora e descoberta no HTML e transfere em 8-30 ms; a demora principal vem da avaliacao de JavaScript e da montagem do app antes de os dados REST aparecerem. O trabalho de avaliacao de scripts chegou a 6.6 s em uma medicao desktop sob o perfil de auditoria. O build inclui a camada completa de MSW, contratos, Socket.IO e fluxos obrigatorios. Acessibilidade, Best Practices e SEO atingiram as metas em todas as combinacoes. Os relatorios HTML/JSON mostram as medidas por execucao e estao resumidos em `lighthouse-reports/summary.json`.

Testes e baselines visuais ficam em `tests/e2e/`; auditorias e medianas são gravadas em `lighthouse-reports/`. Confira `lighthouse-reports/summary.json` para pontuações, LCP, CLS, TBT e versões do ambiente.

### Publicação

Para Vercel, selecione `frontend` como diretório raiz, use `npm run build:demo` como comando de build e `dist` como diretório de saída. `vercel.json` encaminha rotas da aplicação para `index.html`, permitindo acesso direto e refresh. Para Netlify, `public/_redirects` fornece o fallback equivalente. Confirme `/`, `/market`, `/nft/42`, `/cart`, `/payment` e `/order-confirmation` no domínio publicado. A aplicação usa mocks e não depende de backend de produção.
