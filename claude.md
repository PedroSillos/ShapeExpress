# CLAUDE.md — Workout Tracker App (React Native + Expo)

## Visão Geral do Projeto

Aplicativo mobile de rastreamento de treinos com periodização de 8 semanas, cálculo automático de volume, dashboard visual com gráficos, sistema de progressão inteligente e alertas de estagnação. Estruturado nos treinos A/B/C/D/E/F.

---

## Stack Tecnológica

```
Runtime:         React Native + Expo (SDK 51+)
Linguagem:       TypeScript (strict mode)
Navegação:       Expo Router (file-based routing)
Estado Global:   Zustand
Persistência:    AsyncStorage + MMKV (dados críticos)
Gráficos:        Victory Native XL ou react-native-gifted-charts
UI Components:   Custom + NativeWind (Tailwind para RN)
Formulários:     React Hook Form + Zod
Ícones:          Expo Vector Icons (MaterialCommunityIcons)
Testes:          Jest + React Native Testing Library
Linting:         ESLint + Prettier
```

---

## Estrutura de Pastas

```
app/
├── (tabs)/
│   ├── _layout.tsx              # Tab navigator A/B/C/D/E/F + Dashboard
│   ├── dashboard.tsx            # Painel visual principal
│   ├── workout-[id].tsx         # Tela dinâmica de treino (A-F)
│   └── index.tsx                # Redirect para dashboard
├── exercise/
│   ├── [workoutId]/
│   │   └── [exerciseIndex].tsx  # Detalhe/edição de exercício
│   └── _layout.tsx
├── _layout.tsx                  # Root layout (providers)
└── +not-found.tsx

components/
├── workout/
│   ├── WorkoutTab.tsx           # Container de treino A-F
│   ├── ExerciseCard.tsx         # Card de exercício com semanas
│   ├── WeekRow.tsx              # Linha de dados de uma semana
│   ├── ExerciseForm.tsx         # Formulário de exercício
│   ├── MuscleGroupPicker.tsx    # Dropdown de grupo muscular
│   ├── VolumeDisplay.tsx        # Exibição calculada de volume
│   └── ProgressionBadge.tsx     # Badge de sugestão de carga
├── dashboard/
│   ├── KPICard.tsx              # Card de indicador (verde/laranja/vermelho)
│   ├── VolumeByMuscleChart.tsx  # Gráfico de barras por músculo
│   ├── WeeklyProgressChart.tsx  # Gráfico de linha semanal
│   ├── ExerciseProgressChart.tsx# Gráfico de progresso por exercício
│   └── StagnationAlert.tsx      # Alerta visual de estagnação
├── ui/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   ├── Badge.tsx
│   ├── Card.tsx
│   └── Modal.tsx
└── shared/
    ├── EmptyState.tsx
    ├── LoadingSpinner.tsx
    └── ColorIndicator.tsx

store/
├── workoutStore.ts              # Estado principal dos treinos
├── settingsStore.ts             # Preferências do usuário
└── index.ts

hooks/
├── useWorkout.ts                # Lógica de treino e cálculos
├── useVolume.ts                 # Cálculos de volume
├── useProgression.ts            # Lógica de progressão de carga
├── useStagnation.ts             # Detecção de estagnação
└── useDashboard.ts              # Agregação de dados para dashboard

utils/
├── calculations.ts              # Funções puras de cálculo
├── stagnation.ts                # Algoritmos de detecção
├── progression.ts               # Algoritmos de sugestão de carga
├── colors.ts                    # Mapeamento de status → cor
└── constants.ts                 # Constantes globais

types/
├── workout.ts                   # Tipos de treino e exercício
├── dashboard.ts                 # Tipos de dashboard e KPIs
└── index.ts

assets/
├── fonts/
└── images/
```

---

## Tipos Principais (TypeScript)

```typescript
// types/workout.ts

export type MuscleGroup =
  | 'Peito'
  | 'Ombro'
  | 'Tríceps'
  | 'Bíceps'
  | 'Dorsal'
  | 'Trapézio'
  | 'Quadríceps'
  | 'Posterior'
  | 'Panturrilhas'
  | 'Antebraço'
  | 'Core';

export type WorkoutId = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface WeekData {
  week: number;           // 1–8
  sets: number | null;    // Séries
  reps: number | null;    // Repetições
  rest: number | null;    // Descanso em segundos
  load: number | null;    // Carga em kg
  volume: number | null;  // Calculado: sets × reps × load
}

export interface Exercise {
  id: string;
  index: number;          // 0–9 (até 10 exercícios)
  muscleGroup: MuscleGroup | null;
  name: string;
  weeks: WeekData[];      // Array de 8 semanas
  totalVolume: number;    // Soma das semanas
}

export interface Workout {
  id: WorkoutId;
  label: string;          // "Treino A", "Treino B", etc.
  exercises: Exercise[];  // Máx 10
  totalVolume: number;
  lastUpdated: string;    // ISO date
}

export type StagnationLevel = 'none' | 'warning' | 'critical' | 'progress';

export interface StagnationStatus {
  exerciseId: string;
  level: StagnationLevel;
  weeksStagnant: number;
}

export interface ProgressionSuggestion {
  exerciseId: string;
  week: number;
  suggestedLoad: number;
  baseLoad: number;
}
```

