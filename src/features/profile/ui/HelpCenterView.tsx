import { useState } from 'react';
import { ChevronLeft, ChevronDown, ChevronUp, Search, MessageCircle, BookOpen, CreditCard, User, Settings, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/utils/cn';

interface HelpCenterViewProps {
  onBack: () => void;
}

interface FaqItem {
  question: string;
  answer: string;
}

interface HelpCategory {
  id: string;
  icon: React.ReactNode;
  color: string;
  title: string;
  faqs: FaqItem[];
}

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'account',
    icon: <User size={22} />,
    color: '#38bdf8', // sky-400
    title: 'Conta e Perfil',
    faqs: [
      {
        question: 'Como altero minha foto de perfil?',
        answer:
          'Vá em Configurações → Perfil → toque na foto atual e selecione uma nova imagem da galeria ou tire uma foto. Formatos aceitos: JPG e PNG.',
      },
      {
        question: 'Como altero meu nome de usuário?',
        answer:
          'Acesse Configurações → Perfil. Toque no campo Nome de usuário, edite e salve. Seu nome pode ser alterado a qualquer momento.',
      },
      {
        question: 'Como excluo minha conta?',
        answer:
          'Vá em Configurações → Perfil → role até o fim da página e toque em "Excluir conta". Atenção: essa ação é irreversível e remove todos os seus dados.',
      },
      {
        question: 'Esqueci minha senha. O que faço?',
        answer:
          'Na tela de login, toque em "Esqueceu a senha?" e informe seu e-mail. Você receberá um link para redefinição em até 5 minutos. Verifique também a caixa de spam.',
      },
    ],
  },
  {
    id: 'subscription',
    icon: <CreditCard size={22} />,
    color: '#a78bfa', // violet-400
    title: 'Assinatura e Pagamentos',
    faqs: [
      {
        question: 'Quais planos estão disponíveis?',
        answer:
          'O Shape Express oferece planos Mensal, Trimestral e Anual. Cada plano desbloqueia treinos premium, acompanhamento por IA e recursos avançados de estatísticas.',
      },
      {
        question: 'Como cancelo minha assinatura?',
        answer:
          'Acesse Configurações → Assinatura → Cancelar plano. O cancelamento é imediato, mas você mantém o acesso até o fim do período pago.',
      },
      {
        question: 'Meu pagamento foi recusado. O que fazer?',
        answer:
          'Verifique se os dados do cartão estão corretos e se há limite disponível. Tente novamente ou adicione um novo método de pagamento em Configurações → Assinatura.',
      },
      {
        question: 'Posso pedir reembolso?',
        answer:
          'Reembolsos podem ser solicitados em até 7 dias após a cobrança, desde que o período premium ainda não tenha sido utilizado. Entre em contato pelo suporte.',
      },
    ],
  },
  {
    id: 'workouts',
    icon: <Zap size={22} />,
    color: '#fb923c', // orange-400
    title: 'Treinos',
    faqs: [
      {
        question: 'Como crio um treino personalizado?',
        answer:
          'Na aba Treinos, toque em "+" e selecione "Criar treino". Adicione exercícios da biblioteca, defina séries, repetições e tempo de descanso.',
      },
      {
        question: 'Como registro um treino realizado?',
        answer:
          'Abra um treino salvo e toque em "Iniciar treino". Ao concluir cada série, marque como feita. Ao terminar, toque em "Finalizar" para salvar no histórico.',
      },
      {
        question: 'Posso usar o app sem internet durante o treino?',
        answer:
          'Sim. Os treinos salvos ficam disponíveis offline. O histórico é sincronizado automaticamente quando a conexão for reestabelecida.',
      },
      {
        question: 'Como compartilho um treino com meu aluno?',
        answer:
          'Em Treinos → selecione o treino → toque em "Compartilhar". Você pode enviar diretamente para um aluno cadastrado ou copiar o link.',
      },
    ],
  },
  {
    id: 'ai',
    icon: <Zap size={22} />,
    color: '#34d399', // emerald-400
    title: 'Coach com IA',
    faqs: [
      {
        question: 'O que é o Coach IA?',
        answer:
          'O Coach IA é um assistente baseado no Google Gemini que analisa seus dados de treino e oferece sugestões personalizadas de melhoria, recuperação e nutrição.',
      },
      {
        question: 'Minhas informações são seguras com a IA?',
        answer:
          'Sim. Apenas dados de treino anônimos são enviados à IA. Suas informações pessoais identificáveis não são compartilhadas com o modelo.',
      },
      {
        question: 'O Coach IA substitui um personal trainer?',
        answer:
          'Não. O Coach IA é um complemento e não substitui a orientação de um profissional de educação física. Sempre consulte um profissional para prescrição de treinos.',
      },
    ],
  },
  {
    id: 'privacy',
    icon: <Settings size={22} />,
    color: '#f472b6', // pink-400
    title: 'Privacidade e Dados',
    faqs: [
      {
        question: 'Quais dados o app coleta?',
        answer:
          'Coletamos dados de treino, progresso e preferências para personalizar sua experiência. Não vendemos seus dados a terceiros. Consulte nossa Política de Privacidade para detalhes.',
      },
      {
        question: 'Como desativo o compartilhamento de atividades?',
        answer:
          'Vá em Configurações → Privacidade e desative "Compartilhar atividade com todos". Sua atividade ficará visível apenas para você.',
      },
      {
        question: 'Posso baixar meus dados?',
        answer:
          'Atualmente trabalhamos nessa funcionalidade. Em breve será possível exportar todo o histórico de treinos e estatísticas em formato CSV.',
      },
    ],
  },
  {
    id: 'community',
    icon: <MessageCircle size={22} />,
    color: '#facc15', // yellow-400
    title: 'Comunidades e Chat',
    faqs: [
      {
        question: 'Como entro em uma comunidade?',
        answer:
          'Na aba Comunidades, navegue pelas sugestões ou use a busca. Toque em "Entrar" na comunidade desejada. Comunidades privadas precisam de aprovação do administrador.',
      },
      {
        question: 'Como reporto uma mensagem inapropriada?',
        answer:
          'Pressione e segure a mensagem e selecione "Reportar". Nossa equipe analisará em até 24 horas.',
      },
      {
        question: 'Posso criar minha própria comunidade?',
        answer:
          'Sim! Toque em "+" na aba Comunidades e preencha as informações. Comunidades públicas ficam visíveis para todos; privadas exigem convite.',
      },
    ],
  },
];

