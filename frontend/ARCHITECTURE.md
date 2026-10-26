# Arquitetura e contratos

## Camadas

- `src/services/api.ts`: Axios, Bearer token e identificação de carrinho visitante.
- `src/services/contracts.ts`: contratos TypeScript; preços ETH trafegam como strings decimais.
- `src/services/queries.ts`: consultas/mutations TanStack Query, cache e mutations otimistas com rollback.
- `src/mocks/fixtures.ts` e `src/mocks/handlers.ts`: fixtures persistentes e contratos REST em MSW 2.
- `src/services/socket.ts` e `src/services/RealtimeSync.tsx`: cliente Socket.IO, cache versionado e reconciliação.

## Recursos REST

| Método e recurso | Comportamento |
| --- | --- |
| `POST /api/auth/register`, `/login`, `/logout`; `GET /api/auth/session` | Conta, sessão e expiração |
| `GET /api/nfts?...`, `GET /api/nfts/:id` | Busca, filtros, ordenação, paginação e detalhe |
| `GET /api/favorites`, `PUT/DELETE /api/favorites/:id` | Favoritos privados por utilizador |
| `GET /api/cart`, `POST /api/cart/items`, `PATCH/DELETE /api/cart/items/:id`, `POST /api/cart/merge-guest` | Carrinho visitante/conta, validação e mesclagem no login |
| `POST /api/quotes` | Cupom, disponibilidade, subtotal, desconto, taxas, total, versão e expiração |
| `POST /api/orders`, `GET /api/orders/:id` | Criação idempotente, estado e snapshot do recibo |
| `GET/PATCH /api/profile`, `PUT /api/profile/password` | Perfil, avatar e alteração de senha |
| `GET/POST /api/wallets`, `PATCH /api/wallets/:id` | Carteiras principal/secundária |
| `POST /api/wallets/:id/connect`, `/disconnect` | Simulação de conexão, recusa e desconexão |

Pedidos aceitam `Idempotency-Key`. Antes de finalizar, a interface busca de novo carrinho e cotação; o mock valida preços, edições disponíveis, cupom, versão, expiração, taxa e total. A chave identifica a tentativa durante timeout/recuperação; uma chave com payload diferente gera conflito. Falhas e recusas preservam o carrinho, confirmação remove somente as quantidades compradas.

## Sessão, persistência e cache

O token fictício e um identificador de visitante ficam no `localStorage`. O mock persiste carrinhos, sessão, favoritos, perfil, carteiras, catálogo e pedidos para suportar refresh; senhas persistidas são hashes. Login mescla o carrinho visitante com o carrinho da conta. Logout, expiração e troca de conta limpam o cache e renovam subscriptions. O cache padrão usa `staleTime` de cinco minutos e a sessão, 30 segundos. A quantidade do carrinho e os favoritos têm update otimista com rollback. Queries de catálogo usam `AbortSignal` e parâmetros de URL/cache próprios.

## Socket.IO

`socket.io-client` liga-se a `/socket.io`; MSW interceta WebSocket e `@mswjs/socket.io-binding` simula eventos Socket.IO. `nft.updated` e `order.updated` incluem identidade de utilizador, recurso e versão. A aplicação filtra utilizador, descarta duplicatas/versões antigas, atualiza ou invalida o cache e consulta recursos ativos após reconexão. Cenários de preço/estoque, estado terminal, reconexão e replay de evento passam pelo socket real do cliente. O binding no browser é simulação, não servidor Socket.IO de produção.

## Cenários reproduzíveis

Defina `localStorage.kurio_mock_scenario` como `slow`, `variable`, `empty`, `offline`, `server-error`, `favorite-failure-once`, `wallet-connection-rejected`, `timeout-after-create`, `payment-pending` ou `payment-rejected`. `POST /api/mock/reset` restaura fixtures e estado. Endpoints de cenário em `src/mocks/handlers.ts` dirigem mudanças REST e Socket.IO.

O build demonstrativo precisa de `VITE_ENABLE_MOCKS=true`. As limitações do binding e as decisões visuais devem ser comparadas com `about_test.md`; os resultados de Lighthouse e limitações restantes ficam em `lighthouse-reports/summary.json` e no README.