---

## Store Principal (Zustand)

```typescript
// store/workoutStore.ts

interface WorkoutStore {
  workouts: Record<WorkoutId, Workout>;

  // Actions
  updateWeekData: (
    workoutId: WorkoutId,
    exerciseIndex: number,
    week: number,
    data: Partial<WeekData>
  ) => void;

  updateExercise: (
    workoutId: WorkoutId,
    exerciseIndex: number,
    data: Partial<Pick<Exercise, 'name' | 'muscleGroup'>>
  ) => void;

  autoFillWeeks: (
    workoutId: WorkoutId,
    exerciseIndex: number,
    fromWeek: number
  ) => void;

  resetExercise: (workoutId: WorkoutId, exerciseIndex: number) => void;
}
```

**Regras do Store:**
- Sempre recalcular `volume` automaticamente ao atualizar `sets`, `reps` ou `load`
- `totalVolume` do `Exercise` = soma de todos os `WeekData.volume` não nulos
- `totalVolume` do `Workout` = soma de todos os `Exercise.totalVolume`
- Persistir via `AsyncStorage` com `zustand/middleware/persist`

---

## Lógica de Negócio Central

### Cálculo de Volume

```typescript
// utils/calculations.ts

export function calculateWeekVolume(sets: number, reps: number, load: number): number {
  return sets * reps * load;
}

export function calculateExerciseVolume(weeks: WeekData[]): number {
  return weeks.reduce((acc, w) => acc + (w.volume ?? 0), 0);
}

export function calculateWorkoutVolume(exercises: Exercise[]): number {
  return exercises.reduce((acc, e) => acc + e.totalVolume, 0);
}
```

### Progressão de Carga

```typescript
// utils/progression.ts

/**
 * Sugere carga para a semana N+2 baseada na semana N
 * Incremento padrão: 2.5% a 5% da carga atual
 */
export function suggestProgression(
  weeks: WeekData[],
  targetWeek: number
): ProgressionSuggestion | null {
  const baseWeek = weeks.find(w => w.week === targetWeek - 2);
  if (!baseWeek?.load) return null;

  const increment = baseWeek.load <= 20 ? 1 : baseWeek.load * 0.025;
  const suggestedLoad = Math.round((baseWeek.load + increment) * 2) / 2; // arredonda para 0.5

  return {
    exerciseId: '',
    week: targetWeek,
    suggestedLoad,
    baseLoad: baseWeek.load,
  };
}
```

### Detecção de Estagnação

```typescript
// utils/stagnation.ts

export function detectStagnation(weeks: WeekData[]): StagnationLevel {
  const loadedWeeks = weeks
    .filter(w => w.load !== null)
    .sort((a, b) => a.week - b.week);

  if (loadedWeeks.length < 2) return 'none';

  let stagnantCount = 0;
  for (let i = loadedWeeks.length - 1; i > 0; i--) {
    if (loadedWeeks[i].load! <= loadedWeeks[i - 1].load!) {
      stagnantCount++;
    } else {
      break;
    }
  }

  if (stagnantCount === 0) return 'progress';
  if (stagnantCount >= 4) return 'critical';
  if (stagnantCount >= 3) return 'warning';
  return 'none';
}
```

### Cores por Status

```typescript
// utils/colors.ts

export const STATUS_COLORS = {
  progress: '#22c55e',   // Verde
  warning:  '#f97316',   // Laranja
  critical: '#ef4444',   // Vermelho
  none:     '#6b7280',   // Cinza
  suggestion: '#eab308', // Amarelo (sugestão de carga)
} as const;

export function getStagnationColor(level: StagnationLevel): string {
  return STATUS_COLORS[level];
}
```

---

## Componentes Críticos

### ExerciseCard

```typescript
// components/workout/ExerciseCard.tsx
// Responsabilidades:
// - Exibir nome do exercício e grupo muscular
// - Mostrar 8 linhas de WeekRow
// - Exibir totalVolume calculado
// - Badge de progressão na semana relevante
// - Indicador de cor de estagnação no header
// - Ao editar semana 1, disparar autoFillWeeks()
```

### WeekRow

