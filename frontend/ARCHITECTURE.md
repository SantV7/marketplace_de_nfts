# Arquitetura e contratos

## Camadas

- `src/services/api.ts`: cliente Axios e token Bearer fictício.
- `src/services/contracts.ts`: contratos de transporte tipados; preços ETH são strings decimais.
- `src/services/queries.ts`: consultas e mutations TanStack Query, chaves por recurso e atualização otimista do carrinho/favoritos.
- `src/mocks/fixtures.ts` e `src/mocks/handlers.ts`: dataset e simulação REST em memória. `POST /api/mock/reset` limpa o estado.
- `src/services/socket.ts` e `src/services/RealtimeSync.tsx`: cliente Socket.IO, eventos versionados, descarte de versões antigas e invalidação REST após reconexão.

## REST simulado

| Método e recurso | Resultado |
| --- | --- |
| `GET /api/auth/session`, `POST /api/auth/register`, `/login`, `/logout` | sessão, autenticação fictícia, sessão Bearer em memória |
| `GET /api/nfts?search&category&network&min&max&tab&sort&page&limit`, `GET /api/nfts/:id` | catálogo filtrado e detalhe; 404 para ID inexistente |
| `GET /api/favorites`, `PUT/DELETE /api/favorites/:id` | favoritos isolados pelo usuário autenticado |
| `GET /api/cart`, `POST /api/cart/items`, `PATCH/DELETE /api/cart/items/:id` | carrinho e validação de disponibilidade |
| `POST /api/quotes` | cupom `KURIO10`, subtotal, desconto, taxa, total e expiração |
| `POST /api/orders`, `GET /api/orders/:id` | criação/recuperação idempotente com `Idempotency-Key` e snapshot |
| `GET/PATCH /api/profile`, `PUT /api/profile/password` | perfil e senha fictícia |
| `GET/POST /api/wallets`, `PATCH /api/wallets/:id` | consulta, inclusão e edição de carteiras |

O reset é local ao worker (não persiste entre recargas completas). As credenciais iniciais são `contato@email.com` / `Kurio123` e `colecionador@email.com` / `Kurio123`. Não use dados reais. As sessões e senhas pertencem somente ao mock em memória.

## Estado e sessão

O token fictício fica em `localStorage`; ao receber 401, o Axios o remove. Rotas de checkout, recibo, perfil e carteiras validam a sessão por REST antes de renderizar. Query keys separam sessão, catálogo, favoritos, carrinho, perfil, carteiras e pedidos. O cache padrão usa `staleTime` de cinco minutos; sessão usa 30 segundos. Atualizações otimistas de quantidade e favorito revertem ao estado anterior em erro.

## Tempo real

O browser usa `socket.io-client` no endpoint `/socket.io`; o worker MSW usa `@mswjs/socket.io-binding` sobre WebSocket. O binding documenta limitações de rooms, namespaces e broadcasting. O cliente consome `nft.updated` e `order.updated` com `version`, descarta duplicatas/versões antigas e invalida os recursos REST ativos na reconexão. O ambiente atual ainda precisa de cenários UI que emitam ambos os eventos e de validação de compatibilidade do binding: a versão instalada de MSW é 3.0.3, mas o peer range do binding 0.2.0 declara MSW 2.10.2.

## Limitações restantes

O estado mock é em memória, o catálogo de assets não cobre um backend persistente, e os eventos em tempo real não têm servidor Socket.IO de produção. Perfil/carteira são formulários iniciais e não cobrem ainda todos os campos e erros especificados. O reset, cenários determinísticos de lentidão/timeouts/falhas e testes completos devem ser expandidos antes da entrega. Ainda não há deploy configurado nem relatórios Lighthouse.
