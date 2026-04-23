# Arquitetura Feature-Sliced Design (FSD)

## Estrutura

```
src/
├── app/              # Ponto de entrada da aplicação
│   └── index.ts      # Re-exporta o App principal
│
├── features/         # Funcionalidades isoladas por domínio
│   ├── auth/         # Login, Register, ForgotPassword
│   ├── dashboard/    # Tela principal do atleta
│   ├── workout/      # Treinos, sessão ativa, criação
│   ├── stats/        # Estatísticas e evolução física
│   ├── calendar/     # Calendário de treinos
│   ├── leaderboard/  # Ranking global e por liga
│   ├── profile/      # Perfil e edição de dados
│   ├── students/     # Gestão de alunos (treinador)
│   ├── express/      # Loja e conexão com treinadores
│   ├── chat/         # Mensagens entre atleta e treinador
│   └── notifications/# Central de notificações
│
├── entities/         # Tipos de domínio compartilhados
│   └── index.ts      # Re-exporta todos os tipos de domain/entities
│
├── shared/           # Código reutilizável sem lógica de negócio
│   ├── ui/           # Componentes genéricos (Card, Badge, etc.)
│   ├── hooks/        # Hooks compartilhados (useAppState)
│   └── lib/          # Utilitários (cn, validation, youtube)
│
└── app (legado, mantido para compatibilidade)
    ├── domain/       # Entidades e casos de uso
    ├── data/         # Serviços de API
    ├── presentation/ # Componentes e telas (fonte real dos arquivos)
    └── utils/        # Utilitários originais
```

## Regras de Importação FSD

1. `app` pode importar de qualquer camada
2. `features` importa apenas de `entities`, `shared`
3. Uma feature **nunca** importa de outra feature diretamente
4. `entities` importa apenas de `shared`
5. `shared` não importa de nenhuma outra camada

## Como usar

Importe sempre pelo barrel index da feature:

```ts
// ✅ Correto
import { LoginView } from '@/features/auth';
import { Card } from '@/shared/ui';
import { UserProfile } from '@/entities';

// ❌ Evitar
import { LoginView } from '@/presentation/screens/auth/LoginView';
```

## Próximos passos para migração completa

Os arquivos em `presentation/` ainda são a fonte real do código.
Para completar a migração, mova o código de cada tela para dentro
de sua respectiva feature, atualizando os imports internos para
usar os caminhos FSD.
