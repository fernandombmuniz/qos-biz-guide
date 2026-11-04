import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Database,
  Eye,
  FileCheck2,
  LockKeyhole,
  ExternalLink,
  Monitor,
  Network,
  Shield,
  ShieldCheck,
  UsersRound,
  X,
} from 'lucide-react';
import type { Profile } from '../context/ProfileContext';
import { ConciergeBrandLockup } from './AssessmentVisual';

type Props = {
  profile: Profile;
  slide: number;
  onSlide: (slide: number) => void;
  onFinish: () => void;
};


type LawKey = 'art46' | 'art48' | 'art52';

const lawDetails: Record<LawKey, { article: string; title: string; summary: string; executive: string; source: string; href: string }> = {
  art46: {
    article: 'Art. 46',
    title: 'Medidas de segurança são uma obrigação prevista na LGPD',
    summary: 'Os agentes de tratamento devem adotar medidas técnicas e administrativas aptas a proteger dados pessoais contra acessos não autorizados e situações de destruição, perda, alteração ou comunicação indevida.',
    executive: 'Para a gestão, a pergunta deixa de ser apenas “temos antivírus?” e passa a incluir acesso, proteção, backup, registros, responsáveis e capacidade de reação.',
    source: 'Lei nº 13.709/2018, LGPD, Art. 46',
    href: 'https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html',
  },
  art48: {
    article: 'Art. 48',
    title: 'Um incidente pode exigir avaliação e comunicação',
    summary: 'A LGPD determina que o controlador comunique à autoridade nacional e ao titular a ocorrência de incidente de segurança que possa acarretar risco ou dano relevante aos titulares.',
    executive: 'Sem visibilidade do ambiente, registros e contexto do incidente, fica mais difícil responder perguntas básicas: o que aconteceu, quais dados foram afetados, quais medidas existiam e o que foi feito para mitigar o impacto.',
    source: 'Lei nº 13.709/2018, LGPD, Art. 48',
    href: 'https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html',
  },
  art52: {
    article: 'Art. 52',
    title: 'As sanções vão além de uma multa',
    summary: 'A LGPD prevê advertência, multa simples ou diária, publicização da infração, bloqueio ou eliminação de dados e outras restrições. A multa simples pode chegar a 2% do faturamento, limitada a R$ 50 milhões por infração.',
    executive: 'A multa chama atenção, mas publicização, bloqueio de dados e interrupções relacionadas ao tratamento também podem gerar impacto operacional e reputacional.',
    source: 'ANPD e Lei nº 13.709/2018, Art. 52',
    href: 'https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes',
  },
};

const slideLabels = [
  'Boas-vindas',
  'Quem somos',
  'Como trabalhamos',
  'Frentes de proteção',
  'Operação e evidências',
  'Próximo passo',
];

