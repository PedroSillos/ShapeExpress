# Nielsen Norman Group Mobile App Usability Heuristics

This document outlines the main usability heuristics for mobile applications as defined by the Nielsen Norman Group. These guidelines should be followed at all times during the development of this project to ensure a high-quality user experience.

## Design System

### Paleta de Cores

#### Cores Primárias
- **Primary:** `#007AFF` - Azul principal para ações primárias e elementos interativos
- **Secondary:** `#5856D6` - Roxo para ações secundárias
- **Accent:** `#FF9500` - Laranja para destaques e notificações importantes

#### Cores Neutras
- **Background:** `#FFFFFF` - Fundo principal
- **Surface:** `#F2F2F7` - Fundo de cards e superfícies elevadas
- **Border:** `#C6C6C8` - Bordas e divisores
- **Text Primary:** `#000000` - Texto principal
- **Text Secondary:** `#8E8E93` - Texto secundário e labels

#### Cores de Status
- **Success:** `#34C759` - Confirmações e sucesso
- **Warning:** `#FF9500` - Avisos
- **Error:** `#FF3B30` - Erros e ações destrutivas
- **Info:** `#007AFF` - Informações

### Tipografia

#### Família de Fontes
- **Primary:** `Inter` - Fonte principal para todo o aplicativo
- **Fallback:** `San Francisco`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `Arial`, `sans-serif`

#### Escala Tipográfica
- **H1:** 32px / 2rem - Bold (700) - Line height: 40px
- **H2:** 24px / 1.5rem - Bold (700) - Line height: 32px
- **H3:** 20px / 1.25rem - Semibold (600) - Line height: 28px
- **H4:** 18px / 1.125rem - Semibold (600) - Line height: 24px
- **Body Large:** 16px / 1rem - Regular (400) - Line height: 24px
- **Body:** 14px / 0.875rem - Regular (400) - Line height: 20px
- **Body Small:** 12px / 0.75rem - Regular (400) - Line height: 16px
- **Caption:** 11px / 0.6875rem - Regular (400) - Line height: 14px

### Espaçamento

#### Sistema de Espaçamento (8pt Grid)
- **xs:** 4px / 0.25rem
- **sm:** 8px / 0.5rem
- **md:** 16px / 1rem
- **lg:** 24px / 1.5rem
- **xl:** 32px / 2rem
- **2xl:** 48px / 3rem
- **3xl:** 64px / 4rem

#### Margens e Padding
- **Container Horizontal:** 16px (mobile), 24px (tablet)
- **Section Spacing:** 32px entre seções principais
- **Card Padding:** 16px interno
- **List Item Padding:** 12px vertical, 16px horizontal

### Componentes

#### Botões
- **Height:** 48px (primário), 40px (secundário), 32px (pequeno)
- **Border Radius:** 8px
- **Padding Horizontal:** 24px (primário), 16px (secundário)
- **Font Size:** 16px (primário), 14px (secundário)
- **Min Touch Target:** 44x44px (iOS), 48x48px (Android)

#### Cards
- **Border Radius:** 12px
- **Padding:** 16px
- **Shadow:** `0 2px 8px rgba(0, 0, 0, 0.1)`
- **Spacing:** 16px entre cards

#### Inputs
- **Height:** 48px
- **Border Radius:** 8px
- **Border:** 1px solid `#C6C6C8`
- **Padding:** 12px 16px
- **Font Size:** 16px (previne zoom no iOS)

#### Ícones
- **Small:** 16x16px
- **Medium:** 24x24px
- **Large:** 32x32px
- **Stroke Width:** 2px

### Acessibilidade

#### Contraste
- **Texto normal:** Mínimo 4.5:1 (WCAG AA)
- **Texto grande (18px+):** Mínimo 3:1 (WCAG AA)
- **Elementos interativos:** Mínimo 3:1

#### Áreas de Toque
- **Mínimo:** 44x44px (iOS), 48x48px (Android)
- **Espaçamento entre elementos tocáveis:** Mínimo 8px

## The 10 Usability Heuristics

1.  **Visibility of system status:** The user should always be kept informed about what is going on, through appropriate feedback within a reasonable time.
2.  **Match between system and the real world:** The system should speak the users' language, with words, phrases and concepts familiar to the user, rather than system-oriented terms. Follow real-world conventions, making information appear in a natural and logical order.
3.  **User control and freedom:** Users often choose system functions by mistake and will need a clearly marked "emergency exit" to leave the unwanted state without having to go through an extended dialogue. Support undo and redo.
4.  **Consistency and standards:** Users should not have to wonder whether different words, situations, or actions mean the same thing. Follow platform conventions.
5.  **Error prevention:** Even better than good error messages is a careful design which prevents a problem from occurring in the first place.
6.  **Recognition rather than recall:** Minimize the user's memory load by making objects, actions, and options visible. The user should not have to remember information from one part of the dialogue to another. Instructions for use of the system should be visible or easily retrievable whenever appropriate.
7.  **Flexibility and efficiency of use:** Accelerators — unseen by the novice user — may often speed up the interaction for the expert user such that the system can cater to both inexperienced and experienced users. Allow users to tailor frequent actions.
8.  **Aesthetic and minimalist design:** Dialogues should not contain information which is irrelevant or rarely needed. Every extra unit of information in a dialogue competes with the relevant units of information and diminishes their relative visibility.
9.  **Help users recognize, diagnose, and recover from errors:** Error messages should be expressed in plain language (no codes), precisely indicate the problem, and constructively suggest a solution.
10. **Help and documentation:** Even though it is better if the system can be used without documentation, it may be necessary to provide help and documentation. Any such information should be easy to search, focused on the user's task, list concrete steps to be carried out, and not be too large.

