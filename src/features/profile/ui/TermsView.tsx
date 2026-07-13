import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface TermsViewProps {
  onBack: () => void;
}

interface TermsSection {
  number: number;
  title: string;
  paragraphs: string[];
}

const TERMS_SECTIONS: TermsSection[] = [
  {
    number: 1,
    title: 'Aceitação dos Termos',
    paragraphs: [
      'Ao acessar ou utilizar o aplicativo Shape Express ("App", "Serviço"), você confirma que leu, compreendeu e concorda em estar vinculado a estes Termos de Uso ("Termos"). Se você não concordar com qualquer parte destes Termos, não utilize o Serviço.',
      'Estes Termos constituem um contrato legal entre você ("Usuário") e Shape Express Tecnologia Ltda. ("Shape Express", "nós", "nos"). Ao criar uma conta ou utilizar qualquer funcionalidade do App, você aceita estes Termos em sua totalidade.',
      'Reservamo-nos o direito de atualizar estes Termos periodicamente. Notificaremos você sobre alterações significativas por meio do App ou por e-mail. O uso continuado do Serviço após a publicação de alterações constitui sua aceitação dos novos Termos.',
    ],
  },
  {
    number: 2,
    title: 'Descrição do Serviço',
    paragraphs: [
      'O Shape Express é uma plataforma premium de acompanhamento fitness que oferece treinos personalizados, monitoramento de progresso, comunidades de usuários, inteligência artificial aplicada ao coaching esportivo e recursos de pagamento para planos de assinatura.',
      'O Serviço inclui, mas não se limita a: criação e gestão de treinos, registro de atividades físicas, estatísticas de desempenho, calendário de treinos, chat em comunidades, recomendações por IA e ferramentas para personal trainers e academias.',
      'Algumas funcionalidades são exclusivas para assinantes premium. O acesso a recursos premium está condicionado à assinatura ativa de um plano pago, conforme descrito na Seção 6 destes Termos.',
    ],
  },
  {
    number: 3,
    title: 'Elegibilidade e Cadastro',
    paragraphs: [
      'Para utilizar o Shape Express, você deve ter pelo menos 16 anos de idade. Usuários entre 16 e 18 anos devem ter consentimento de um responsável legal para criar uma conta e realizar pagamentos.',
      'Ao criar uma conta, você concorda em fornecer informações precisas, atuais e completas. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades realizadas em sua conta.',
      'Notifique-nos imediatamente em caso de uso não autorizado da sua conta ou qualquer outra violação de segurança. O Shape Express não se responsabiliza por perdas decorrentes do uso não autorizado das suas credenciais.',
      'É permitido apenas um cadastro por pessoa física. Contas duplicadas podem ser removidas sem aviso prévio.',
    ],
  },
  {
    number: 4,
    title: 'Uso Aceitável',
    paragraphs: [
      'Você concorda em utilizar o Serviço apenas para fins lícitos e de acordo com estes Termos. É expressamente proibido: (a) usar o App para qualquer finalidade ilegal ou não autorizada; (b) violar qualquer lei local, estadual, nacional ou internacional aplicável; (c) transmitir material ofensivo, difamatório, obsceno, fraudulento ou prejudicial.',
      'Não é permitido: reproduzir, duplicar, copiar, vender, revender ou explorar qualquer parte do Serviço sem autorização expressa por escrito; usar técnicas de raspagem de dados (scraping), bots ou outros métodos automatizados para acessar o Serviço; tentar acessar áreas restritas do sistema ou contornar medidas de segurança.',
      'Ao publicar conteúdo nas comunidades do App, você é inteiramente responsável pelo que compartilha. Conteúdo que viole direitos de terceiros, promova ódio, violência ou discriminação será removido e poderá resultar no encerramento da conta.',
      'O Shape Express reserva-se o direito de suspender ou encerrar contas que violem estas diretrizes, sem aviso prévio e sem direito a reembolso.',
    ],
  },
  {
    number: 5,
    title: 'Conteúdo do Usuário',
    paragraphs: [
      'Ao submeter conteúdo ao Serviço (fotos, textos, dados de treino, comentários), você concede ao Shape Express uma licença mundial, não exclusiva, isenta de royalties, sublicenciável e transferível para usar, reproduzir, modificar, adaptar, publicar e exibir tal conteúdo exclusivamente para a operação e melhoria do Serviço.',
      'Você declara e garante que possui todos os direitos necessários sobre o conteúdo submetido e que este não viola direitos de terceiros, incluindo direitos autorais, marcas registradas, privacidade ou publicidade.',
      'O Shape Express não reivindica propriedade sobre seus dados pessoais de treino e saúde. Você mantém total propriedade dessas informações, que são tratadas conforme nossa Política de Privacidade.',
    ],
  },
  {
    number: 6,
    title: 'Assinaturas e Pagamentos',
    paragraphs: [
      'O Shape Express oferece planos de assinatura com cobrança recorrente (mensal, trimestral ou anual). Os valores atuais dos planos estão disponíveis na seção "Assinatura" do App e podem ser alterados mediante aviso prévio de 30 dias.',
      'As cobranças são processadas pela Stripe Inc., parceiro de pagamentos do Shape Express. Ao assinar um plano, você autoriza a cobrança recorrente no método de pagamento cadastrado até que a assinatura seja cancelada.',
      'Cancelamentos devem ser realizados dentro do App em Configurações → Assinatura → Cancelar plano. O cancelamento interrompe a renovação automática, mas você mantém acesso aos recursos premium até o fim do período já pago.',
      'Reembolsos podem ser solicitados em até 7 (sete) dias corridos após a cobrança, desde que os recursos premium não tenham sido amplamente utilizados no período. Solicitações fora deste prazo serão avaliadas individualmente.',
      'O Shape Express não se responsabiliza por falhas no processamento de pagamento causadas por fatores externos, como bloqueios do banco emissor ou problemas na rede do usuário.',
    ],
  },
  {
    number: 7,
    title: 'Recursos de Inteligência Artificial',
    paragraphs: [
      'O Shape Express utiliza modelos de inteligência artificial (Google Gemini) para oferecer recomendações de treino, feedback de coaching e sugestões de comunidades. Essas recomendações têm caráter informativo e não substituem a orientação de um profissional de educação física, médico ou nutricionista.',
      'As respostas geradas pela IA são baseadas nos seus dados de treino e preferências cadastradas. O Shape Express não garante a precisão, adequação ou completude das sugestões fornecidas pela IA para sua situação específica de saúde.',
      'Você utiliza as recomendações de IA por sua própria conta e risco. Sempre consulte um profissional habilitado antes de iniciar ou modificar um programa de exercícios, especialmente em casos de condições de saúde preexistentes.',
      'Dados enviados à IA são anonimizados e não contêm informações pessoais identificáveis, conforme detalhado na nossa Política de Privacidade.',
    ],
  },
  {
    number: 8,
    title: 'Propriedade Intelectual',
    paragraphs: [
      'O Serviço e todo o seu conteúdo original, funcionalidades e design são e permanecerão propriedade exclusiva do Shape Express e seus licenciadores. O Serviço é protegido por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual do Brasil e de outros países.',
      'Nossa marca, logotipo e o nome "Shape Express" são marcas registradas do Shape Express Tecnologia Ltda. Você não pode usar nossa marca sem autorização prévia por escrito.',
      'É concedida a você uma licença limitada, não exclusiva, não transferível e revogável para acessar e utilizar o Serviço para fins pessoais e não comerciais, sujeita a estes Termos.',
    ],
  },
  {
    number: 9,
    title: 'Privacidade e Proteção de Dados',
    paragraphs: [
      'O tratamento dos seus dados pessoais é regido pela nossa Política de Privacidade, disponível no App em Configurações → Política de Privacidade. Ao utilizar o Serviço, você consente com o tratamento de seus dados conforme descrito nessa política.',
      'O Shape Express está em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). Você tem direito ao acesso, correção, portabilidade, anonimização e exclusão dos seus dados pessoais, mediante solicitação.',
      'Para exercer seus direitos ou esclarecer dúvidas sobre privacidade, entre em contato com nosso Encarregado de Proteção de Dados (DPO) pelo e-mail privacidade@shapeexpress.com.br.',
    ],
  },
  {
    number: 10,
    title: 'Isenção de Responsabilidade e Saúde',
    paragraphs: [
      'O Shape Express fornece ferramentas de organização e acompanhamento de treinos. Não somos um serviço médico e não prestamos aconselhamento médico, diagnóstico ou tratamento. Consulte sempre um profissional de saúde antes de iniciar qualquer programa de exercícios.',
      'O Shape Express não se responsabiliza por lesões, danos à saúde ou outras consequências negativas decorrentes da prática de exercícios físicos baseados em conteúdo presente no App, incluindo treinos, planos e recomendações de IA.',
      'O Serviço é fornecido "no estado em que se encontra" e "conforme disponível", sem garantias expressas ou implícitas de qualquer tipo, incluindo garantias de comerciabilidade, adequação a uma finalidade específica ou não violação.',
      'O Shape Express não garante que o Serviço será ininterrupto, livre de erros, seguro ou livre de vírus. Manutenções programadas serão comunicadas com antecedência sempre que possível.',
    ],
  },
  {
    number: 11,
    title: 'Limitação de Responsabilidade',
    paragraphs: [
      'Na máxima extensão permitida pela lei aplicável, o Shape Express e seus diretores, funcionários, parceiros e licenciadores não serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo perda de lucros, dados ou boa vontade.',
      'A responsabilidade total do Shape Express perante você por qualquer reclamação relacionada ao Serviço não excederá o valor pago por você ao Shape Express nos 3 (três) meses anteriores ao evento que originou a reclamação.',
      'Algumas jurisdições não permitem a exclusão de certas garantias ou a limitação de responsabilidade por danos consequenciais. Nessas jurisdições, a responsabilidade do Shape Express será limitada ao máximo permitido por lei.',
    ],
  },
  {
    number: 12,
    title: 'Rescisão',
    paragraphs: [
      'Você pode encerrar sua conta a qualquer momento em Configurações → Perfil → Excluir conta. O encerramento da conta implica a exclusão permanente dos seus dados, conforme nossa Política de Privacidade.',
      'O Shape Express pode suspender ou encerrar seu acesso ao Serviço a qualquer momento, com ou sem aviso, caso você viole estes Termos ou por qualquer outro motivo a nosso critério exclusivo.',
      'Em caso de rescisão, todas as licenças e direitos concedidos a você cessam imediatamente. As disposições que por sua natureza devam sobreviver à rescisão continuarão em vigor, incluindo direitos de propriedade intelectual, isenções de responsabilidade e limitações de responsabilidade.',
    ],
  },
  {
    number: 13,
    title: 'Lei Aplicável e Foro',
    paragraphs: [
      'Estes Termos são regidos e interpretados de acordo com as leis da República Federativa do Brasil. Qualquer disputa decorrente ou relacionada a estes Termos ou ao Serviço será submetida à jurisdição exclusiva do Foro da Comarca de São Paulo, Estado de São Paulo.',
      'Antes de recorrer ao judiciário, as partes concordam em tentar resolver qualquer disputa por meio de negociação direta por um período de 30 (trinta) dias.',
      'Se qualquer disposição destes Termos for considerada inválida ou inaplicável por um tribunal competente, as demais disposições permanecerão em pleno vigor e efeito.',
    ],
  },
  {
    number: 14,
    title: 'Contato',
    paragraphs: [
      'Se você tiver dúvidas, comentários ou preocupações sobre estes Termos de Uso, entre em contato conosco:',
      'Shape Express Tecnologia Ltda.\nE-mail: termos@shapeexpress.com.br\nSuporte: suporte@shapeexpress.com.br\nPrivacidade (DPO): privacidade@shapeexpress.com.br',
      'Nosso time de suporte está disponível de segunda a sexta-feira, das 9h às 18h (horário de Brasília), para responder suas dúvidas em até 2 dias úteis.',
    ],
  },
];

