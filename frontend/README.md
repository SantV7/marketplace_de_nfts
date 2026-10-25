# KURIO — NFT Marketplace

Frontend de um marketplace de NFTs desenvolvido como parte de um desafio técnico. A homepage está sendo construída incrementalmente para seguir a direção visual do Figma, incluindo navegação, apresentação, descoberta de NFTs, banners editoriais, conteúdo e rodapé.

> **Status:** o frontend contém homepage, catálogo e detalhes demonstrativos, carrinho persistido no navegador e telas responsivas de carrinho e pagamento. Busca e filtros são locais, com o estado aplicado sincronizado à URL. Carrinho e pagamento mobile foram conferidos visualmente em 390 × 844 px; os demais viewports e telas ainda precisam de validação sistemática. Os dados não vêm de API; autenticação, pedidos, transações, tempo real, testes E2E e deploy permanecem pendentes. Consulte [Escopo do desafio e status](#escopo-do-desafio-e-status).

## Tecnologias

### Em uso na interface atual

- React 19 e TypeScript
- Vite
- TanStack Router
- Tailwind CSS v4
- Roboto Mono (família local via Fontsource)
- Lucide React

### Dependências instaladas para etapas futuras

O projeto também inclui TanStack Query, Axios, Socket.IO Client, MSW, React Hook Form, Zod e Playwright. A presença dessas dependências não significa que as integrações ou os fluxos correspondentes estejam concluídos.

## Executar localmente

Requisitos: Node.js compatível com Vite 8 e npm.

```bash
cd frontend
npm ci
npm run dev
```

O Vite exibe no terminal a URL local para abrir no navegador.

### Comandos disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite. |
| `npm run build` | Executa a verificação TypeScript (`tsc -b`) e gera o build de produção. |
| `npm run lint` | Executa o ESLint no frontend. |
| `npm run preview` | Serve localmente o build de produção; execute `npm run build` antes. |

No estado atual, não há scripts de testes Playwright ou auditoria Lighthouse configurados no `package.json`. Também não são necessárias variáveis de ambiente para executar a interface atual.

## O que está implementado

### Página inicial

- Navbar com marca KURIO, links, busca expansível, contador de itens do carrinho e acesso visual ao login.
- Hero responsivo com texto, arte principal e botão que navega para `/market`.
- No mobile, busca de coleções, atalho de filtros, hero compacto com artes sobrepostas, catálogo em duas colunas e navbar inferior flutuante.
- Seção de produtos com filtros laterais à esquerda e catálogo à direita em telas grandes.
- A rota `/market` reutiliza o catálogo de produtos e o footer, em vez de exibir somente o navbar.
- Banners de destaque com imagens, textos e botões de exploração.
- Seção editorial “Diário da Cunhagem”, com quatro cards de artigos.
- Footer com cartões informativos, links agrupados, contato, redes sociais e campo de newsletter.
- Layouts responsivos nas seções da homepage e imagens locais otimizadas.

### Detalhes do NFT

- Rota dinâmica `/nft/$id`, alcançada ao selecionar um NFT no catálogo ou na seção de itens relacionados.
- Página demonstrativa com galeria de imagens/estilos, informações do ativo, seleção visual de edição, quantidade, favorito, abas de detalhes/avaliações e itens relacionados.
- IDs sem correspondência exibem um estado de “NFT não encontrado” com opção de voltar ao mercado.
- Os dados vêm de um catálogo local em `src/pages/nftDetails/productDetailData.ts`. A compra adiciona o NFT e a edição selecionada ao carrinho; disponibilidade e quantidade usam limites demonstrativos por edição. Favoritos ainda não persistem nem integram uma API.

### Carrinho

- Rota `/cart` com layout responsivo, breadcrumb, resumo do pedido e recomendações paginadas.
- No mobile, exibe apenas os itens e o resumo do frame do Figma. O resumo ocupa a largura disponível e encosta nas laterais e no fundo da viewport; em telas curtas, o conteúdo pode rolar.
- Adição pela página de detalhes; itens agrupados por NFT, edição e estilo, com controles para alterar quantidade e remover.
- A imagem e a identificação do item refletem o estilo escolhido (Normal, Platinada, Dourada ou Saturada).
- Carrinho persistido em `localStorage`, restaurado após refresh e sincronizado entre abas do navegador.
- Contador da navbar reflete a quantidade total de unidades.
- Quantidades respeitam limites demonstrativos por NFT/edição, compartilhados entre estilos diferentes.
- Subtotal, desconto, taxa fixa demonstrativa de `0.016 ETH` e total são calculados com unidades inteiras de ETH. O cupom `KURIO10` aplica 10% de desconto local, sem validação de API.
- O botão de finalização leva à rota `/payment` e mantém o cupom aplicado na URL.
- A composição mobile foi conferida manualmente no navegador em 390 × 844 px; não há baseline ou teste visual automatizado.

### Pagamento

- Rota `/payment` com layouts específicos por viewport: formulário do colecionador e revisão dos NFTs no desktop; carteiras conectadas, seleção de carteira/rede e total no mobile.
- Validação nativa dos campos obrigatórios no desktop; seletores de carteira/rede são demonstrações visuais e não conectam carteiras.
- Ao confirmar, abre um recibo demonstrativo em `/order-confirmation`, calculado a partir do carrinho, cupom e carteira selecionada. Ele fica disponível após atualizar a página da sessão.
- A prévia usa um identificador `DEMO-`, não remove os itens do carrinho e avisa que não cria pedido real, não conecta carteira nem envia transação. O botão abre a página inicial do Etherscan, não um link de transação.
- A composição mobile está implementada, mas ainda precisa de conferência visual nos viewports do teste.

### Login e cadastro

- As rotas `/login` e `/register` mostram modal sobre a home no desktop e telas dedicadas no mobile; é possível alternar entre os formulários.
- Validação local de e-mail, senha (mínimo de 8 caracteres com maiúscula, minúscula e número), nome de usuário e confirmação de senha.
- Google/Facebook, recuperação de senha e envio das credenciais informam que ainda não há integração e não autenticam o usuário.

### Catálogo de demonstração

- Cards reutilizáveis com imagem, nome, identificador e preço em ETH.
- Categorias com contagens calculadas a partir do conjunto demonstrativo e seleção de categoria.
- Controle de faixa de preço e aplicação do intervalo selecionado.
- Abas para todos os NFTs, novos lançamentos e itens em alta.
- Ordenação por listagem ou preço.
- Controles de paginação prototipados e estado de resultados vazios.
- Bloco de NFT em destaque.
- Imagens locais otimizadas em `src/assets/img/nfts/`; a arte do hero também utiliza um desses assets.

O conteúdo atual do catálogo está definido em `src/pages/home/products/productData.ts` e é **estático/de demonstração**. Busca, filtros, ordenação e paginação atuam localmente e são sincronizados com os parâmetros da URL; não há consultas REST, cache remoto ou dados reais.

Os botões “Explorar” dos banners, links editoriais e links de redes sociais são elementos de apresentação sem integração funcional nesta etapa. O formulário de newsletter valida o formato do e-mail e apresenta feedback na interface, mas ainda não envia os dados a um serviço. O footer exibe informações de contato e carteiras ilustrativas.

## Organização atual do código

```text
src/
├── assets/img/nfts/            # Imagens locais otimizadas
├── components/
│   ├── blogSection/            # Cards editoriais da homepage
│   ├── featuredBanners/        # Banners de destaque
│   ├── footer/                 # Footer e conteúdo informativo
│   ├── navbar/                 # Navbar responsiva e busca
│   └── nftProduct/             # Card e Category reutilizáveis
├── libs/
│   └── cartStore.ts            # Estado compartilhado e persistência local do carrinho
├── pages/home/
│   ├── Home.tsx                # Composição da página inicial
│   ├── Hero.tsx                # Hero da homepage
│   ├── MobileHomeNavbar.tsx    # Navegação fixa mobile
│   └── products/
│       ├── Products.tsx        # Estado e composição da seção de produtos
│       ├── ProductSidebar.tsx  # Categorias, preço, redes e destaque
│       ├── ProductCatalog.tsx  # Abas, ordenação, cards e paginação
│       └── productData.ts      # Tipos, dados demonstrativos e opções
├── pages/nftDetails/
│   ├── ProductDetail.tsx       # Página demonstrativa de detalhes do NFT
│   └── productDetailData.ts    # Dados locais usados na página de detalhes
├── pages/cart/
│   ├── Cart.tsx                # Composição responsiva do carrinho
│   ├── CartItemList.tsx        # Itens, quantidades e remoção
│   ├── CartSummary.tsx         # Cupom demonstrativo, totais e CTA
│   ├── CartRecommendations.tsx # Recomendações paginadas no desktop
│   └── cartPricing.ts          # Cálculos de ETH com unidades inteiras
├── pages/payments/
│   ├── Checkout.tsx            # Composição da tela responsiva de pagamento
│   ├── CheckoutProfileForm.tsx # Dados do colecionador e validação nativa
│   ├── CheckoutOrderSummary.tsx # NFTs, valores e opções demonstrativas de carteira
│   ├── OrderConfirmation.tsx   # Recibo responsivo para confirmação demonstrativa
│   ├── DemoOrderConfirmation.tsx # Rota e estado de sessão da prévia de recibo
│   ├── demoReceipt.ts          # Criação e persistência temporária do recibo
│   └── paymentData.ts          # Opções locais de redes e carteiras demonstrativas
├── pages/auth/
│   └── Auth.tsx                # Formulários responsivos de login e cadastro
├── routes/index.tsx            # Rotas declaradas com TanStack Router
└── styles/global.css           # Estilos globais e controles de preço
```

## Escopo do desafio e status

O desafio pede uma experiência completa de descoberta, compra e conta do colecionador, integrada a APIs simuladas, com responsividade, acessibilidade, testes e auditorias. A tabela abaixo diferencia a implementação atual dos requisitos ainda pendentes.

| Área avaliada | Status atual |
| --- | --- |
| Início e identidade visual | Navbar, hero, catálogo, banners, seção editorial e footer compõem a homepage. O layout mobile de início foi conferido em 390 × 844 px; ainda falta validar todos os frames e viewports do desafio. |
| Descoberta de NFTs | Busca, filtros, abas, ordenação e paginação locais em `/` e `/market`; o estado aplicado é sincronizado com a URL. Dados e resultados ainda não vêm de API. |
| Detalhes do NFT | Página em `/nft/$id`, com estado para identificador inexistente. Compra adiciona ao carrinho; dados e limites por edição são demonstrativos, e favoritos persistentes não estão implementados. |
| Carrinho, cotação e cupons | Adicionar, alterar quantidade e remover itens com persistência local; cupom `KURIO10`, disponibilidade e taxa de rede são demonstrativos. O layout mobile foi conferido em 390 × 844 px; cotação real e atualização de disponibilidade não existem. |
| Pagamento e confirmação | Layouts desktop/mobile e recibo demonstrativo calculado dos itens, valores e carteira selecionada. Identificador prefixado com `DEMO-`; nenhuma transação real é enviada. Ainda faltam API, pedido idempotente, conexão, estados reais de confirmação/recusa e recibo imutável do servidor. |
| Cadastro, login e sessão | Formulários de login/cadastro responsivos com validação local de e-mail e senha. Autenticação, persistência de sessão e proteção de rotas não foram implementadas. |
| Perfil e carteiras | Não implementados. |
| REST, Axios e TanStack Query | Dependências disponíveis; contratos, cliente e integração ainda não implementados. |
| MSW | Dependências disponíveis; handlers, cenários e reset de mocks ainda não implementados. |
| Socket.IO | Cliente instalado; eventos, reconexão e sincronização ainda não implementados. |
| Banners, conteúdo e newsletter | Componentes visuais estão na homepage; navegação editorial, CTAs e redes sociais ainda não têm comportamento funcional. O formulário de newsletter valida o formato, sem envio para serviço. |
| Acessibilidade e responsividade | Há semântica básica, textos alternativos e estilos responsivos. Testes sistemáticos de teclado, leitor de tela, zoom, contraste e viewports do desafio estão pendentes. |
| Playwright e regressão visual | Playwright está instalado, mas não há testes E2E, script de execução ou baselines versionadas. |
| Lighthouse e deploy | Scripts, relatórios de auditoria e publicação ainda não configurados. |

As outras rotas declaradas em `src/routes/index.tsx` ainda são estruturas iniciais e não representam as telas funcionais descritas no desafio.

### Validação realizada

- `npm run build` — TypeScript e build de produção aprovados.
- `npm run lint` — ESLint aprovado.
- Conferência visual manual do carrinho e do pagamento mobile em 390 × 844 px; ambos sem overflow horizontal nessa largura. Não foram criadas baselines nem executados testes E2E.

**Risco para a avaliação:** o enunciado considera eliminatórios os fluxos principais apenas visuais e a ausência de testes E2E executáveis. Como pedidos, autenticação e integrações simuladas ainda não estão implementados, o projeto ainda não atende ao desafio completo, apesar das telas de carrinho e pagamento funcionais localmente.

## Próximas etapas recomendadas

1. Definir contratos REST e implementar a camada de rede com Axios e MSW.
2. Migrar catálogo e detalhes locais para consultas tipadas com TanStack Query; sincronizar busca, filtros, ordenação e paginação com a URL.
3. Migrar filtros, estados de carregamento/erro/vazio e paginação do catálogo para consultas à API.
4. Completar favoritos persistentes, disponibilidade e validação de edições/quantidade no detalhe.
5. Integrar formulário e carrinho a contratos REST/MSW; implementar cotação, pedidos idempotentes, estados pendentes/confirmados/recusados e recibo.
6. Implementar cadastro, autenticação, sessão, perfil e carteiras.
7. Integrar eventos Socket.IO e cenários de reconexão.
8. Conectar CTAs, conteúdo e newsletter a destinos ou operações reais, sem exibir sucesso falso.
9. Completar testes Playwright, verificações de acessibilidade, auditorias Lighthouse e deploy.
