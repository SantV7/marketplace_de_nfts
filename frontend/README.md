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
| `npm run preview` | Preview do build |
| `npx playwright test` | Playwright desktop/mobile e relatório HTML |
| `npm run test:e2e:report` | Abrir o relatório Playwright |
| `npm run audit:lighthouse` | Build com mocks e 3 auditorias por rota/perfil |
| `npm run audit:lighthouse:summary` | Regenerar medianas a partir dos relatórios JSON existentes |

## Mocks e cenários

O MSW é ativado em desenvolvimento e pode ser incluído no build de demonstração com `VITE_ENABLE_MOCKS=true`. `POST /api/mock/reset` restaura os fixtures. Estado de demonstração persiste em `localStorage` para permitir refresh. A chave `kurio_mock_scenario` aceita `slow`, `variable`, `empty`, `offline`, `server-error`, `favorite-failure-once`, `wallet-connection-rejected`, `timeout-after-create`, `payment-pending` e `payment-rejected`.

O carrinho visitante é identificado localmente e mesclado na conta após login. Checkout, perfil, carteiras, favoritos e pedidos exigem sessão. Contratos REST, política de cache, eventos e limites do transporte estão em [ARCHITECTURE.md](ARCHITECTURE.md).

## Evidências e entrega

### Resultados da auditoria Lighthouse

Mediana de tres execucoes por pagina e perfil, em build com mocks (Lighthouse 13.5.0, Headless Chrome 156, Node 24.14.1, Windows):

| Pagina | Perfil | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Inicio | Mobile | 66 | 95 | 96 | 100 | 3849 ms | 0.000 | 704 ms |
| Inicio | Desktop | 42 | 97 | 96 | 100 | 3672 ms | 0.007 | 539 ms |
| Detalhe NFT | Mobile | 59 | 100 | 96 | 100 | 3793 ms | 0.000 | 1370 ms |
| Detalhe NFT | Desktop | 63 | 95 | 96 | 100 | 3802 ms | 0.002 | 100 ms |

Performance ficou abaixo de 90 nas quatro combinacoes. Os relatorios medem LCP entre 3.67 s e 3.85 s, tarefa JavaScript bloqueante mais alta no detalhe mobile, cerca de 95 kB de JavaScript nao utilizado na amostra mobile da pagina inicial e aproximadamente 150 ms de recursos que bloqueiam a renderizacao. O build completo de demonstracao inclui MSW, contratos, Socket.IO, assets e fluxos obrigatorios; esses custos explicam as pontuacoes abaixo da meta. Acessibilidade, Best Practices e SEO atingiram as metas em todas as combinacoes. Os detalhes estao nos relatorios HTML/JSON e em `lighthouse-reports/summary.json`.

Testes e baselines visuais ficam em `tests/e2e/`; auditorias e medianas são gravadas em `lighthouse-reports/`. Confira `lighthouse-reports/summary.json` para pontuações, LCP, CLS, TBT e versões do ambiente.

O deploy público ainda precisa ser configurado e testado com acesso direto/refresh. A aplicação usa mocks e não depende de backend de produção.
