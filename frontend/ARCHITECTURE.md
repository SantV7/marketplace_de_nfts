# Arquitetura

## Responsabilidades e stack

A interface usa React e TypeScript, TanStack Router nas rotas e no estado do catálogo, TanStack Query no estado remoto, Axios nas chamadas REST, Tailwind e componentes shadcn/ui adaptados à paleta Kurio. `components.json` configura os aliases; Button, Skeleton e Dialog ficam em `src/components/ui`. O diálogo usa Radix para foco, Escape e retorno ao elemento acionador.

- `src/routes`: validação de busca e proteção de pagamento, perfil, carteiras e recibos.
- `src/services/contracts.ts`: tipos compartilhados entre transporte e interface.
- `src/services/queries.ts`: consultas, mutations e invalidações.
- `src/services/api.ts`: Axios, identificação do visitante, Bearer token e expiração.
- `src/services/RealtimeSync.tsx`: assinatura dos recursos ativos, versões e reconciliação.
- `src/mocks`: fixtures, persistência, validação, estados de pedido e eventos MSW.
- `src/pages`: composição das telas. Autenticação separa controlador/formulário, campo, diálogo e ícones.
- `tests/e2e`: jornadas, falhas de rede, tempo real e baselines desktop/mobile.
- `scripts`: auditoria Lighthouse, resumo de medianas e otimização reproduzível dos assets.

Os dados de NFTs, preços, estoque, avaliações, favoritos, carrinhos, contas, carteiras e pedidos pertencem aos mocks de rede. Hooks e componentes não fabricam respostas nem inferem identificadores de pedidos. Rótulos de navegação, textos editoriais, estilos visuais de galeria e nomes de provedores são configuração de interface.

## Contratos REST

Base `/api`; JSON; erros no formato `{ "message": "descrição" }`. Axios envia `Authorization: Bearer <token>` quando há sessão e `X-Guest-ID` para identificar o visitante. Os tipos completos estão em `src/services/contracts.ts`.

| Método / recurso | Entrada | Resposta de sucesso |
| --- | --- | --- |
| POST /auth/register | username, email, password | 201: token e user |
| POST /auth/login | email, password | 200: token e user |
| GET /auth/session | Bearer | user: id, name, username, email |
| POST /auth/logout, /auth/expire | Bearer | 204; revoga a sessão |
| GET /nfts | search, category, network repetido, min, max, sort, tab, page, limit | data, total, page, pageCount |
| GET /nfts/:id | identificador | NFT com preço, estoque, edições, metadados, avaliações e versão |
| GET /favorites | Bearer | ids |
| PUT /favorites/:id, DELETE /favorites/:id | Bearer, NFT | ids atualizados |
| GET /cart | visitante ou sessão | items |
| POST /cart/items | nftId, edition, quantity e configuração visual | 201: items; preço/nome/imagem vêm do catálogo |
| PATCH /cart/items/:id | quantity inteiro | items |
| DELETE /cart/items/:id | identificador do item | items |
| POST /cart/merge-guest | Bearer e X-Guest-ID | items mesclados; conflito preserva as duas origens |
| POST /quotes | coupon opcional | subtotal, discount, networkFee, total, currency, coupon, version, expiresAt |
| POST /orders | items, total, discount, networkFee, coupon, quoteVersion, quoteExpiresAt, wallet, provider, network | 201: Order; repetição idempotente: 200 |
| GET /orders/:id | Bearer e identificador | Order do próprio usuário |
| GET /orders/by-key/:key | Bearer e chave da tentativa | mesmo Order, inclusive após resposta perdida |
| GET /profile | Bearer | dados públicos da própria conta e avatar |
| PATCH /profile | name, username, avatar | perfil validado |
| PUT /profile/password | currentPassword, newPassword | updated |
| GET /wallets | Bearer | wallets |
| POST /wallets | label, address, network | 201: wallets |
| PATCH /wallets/:id | label, address, network, primary | wallets |
| POST /wallets/:id/connect, /disconnect | Bearer | connected, walletId |

`sort`: recent, price-asc, price-desc. `tab`: all, new, trending. Redes são enviadas como `network=Ethereum&network=Polygon`, sem sufixos de array. A URL da interface usa `q` para busca e serialização do TanStack Router; o serviço converte para `search`.

Erros: 400 para identificação/chave ausente; 401 para sessão inválida; 403 no cenário sem permissão; 404 para NFT, carteira ou pedido indisponível ao solicitante; 409 para conflito de cadastro, estoque, cotação ou idempotência; 422 para validação e cupom; 503 para indisponibilidade transitória. Pedidos de outro usuário respondem 404 sem expor seu conteúdo.

Exemplo de cotação (precisão fixa de oito casas nesta simulação):

