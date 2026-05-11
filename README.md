# Shape Express

Plataforma premium de acompanhamento fitness com treinos, progresso, comunidades, IA e pagamentos.

## Stack

| Camada | Tecnologia |
|--------|------------|
| Frontend | React 19, TypeScript, Vite 6 |
| Estilo | TailwindCSS 4, Motion |
| Backend | Express.js (porta 3000) |
| Banco de dados | Firebase (Firestore, Auth, Storage) |
| Pagamentos | Stripe |
| IA | Google Gemini (`gemini-2.0-flash`) |
| Mobile | Capacitor 8 (Android) |
| Deploy | Railway |

## Pré-requisitos

- Node.js 20+
- JDK 17+ e Android Studio (apenas para builds Android)

## Início Rápido

```bash
npm install

# Windows
copy .env.example .env.local
# macOS/Linux
cp .env.example .env.local

npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Comandos

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Limpa cache e inicia Vite + Express |
| `npm run build` | Build de produção |
| `npm run lint` | Verificação TypeScript (`tsc --noEmit`) |
| `npm run clean` | Remove dist, cache, logs e build Android |
| `npm run test:web` | Testes web: login + register atleta + register treinador (headless) |
| `npm run test:web:headed` | Mesmo que acima, browser visível |
| `npm run test:android` | Só o build Android |
| `npm run test:e2e` | Web + Android em sequência, aborta se web falhar |
| `npm run test:e2e:headed` | Mesmo que acima, browser visível |

## Variáveis de Ambiente

Crie `.env.local` com as seguintes chaves:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLIC_KEY=pk_test_...
GEMINI_API_KEY=
APP_URL=http://localhost:3000
NODE_ENV=development
```

> Variáveis com prefixo `VITE_` ficam expostas no cliente. Nunca coloque `STRIPE_SECRET_KEY` ou `GEMINI_API_KEY` com esse prefixo.

## Funcionalidades

- Autenticação, Dashboard, Treinos, Estatísticas, Calendário
- Placar, Chat (Firestore em tempo real), Express (marketplace), Loja
- Perfil, Conquistas, Avaliação Corporal
- Notificações, Alunos, Comunidades
- Coach IA e recomendação de comunidades por IA

## Deploy

O projeto está configurado para Railway via `railway.toml`. O comando de start em produção é `npm run start`.

## Convenções de Commit

Conventional Commits em **português (pt-BR)**.

Formato: `<tipo>(<escopo>): <descrição>`

```bash
funcionalidade(auth): adiciona login com Google
correção(chat): corrige envio de mensagens duplicadas
refatoração(hooks): extrai lógica de autenticação
```

## Licença

Privado — Todos os direitos reservados.
