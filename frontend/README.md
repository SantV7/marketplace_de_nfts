# KURIO — NFT Marketplace

Frontend de um marketplace de NFTs desenvolvido como parte de um desafio técnico. A homepage está sendo construída incrementalmente para seguir a direção visual do Figma, incluindo navegação, apresentação, descoberta de NFTs, banners editoriais, conteúdo e rodapé.

> **Status:** a interface contém homepage, catálogo e detalhes demonstrativos, com busca e filtros locais sincronizados à URL e carrinho persistido no navegador. Os dados ainda não vêm de API; autenticação, checkout, tempo real, testes E2E e deploy permanecem pendentes. Consulte [Escopo do desafio e status](#escopo-do-desafio-e-status) e os [requisitos completos do teste](./about_test.md).

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
- Adição pela página de detalhes; itens agrupados por NFT, edição e estilo, com controles para alterar quantidade e remover.
- A imagem e a identificação do item refletem o estilo escolhido (Normal, Platinada, Dourada ou Saturada).
- Carrinho persistido em `localStorage`, restaurado após refresh e sincronizado entre abas do navegador.
- Contador da navbar reflete a quantidade total de unidades.
- Quantidades respeitam limites demonstrativos por NFT/edição, compartilhados entre estilos diferentes.
- Subtotal, desconto, taxa fixa demonstrativa de `0.016 ETH` e total são calculados com unidades inteiras de ETH. O cupom `KURIO10` aplica 10% de desconto local, sem validação de API.
- A finalização apenas informa que o pagamento não está disponível; nenhum pedido é criado ou confirmado.

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
│   └── products/
│       ├── Products.tsx        # Estado e composição da seção de produtos
│       ├── ProductSidebar.tsx  # Categorias, preço, redes e destaque
│       ├── ProductCatalog.tsx  # Abas, ordenação, cards e paginação
│       └── productData.ts      # Tipos, dados demonstrativos e opções
├── pages/nftDetails/
│   ├── ProductDetail.tsx       # Página demonstrativa de detalhes do NFT
│   └── productDetailData.ts    # Dados locais usados na página de detalhes
├── pages/cart/
│   └── Cart.tsx                # Carrinho, resumo, cupom demonstrativo e recomendações
├── routes/index.tsx            # Rotas declaradas com TanStack Router
└── styles/global.css           # Estilos globais e controles de preço
```

Os requisitos completos do desafio estão em [`about_test.md`](./about_test.md).

## Escopo do desafio e status

O desafio pede uma experiência completa de descoberta, compra e conta do colecionador, integrada a APIs simuladas, com responsividade, acessibilidade, testes e auditorias. A tabela abaixo diferencia a implementação atual dos requisitos ainda pendentes.

| Área avaliada | Status atual |
| --- | --- |
| Início e identidade visual | Navbar, hero, catálogo, banners, seção editorial e footer compõem a homepage. A fidelidade e responsividade ainda precisam de validação completa contra os frames do Figma. |
| Descoberta de NFTs | Busca, filtros, abas, ordenação e paginação locais em `/` e `/market`, sincronizados com a URL. Dados e resultados ainda não vêm de API. |
| Detalhes do NFT | Página em `/nft/$id`, com estado para identificador inexistente. Compra adiciona ao carrinho; dados e limites por edição são demonstrativos, e favoritos persistentes não estão implementados. |
| Carrinho, cotação e cupons | Adicionar, alterar quantidade e remover itens com persistência local; estilo escolhido é refletido na linha e na imagem do NFT. Cupom `KURIO10`, disponibilidade e taxa de rede são demonstrativos. Cotação real, disponibilidade remota, reconciliação com eventos e checkout ainda não estão implementados. |
| Pagamento e confirmação | Não implementados. |
| Cadastro, login e sessão | Há um link e uma rota inicial de login; autenticação, persistência de sessão e proteção de rotas não foram implementadas. |
| Perfil e carteiras | Não implementados. |
| REST, Axios e TanStack Query | Dependências disponíveis; contratos, cliente e integração ainda não implementados. |
| MSW | Dependências disponíveis; handlers, cenários e reset de mocks ainda não implementados. |
| Socket.IO | Cliente instalado; eventos, reconexão e sincronização ainda não implementados. |
| Banners, conteúdo e newsletter | Componentes visuais estão na homepage; navegação editorial, CTAs e redes sociais ainda não têm comportamento funcional. O formulário de newsletter valida o formato, sem envio para serviço. |
| Acessibilidade e responsividade | Há semântica básica, textos alternativos e estilos responsivos; a validação completa por teclado, leitor de tela, zoom, estados de carregamento e viewports do desafio está pendente. |
| Playwright e regressão visual | Playwright está instalado, mas ainda não há testes E2E ou baselines versionadas. |
| Lighthouse e deploy | Scripts, relatórios de auditoria e publicação ainda não configurados. |

As outras rotas declaradas em `src/routes/index.tsx` ainda são estruturas iniciais e não representam as telas funcionais descritas no desafio.

## Próximas etapas recomendadas

1. Definir contratos REST e implementar a camada de rede com Axios e MSW.
2. Migrar catálogo e detalhes locais para consultas tipadas com TanStack Query; sincronizar busca, filtros, ordenação e paginação com a URL.
3. Migrar filtros, estados de carregamento/erro/vazio e paginação do catálogo para consultas à API.
4. Completar favoritos persistentes, disponibilidade e validação de edições/quantidade no detalhe.
5. Substituir o estado local do carrinho por contratos REST/MSW e implementar cotação, checkout, idempotência e recibo.
6. Implementar cadastro, autenticação, sessão, perfil e carteiras.
7. Integrar eventos Socket.IO e cenários de reconexão.
8. Conectar CTAs, conteúdo e newsletter a destinos ou operações reais, sem exibir sucesso falso.
9. Completar testes Playwright, verificações de acessibilidade, auditorias Lighthouse e deploy.