```typescript
// components/workout/WeekRow.tsx
// Responsabilidades:
// - Inputs: séries, repetições, descanso, carga
// - Exibição do volume calculado (readonly)
// - Highlight amarelo quando há sugestão de carga
// - Highlight laranja quando volume = semana anterior
// - Background verde/laranja/vermelho sutil baseado em estagnação
```

### KPICard

```typescript
// components/dashboard/KPICard.tsx
// Props: title, value, unit, status: StagnationLevel, subtitle?
// - Borda colorida baseada no status
// - Ícone contextual
// - Valor em destaque
```

---

## Dashboard — KPIs Calculados

| KPI | Cálculo | Cor |
|-----|---------|-----|
| Volume Total da Semana | Soma de todos os workouts na semana atual | Verde se ↑, Laranja se =, Vermelho se ↓ |
| Exercícios Evoluindo | Count de exercícios com `stagnation = 'progress'` | Verde |
| Exercícios Estagnados | Count com `stagnation = 'warning' ou 'critical'` | Laranja/Vermelho |
| Maior Progresso de Carga | Max ((carga atual - carga inicial) / carga inicial) | Verde |
| Volume por Grupo Muscular | `groupBy(muscleGroup).sum(volume)` | Chart de barras |

---

## Gráficos (Victory Native XL)

### 1. Volume por Grupo Muscular
```typescript
// Tipo: Bar Chart horizontal
// X: MuscleGroup
// Y: volume total acumulado
// Cor: baseada no volume relativo (verde = mais, cinza = menos)
```

### 2. Evolução Semanal
```typescript
// Tipo: Line Chart
// X: semana (1-8)
// Y: volume total de todos os treinos naquela semana
// Mostra tendência de progressão
```

### 3. Progresso por Exercício
```typescript
// Tipo: Line Chart com seletor de exercício
// X: semana (1-8)
// Y: carga registrada
// Linha pontilhada para sugestões futuras
```

---

## Auto Preenchimento de Séries e Repetições

```typescript
// hooks/useWorkout.ts

function autoFillWeeks(
  workoutId: WorkoutId,
  exerciseIndex: number,
  fromWeek: number
): void {
  const exercise = getExercise(workoutId, exerciseIndex);
  const sourceWeek = exercise.weeks.find(w => w.week === fromWeek);
  if (!sourceWeek) return;

  // Preenche semanas posteriores mantendo séries e reps, zerando carga
  for (let week = fromWeek + 1; week <= 8; week++) {
    const target = exercise.weeks.find(w => w.week === week);
    if (!target?.sets && !target?.reps) {
      updateWeekData(workoutId, exerciseIndex, week, {
        sets: sourceWeek.sets,
        reps: sourceWeek.reps,
        rest: sourceWeek.rest,
        // load não é copiado — usuário preenche semana a semana
      });
    }
  }
}
```

---

## Regras de Negócio (Obrigatórias)

1. **Máximo de 10 exercícios por treino** — validar antes de adicionar
2. **8 semanas fixas** — sempre inicializar com array de 8 semanas
3. **Volume nunca negativo** — validar inputs (mínimo 0)
4. **Sugestão de carga** — aparecer APENAS se semana N-2 tiver carga registrada
5. **Estagnação** — calcular apenas com mínimo 2 semanas de dados
6. **Auto preenchimento** — NUNCA sobrescrever dados já preenchidos
7. **Grupo muscular** — obrigatório para aparecer no dashboard
8. **Treinos A-F** — sempre existir no store, mesmo vazios

---

## Validações (Zod)

```typescript
// types/workout.ts

export const WeekDataSchema = z.object({
  week: z.number().int().min(1).max(8),
  sets: z.number().int().min(1).max(20).nullable(),
  reps: z.number().int().min(1).max(100).nullable(),
  rest: z.number().int().min(0).max(600).nullable(), // segundos
  load: z.number().min(0).max(1000).nullable(),      // kg
  volume: z.number().min(0).nullable(),
});

export const ExerciseSchema = z.object({
  id: z.string().uuid(),
  index: z.number().int().min(0).max(9),
  muscleGroup: z.enum(MUSCLE_GROUPS).nullable(),
  name: z.string().min(1).max(100),
  weeks: z.array(WeekDataSchema).length(8),
  totalVolume: z.number().min(0),
});
```

---

## Constantes

```typescript
// utils/constants.ts

export const WORKOUT_IDS: WorkoutId[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Peito', 'Ombro', 'Tríceps', 'Bíceps', 'Dorsal',
  'Trapézio', 'Quadríceps', 'Posterior', 'Panturrilhas',
  'Antebraço', 'Core',
];

export const MAX_EXERCISES = 10;
export const TOTAL_WEEKS = 8;
export const STAGNATION_WARNING_WEEKS = 3;
export const STAGNATION_CRITICAL_WEEKS = 4;
export const DEFAULT_PROGRESSION_PERCENTAGE = 0.025; // 2.5%
```

