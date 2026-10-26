# KURIO NFT Marketplace

Frontend responsivo em React e TypeScript para o desafio descrito em [about_test.md](about_test.md). A aplicação usa TanStack Router e Query, Axios, Tailwind, MSW e Socket.IO para os fluxos de catálogo, conta e compra simulada. Os mocks funcionam no desenvolvimento e podem ser incluídos no build de demonstração.

## Executar

Requer Node.js compatível com Vite 8 e npm.

```bash
npm ci
npm run dev
```

Credenciais fictícias: `contato@email.com` / `Kurio123` e `colecionador@email.com` / `Kurio123`. Para incluir MSW num build de demonstração, configure `VITE_ENABLE_MOCKS=true` antes do build. Não introduza credenciais ou dados reais.

| Comando | Objetivo |
| --- | --- |
| `npm run dev` | Desenvolvimento com MSW |
| `npm run typecheck` | Verificação TypeScript |
| `npm run lint` | ESLint |
| `npm run build` | Typecheck e build de produção |
| `npm run preview` | Servir o build localmente |
| `npm run test:e2e` | Playwright em Chromium desktop e mobile |
| `npm run test:e2e:report` | Abrir o relatório Playwright mais recente |
| `npm run audit:lighthouse` | Auditoria configurada para home e detalhe |

## Cenários e contratos

O estado de demonstração pode ser persistido entre refreshes em `localStorage`; `POST /api/mock/reset` restaura os fixtures. Defina `kurio_mock_scenario` para `slow`, `variable`, `empty`, `offline`, `server-error`, `timeout-after-create`, `payment-pending` ou `payment-rejected` para reproduzir cenários. A autenticação é obrigatória em carrinho, cotações, favoritos, pedidos, perfil e carteiras. O checkout valida novamente carrinho, preço, disponibilidade, cupom, taxa e versão da cotação. Uma tentativa de pedido mantém a mesma chave de idempotência na recuperação de timeout.

Os endpoints REST, os eventos Socket.IO, a política de sessão/cache e as limitações da simulação estão descritos em [ARCHITECTURE.md](ARCHITECTURE.md). A suíte atual cobre autenticação e isolamento, persistência, cupom, preço desatualizado, timeout/idempotência, recusa e eventos em tempo real em ambos os viewports.

## Estado da entrega

O núcleo de rede e os fluxos de compra estão implementados e a suíte Playwright atual é executável. A conformidade integral do desafio ainda depende de concluir os cenários E2E de perfil/carteiras, acessibilidade, estados lentos e recuperação, eventos duplicados/antigos e desconexão, além de regressão visual com baselines. Lighthouse está configurado, mas as medições e as metas ainda precisam ser comprovadas. Não existe deploy público configurado; a publicação exige uma conta de hospedagem e URL acessível.