```json
{
  "subtotal": "1.19000000",
  "discount": "0.11900000",
  "networkFee": "0.01600000",
  "total": "1.08700000",
  "currency": "ETH",
  "coupon": "KURIO10",
  "version": 123,
  "expiresAt": "2026-10-26T12:01:00.000Z"
}
```

A versão acima é ilustrativa; o servidor calcula a versão a partir do carrinho e do cupom. Preços trafegam como strings; cálculos usam inteiros BigInt em unidades de 10⁻⁸ ETH, sem aritmética de ponto flutuante nos totais. Quantidades são inteiras. A API valida o estoque agregado por NFT e edição, inclusive entre estilos diferentes.

## Carrinho, cotação e pedidos

O carrinho pertence ao identificador do visitante ou ao usuário autenticado. O login mescla os itens compatíveis. O catálogo é a referência para preço e disponibilidade; a cotação calcula subtotal, desconto e taxa. Alterar quantidade, remover/adicionar item ou receber um evento invalida a cotação. Uma falha mostra erro e impede avançar com resumo tratado como válido.

No envio do checkout, a interface consulta novamente carrinho, cotação e carteiras. Erros impedem a compra. Uma diferença nos itens, preço, desconto, taxa, cupom ou versão exige outra confirmação. Um aviso de preço/estoque via Socket.IO também exige confirmação adicional mesmo se a cotação já tiver sido atualizada em segundo plano.

Uma tentativa guarda chave UUID e payload antes do POST, em armazenamento separado por sessão. Reenvios e refresh reutilizam essa tentativa; a UI consulta o pedido pela chave em vez de montar um ID a partir dela. O mock grava o pedido antes de simular timeout. Mesmo conteúdo/chave recupera o pedido; conteúdo diferente retorna 409. O bloqueio de envio impede cliques concorrentes.

Estados: pending → confirmed ou rejected. Estados finais não regridem. Recusa mantém o carrinho. Confirmação desconta somente as quantidades compradas e atualiza o estoque. Itens adicionados depois de um pedido pendente permanecem. O recibo consulta o snapshot do pedido, nunca recompõe valores usando o catálogo atual.

A conexão de carteira é simulada por endpoints, sem extensão ou blockchain. O formulário desktop e mobile seleciona carteiras cadastradas e verifica a rede. Os campos não secretos do coletor são preservados para retomada após expiração. Senhas não entram nesse rascunho.

## Sessão, cache e cancelamento

O token é fictício e persistido em localStorage. A sessão é recuperada pela API na inicialização. O guard de rota redireciona visitantes e sessões inválidas para login com o destino de retorno; erros transitórios têm estado de erro e retry. Um 401 durante uso limpa o token e o cache e inicia a retomada pelo login.

Login, logout e troca de conta limpam o cache privado e substituem as subscriptions. O servidor filtra recursos por usuário. O último ID de recibo pode permanecer localmente, mas seus dados só são renderizados após consulta autorizada à API.

A configuração padrão usa staleTime de cinco minutos; sessão usa 30 segundos. Catálogo/detalhe incluem parâmetros/ID na query key e usam AbortSignal. Falhas de catálogo, sessão, favoritos, perfil, carteiras, cotação e pedidos têm retry automático desabilitado; o carrinho segue o retry padrão do TanStack Query. Mutations não são repetidas automaticamente. Favoritos e quantidade têm atualização otimista com rollback. Eventos e mutations invalidam os recursos afetados; refetch em foco da janela está desabilitado.

O estado persistido do mock reúne catálogo, contas, hashes de senha, sessões, favoritos, carrinhos, perfis, carteiras e pedidos. Isso simula um backend dentro do navegador; não é mecanismo de segurança para produção. Os dados são locais a cada navegador e não há sincronização entre dispositivos.

## Socket.IO e MSW

O cliente é `socket.io-client`, com transporte WebSocket e reconexão automática (até cinco tentativas; intervalo de 500–2000 ms). MSW intercepta a conexão; `@mswjs/socket.io-binding` implementa os frames Engine.IO/Socket.IO. O mock responde ao handshake e envia heartbeat a cada 20 segundos; não abre conexão com um servidor externo inexistente.

O cliente emite `subscribe` com token/guestId, nftIds e orderIds ativos. O mock resolve a identidade pelo token; não aceita uma identidade de usuário arbitrária. Somente consultas observadas geram assinaturas.

| Evento | Payload | Efeito |
| --- | --- | --- |
| nft.updated | userId, id, price, available, editions, version | atualiza catálogo/detalhe, invalida carrinho/cotação e anuncia a mudança |
| order.updated | userId, orderId, status, version | consulta o snapshot REST e sincroniza carrinho e recibo |

Mudanças públicas de NFT são transmitidas aos assinantes do recurso, com a identidade correspondente; pedidos são privados. Cada evento usa ID estável e versão crescente. O cliente verifica identidade e versão, descarta duplicatas/versões antigas e não regride pedidos terminais. A mudança do cenário altera primeiro o estado REST e depois emite o evento.