## Aplicação das Heurísticas no Design

### Feedback Visual
- Loading states devem aparecer após 200ms de espera
- Animações de transição: 200-300ms (ease-in-out)
- Toast notifications: 3-5 segundos de duração
- Progress indicators para operações > 2 segundos

### Hierarquia Visual
- Usar tamanho, peso e cor para criar hierarquia
- Espaçamento consistente para agrupar elementos relacionados
- Máximo de 3 níveis de hierarquia visual por tela

### Responsividade
- **Mobile:** 320px - 767px
- **Tablet:** 768px - 1023px
- **Desktop:** 1024px+

### Performance
- Imagens otimizadas (WebP quando possível)
- Lazy loading para conteúdo abaixo da dobra
- Skeleton screens para carregamento de conteúdo

## Melhores Práticas para Aplicativos Móveis

### Navegação
- **Tab Bar:** Máximo de 5 itens principais, sempre visível
- **Hierarquia:** Máximo de 3 níveis de profundidade
- **Botão Voltar:** Sempre presente no canto superior esquerdo
- **Gestos:** Suportar swipe para voltar (iOS) e back button (Android)
- **Bottom Navigation:** Para ações principais e frequentes

### Interação Touch
- **Zona de Polegar:** Posicionar ações importantes na parte inferior da tela
- **Swipe Gestures:** Pull-to-refresh, swipe-to-delete, swipe entre telas
- **Long Press:** Para ações secundárias e menus contextuais
- **Haptic Feedback:** Confirmar ações importantes com vibração sutil
- **Evitar:** Hover states (não existem em mobile)

### Formulários
- **Input Type:** Usar teclado apropriado (email, number, tel, url)
- **Autofill:** Suportar preenchimento automático
- **Validação:** Em tempo real, mas sem bloquear digitação
- **Labels:** Sempre visíveis, não usar apenas placeholders
- **Um Campo por Linha:** Facilita preenchimento e leitura
- **Botão Submit:** Sempre visível, desabilitado até formulário válido

### Conteúdo
- **Texto:** Parágrafos curtos (2-3 linhas), linguagem clara
- **Imagens:** Otimizadas, usar lazy loading, fornecer alt text
- **Listas:** Scroll infinito ou paginação clara
- **Priorização:** Conteúdo mais importante no topo
- **Escaneabilidade:** Usar headings, bullets, espaçamento

### Notificações
- **Push:** Apenas para informações relevantes e urgentes
- **In-App:** Para feedback de ações e atualizações
- **Badges:** Indicar itens não lidos/pendentes
- **Permissões:** Solicitar no contexto, explicar benefício
- **Frequência:** Não sobrecarregar o usuário

### Offline & Conectividade
- **Offline First:** Funcionalidades básicas devem funcionar offline
- **Sync:** Sincronizar automaticamente quando online
- **Feedback:** Indicar claramente status de conexão
- **Cache:** Armazenar dados frequentes localmente
- **Retry:** Tentar novamente ações falhadas automaticamente

### Onboarding
- **Primeira Impressão:** Mostrar valor imediatamente
- **Progressivo:** Ensinar recursos conforme necessário
- **Skippable:** Permitir pular tutorial
- **Máximo 3-5 Telas:** Ser conciso e objetivo
- **Permissões:** Solicitar apenas quando necessário

### Performance & Otimização
- **Launch Time:** < 2 segundos para tela inicial
- **Animações:** 60fps, usar GPU acceleration
- **Memória:** Liberar recursos não utilizados
- **Bateria:** Minimizar uso de GPS, background tasks
- **Tamanho do App:** Manter < 50MB quando possível

### Segurança & Privacidade
- **Biometria:** Oferecer Face ID/Touch ID/Fingerprint
- **Dados Sensíveis:** Criptografar localmente
- **HTTPS:** Sempre usar conexões seguras
- **Permissões:** Solicitar apenas necessárias
- **Logout Automático:** Para apps com dados sensíveis

### Orientação & Rotação
- **Portrait:** Priorizar modo retrato
- **Landscape:** Suportar quando relevante (vídeos, jogos)
- **Adaptação:** Layout deve se ajustar suavemente
- **Lock:** Permitir usuário travar orientação quando apropriado

### Gestos Nativos
- **iOS:** Swipe from edge (voltar), pull-to-refresh, long press
- **Android:** Back button, swipe up (home), pull-to-refresh
- **Universal:** Pinch-to-zoom, double-tap, scroll
- **Customizados:** Ensinar gestos não-padrão

### Estados da Aplicação
- **Empty States:** Guiar usuário sobre próximos passos
- **Loading:** Skeleton screens ou spinners com mensagem
- **Error:** Mensagem clara + ação para resolver
- **Success:** Confirmação visual clara
- **No Connection:** Indicar e sugerir ações offline

### Acessibilidade Mobile
- **Screen Readers:** Suportar VoiceOver (iOS) e TalkBack (Android)
- **Dynamic Type:** Respeitar preferências de tamanho de fonte
- **Contraste:** Modo escuro e claro
- **Reduce Motion:** Respeitar preferência de animações reduzidas
- **Labels:** Todos elementos interativos devem ter labels

### Testes em Dispositivos Reais
- **Múltiplos Tamanhos:** iPhone SE, iPhone Pro Max, Android pequeno/grande
- **Versões OS:** Últimas 2-3 versões principais
- **Condições Reais:** Luz solar, movimento, uma mão
- **Conectividade:** 3G, 4G, 5G, WiFi lento
- **Bateria Baixa:** Testar com modo economia de energia

---

**Última atualização:** 2024
**Referências:** Nielsen Norman Group, Apple HIG, Material Design, Mobile UX Best Practices