/**
 * Terms of Use screen — Duolingo-inspired layout.
 * Displays the full Shape Express Terms of Use with numbered sections.
 */
export function TermsView({ onBack }: TermsViewProps) {
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
          aria-label="Voltar"
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/5 active:bg-white/10 transition-colors"
          onClick={onBack}
        >
          <ChevronLeft size={22} className="text-sky-400" />
        </button>
        <h1 className="text-white/60 text-base font-semibold tracking-wide">Termos de Uso</h1>
        <div className="w-10" />
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">

        {/* ── Intro card ── */}
        <div className="bg-dark-card border border-dark-border rounded-2xl px-5 py-5">
          <h2 className="text-white font-bold text-xl leading-snug mb-2">
            Termos e Condições de Uso
          </h2>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">
            Última atualização: 9 de julho de 2026
          </p>
          <p className="mt-3 text-white/60 text-sm leading-relaxed">
            Leia atentamente estes Termos antes de usar o Shape Express. Ao criar uma conta ou
            utilizar o Serviço, você concorda com todas as condições descritas abaixo.
          </p>
        </div>

        {/* ── Sections ── */}
        {TERMS_SECTIONS.map((section) => (
          <div key={section.number} className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
            {/* Section header */}
            <div className="px-5 py-4 border-b border-dark-border flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-sky-400/15 flex items-center justify-center flex-shrink-0">
                <span className="text-sky-400 font-bold text-xs">{section.number}</span>
              </div>
              <h3 className="text-white font-bold text-[15px] leading-snug">{section.title}</h3>
            </div>

            {/* Section body */}
            <div className="px-5 py-4 space-y-3">
              {section.paragraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="text-white/60 text-sm leading-relaxed whitespace-pre-line"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        ))}

        {/* ── Footer ── */}
        <div className="pb-10 text-center">
          <p className="text-white/25 text-xs leading-relaxed">
            © 2026 Shape Express Tecnologia Ltda.{'\n'}Todos os direitos reservados.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
