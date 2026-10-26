# Arquitetura e contratos

## Camadas

- `src/services/api.ts` centraliza Axios, Bearer token e tratamento de respostas 401.
- `src/services/contracts.ts` tipa transporte e estado; valores ETH viajam como strings decimais.
- `src/services/queries.ts` contém consultas/mutations TanStack Query. Quantidade do carrinho e favorito têm atualização otimista com rollback.
- `src/mocks/fixtures.ts` e `src/mocks/handlers.ts` mantêm fixtures e contratos REST no MSW 2. O estado necessário para refresh (sessão, carrinhos, perfil, carteiras, favoritos, catálogo e pedidos) é serializado no navegador; palavras-passe persistidas ficam em hash.
- `src/services/socket.ts` e `src/services/RealtimeSync.tsx` ligam `socket.io-client` aos eventos simulados pelo `@mswjs/socket.io-binding`.

## Contratos REST

| Método e recurso | Comportamento |
| --- | --- |
| `POST /api/auth/register`, `/login`, `/logout`; `GET /api/auth/session` | Registo, login, logout e recuperação de sessão Bearer |
| `GET /api/nfts?...`, `GET /api/nfts/:id` | Busca, filtros, ordenação, paginação e detalhe |
| `GET /api/favorites`, `PUT/DELETE /api/favorites/:id` | Favoritos isolados por utilizador autenticado |
| `GET /api/cart`, `POST /api/cart/items`, `PATCH/DELETE /api/cart/items/:id` | Carrinho privado e validação de quantidades/edições |
| `POST /api/quotes` | Cupom, subtotal, desconto, taxa, total, versão e expiração |
| `POST /api/orders`, `GET /api/orders/:id` | Pedido com `Idempotency-Key`, snapshot e leitura privada |
| `GET/PATCH /api/profile`, `PUT /api/profile/password` | Perfil, dados e atualização de senha |
| `GET/POST /api/wallets`, `PATCH /api/wallets/:id` | Consulta, criação e edição de carteiras |

Carrinho e cotação recusam sessão ausente/expirada. Antes do pedido, o cliente atualiza carrinho e cotação, e o handler valida novamente os itens, preços, disponibilidade, cupom, versão, expiração, desconto e taxa. O fingerprint da tentativa exclui somente a expiração efémera da cotação; a chave permanece estável para recuperar o mesmo pedido depois de timeout. Reutilizar a chave com conteúdo diferente ou por outro utilizador resulta em conflito. Recusa e falha preservam o carrinho; confirmação remove apenas as unidades compradas.

## Sessão, persistência e cache

O token fictício fica em `localStorage`; a sessão do mock e os dados privados são persistidos pelo MSW para permitir refresh. A API não guarda palavras-passe em claro após persistência. Logout, expiração e troca de conta limpam o cache Query, e eventos da sessão anterior são filtrados. Checkout, recibo, perfil, carteiras, favoritos, carrinho e cotação exigem autenticação. O cache global usa `staleTime` de cinco minutos e a sessão, 30 segundos. Queries aceitam `AbortSignal` onde aplicável; respostas e eventos usam versão para descartar estado antigo. O reset `POST /api/mock/reset` restaura os fixtures padrão.

## Tempo real

O cliente usa Socket.IO em `/socket.io`; o MSW 2 interceta o transporte WebSocket e o binding simula o protocolo Socket.IO. Os eventos `nft.updated` e `order.updated` carregam identidade de recurso, utilizador e versão. A simulação inclui alterações determinísticas pelo endpoint `/api/mock/scenarios/nft-price-change` e transições de pedido em `/api/mock/scenarios/orders/:id/:status`. O cliente atualiza/invalida cache REST, ignora duplicatas ou versões antigas, filtra por sessão e reconcilia recursos ativos ao reconectar. O binding é uma simulação de browser e não substitui um servidor Socket.IO de produção; rooms e recursos de servidor podem divergir.

## Cenários e limitações

Defina `localStorage.kurio_mock_scenario` como `slow`, `variable`, `empty`, `offline`, `server-error`, `timeout-after-create`, `payment-pending` ou `payment-rejected` para reproduzir resultados. O cenário e o estado simulado destinam-se a demonstração/testes, não a produção. O timeout após criar pedido pode ser recuperado com a mesma chave, inclusive após refresh; pedidos pendentes podem avançar para estado terminal pelos handlers de cenário.

A suíte Playwright cobre os contratos e fluxos principais de compra/autenticação em desktop e mobile. Ainda falta a cobertura especificada para todos os formulários de perfil/senha/carteiras, navegação e foco por teclado, skeletons e retentativas, eventos duplicados/antigos e desconexão/retomada, além de regressão visual com baselines. A auditoria Lighthouse está configurada para três execuções por página/perfil, mas não há resultados medidos ainda. Não há deploy público configurado. Consultar `about_test.md` para a lista completa de critérios pendentes.
