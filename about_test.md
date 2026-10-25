# Checklist do desafio frontend — Marketplace de NFTs

Este documento acompanha os requisitos do teste frontend e registra o estado observado no projeto. Atualize os status conforme novas partes forem implementadas e validadas.

## Legenda

- **Feito**: implementado e validado.
- **Parcial**: existe uma implementação visual ou limitada, mas faltam comportamentos exigidos.
- **Pendente**: ainda não implementado.

> O projeto está atualmente em fase de protótipo visual. A existência de dependências instaladas não significa que uma integração esteja implementada. Ainda não há cobertura de testes E2E nem validação integral dos critérios.

## 1. Stack obrigatória

| Requisito | Status | Situação atual |
| --- | --- | --- |
| React | Feito | Interface implementada em React. |
| TypeScript | Feito | Componentes, rotas e dados são escritos em TypeScript. |
| TanStack Router | Parcial | Rotas declaradas para início, mercado e detalhe; algumas outras rotas exibem apenas o navbar. |
| TanStack Query | Pendente | Dependência instalada; não há consultas/mutations integradas. |
| Axios e REST | Pendente | Dependências instaladas; cliente HTTP, contratos e integração não implementados. |
| Socket.IO | Pendente | Cliente instalado; não há conexão/eventos implementados. |
| Tailwind CSS | Feito | Estilização atual usa Tailwind CSS. |
| shadcn/ui | Pendente | Componentes shadcn/ui ainda não foram integrados. |
| MSW | Pendente | Dependências instaladas; worker, handlers e cenários do desafio não implementados. |
| Playwright | Pendente | Dependência instalada; não há testes E2E ou regressão visual. |
| Lighthouse | Pendente | Auditorias e scripts de execução não configurados. |

## 2. Telas e fluxos

| Tela/fluxo | Status | Implementado | Ainda falta |
| --- | --- | --- | --- |
| Início | Parcial | Navbar, hero, catálogo local, banners, seção editorial e footer. | Validar fidelidade completa ao Figma; ligar busca e CTAs a comportamentos reais; adicionar estados de dados. |
| Mercado | Parcial | `/market` reutiliza catálogo, filtros locais, ordenação, paginação demonstrativa e footer. | Dados por API; estado completo na URL; filtro de rede funcional; paginação com dados suficientes; busca efetiva. |
| Detalhes do NFT | Parcial | `/nft/$id`, acesso direto por ID, estado de NFT inexistente, galeria/estilos, edição visual, quantidade, favorito visual, detalhes e itens relacionados. | API, favorito persistente por usuário, edição indisponível, limite de quantidade e integração da compra/carrinho. |
| Carrinho de NFTs | Pendente | — | Inclusão, edição de quantidade, remoção, cupom, resumo e persistência. |
| Pagamento | Pendente | — | Dados do colecionador, carteira/rede, revisão, cotação atualizada e envio do pedido. |
| Confirmação do pedido | Pendente | — | Estados pendente/confirmado/recusado, recibo imutável e recuperação após refresh/reconexão. |
| Login e cadastro | Pendente | Há rota declarada de login, que ainda exibe apenas o navbar. | Cadastro, validação, login/logout, sessão recuperável, expiração e retorno ao fluxo anterior. |
| Perfil do colecionador | Pendente | — | Edição de dados, avatar e senha, validação e persistência. |
| Carteiras | Pendente | — | Cadastro/edição de carteiras principal e secundária, seleção de rede e simulação de conexão. |

## 3. Catálogo, detalhe e carrinho

| Requisito | Status | Situação atual |
| --- | --- | --- |
| Busca, filtros, ordenação e paginação sincronizados à URL/histórico | Pendente | Busca só navega para `/market?q=...`; filtros, ordenação e página são estado local. |
| Filtros combináveis e reinício de página ao filtrar | Parcial | Categoria e faixa de preço alteram os dados locais; rede não está conectada ao filtro. |
| Consulta à API, respostas vazias, falhas e respostas fora de ordem | Pendente | Catálogo e detalhe usam dados locais, sem estados de consulta remota. |
| Acesso direto ao detalhe e NFT inexistente | Parcial | A rota dinâmica e a mensagem de NFT não encontrado existem; validação contra serviço/API não existe. |
| Edição indisponível e limite de quantidade | Pendente | Seleção de edição e quantidade são visuais, sem validação de disponibilidade/limite. |
| Favoritos persistentes para usuário autenticado | Pendente | O botão altera somente estado local temporário; não há autenticação nem persistência. |
| Carrinho persistente e preservado ao autenticar | Pendente | Carrinho não implementado. |
| Cupom, subtotal, desconto, taxas e total precisos em ETH | Pendente | Fluxo e cálculos não implementados. |
| Atualização de preço/disponibilidade enquanto o carrinho está aberto | Pendente | Não há integração em tempo real. |

## 4. Integração e estado

- [ ] Definir contratos REST tipados para sessão, conta, NFTs, favoritos, carrinho, cotação, pedidos, perfil e carteiras.
- [ ] Encaminhar chamadas REST pelo cliente Axios.
- [ ] Usar TanStack Query para consultas, mutations, cache e invalidação.
- [ ] Refletir carregamento, vazio, erro, sucesso e atualização em segundo plano.
- [ ] Tratar respostas obsoletas, retries e falhas sem duplicar operações.
- [ ] Sincronizar parâmetros do catálogo com TanStack Router e preservar histórico/refresh.
- [ ] Isolar dados privados por sessão e limpá-los em logout/troca de usuário.
- [ ] Implementar ao menos uma atualização otimista com rollback.
- [ ] Documentar política de cache, retries e sincronização.
- [ ] Tratar rota inexistente e acesso direto a todas as telas previstas.