export default function InstitutionalPresentation({ profile, slide, onSlide, onFinish }: Props) {
  const company = profile.companyName || 'sua empresa';
  const clientName = profile.companyName || 'Sua empresa';
  const last = slide === slideLabels.length - 1;
  const [lawKey, setLawKey] = useState<LawKey | null>(null);
  const lawDialogRef = useRef<HTMLDialogElement>(null);
  const lawDetail = lawKey ? lawDetails[lawKey] : null;

  useEffect(() => {
    const dialog = lawDialogRef.current;
    if (!dialog) return;
    if (lawDetail && !dialog.open) dialog.showModal();
    if (!lawDetail && dialog.open) dialog.close();
  }, [lawDetail]);

  const body = useMemo(() => {
    if (slide === 0) {
      return (
        <section className="institutional-hero">
          <div>
            <span className="v3-kicker">CONCIERGE SEGURANÇA DIGITAL</span>
            <h1>A segurança acompanha o funcionamento da empresa.</h1>
            <p className="v3-lead">
              Antes de falar de produto, vamos entender o que precisa continuar funcionando em {company}, apresentar como trabalhamos e decidir onde vale aprofundar.
            </p>
            <div className="v3-trust">
              <span>SOC 24/7</span>
              <span>Grupo QOS Tecnologia</span>
              <span>ISO 27001</span>
              <span>ISO 37001</span>
            </div>
          </div>
          <div className="institutional-brand-stack">
            <ConciergeBrandLockup />
            {profile.companyLogo && (
              <div className="v3-client-logo institutional-client-logo">
                <img src={profile.companyLogo} alt={`Logo de ${clientName}`} />
              </div>
            )}
            <p>Conversa preparada para {clientName}</p>
          </div>
        </section>
      );
    }

    if (slide === 1) {
      return (
        <section className="v3-stage institutional-stage">
          <span className="v3-kicker">CONCIERGE + GRUPO QOS TECNOLOGIA</span>
          <h2>Uma operação com experiência, estrutura e acompanhamento.</h2>
          <p className="v3-lead">
            A Concierge atende pequenas e médias empresas com serviços gerenciados de segurança. A operação conta com a experiência e a estrutura do Grupo QOS Tecnologia.
          </p>
          <div className="institutional-milestones">
            <article><strong>2002</strong><span>Início da trajetória da QOS</span></article>
            <article><strong>2008</strong><span>Operação de SOC próprio</span></article>
            <article><strong>24/7</strong><span>Capacidade de monitoramento contínuo</span></article>
          </div>
          <div className="institutional-two-columns institutional-two-columns-rich">
            <article><Building2 size={28}/><h3>Estrutura especializada</h3><p>Segurança, infraestrutura, risco, identidade, vulnerabilidades e projetos que podem ser aprofundados conforme a necessidade.</p></article>
            <article><ShieldCheck size={28}/><h3>Governança e processos</h3><p>Operação apoiada por práticas de gestão de segurança e integridade, com certificações ISO 27001 e ISO 37001 no Grupo QOS.</p></article>
            <article><Eye size={28}/><h3>Acompanhamento contínuo</h3><p>Visibilidade, rotinas de operação e leitura consultiva para transformar tecnologia em algo compreensível para a gestão.</p></article>
            <article><CheckCircle2 size={28}/><h3>Modelo de relacionamento</h3><p>Começamos entendendo o cenário atual, aprofundamos somente o que fizer sentido e seguimos com próximos passos claros.</p></article>
          </div>
        </section>
      );
    }

    if (slide === 2) {
      return (
        <section className="v3-stage institutional-stage">
          <span className="v3-kicker">COMO TRABALHAMOS</span>
          <h2>O contexto e a operação do cliente ficam no centro da conversa.</h2>
          <p className="v3-lead">
            Antes de discutir tecnologia, precisamos entender o que sustenta a operação, quem depende dos sistemas, como a gestão acompanha isso e onde a Concierge pode proteger e apoiar esse ambiente.
          </p>
          <div className="institutional-orbit-shell">
            <div className="institutional-protection-band">
              <ShieldCheck size={18} />
              <span>Concierge se conecta ao ambiente do cliente com proteção, acompanhamento e apoio à gestão.</span>
            </div>
            <div className="institutional-orbit institutional-orbit-client-first">
              <article><Network/><h3>Internet e rede</h3><p>Conectividade, acessos, segmentação e disponibilidade.</p></article>
              <article><Monitor/><h3>Computadores</h3><p>Proteção, cobertura, investigação e resposta.</p></article>
              <div className="institutional-orbit-center institutional-orbit-client-center">
                {profile.companyLogo && (
                  <div className="v3-client-logo institutional-client-core-logo">
                    <img src={profile.companyLogo} alt={`Logo de ${clientName}`} />
                  </div>
                )}
                <small>CONTEXTO DO CLIENTE</small>
                <h3>{clientName}</h3>
                <p>Operação, gestão, prioridades, pessoas e sistemas que mantêm a empresa funcionando.</p>
                <div className="institutional-core-tags">
                  <span>Operação</span>
                  <span>Gestão</span>
                  <span>Prioridades</span>
                </div>
              </div>
              <article><Database/><h3>Dados e sistemas</h3><p>Cópias, retenção, recuperação e continuidade.</p></article>
              <article><UsersRound/><h3>Pessoas e acessos</h3><p>Responsabilidades, credenciais e capacidade de reação.</p></article>
            </div>
            <div className="institutional-relationship-note">
              <article>
                <Shield size={18} />
                <div>
                  <strong>Concierge atua ao redor do ambiente</strong>
                  <p>Nosso papel é proteger, acompanhar e ajudar a evoluir a operação do cliente. Não substituir a realidade do cliente.</p>
                </div>
              </article>
              <article>
                <UsersRound size={18} />
                <div>
                  <strong>A gestão continua participando</strong>
                  <p>Decisões, prioridades, aprovações e contexto do negócio continuam com a empresa. A Concierge complementa essa jornada.</p>
                </div>
              </article>
            </div>
          </div>
        </section>
      );
    }

    if (slide === 3) {
      return (
        <section className="v3-stage institutional-stage">
          <span className="v3-kicker">TRÊS FRENTES PRINCIPAIS</span>
          <h2>Onde a Concierge pode apoiar a operação com mais impacto.</h2>
          <p className="v3-lead">Cada frente responde a uma necessidade diferente. O aprofundamento acontece somente onde houver prioridade para {company}.</p>
          <div className="institutional-services institutional-services-strong">
            <article><Shield size={30}/><span>CONCIERGE FIREWALL</span><h3>Controlar quem entra, por onde entra e o que pode acessar.</h3><p>Políticas, VPN, segmentação e visibilidade ajudam a reduzir exposição e dão mais contexto quando algo foge do esperado.</p><b>Rede protegida e acompanhada</b></article>
            <article><Monitor size={30}/><span>CONCIERGE ENDPOINT</span><h3>Perceber e responder ao que acontece nos dispositivos.</h3><p>Prevenção, telemetria e investigação ajudam a reduzir o tempo entre um comportamento suspeito e uma ação de contenção.</p><b>Mais contexto para agir</b></article>
            <article><Database size={30}/><span>CONCIERGE BACKUP</span><h3>Saber que os dados podem voltar quando a operação precisar.</h3><p>Cobertura, retenção e recuperação precisam ser conhecidas antes da crise. Cópia sem capacidade de restauração deixa uma dúvida cara.</p><b>Recuperação preparada</b></article>
          </div>
        </section>
      );
    }

    if (slide === 4) {
      return (
        <section className="v3-stage institutional-stage">
          <span className="v3-kicker">OPERAÇÃO, EVIDÊNCIAS E LGPD</span>
          <h2>Segurança também pesa em governança, LGPD e capacidade de resposta.</h2>
          <div className="institutional-operation-flow institutional-operation-compact">
            <article><Eye/><span>01</span><h3>Acompanhar</h3><p>Ter sinais do ambiente e saber o que merece atenção.</p></article>
            <article><LockKeyhole/><span>02</span><h3>Analisar</h3><p>Entender contexto antes de transformar alerta em decisão.</p></article>
            <article><CheckCircle2/><span>03</span><h3>Agir</h3><p>Ter responsáveis, prioridade e um caminho claro de resposta.</p></article>
            <article><FileCheck2/><span>04</span><h3>Registrar</h3><p>Manter evidências do que aconteceu e do que foi feito.</p></article>
          </div>
          <div className="institutional-law-strip">
            <article><strong>Art. 46</strong><p>Medidas técnicas e administrativas de segurança.</p><button type="button" onClick={() => setLawKey('art46')}>Ver artigo</button></article>
            <article><strong>Art. 48</strong><p>Incidente relevante pode exigir comunicação.</p><button type="button" onClick={() => setLawKey('art48')}>Ver artigo</button></article>
            <article className="law-impact"><strong>Art. 52</strong><p>Sanções incluem multa de até 2% do faturamento, limitada a R$ 50 milhões por infração.</p><button type="button" onClick={() => setLawKey('art52')}>Ver sanções</button></article>
          </div>
          <div className="institutional-lgpd-message"><ShieldCheck size={24}/><p><b>O ponto para a gestão:</b> sem controles, registros e capacidade de resposta, fica mais difícil demonstrar como os dados eram protegidos e como a empresa reagiu quando algo aconteceu.</p></div>
        </section>
      );
    }

    return (
      <section className="v3-stage institutional-stage institutional-next-step">
        <span className="v3-kicker">PRÓXIMO PASSO</span>
        <h2>Agora podemos aprofundar somente o que fizer sentido para {company}.</h2>
        <p className="v3-lead">
          Se houver tempo nesta reunião, seguimos para uma qualificação objetiva. Caso contrário, salvamos o contexto e retomamos em uma segunda conversa.
        </p>
        <div className="institutional-services compact">
          <article><Shield/><h3>Firewall</h3><p>Rede, acessos, links, VPN, disponibilidade e controles ativos.</p></article>
          <article><Monitor/><h3>Endpoint</h3><p>Parque, solução atual, cobertura, operação dos alertas e resposta.</p></article>
          <article><Database/><h3>Backup</h3><p>Escopo, volumetria, retenção, recuperação e continuidade.</p></article>
        </div>
        <div className="institutional-handoff">
          <p>O aprofundamento é feito em uma área interna do apresentador. O cliente vê apenas a apresentação preparada a partir das informações confirmadas.</p>
        </div>
      </section>
    );
  }, [company, clientName, profile.companyLogo, slide]);

  return (
    <div className="institutional-deck">
      <div className="institutional-progress" aria-label="Progresso da apresentação">
        {slideLabels.map((label, index) => (
          <button
            key={label}
            type="button"
            className={index === slide ? 'active' : index < slide ? 'done' : ''}
            onClick={() => onSlide(index)}
            aria-label={`Abrir ${label}`}
            aria-current={index === slide ? 'step' : undefined}
          ><span>{String(index + 1).padStart(2, '0')}</span>{label}</button>
        ))}
      </div>
      <div key={slide} className="institutional-slide-frame">{body}</div>
      <footer className="v3-presentation-footer institutional-footer">
        <button className="v3-btn secondary" onClick={() => onSlide(Math.max(0, slide - 1))} disabled={slide === 0}><ArrowLeft size={17}/>Voltar</button>
        <span>{String(slide + 1).padStart(2, '0')} / {String(slideLabels.length).padStart(2, '0')} · {slideLabels[slide]}</span>
        {last ? (
          <button className="v3-btn" onClick={onFinish}>Finalizar apresentação <ArrowRight size={17}/></button>
        ) : (
          <button className="v3-btn" onClick={() => onSlide(slide + 1)}>Continuar <ArrowRight size={17}/></button>
        )}
      </footer>
      <dialog ref={lawDialogRef} className="institutional-law-dialog" onClose={() => setLawKey(null)}>
        {lawDetail && (
          <div>
            <button type="button" className="institutional-law-close" onClick={() => setLawKey(null)} aria-label="Fechar detalhe do artigo"><X size={20}/></button>
            <span className="v3-kicker">LGPD · {lawDetail.article}</span>
            <h2>{lawDetail.title}</h2>
            <p>{lawDetail.summary}</p>
            <div className="institutional-law-executive"><strong>O que isso significa para a gestão</strong><p>{lawDetail.executive}</p></div>
            <small>{lawDetail.source}</small>
            <a href={lawDetail.href} target="_blank" rel="noreferrer">Consultar fonte oficial <ExternalLink size={15}/></a>
          </div>
        )}
      </dialog>
    </div>
  );
}