/** Accordion item with question/answer */
function FaqRow({ question, answer, last = false }: FaqItem & { last?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn(!last && 'border-b border-dark-border')}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-4 gap-3 text-left hover:bg-white/5 active:bg-white/10 transition-colors"
      >
        <span className="text-white font-semibold text-[15px] flex-1 leading-snug">{question}</span>
        {open ? (
          <ChevronUp size={18} className="text-white/40 flex-shrink-0" />
        ) : (
          <ChevronDown size={18} className="text-white/40 flex-shrink-0" />
        )}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-white/60 text-sm leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Category card shown in the grid */
function CategoryCard({
  category,
  onSelect,
}: {
  category: HelpCategory;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center gap-2 p-4 bg-dark-card border border-dark-border rounded-2xl hover:bg-white/5 active:bg-white/10 transition-colors"
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: category.color + '22', color: category.color }}
      >
        {category.icon}
      </div>
      <span className="text-white font-semibold text-xs text-center leading-snug">
        {category.title}
      </span>
    </button>
  );
}

/**
 * Help Center screen — Duolingo-inspired.
 * Shows a searchable FAQ with category cards and accordion items.
 */
export function HelpCenterView({ onBack }: HelpCenterViewProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const activeCategory = HELP_CATEGORIES.find((c) => c.id === selectedCategory) ?? null;

  // Flat search across all categories
  const searchResults =
    search.trim().length > 1
      ? HELP_CATEGORIES.flatMap((cat) =>
          cat.faqs
            .filter(
              (faq) =>
                faq.question.toLowerCase().includes(search.toLowerCase()) ||
                faq.answer.toLowerCase().includes(search.toLowerCase()),
            )
            .map((faq) => ({ ...faq, categoryTitle: cat.title })),
        )
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.2 }}
      className="h-screen bg-dark-surface flex flex-col"
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4 border-b border-dark-border">
        <button
          aria-label={selectedCategory ? 'Voltar às categorias' : 'Voltar'}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 active:bg-white/10 transition-colors"
          onClick={selectedCategory ? () => setSelectedCategory(null) : onBack}
        >
          <ChevronLeft size={22} className="text-sky-400" />
        </button>
        <h1 className="text-white/60 text-base font-semibold tracking-wide">
          {activeCategory ? activeCategory.title : 'Central de Ajuda'}
        </h1>
        <div className="w-10" />
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

        {/* ── Category detail view ── */}
        {activeCategory ? (
          <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
            {activeCategory.faqs.map((faq, idx) => (
              <FaqRow
                key={faq.question}
                {...faq}
                last={idx === activeCategory.faqs.length - 1}
              />
            ))}
          </div>
        ) : (
          <>
            {/* ── Search bar ── */}
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar na Central de Ajuda..."
                className="w-full bg-dark-card border border-dark-border rounded-2xl pl-10 pr-4 py-3.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-sky-400/50 transition-colors"
              />
            </div>

            {/* ── Search results ── */}
            {searchResults !== null ? (
              <div>
                {searchResults.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-12 text-center">
                    <BookOpen size={40} className="text-white/20" />
                    <p className="text-white/40 text-sm">Nenhum resultado para "{search}"</p>
                  </div>
                ) : (
                  <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
                    {searchResults.map((item, idx) => (
                      <div key={item.question} className={cn(idx !== searchResults.length - 1 && 'border-b border-dark-border')}>
                        <p className="px-4 pt-3 text-xs font-bold text-white/30 uppercase tracking-wider">
                          {item.categoryTitle}
                        </p>
                        <FaqRow question={item.question} answer={item.answer} last />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* ── Category grid ── */}
                <div>
                  <p className="text-white font-bold text-base mb-3">Categorias</p>
                  <div className="grid grid-cols-2 gap-3">
                    {HELP_CATEGORIES.map((cat) => (
                      <CategoryCard
                        key={cat.id}
                        category={cat}
                        onSelect={() => setSelectedCategory(cat.id)}
                      />
                    ))}
                  </div>
                </div>

                {/* ── Popular questions ── */}
                <div>
                  <p className="text-white font-bold text-base mb-3">Perguntas frequentes</p>
                  <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
                    {HELP_CATEGORIES.flatMap((cat) => cat.faqs.slice(0, 1)).map((faq, idx, arr) => (
                      <FaqRow
                        key={faq.question}
                        {...faq}
                        last={idx === arr.length - 1}
                      />
                    ))}
                  </div>
                </div>

                {/* ── Contact footer ── */}
                <div className="bg-dark-card border border-dark-border rounded-2xl px-5 py-5 flex flex-col gap-1 pb-8">
                  <p className="text-white font-bold text-sm">Não encontrou o que procura?</p>
                  <p className="text-white/50 text-sm leading-snug">
                    Nossa equipe está disponível de segunda a sexta, das 9h às 18h.
                  </p>
                  <button
                    className="mt-3 w-full py-3.5 rounded-2xl bg-sky-400 text-white font-bold text-sm tracking-wide hover:bg-sky-300 active:bg-sky-500 transition-colors"
                    onClick={() => {
                      window.open('mailto:suporte@shapeexpress.com.br', '_blank');
                    }}
                  >
                    Falar com o suporte
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