## 5. Contratos REST

- [ ] Sessão/conta: cadastro, login, consulta de sessão, logout e expiração.
- [ ] NFTs: listagem com busca/filtros/ordenação/paginação e detalhe.
- [ ] Favoritos: consulta, inclusão e remoção.
- [ ] Carrinho: consulta, inclusão, alteração e remoção.
- [ ] Cotação: validação de cupom, disponibilidade, descontos, taxas e total.
- [ ] Pedidos: criação idempotente, estado e recibo.
- [ ] Perfil: consulta, atualização de dados/avatar e alteração de senha.
- [ ] Carteiras: consulta, cadastro e atualização.
- [ ] Representar erros de validação, sessão inválida, falta de permissão, recurso inexistente, conflito de disponibilidade e falha transitória.
- [ ] Documentar contratos e utilizar chave de idempotência em mutations de pedido.

## 6. MSW e cenários de rede

- [ ] Implementar mocks na camada de rede, reutilizáveis em desenvolvimento, demonstração e testes.
- [ ] Manter estado consistente entre catálogo, favoritos, carrinho, perfil, carteiras e pedidos.
- [ ] Disponibilizar reset para um cenário determinístico conhecido.
- [ ] Configurar cenários de latência variável, timeout, desconexão e HTTP 4xx/5xx.
- [ ] Criar fixtures com variedade para filtros/paginação e pelo menos dois usuários.
- [ ] Cobrir sucesso, vazio, respostas fora de ordem, sessão expirada, validação, cupom inválido, preço/edição alterados, timeout idempotente, pagamento confirmado e recusado.
- [ ] Simular eventos Socket.IO de forma compatível com o cliente `socket.io-client` e documentar limitações.
- [ ] Permitir ativação por configuração e disponibilizar mocks no build de demonstração.

## 7. Tempo real com Socket.IO

- [ ] Implementar `nft.updated` para atualizar preço/disponibilidade no catálogo, detalhe e carrinho.
- [ ] Implementar `order.updated` para atualizar pedido e apresentar confirmação/recusa.
- [ ] Tratar identidade/versão, duplicatas e eventos antigos sem regredir estado.
- [ ] Reconciliar recursos via REST após reconexão.
- [ ] Isolar eventos por sessão e liberar listeners ao encerrar o ciclo de vida.
- [ ] Testar alteração de preço/disponibilidade durante checkout e bloquear cotação desatualizada.
- [ ] Recuperar pedido pendente após desconexão/refresh sem criar compra duplicada.

## 8. Interface, responsividade e acessibilidade

- [ ] Validar todas as telas nos viewports de 390, 768 e 1440 px.
- [ ] Validar filtros, navegação, formulários, carrinho e checkout em desktop/tablet/mobile.
- [ ] Implementar skeletons com shimmer para catálogo, detalhe e resumo do carrinho; respeitar movimento reduzido.
- [ ] Garantir navegação por teclado, foco visível e controle de foco em diálogos/drawers.
- [ ] Associar labels e mensagens de erro aos campos; validar semântica e textos alternativos.
- [ ] Conferir contraste, feedback acessível em alterações e operação com zoom sem overflow indevido.
- [ ] Documentar substituições de assets ou desvios necessários em relação ao Figma.

## 9. Playwright

- [ ] Configurar testes E2E executáveis com MSW e estado isolado por teste.
- [ ] Cobrir catálogo, histórico, detalhe direto/inexistente, conta/sessão, favoritos e recuperação de falha.
- [ ] Cobrir carrinho, refresh/login, compra confirmada, recusa, clique repetido e recuperação idempotente.
- [ ] Cobrir perfil/carteiras, erros, eventos Socket.IO, duplicatas, desconexão e retomada.
- [ ] Cobrir teclado, foco, formulários, skeletons, falha e nova tentativa.
- [ ] Executar Chromium em desktop e mobile e criar baselines visuais para início, detalhe, carrinho e pagamento.
- [ ] Entregar relatório HTML e traces de falhas.

## 10. Performance e Lighthouse

- [ ] Configurar auditoria para início e detalhe em perfis desktop e mobile, usando build otimizado.
- [ ] Executar três medições por página/perfil e reportar medianas.
- [ ] Medir metas: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 90.
- [ ] Registrar LCP, CLS e TBT; justificar resultados abaixo das metas.
- [ ] Versionar configuração e entregar relatórios HTML/JSON com ferramentas, versões e ambiente.

## 11. Entrega e documentação

- [x] README do frontend descreve execução, stack atual, estrutura, funcionalidades e limitações conhecidas.
- [x] Este checklist registra requisitos do teste e status observado.
- [ ] Documentar contratos REST, eventos, política de sessão/cache, mocks, reset e cenários.
- [ ] Incluir comandos para desenvolvimento, mocks, build, lint, testes Playwright e Lighthouse.
- [ ] Entregar código, lockfile, assets, mocks, fixtures, testes e configuração de auditoria.
- [ ] Publicar deploy acessível, alinhado ao código entregue, com acesso direto e refresh das rotas funcionando.

## Próxima prioridade sugerida

1. Implementar estado de URL e busca/filtros reais do catálogo.
2. Criar contratos REST e camada de rede Axios/MSW, começando por catálogo e detalhe.
3. Adicionar estados de carregamento/erro/vazio e testes Playwright do catálogo/detalhe.
4. Implementar favoritos e carrinho com persistência.
5. Completar sessão, checkout, pedidos e eventos em tempo real.
6. Validar acessibilidade/responsividade e configurar Lighthouse/deploy.