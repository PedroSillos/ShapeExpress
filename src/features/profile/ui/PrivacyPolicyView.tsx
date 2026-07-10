import { ChevronLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface PrivacyPolicyViewProps {
  onBack: () => void;
}

interface PolicySection {
  number: number;
  title: string;
  paragraphs: string[];
}

const POLICY_SECTIONS: PolicySection[] = [
  {
    number: 1,
    title: 'Geral',
    paragraphs: [
      'O Shape Express se preocupa com a sua privacidade e com a proteção dos seus dados pessoais. Esta Política de Privacidade explica como coletamos, usamos, armazenamos e compartilhamos suas informações ao utilizar o aplicativo Shape Express ("App", "Serviço"), operado pela Shape Express Tecnologia Ltda. ("Shape Express", "nós", "nos").',
      'Esta Política aplica-se a todos os usuários do App, incluindo visitantes, usuários registrados e assinantes premium. Ao criar uma conta ou utilizar qualquer funcionalidade do Serviço, você concorda com as práticas descritas nesta Política.',
      'Estamos em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018) e com demais legislações aplicáveis de proteção de dados. Esta Política pode ser atualizada periodicamente; notificaremos você sobre alterações relevantes por e-mail ou pelo próprio App.',
    ],
  },
  {
    number: 2,
    title: 'Dados que Coletamos',
    paragraphs: [
      'Dados fornecidos por você diretamente:\n• Informações de cadastro: nome, e-mail, data de nascimento, foto de perfil e senha.\n• Informações de perfil fitness: peso, altura, modalidades esportivas, objetivos, nível de condicionamento.\n• Conteúdo gerado: treinos criados, registros de atividades, comentários em comunidades, mensagens de chat.\n• Dados de pagamento: informações de cartão processadas pela Stripe (não armazenamos dados de cartão diretamente).',
      'Dados coletados automaticamente:\n• Dados de uso: funcionalidades acessadas, telas visitadas, tempo de sessão, frequência de uso.\n• Dados técnicos: tipo de dispositivo, sistema operacional, versão do App, identificadores únicos do dispositivo, endereço IP.\n• Dados de desempenho: logs de erro, relatórios de falhas para melhoria do Serviço.',
      'Dados de terceiros:\n• Informações de autenticação do Google (se você usar login com Google via Firebase).\n• Dados de confirmação de pagamento da Stripe após transações concluídas.',
    ],
  },
  {
    number: 3,
    title: 'Como Usamos seus Dados',
    paragraphs: [
      'Utilizamos seus dados pessoais para as seguintes finalidades:\n• Prestação do Serviço: criar e gerenciar sua conta, processar pagamentos, fornecer funcionalidades de treino, estatísticas e comunidades.\n• Personalização: adaptar conteúdo, recomendações de treino e sugestões de comunidades com base no seu perfil e histórico.\n• Coach IA: enviar dados de treino anonimizados ao Google Gemini para gerar recomendações personalizadas de coaching.',
      '• Comunicações: enviar notificações sobre sua conta, atualizações do Serviço, lembretes de treino e comunicados importantes. Você pode gerenciar preferências de notificação em Configurações → Notificações.\n• Segurança: detectar e prevenir fraudes, abusos e violações dos Termos de Uso.\n• Melhoria do Serviço: analisar padrões de uso agregados e anonimizados para desenvolver novas funcionalidades.\n• Cumprimento legal: atender obrigações legais e responder a requisições de autoridades competentes.',
      'Não utilizamos seus dados para veiculação de publicidade de terceiros e não vendemos suas informações pessoais a anunciantes ou corretores de dados.',
    ],
  },
  {
    number: 4,
    title: 'Base Legal para o Tratamento',
    paragraphs: [
      'De acordo com a LGPD, tratamos seus dados pessoais com base nas seguintes hipóteses legais:',
      '• Execução de contrato: dados necessários para a prestação do Serviço contratado (cadastro, treinos, pagamentos).\n• Consentimento: funcionalidades opcionais como compartilhamento de atividades, notificações promocionais e uso de fotos de perfil.\n• Legítimo interesse: segurança da plataforma, prevenção de fraudes e melhoria do Serviço.\n• Cumprimento de obrigação legal: retenção de registros fiscais e atendimento a requisições de autoridades.',
      'Quando o tratamento for baseado em consentimento, você pode revogá-lo a qualquer momento, o que não afetará a licitude do tratamento realizado antes da revogação.',
    ],
  },
  {
    number: 5,
    title: 'Compartilhamento de Dados',
    paragraphs: [
      'Compartilhamos seus dados apenas nas situações descritas abaixo, sempre com as salvaguardas adequadas:',
      '• Google Firebase: armazenamento de dados de usuário, autenticação e banco de dados em tempo real (Firestore). Os dados são protegidos pelas políticas de segurança do Firebase e pelas regras de segurança do Firestore configuradas pelo Shape Express.\n• Google Gemini (IA): dados de treino anonimizados são enviados ao modelo de IA para geração de recomendações de coaching. Nenhuma informação pessoal identificável é compartilhada com o modelo.\n• Stripe: informações necessárias para processamento de pagamentos. A Stripe é certificada PCI DSS e opera sob sua própria política de privacidade.',
      '• Obrigações legais: podemos divulgar dados quando exigido por lei, ordem judicial, processo legal ou para proteger os direitos, propriedade ou segurança do Shape Express, de nossos usuários ou do público.\n• Transferência de negócio: em caso de fusão, aquisição ou venda de ativos do Shape Express, seus dados poderão ser transferidos ao sucessor, que ficará vinculado a esta Política.',
      'Não compartilhamos seus dados pessoais com outras empresas para fins publicitários ou de marketing sem seu consentimento explícito.',
    ],
  },
  {
    number: 6,
    title: 'Segurança dos Dados',
    paragraphs: [
      'Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, alteração, divulgação ou destruição acidental ou ilícita:',
      '• Autenticação segura via Firebase Authentication com suporte a autenticação de dois fatores.\n• Comunicações criptografadas com TLS/HTTPS em todas as requisições entre o App e nossos servidores.\n• Controle de acesso baseado em funções (RBAC) com regras de segurança do Firestore aplicadas por e-mail autenticado.\n• Tokens de acesso com tempo de expiração curto; chaves de API armazenadas exclusivamente em variáveis de ambiente do servidor, nunca expostas no cliente.',
      'Apesar dos nossos esforços, nenhum sistema de segurança é impenetrável. Em caso de incidente de segurança que possa afetar seus dados, notificaremos você e a Autoridade Nacional de Proteção de Dados (ANPD) conforme exigido pela LGPD.',
    ],
  },
  {
    number: 7,
    title: 'Retenção de Dados',
    paragraphs: [
      'Mantemos seus dados pessoais pelo tempo necessário para a prestação do Serviço e cumprimento das finalidades descritas nesta Política, observados os prazos legais aplicáveis:',
      '• Dados de conta e perfil: mantidos enquanto sua conta estiver ativa. Após o encerramento da conta, os dados são excluídos em até 30 dias, exceto quando a retenção for exigida por lei.\n• Histórico de treinos e estatísticas: mantidos pelo período de atividade da conta e excluídos junto com a conta.\n• Registros de pagamento: mantidos por 5 anos conforme exigência fiscal e contábil.\n• Logs de segurança: mantidos por até 6 meses para fins de análise e prevenção de fraudes.',
      'Você pode solicitar a exclusão antecipada dos seus dados por meio do exercício dos seus direitos descritos na Seção 9.',
    ],
  },
  {
    number: 8,
    title: 'Transferência Internacional de Dados',
    paragraphs: [
      'O Shape Express utiliza serviços de infraestrutura em nuvem que podem processar dados fora do Brasil, incluindo servidores do Google Cloud Platform (Firebase) e da Stripe Inc., localizados nos Estados Unidos e em outras regiões.',
      'Essas transferências internacionais são realizadas com base nas salvaguardas previstas na LGPD, incluindo cláusulas contratuais padrão e certificações de adequação reconhecidas. Os prestadores de serviços com quem compartilhamos dados estão sujeitos a obrigações contratuais de proteção equivalentes às desta Política.',
    ],
  },
  {
    number: 9,
    title: 'Seus Direitos',
    paragraphs: [
      'Nos termos da LGPD, você tem os seguintes direitos em relação aos seus dados pessoais:',
      '• Acesso: solicitar confirmação da existência de tratamento e acesso aos seus dados.\n• Correção: solicitar a correção de dados incompletos, inexatos ou desatualizados.\n• Anonimização ou bloqueio: solicitar a anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desconformidade com a LGPD.\n• Portabilidade: solicitar a portabilidade dos seus dados para outro fornecedor de serviço.\n• Eliminação: solicitar a exclusão dos dados tratados com base no seu consentimento.\n• Informação: obter informações sobre entidades com as quais compartilhamos seus dados.\n• Revogação do consentimento: revogar consentimento previamente concedido.',
      'Para exercer seus direitos, acesse Configurações → Perfil → Excluir conta (para exclusão completa) ou entre em contato com nosso Encarregado de Proteção de Dados pelo e-mail privacidade@shapeexpress.com.br. Responderemos em até 15 dias úteis.',
    ],
  },
  {
    number: 10,
    title: 'Cookies e Tecnologias de Rastreamento',
    paragraphs: [
      'O Shape Express utiliza tecnologias de armazenamento local (localStorage, sessionStorage) e identificadores de dispositivo para manter sua sessão ativa, salvar preferências e melhorar a experiência de uso. Não utilizamos cookies de rastreamento de terceiros para publicidade comportamental.',
      'No ambiente web, podemos utilizar cookies de sessão essenciais para autenticação e segurança. Esses cookies são excluídos ao encerrar a sessão no navegador.',
      'Para o aplicativo Android, utilizamos identificadores fornecidos pelo sistema operacional para funcionalidades essenciais de autenticação e notificações push. Você pode gerenciar permissões de notificação nas configurações do dispositivo.',
    ],
  },
  {
    number: 11,
    title: 'Menores de Idade',
    paragraphs: [
      'O Shape Express não é direcionado a menores de 16 anos. Não coletamos intencionalmente dados pessoais de crianças com menos de 16 anos sem o consentimento verificado de um responsável legal.',
      'Usuários entre 16 e 18 anos podem utilizar o Serviço com consentimento do responsável legal, conforme descrito nos Termos de Uso. Se tomarmos conhecimento de que coletamos dados de uma criança sem o consentimento adequado, excluiremos essas informações imediatamente.',
      'Se você é responsável legal e acredita que seu filho forneceu dados ao Shape Express sem sua autorização, entre em contato conosco pelo e-mail privacidade@shapeexpress.com.br.',
    ],
  },
  {
    number: 12,
    title: 'Links e Serviços de Terceiros',
    paragraphs: [
      'O App pode conter links para sites ou serviços de terceiros, como vídeos do YouTube vinculados a exercícios. Esta Política de Privacidade não se aplica a esses serviços externos, e não somos responsáveis pelas práticas de privacidade de terceiros.',
      'Recomendamos que você leia as políticas de privacidade de qualquer serviço de terceiro com o qual interaja por meio do Shape Express.',
    ],
  },
  {
    number: 13,
    title: 'Encarregado de Proteção de Dados (DPO)',
    paragraphs: [
      'Nos termos da LGPD, designamos um Encarregado de Proteção de Dados (DPO) responsável por atuar como canal de comunicação entre o Shape Express, os titulares dos dados e a Autoridade Nacional de Proteção de Dados (ANPD).',
      'Encarregado de Proteção de Dados\nShape Express Tecnologia Ltda.\nE-mail: privacidade@shapeexpress.com.br\n\nVocê pode entrar em contato com o DPO para exercer seus direitos, esclarecer dúvidas sobre o tratamento dos seus dados ou registrar reclamações relacionadas a esta Política.',
    ],
  },
  {
    number: 14,
    title: 'Alterações nesta Política',
    paragraphs: [
      'Podemos atualizar esta Política de Privacidade periodicamente para refletir mudanças nas nossas práticas de dados, no Serviço ou na legislação aplicável. A data da última revisão estará sempre indicada no topo desta Política.',
      'Para alterações significativas, notificaremos você com pelo menos 30 dias de antecedência por e-mail ou por meio de um aviso destacado no App. O uso continuado do Serviço após a data de vigência das alterações constitui sua aceitação da Política revisada.',
      'Recomendamos que você revise esta Política periodicamente para se manter informado sobre como protegemos suas informações.',
    ],
  },
  {
    number: 15,
    title: 'Contato',
    paragraphs: [
      'Se você tiver dúvidas, comentários ou preocupações sobre esta Política de Privacidade ou sobre o tratamento dos seus dados pessoais, entre em contato conosco:',
      'Shape Express Tecnologia Ltda.\nE-mail geral: contato@shapeexpress.com.br\nSuporte: suporte@shapeexpress.com.br\nPrivacidade (DPO): privacidade@shapeexpress.com.br',
      'Nosso time está disponível de segunda a sexta-feira, das 9h às 18h (horário de Brasília). Responderemos às solicitações relacionadas a dados pessoais em até 15 dias úteis, conforme previsto na LGPD.',
    ],
  },
];

/**
 * Privacy Policy screen — Duolingo-inspired layout.
 * Displays the full Shape Express Privacy Policy with numbered sections.
 */
export function PrivacyPolicyView({ onBack }: PrivacyPolicyViewProps) {
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
        <h1 className="text-white/60 text-base font-semibold tracking-wide">
          Política de Privacidade
        </h1>
        <div className="w-10" />
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6">

        {/* ── Intro card ── */}
        <div className="bg-dark-card border border-dark-border rounded-2xl px-5 py-5">
          <h2 className="text-white font-bold text-xl leading-snug mb-2">
            Política de Privacidade
          </h2>
          <p className="text-white/40 text-xs font-semibold uppercase tracking-wider">
            Última atualização: 9 de julho de 2026
          </p>
          <p className="mt-3 text-white/60 text-sm leading-relaxed">
            Sua privacidade é importante para nós. Esta Política explica como coletamos, usamos e
            protegemos seus dados pessoais em conformidade com a LGPD (Lei nº 13.709/2018).
          </p>
        </div>

        {/* ── Sections ── */}
        {POLICY_SECTIONS.map((section) => (
          <div
            key={section.number}
            className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden"
          >
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
          <p className="text-white/25 text-xs leading-relaxed whitespace-pre-line">
            {'© 2026 Shape Express Tecnologia Ltda.\nTodos os direitos reservados.'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
