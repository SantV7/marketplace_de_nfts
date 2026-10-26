# KURIO — NFT Marketplace

Frontend React/TypeScript para o desafio descrito em [about_test.md](about_test.md). A interface existente cobre homepage, catálogo, detalhe, carrinho e checkout responsivos. A migração para REST simulado está em andamento: catálogo, detalhe, favoritos, carrinho, cotação, autenticação e pedido já usam Axios, TanStack Query e handlers MSW. Veja [ARCHITECTURE.md](ARCHITECTURE.md) para contratos e limitações.

> **Estado:** implementação parcial. Ainda não atende a todas as exigências eliminatórias: faltam cobertura E2E completa, cenários e sincronização Socket.IO validados, estados de pagamento/falha completos, revisão de acessibilidade, Lighthouse executado e deploy público. Não considere a entrega pronta para avaliação final.

## Executar localmente

Requisitos: Node.js compatível com Vite 8 e npm.

```bash
npm ci
npm run dev
```

MSW inicia em desenvolvimento. Para ativá-lo num build de demonstração, defina `VITE_ENABLE_MOCKS=true` antes do build. Não há backend real. Credenciais fictícias: `contato@email.com` / `Kurio123` e `colecionador@email.com` / `Kurio123`.

### Comandos

| Comando | Função |
| --- | --- |
| `npm run dev` | Vite com MSW em desenvolvimento |
| `npm run typecheck` | Verificação TypeScript |
| `npm run lint` | ESLint |
| `npm run build` | Typecheck e build de produção |
| `npm run preview` | Preview do build |
| `npm run test:e2e` | Playwright, Chromium desktop/mobile |
| `npm run test:e2e:report` | Relatório HTML da execução anterior |
| `npm run audit:lighthouse` | Três medições mobile/desktop para início e detalhe |

O script Lighthouse requer `lighthouse` disponível no projeto e Chrome/Chromium executável (ou `CHROME_PATH`). A tentativa de adicionar Lighthouse ao lockfile offline não foi possível neste ambiente; execute `npm install -D lighthouse` num ambiente com acesso ao registry, gere o lockfile e rode `npm run build` antes da auditoria. Relatórios são escritos em `lighthouse-reports/`.

## Implementado nesta etapa

- Contratos REST tipados e hooks Axios/TanStack Query para NFTs, favoritos, carrinho, cotação, sessão, perfil, carteiras e pedidos idempotentes.
- MSW com catálogo de fixtures ampliado, dois usuários, validação básica de disponibilidade/cupom e cenários `slow`, `variable`, `empty`, `offline` e `server-error` por `localStorage.kurio_mock_scenario`.
- Catálogo e detalhe migrados para REST; favorito usa update otimista com rollback; carrinho consulta e altera o mock; login usa handler REST.
- Rotas protegidas para checkout, confirmação, perfil e carteiras; pedido confirmado vem da API simulada.
- Listener Socket.IO e binding MSW adicionados, com versão/deduplicação e invalidação pós-reconexão. Compatibilidade precisa de validação: o binding declara peer MSW 2.10.2, enquanto o projeto usa MSW 3.0.3.
- `ARCHITECTURE.md` documenta rotas REST, cache, sessão e limitações.

## Validação atual

- `npm run build` — aprovado.
- `npm run lint` — aprovado.
- Playwright — catálogo HTTP, detalhe inexistente e login passaram no Chromium mobile. A suíte completa ainda falha/está incompleta; cadastro foi marcado como `fixme` porque o Auth monta dois formulários responsivos simultaneamente. Testes cobrindo compra, persistência, eventos, perfis, carteiras, teclado, falhas e regressão visual ainda faltam.
- Lighthouse — configuração e script adicionados, medições não executadas; nenhuma meta de pontuação foi comprovada.
- Deploy — não configurado. Requer conta/credenciais de hospedagem e URL pública.

## Próximo trabalho obrigatório

1. Completar a refatoração de Auth em componentes e montar uma única instância acessível do formulário por viewport; finalizar retorno pós-login, logout e persistência/expiração da sessão.
2. Migrar todos os consumidores ainda locais (recomendações, carrinho no mobile, confirmação e demais dados editoriais aplicáveis); fechar formulário de cotação e pedido idempotente/timeout/recusa com snapshot fiel.
3. Completar handlers determinísticos e isolamento/reset por teste; validar MSW Socket.IO binding com versão compatível e criar cenários de eventos, desconexão e retomada.
4. Criar telas/validações completas para senha, avatar e carteiras; cobrir os doze grupos de cenários Playwright, desktop/mobile, snapshots visuais estáveis e estados isolados.
5. Instalar Lighthouse, rodar três vezes por rota/perfil, reportar medianas, LCP/CLS/TBT, corrigir metas e versionar relatórios.
6. Configurar deploy público com mocks habilitados, testar refresh de rotas publicadas e registrar URL/repositório.

Consulte o enunciado completo em [about_test.md](about_test.md); decisões e limitações técnicas estão em [ARCHITECTURE.md](ARCHITECTURE.md).
