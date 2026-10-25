# KURIO — NFT Marketplace

Frontend de um marketplace de NFTs desenvolvido como parte de um desafio técnico. A homepage está sendo construída incrementalmente para seguir a direção visual do Figma, incluindo navegação, apresentação, descoberta de NFTs, banners editoriais, conteúdo e rodapé.

> **Status:** a interface está em fase de protótipo visual, com catálogo demonstrativo disponível tanto na homepage quanto em `/market`, e uma página de detalhes acessível em `/nft/:id`. O catálogo e os detalhes usam dados locais; APIs, autenticação, carrinho, compra, tempo real, testes E2E e deploy ainda não estão implementados. Consulte [Escopo do desafio e status](#escopo-do-desafio-e-status) e o [checklist completo do teste](../about_test.md).

## Tecnologias

### Em uso na interface atual

- React 19 e TypeScript
- Vite
- TanStack Router
- Tailwind CSS v4
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

- Navbar com marca KURIO, links, busca expansível, carrinho e acesso visual ao login.
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
- Os dados vêm de um catálogo local em `src/pages/nftDetails/productDetailData.ts`. As ações de compra e favorito ainda não persistem nem integram uma API; edição e quantidade ainda não validam disponibilidade/limites.

### Catálogo de demonstração

- Cards reutilizáveis com imagem, nome, identificador e preço em ETH.
- Categorias com contagens calculadas a partir do conjunto demonstrativo e seleção de categoria.
- Controle de faixa de preço e aplicação do intervalo selecionado.
- Abas para todos os NFTs, novos lançamentos e itens em alta.
- Ordenação por listagem ou preço.
- Controles de paginação prototipados e estado de resultados vazios.
- Bloco de NFT em destaque.
- Imagens locais otimizadas em `src/assets/img/nfts/`; a arte do hero também utiliza um desses assets.

O conteúdo atual do catálogo está definido em `src/pages/home/products/productData.ts` e é **estático/de demonstração**. Não representa dados recebidos de API. As contagens de categorias e redes são calculadas somente sobre esse conjunto pequeno, não sobre um catálogo real. A lista de redes não está disponível como filtro funcional na interface atual. A paginação é apenas um protótipo e ainda não há NFTs suficientes para preencher páginas adicionais. A busca da navbar leva o termo para a URL de `/market`, mas ainda não filtra o catálogo local. Busca, filtros, ordenação e paginação também ainda não são sincronizados integralmente com os parâmetros da URL.

Os botões “Explorar” dos banners, os cards e links editoriais, os links de redes sociais e o formulário de newsletter são elementos de apresentação sem integração funcional nesta etapa. O footer exibe informações de contato e carteiras ilustrativas.

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
├── routes/index.tsx            # Rotas declaradas com TanStack Router
└── styles/global.css           # Estilos globais e controles de preço
```

O detalhamento dos requisitos do desafio, com o status de cada item, está em [`about_test.md`](../about_test.md).

## Escopo do desafio e status

O desafio pede uma experiência completa de descoberta, compra e conta do colecionador, integrada a APIs simuladas, com responsividade, acessibilidade, testes e auditorias. A tabela abaixo diferencia a implementação atual dos requisitos ainda pendentes.

| Área avaliada | Status atual |
| --- | --- |
| Início e identidade visual | Navbar, hero, catálogo, banners, seção editorial e footer compõem a homepage. A fidelidade e responsividade ainda precisam de validação completa contra os frames do Figma. |
| Descoberta de NFTs | Protótipo com dados locais em `/` e `/market`. Categoria, faixa de preço, abas e ordenação alteram a lista local; redes não têm filtro funcional, paginação não tem páginas adicionais preenchidas, estados não são sincronizados integralmente com a URL e não há integração com API. |
| Detalhes do NFT | Página visual implementada em `/nft/$id`, com estado para identificador inexistente e navegação de ida/volta do catálogo. Dados são locais; compra, favorito persistente, validação de edição e limites de quantidade não estão implementados. |
| Carrinho, cotação e cupons | Não implementados. |
| Pagamento e confirmação | Não implementados. |
| Cadastro, login e sessão | Há um link e uma rota inicial de login; autenticação, persistência de sessão e proteção de rotas não foram implementadas. |
| Perfil e carteiras | Não implementados. |
| REST, Axios e TanStack Query | Dependências disponíveis; contratos, cliente e integração ainda não implementados. |
| MSW | Dependências disponíveis; handlers, cenários e reset de mocks ainda não implementados. |
| Socket.IO | Cliente instalado; eventos, reconexão e sincronização ainda não implementados. |
| Banners, conteúdo e newsletter | Componentes visuais estão na homepage; navegação editorial, CTAs, redes sociais e cadastro de e-mail ainda não têm comportamento funcional. |
| Acessibilidade e responsividade | Há semântica básica, textos alternativos e estilos responsivos; a validação completa por teclado, leitor de tela, zoom, estados de carregamento e viewports do desafio está pendente. |
| Playwright e regressão visual | Playwright está instalado, mas ainda não há testes E2E ou baselines versionadas. |
| Lighthouse e deploy | Scripts, relatórios de auditoria e publicação ainda não configurados. |

As outras rotas declaradas em `src/routes/index.tsx` ainda são estruturas iniciais e não representam as telas funcionais descritas no desafio.

## Próximas etapas recomendadas

1. Definir contratos REST e implementar a camada de rede com Axios e MSW.
2. Migrar catálogo e detalhes locais para consultas tipadas com TanStack Query; sincronizar busca, filtros, ordenação e paginação com a URL.
3. Completar filtros de rede, estados de carregamento/erro/vazio e paginação do catálogo.
4. Completar favoritos persistentes, disponibilidade e validação de edições/quantidade no detalhe.
5. Implementar carrinho, cotação, checkout, idempotência e recibo.
6. Implementar cadastro, autenticação, sessão, perfil e carteiras.
7. Integrar eventos Socket.IO e cenários de reconexão.
8. Conectar CTAs, conteúdo e newsletter a destinos ou operações reais, sem exibir sucesso falso.
9. Completar testes Playwright, verificações de acessibilidade, auditorias Lighthouse e deploy.