---

## Navegação (Expo Router)

```
/ → (tabs)/dashboard
/(tabs)/dashboard → Dashboard principal
/(tabs)/workout-A → Treino A
/(tabs)/workout-B → Treino B
...
/(tabs)/workout-F → Treino F
/exercise/A/0 → Exercício 1 do Treino A (modal ou push)
```

**Tab Bar:**
- Dashboard (ícone: chart-bar)
- A / B / C / D / E / F (ícones: dumbbell ou letra)
- Máximo 7 tabs — considerar agrupar A-F num menu lateral se UX pedir

---

## Padrões de Código

### Nomenclatura
- Componentes: `PascalCase`
- Hooks: `use` + `camelCase`
- Stores: `camelCase` + `Store` suffix
- Utils: `camelCase`
- Types: `PascalCase` com sufixo descritivo (`Exercise`, `WorkoutId`)
- Constantes: `SCREAMING_SNAKE_CASE`

### Componentes
- Sempre tipados com TypeScript
- Props explícitas com interface separada
- `React.memo()` para componentes de lista (WeekRow, ExerciseCard)
- Callbacks com `useCallback` quando passados como props

### Performance
- `useMemo` para cálculos pesados (volume total, dados de gráfico)
- `FlatList` para listas de exercícios com `keyExtractor`
- Evitar re-renders desnecessários no store usando selectors granulares do Zustand
- Gráficos com dimensões fixas para evitar layout shifts

### Acessibilidade
- `accessibilityLabel` em todos inputs e botões
- `accessibilityRole` adequado em cards e badges
- Contraste mínimo de 4.5:1 nas cores de status

---

## Telas e Fluxo de UX

### Tela de Treino (workout-[id].tsx)
1. Header com nome do treino e volume total
2. Lista de até 10 exercícios
3. Cada card colapsável para economizar espaço
4. Botão "+" para adicionar exercício (desabilitado se = 10)
5. Indicador de estagnação no header de cada exercício

### Tela de Dashboard
1. Seletor de semana atual (1-8)
2. KPIs em grid 2×2
3. Gráfico de volume por músculo
4. Gráfico de evolução semanal
5. Lista dos exercícios mais evoluídos
6. Lista de exercícios em alerta

### Modal de Exercício
1. Campo de nome (autocomplete com histórico)
2. Picker de grupo muscular
3. Navegação entre as 8 semanas (tabs ou scroll horizontal)
4. Para cada semana: séries, repetições, descanso, carga
5. Volume calculado em tempo real
6. Badge de sugestão se aplicável

---

## Recursos Futuros (Backlog)

> Implementar após MVP estável

- **Detecção de Overtraining** — volume > 150% da média das últimas 3 semanas
- **Sugestão de Aumento de Séries** — quando carga progride por 4 semanas seguidas
- **RPE / RIR** — campo adicional por semana, cálculo de intensidade relativa
- **Estimativa de 1RM** — fórmula Epley: `load × (1 + reps/30)`
- **Ranking de Exercícios** — por percentual de progresso de carga
- **Exportação** — PDF ou CSV do histórico de treinos
- **Temas** — dark/light mode com tokens de cor

---

## Inicialização do Projeto

```bash
# Criar projeto
npx create-expo-app@latest workout-tracker --template default
cd workout-tracker

# Dependências principais
npx expo install expo-router react-native-safe-area-context react-native-screens
npx expo install expo-font expo-splash-screen

# Estado e persistência
npm install zustand
npx expo install @react-native-async-storage/async-storage

# UI e formulários
npm install nativewind
npm install react-hook-form zod @hookform/resolvers
npm install react-native-picker-select

# Gráficos
npm install victory-native
npx expo install react-native-reanimated react-native-gesture-handler react-native-svg

# Dev
npm install -D typescript @types/react eslint prettier
```

---

## Checklist de MVP

- [ ] Store Zustand com persistência
- [ ] Treinos A-F inicializados com 10 exercícios e 8 semanas
- [ ] Cálculo automático de volume em tempo real
- [ ] Auto preenchimento de séries/reps da semana 1
- [ ] Sugestão de carga (semana N+2)
- [ ] Detecção de estagnação com cores
- [ ] Highlight de volume repetido (laranja)
- [ ] Dashboard com KPIs
- [ ] Gráfico de volume por músculo
- [ ] Gráfico de evolução semanal
- [ ] Gráfico de progresso por exercício
- [ ] Dropdown de grupo muscular
- [ ] Validação de máximo 10 exercícios
- [ ] Testes unitários de utils/calculations.ts
- [ ] Testes unitários de utils/stagnation.ts
- [ ] Testes unitários de utils/progression.ts
