# KURIO — Marketplace de NFTs

Implementação do desafio `about_test.md`: descoberta de NFTs, conta do colecionador, carrinho visitante/autenticado, checkout e recibo. Usa React, TypeScript, TanStack Router/Query, Axios, Tailwind, shadcn/ui, MSW, Socket.IO, Playwright e Lighthouse.

As requisições HTTP e o cliente Socket.IO são reais; MSW simula o servidor no navegador. Blockchain, extensões de carteira e gateways reais ficam fora do escopo.

[Repositório](https://github.com/SantV7/marketplace_de_nfts) · [Arquitetura e contratos](ARCHITECTURE.md)

## Setup

Ambiente validado: Node.js 24.14.1, npm 11.11.0 e Windows. A partir da raiz do repositório:

```bash
cd frontend
npm ci
npx playwright install chromium
npm run dev
```

O lockfile está versionado. Não é necessário backend, serviço privado, API key ou extensão de carteira.

| Conta fictícia | Senha |
| --- | --- |
| contato@email.com | Kurio123 |
| colecionador@email.com | Kurio123 |

Cupom de demonstração: **KURIO10**. Qualquer outro código, por exemplo **EXPIRED**, produz erro de cupom inválido/expirado. As contas possuem carteiras iniciais; contas novas cadastram suas carteiras pela tela Carteiras.

## Comandos e ambiente

| Comando, em frontend | Finalidade |
| --- | --- |
| npm run dev | Vite com MSW |
| npm run typecheck | TypeScript |
| npm run lint | ESLint |
| npm run build | Build sem ativação automática dos mocks |
| npm run build:demo | Build publicável com MSW e Socket.IO simulado |
| npm run preview -- --host 127.0.0.1 | Preview do build gerado |
| npx playwright test | E2E desktop/mobile, baselines e relatório HTML |
| npm run test:e2e:report | Abrir relatório HTML |
| npm run audit:lighthouse | Build demo + 12 medições Lighthouse |
| npm run audit:lighthouse:summary | Recalcular medianas dos JSON existentes |
| node scripts/optimize-assets.mjs | Reproduzir os WebP a partir dos PNG originais |

`VITE_ENABLE_MOCKS=true` ativa os mocks no build. `.env.demo` já define a variável para `build:demo`. O desenvolvimento também os ativa. `CHROME_PATH` é opcional na auditoria; por padrão ela usa o Chromium instalado pelo Playwright. Não existem segredos no frontend.

## Fluxo principal

1. Explore o catálogo e combine busca, categoria, rede, preço, ordenação e página. A URL preserva o estado no refresh e histórico.
2. Abra um NFT, escolha edição/estilo/quantidade e adicione ao carrinho. O carrinho do visitante permanece após refresh e é mesclado no login.
3. Altere quantidades e aplique/remova o cupom. Subtotal, desconto, taxa e total vêm da cotação da API.
4. Entre pelo checkout, preencha os dados, selecione uma carteira cadastrada e a rede correspondente, conecte e revise a compra.
5. Confirme. O recibo aparece somente após o pedido confirmado pelo mock; o carrinho perde apenas as quantidades compradas.
6. No perfil, edite dados/avatar, troque a senha, consulte favoritos, gerencie carteiras ou saia da conta.

## Seleção e reset dos cenários

Com a aplicação aberta, use o console do navegador:

```js
localStorage.setItem('kurio_mock_scenario', 'slow');
location.reload();
```

Para voltar ao comportamento normal sem perder dados:

```js
localStorage.removeItem('kurio_mock_scenario');
location.reload();
```

Para restaurar integralmente as fixtures, as contas e a sessão inicial:

```js
await fetch('/api/mock/reset', { method: 'POST' });
location.reload();
```

| Cenário | Como observar |
| --- | --- |
| slow | Catálogo, detalhe, carrinho e cotação com latência de 1200 ms e skeletons |
| variable | Latência determinística por página; altere filtros/ordenação durante a consulta |
| empty | Catálogo sem resultados |
| offline | Falha de conexão no catálogo, detalhe, carrinho e cotação |
| server-error | HTTP 503 e recuperação pela interface |
| forbidden | HTTP 403 na listagem |
| quote-error | Falha de cotação; checkout não cria pedido |
| favorite-failure-once | Primeira mutation de favorito falha; rollback e segunda tentativa funcionam |
| favorite-error | Mutations de favorito continuam falhando |
| wallet-connection-rejected | A tentativa de conectar a carteira é recusada |
| payment-rejected | Pedido recusado, com carrinho preservado |
| payment-pending | Pedido permanece pendente até um evento terminal |
| timeout-after-create | Pedido é salvo; a resposta se perde após 3500 ms; Axios expira em 3000 ms |

Para reproduzir timeout, monte o carrinho e selecione o cenário antes de confirmar. Após a mensagem de resposta perdida, recarregue e confirme novamente: a mesma chave e o mesmo payload recuperam o pedido. Não troque o cenário entre as duas tentativas dessa demonstração. O endpoint de consulta pela chave também permite recuperar o estado sem criar outra compra.

## Expiração e tempo real

Faça login antes dos comandos abaixo. Este helper serve apenas para acionar os controles de cenário no console:

```js
const scenario = async (path) => {
  const response = await fetch('/api/' + path, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + localStorage.getItem('kurio_token') }
  });
  return response.status === 204 ? null : response.json();
};
```

- **Expiração:** `await scenario('auth/expire')`. Na próxima operação privada, ocorre o redirecionamento para login e retomada do destino, com o rascunho do checkout.
- **Preço/estoque:** adicione o NFT 42 e abra carrinho/pagamento; execute `await scenario('mock/scenarios/nft-price-change')`. O preço passa para 2.39 ETH e o estoque para três unidades; REST e Socket.IO concordam. Checkout exige nova confirmação.
- **Esgotamento:** `await scenario('mock/scenarios/nft-sold-out')`. A cotação e a compra são bloqueadas sem apagar os itens.
- **Duplicatas/evento antigo:** `await scenario('mock/scenarios/replay-nft-events')`. O cliente mantém a versão mais recente.
- **Outro usuário:** `await scenario('mock/scenarios/foreign-user-event')`. O evento é descartado.
- **Reconexão:** `await scenario('mock/scenarios/socket-disconnect')`. As consultas ativas são reconciliadas pela API.
- **Pedido pendente:** selecione payment-pending e confirme. Consulte o orderId na resposta de POST /api/orders ou GET /api/orders/by-key/:key. Execute `await scenario('mock/scenarios/orders/ORDER_ID/confirmed')` ou troque confirmed por rejected. Também funciona após interrupção do socket ou refresh; estados terminais não regridem.

O reset restaura preço, estoque, pedidos, perfil, carteiras e senhas fictícias. O estado persistido pertence somente a esse navegador.

## Cobertura do desafio

| Grupo obrigatório | Evidência Playwright |
| --- | --- |
| 1. Catálogo e histórico | Busca HTTP, filtros combinados, ordenação, página, refresh/histórico e resposta obsoleta |
| 2. Detalhe | Acesso direto, NFT inexistente, galeria e quantidade/edição |
| 3. Conta e sessão | Cadastro/conflito, login, expiração no checkout, logout e troca de usuário |
| 4. Favoritos | Persistência, isolamento, falha, rollback e retry |
| 5. Carrinho | Quantidade, remoção, cupom, refresh e mesclagem do visitante |
| 6. Compra completa | Detalhe → carrinho → carteira → pedido → recibo |
| 7. Falhas de pagamento | Recusa, clique duplo, chave conflitante e timeout recuperado após refresh |
| 8. Perfil/carteiras | Dados, avatar, senha, cadastro/edição e validação |
| 9. Atualização no checkout | Preço e esgotamento via Socket.IO, com confirmação adicional |
| 10. Reconexão | Duplicatas/eventos antigos, outro usuário e pedido pendente interrompido |
| 11. Teclado e formulários | Foco do login/galeria, Escape, campos obrigatórios e mensagens |
| 12. Carregamento e falhas | Skeletons, latência, erro de rede/HTTP e recuperação |

Os fluxos principais executam em Chromium desktop (1440×900) e mobile (390×844). A matriz de responsividade também verifica 768 px e reflow em 720 px. Testes exclusivos de um layout são ignorados no outro projeto; isso não remove os fluxos compartilhados.

Baselines de início, detalhe, carrinho e pagamento estão em `tests/e2e/visual-regression.spec.ts-snapshots`. Foram geradas no Chromium/Windows; em outro sistema operacional, gere as baselines correspondentes e revise as diferenças de renderização de fonte antes de aceitá-las.

O relatório HTML é `playwright-report/index.html`. Falhas conservam screenshots, contexto e trace em `test-results`; abra um trace com `npx playwright show-trace caminho/trace.zip`. Os testes usam contexto isolado, reset MSW e relógio fixo nos cenários de transação.

Execução completa em 26/10/2026: **81 aprovados, 9 skips por viewport e nenhuma falha**, em 4,2 minutos. Inclui oito comparações visuais. TypeScript, build demo e lint também foram verificados.

Uma verificação adicional sobre `vite preview` do build demo aprovou nove testes de autenticação, redirecionamento, preço via Socket.IO, reconexão e recuperação de pedido pendente (um skip de viewport). Resultado em `playwright-report/production.json`. A preparação aguarda o catálogo carregado antes do reset dos mocks e verifica o sucesso da sessão antes de continuar o checkout.

## Lighthouse

A configuração versionada audita / e /nft/42, três vezes em mobile e desktop, sobre o build demo. Os relatórios HTML/JSON e `summary.json` ficam em `lighthouse-reports`. O resumo registra medianas, LCP, CLS, TBT, versões e condições de execução. Execute a auditoria sem Playwright ou outras cargas concorrentes.

Metas: Performance ≥90, Accessibility ≥95, Best Practices ≥95 e SEO ≥90. Medianas das três execuções por combinação, em 26/10/2026:

| Página / perfil | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Início / mobile | 75 | 100 | 100 | 100 | 4.402 ms | 0 | 263 ms |
| Início / desktop | 99 | 97 | 100 | 100 | 887 ms | 0,0061 | 0 ms |
| Detalhe / mobile | 73 | 100 | 100 | 100 | 4.699 ms | 0 | 258 ms |
| Detalhe / desktop | 96 | 100 | 100 | 100 | 1.245 ms | 0 | 28 ms |

**A meta de Performance mobile não foi atingida.** O item 10 do desafio pede justificativa nesses casos. Os relatórios apontam atraso de renderização do elemento LCP e trabalho de JavaScript na inicialização: a SPA aguarda MSW/Service Worker e a consulta REST antes de mostrar o NFT. No relatório de detalhe mobile, os bundles inicial e de mocks transferem aproximadamente 77 kB e 168 kB; a avaliação de scripts soma 936 ms sob a modelagem mobile. O LCP é penalizado mesmo com a imagem antecipada. Foram aplicados WebP, fontes Latin, preload de fontes/imagem e carregamento antecipado da rota; os mocks, imagens e funcionalidades permanecem ativos. Não foi removido conteúdo nem alterado o throttling para elevar a nota.

Ambiente: Windows 10.0.26300, Intel i3-1315U, 8 GB de RAM, Node 24.14.1, Lighthouse 13.5.0 e Chromium 156. Auditoria local sem testes concorrentes, com cache limpo, perfis oficiais mobile/desktop e Chromium headless sem GPU. Os JSON preservam cada execução e os parâmetros; as medianas incluem os resultados inferiores.

## Deploy

1. Importe o [repositório](https://github.com/SantV7/marketplace_de_nfts) na Vercel.
2. Selecione **frontend** como Root Directory.
3. Use **npm ci** para instalação, **npm run build:demo** para build e **dist** como Output Directory.
4. Publique o mesmo commit validado. Não use o build sem mocks para a demonstração.
5. No domínio HTTPS, confira acesso direto e refresh em /nft/42, /cart, /payment, /profile, /wallets e /order-confirmation. Visitantes nas rotas privadas devem ir ao login.
6. Faça uma compra simulada e confira o recibo. Envie ao avaliador o link do repositório e a URL pública gerada pelo deploy.

`vercel.json` configura o fallback da SPA. Para Netlify e Cloudflare Pages, o arquivo `public/_redirects` é copiado para dist. Assets, fontes e Service Worker são locais. Não é necessário servidor Socket.IO externo.

A publicação e a entrega da URL pública são a etapa externa obrigatória do desafio; preparar o build local não substitui essa etapa.
