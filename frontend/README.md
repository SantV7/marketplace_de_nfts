# 💎 NFT Marketplace — Frontend Challenge

Aplicação web production-ready para um Marketplace de NFTs desenvolvida com React 19, TypeScript, Tailwind CSS, shadcn/ui e Clean Architecture. O projeto conta com simulação de rede e tempo real via MSW (v2) e Socket.IO, além de testes E2E com Playwright.

---

## 🛠️ Tech Stack & Dependências Base

A stack principal e ferramentas utilitárias foram estritamente alinhadas para garantir compatibilidade total, tipagem estática rigorosa e alta performance:

* **Core & Build:** React 19, TypeScript, Vite.
* **Roteamento & Estado Remoto:** TanStack Router, TanStack Query (v5).
* **Comunicação HTTP & Realtime:** Axios, Socket.IO Client.
* **Interface & Estilização:** Tailwind CSS v4, shadcn/ui (Radix UI + Nova Preset / Geist), Lucide React, `clsx`, `tailwind-merge`, `class-variance-authority`.
* **Formulários & Validação:** React Hook Form, Zod, `@hookform/resolvers`.
* **Mocking & Testes:** MSW (v2), `@mswjs/socket.io-binding`, Playwright (`@playwright/test`).
* **Utilitários:** `date-fns`.

---

## 🏗️ Decisões de Arquitetura (Clean Architecture)

A estrutura de pastas dentro de `src/` foi organizada visando separação clara de responsabilidades, testabilidade e desacoplamento de UI/infraestrutura:

```text
frontend/
├── public/
├── tests/                     # Suite de testes E2E (Playwright)
├── src/
│   ├── assets/                # Imagens, ícones locais e fontes
│   ├── components/            # Componentes princípais e reutilizáveis
│   ├── features/              # Módulos por domínio de negócio (catalog, cart, checkout, auth, profile)
│   │   ├── domain/            # Tipos, interfaces de entidades e regras puras
│   │   ├── application/       # Use cases, custom hooks, queries e mutations (TanStack Query)
│   ├── libs/                  # Instâncias de infraestrutura (Axios client, Socket.IO, MSW handlers/worker)
│   ├── pages/                 # Páginas e contêineres de rotas
│   ├── routes/                # Configuração e definição de rotas (TanStack Router)
│   ├── styles/                # Estilos globais (global.css, variáveis de tema)
│   ├── App.tsx
│   └── main.tsx
├── components.json            # Configuração do CLI do shadcn/ui
├── vite.config.ts             # Configuração do bundler e Path Aliases (@/*)
├── tsconfig.app.json          # Resolução de paths e compilador TypeScript
└── package.json