Após reconectar, consultas ativas de catálogo, detalhe, carrinho, cotação, pedido, tentativa e sessão são revalidadas via REST. Listeners, assinatura do Query Cache, heartbeat e sockets são liberados ao desmontar. A implementação é uma simulação por contexto de página, sem servidor Socket.IO compartilhado, transporte polling ou pagamentos reais.

## Interface e decisões de UX

As cores, tipografia Roboto Mono e assets fornecidos permanecem locais. WebP deriva dos PNG originais, preservados no repositório; usa dimensão máxima de 900 px e qualidade 85 para reduzir transferência. `node scripts/optimize-assets.mjs` reproduz os derivados. Nenhuma arte foi substituída por imagem externa. As fontes carregam o subconjunto Latin, que cobre o conteúdo pt-BR.

A rota inicial de início/detalhe e as fontes são antecipadas enquanto o MSW inicializa. O módulo do cliente Socket.IO só é importado depois de `worker.start()`, para capturar o WebSocket interceptado. Essa ordem é necessária também no build publicado. A área clicável da paginação de NFTs relacionados foi ampliada para 24 px; os pontos visuais mantêm 10 px. Títulos acessíveis e landmarks complementam a hierarquia sem alterar a composição.

Skeletons usam shimmer com dimensões reservadas em catálogo, detalhe e resumo do carrinho. Movimento reduzido desliga animações. Foco visível, labels, mensagens associadas e anúncios de mutations/tempo real complementam o layout. O mobile inclui dados do coletor e controles de galeria para manter os mesmos fluxos disponíveis no desktop. A autenticação e o checkout renderizam uma única versão do formulário no DOM.

Conteúdo editorial, newsletter, login social, recuperação de senha, suporte e links de exploração não representam serviços reais. A interface informa a indisponibilidade das ações auxiliares; a navegação editorial leva a uma página explicativa. O recibo identifica explicitamente a simulação. Filtros mobile expandem na página, sem se apresentar como drawer modal. Galeria e autenticação têm diálogos com controle de foco.

## Testes e auditoria

Playwright executa Chromium em 1440×900 e 390×844. Há uma matriz adicional em 768 px e reflow de 720 px (equivalente ao espaço CSS de 1440 px com zoom de 200%). Contextos isolados e reset MSW evitam dependência da ordem; testes de pagamento fixam Date e disparam eventos pelos endpoints de cenário.

O reset de preparação ocorre após o catálogo inicial chegar à interface; falhas no login de preparação interrompem imediatamente o teste. Login e cadastro compartilham o componente Auth, cuja leitura de search não depende de uma rota fixa durante a transição de telas. A checagem adicional do build demo cobre os fluxos de sessão e Socket.IO sobre os bundles de produção.

As asserções observam a interface e os resultados REST; o tempo real passa pelo socket.io-client. Baselines versionadas cobrem início, detalhe, carrinho e pagamento nos dois perfis. HTML fica em `playwright-report`; traces de falhas em `test-results`.

Lighthouse audita o build demo, com todas as funcionalidades e assets, em início e /nft/42: três medições por perfil/página. O perfil desktop usa a configuração oficial desktopDense4G; mobile usa a configuração padrão, com viewport 390×844. Não há modo de interface reduzido para auditoria. HTML/JSON e medianas de Performance, Accessibility, Best Practices, SEO, LCP, CLS e TBT estão em `lighthouse-reports`. O resumo registra versões, CPU, memória e condições de execução.

A execução documentada alcançou as metas de acessibilidade, boas práticas e SEO nos quatro perfis/páginas, e de performance no desktop. Performance mobile ficou em 75 (início) e 73 (detalhe), abaixo de 90. O custo de inicializar o MSW e aguardar os dados antes de renderizar o NFT prolonga a cadeia crítica de uma SPA no perfil mobile. Os relatórios identificam avaliação de JavaScript e atraso de renderização do LCP; as imagens já são antecipadas e convertidas para WebP. Essa limitação está explicitada conforme o item 10 do enunciado, sem simular um backend diferente, esconder funcionalidades ou selecionar somente as melhores execuções. O README contém as medianas completas e o ambiente.

## Publicação

O projeto é uma SPA. Vercel usa `frontend` como raiz, `npm run build:demo` e saída `dist`. `vercel.json` e `public/_redirects` cobrem acesso direto/refresh em Vercel e Netlify/Cloudflare Pages. O domínio deve usar HTTPS para Service Worker. Os mocks são habilitados por `VITE_ENABLE_MOCKS=true` no modo demo; sem esse modo o cliente espera APIs reais em /api. A publicação deve usar o mesmo commit validado e ser conferida no domínio público.
