import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft, ArrowRight, Building2, CheckCircle2, Database, ExternalLink,
  Eye, FileCheck2, Globe2, Laptop, LockKeyhole, Monitor, Network,
  SearchCheck, Shield, ShieldCheck, UsersRound, X,
} from 'lucide-react';
import type { Profile } from '../context/ProfileContext';
import { ConciergeBrandLockup } from './AssessmentVisual';
import qosLogo from '../assets/logo_qostecnologia.jpg';
import './institutional-v397.css';

type Props = { profile: Profile; slide: number; onSlide: (slide: number) => void; onFinish: () => void };
type LawKey = 'art46' | 'art48' | 'art52';
const labels = ['Boas-vindas', 'Quem somos', 'Nossa abordagem', 'Onde protegemos', 'Operação e LGPD', 'Próximo passo'];
const lawDetails: Record<LawKey, { label: string; title: string; body: string; context: string }> = {
  art46: { label: 'Art. 46', title: 'Segurança de dados pessoais', body: 'A LGPD prevê a adoção de medidas técnicas e administrativas aptas a proteger dados pessoais de acessos não autorizados e de situações acidentais ou ilícitas.', context: 'É importante identificar os dados pessoais tratados, os perfis de acesso, os controles de proteção e os registros disponíveis para demonstrar as medidas adotadas.' },
  art48: { label: 'Art. 48', title: 'Comunicação de incidentes', body: 'O controlador deve avaliar e comunicar incidentes de segurança que possam acarretar risco ou dano relevante aos titulares, nos termos da lei e regulamentação aplicável.', context: 'A avaliação de um incidente exige informações sobre o ocorrido, os dados e titulares potencialmente afetados, o risco envolvido e as providências tomadas.' },
  art52: { label: 'Art. 52', title: 'Sanções administrativas', body: 'A LGPD prevê advertências, multas e outras sanções administrativas, aplicáveis conforme a gravidade, os critérios legais e o processo competente.', context: 'As sanções dependem de processo e critérios legais. Procedimentos, controles e registros integram a avaliação da atuação da empresa.' },
};
const lawUrl = 'https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html';

function QosSignature({ large = false }: { large?: boolean }) {
  return <div className={`inst397-qos-signature ${large ? 'large' : ''}`}>
    <img src={qosLogo} alt="Símbolo da QOS Tecnologia" />
    <div><strong>QOS Tecnologia</strong><span>Grupo empresarial desde 2002</span></div>
  </div>;
}

export default function InstitutionalPresentation({ profile, slide, onSlide, onFinish }: Props) {
  const company = profile.companyName?.trim() || 'sua empresa';
  const companyTitle = profile.companyName?.trim() || 'Sua empresa';
  const [law, setLaw] = useState<LawKey | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialogRef.current;
    if (!node) return;
    if (law && !node.open) node.showModal();
    else if (!law && node.open) node.close();
  }, [law]);
  const customerLogo = profile.companyLogo ? <img src={profile.companyLogo} alt={`Logo de ${companyTitle}`} /> : null;
  const safeSlide = Math.min(Math.max(slide, 0), labels.length - 1);

  const screens = [
    <section className="inst397-stage inst397-cover" key="cover">
      <div className="inst397-cover-content">
        <span className="inst397-eyebrow"><span className="inst397-light" /> CONCIERGE SEGURANÇA DIGITAL</span>
        <h1>A segurança da sua empresa precisa de <em>acompanhamento.</em></h1>
        <p className="inst397-lead">A TI mantém sistemas, pessoas e processos funcionando. Quem acompanha os riscos de segurança enquanto tudo isso acontece? A Concierge ajuda a cuidar dessa rotina, com proteção gerenciada, especialistas e um SOC próprio 24/7.</p>
        <div className="inst397-cover-points"><span><ShieldCheck size={17}/> Serviços gerenciados</span><span><Eye size={17}/> SOC próprio 24/7</span><span><UsersRound size={17}/> Apoio à TI e à gestão</span></div>
        <div className="inst397-cover-group"><span>Uma empresa do Grupo</span><QosSignature /></div>
      </div>
      <div className={`inst397-cover-identity ${customerLogo ? '' : 'inst397-no-logo'}`}>
        <div className="inst397-brandmark"><ConciergeBrandLockup /></div>
        <div className="inst397-identity-rule" />
        <span className="inst397-subtle-kicker">Apresentação preparada para</span>
        {customerLogo && <div className="inst397-customer-image">{customerLogo}</div>}
        <strong className="inst397-client-name">{companyTitle}</strong>
        <p>Vamos conversar sobre o que sustenta a operação e onde existe espaço para melhorar a proteção.</p>
      </div>
    </section>,
    <section className="inst397-stage inst397-about" key="about">
      <header className="inst397-headerline"><span className="inst397-eyebrow">01 / QUEM SOMOS</span><h2>Uma equipe de segurança por trás da rotina da sua empresa.</h2><p>A Concierge é a operação de segurança gerenciada do Grupo QOS para pequenas e médias empresas. Assumimos, dentro do escopo contratado, rotinas de proteção, monitoramento e suporte especializado, trabalhando junto da TI e da gestão.</p></header>
      <div className="inst397-about-composition">
        <div className="inst397-about-master">
          <div className="inst397-master-label"><Shield size={22}/><span>Concierge Segurança Digital</span></div>
          <h3>Firewall, Endpoint e Backup acompanhados por especialistas, com visibilidade sobre alertas, mudanças e o que pede atenção.</h3>
          <div className="inst397-about-pillars"><span><Eye size={17}/> Visibilidade</span><span><ShieldCheck size={17}/> Proteção</span><span><UsersRound size={17}/> Acompanhamento</span></div>
        </div>
        <div className="inst397-qos-feature">
          <QosSignature large />
          <div className="inst397-facts"><article><strong>2002</strong><span>Atuação em segurança e gestão de riscos</span></article><article><strong>2008</strong><span>SOC próprio com operação 24/7</span></article></div>
          <div className="inst400-certifications"><span>ISO/IEC 27001</span><span>ISO 37001</span><small>Certificações do Grupo QOS</small></div>
          <p>A QOS atua desde 2002 em cibersegurança e gestão de riscos. Seu SOC próprio opera desde 2008, com estrutura 24/7 e experiência em setores regulados. O grupo também atua em vulnerabilidades, resposta a incidentes, identidade, conscientização e governança, com certificações ISO/IEC 27001 e ISO 37001.</p>
        </div>
      </div>
      <footer className="inst397-lowline">Concierge com operação gerenciada, apoiada pela experiência da QOS desde 2002, SOC próprio desde 2008 e certificações ISO/IEC 27001 e ISO 37001. O escopo e os níveis de serviço são definidos em contrato.</footer>
    </section>,
    <section className="inst397-stage inst397-process" key="process">
      <header className="inst397-headerline"><span className="inst397-eyebrow">02 / NOSSA ABORDAGEM</span><h2>Entender o ambiente, estabelecer prioridades e assumir uma rotina de segurança.</h2><p>O primeiro passo é conhecer as dependências de {company}: sistemas críticos, usuários, links, acessos, dados e controles atuais. Com esse contexto, dimensionamos a proteção e combinamos o que será acompanhado pela Concierge e o que permanece sob decisão da empresa.</p></header>
      <div className="inst397-flow inst400-flow">
        <article><span className="inst397-flow-index">01 / LEVANTAMENTO</span><div className="inst397-flow-icon"><Network size={27}/></div><h3>Conhecer a operação</h3><p>Mapeamos usuários, equipamentos, acessos, dados relevantes e as dependências que podem parar o negócio.</p><div className="inst400-deliverable"><span>O que você ganha</span><strong>Visão do cenário atual e lacunas a confirmar</strong></div></article>
        <div className="inst397-flow-arrow" aria-hidden="true"><span /></div>
        <article><span className="inst397-flow-index">02 / PRIORIZAÇÃO</span><div className="inst397-flow-icon"><SearchCheck size={27}/></div><h3>Separar risco de ruído</h3><p>Analisamos exposição, controles existentes e impacto operacional para indicar por onde faz sentido começar.</p><div className="inst400-deliverable"><span>O que você ganha</span><strong>Recomendação e dimensionamento fundamentados</strong></div></article>
        <div className="inst397-flow-arrow" aria-hidden="true"><span /></div>
        <article><span className="inst397-flow-index">03 / SUSTENTAÇÃO</span><div className="inst397-flow-icon"><CheckCircle2 size={27}/></div><h3>Proteger e acompanhar</h3><p>Após a contratação, configuramos a solução e definimos monitoramento, tratamento de eventos, suporte e escalonamento conforme o serviço.</p><div className="inst400-deliverable"><span>O que você ganha</span><strong>Rotina acompanhada e responsabilidades claras</strong></div></article>
      </div>
      <div className="inst397-context-band inst400-context-band"><span><ShieldCheck size={16}/> A TI conhece o ambiente e executa suas rotinas.</span><div className="inst397-bridge-line"/><span><Eye size={16}/> A Concierge complementa com segurança gerenciada e especialistas.</span></div>
    </section>,
    <section className="inst397-stage inst397-protection" key="protection">
      <header className="inst397-headerline"><span className="inst397-eyebrow">03 / ONDE PROTEGEMOS</span><h2>Proteção da rede, dos dispositivos e dos dados, com gestão especializada.</h2><p>A Concierge reúne tecnologia e operação gerenciada para empresas com equipes de TI enxutas. Cada frente atende um risco diferente e pode ser combinada conforme a necessidade e o escopo contratado.</p></header>
      <div className="inst397-protection-grid inst400-protection-grid">
        <article><div className="inst397-product-visual"><Globe2 size={38}/><span className="inst397-wire"/><Shield size={35}/><span className="inst397-wire"/><Network size={38}/></div><small>CONCIERGE FIREWALL</small><h3>Rede e acessos</h3><p>Equipamento e licenças com gestão de políticas, regras de navegação, VPN e visibilidade do perímetro.</p><ul className="inst400-product-details"><li>Monitoramento e acompanhamento de eventos de segurança</li><li>Ajustes, suporte e evolução das regras conforme autorização e contrato</li></ul><span className="inst397-product-tag">Para quem precisa controlar exposição e acesso à rede</span></article>
        <article><div className="inst397-product-visual"><Laptop size={40}/><span className="inst397-wire"/><ShieldCheck size={38}/><span className="inst397-wire"/><Monitor size={38}/></div><small>CONCIERGE ENDPOINT</small><h3>Dispositivos e resposta</h3><p>Proteção gerenciada para estações e servidores, com prevenção, detecção e telemetria de comportamentos suspeitos.</p><ul className="inst400-product-details"><li>Análise de alertas, investigação e ações de contenção previstas no serviço</li><li>Acompanhamento da cobertura e dos eventos, inclusive fora da rede corporativa</li></ul><span className="inst397-product-tag">Para quem precisa reagir a malware e ransomware</span></article>
        <article><div className="inst397-product-visual"><Database size={40}/><span className="inst397-wire"/><LockKeyhole size={35}/><span className="inst397-wire"/><CheckCircle2 size={38}/></div><small>CONCIERGE BACKUP</small><h3>Dados e recuperação</h3><p>Backup gerenciado com escopo definido, rotinas de cópia, retenção e acompanhamento das tarefas.</p><ul className="inst400-product-details"><li>Verificação de falhas de execução e tratamento conforme escopo</li><li>Testes de restauração e suporte à recuperação para validar a cópia</li></ul><span className="inst397-product-tag">Para quem precisa reduzir a incerteza após uma parada</span></article>
      </div>
      <div className="inst400-products-footnote"><ShieldCheck size={16}/><span>O SOC e a equipe técnica sustentam o acompanhamento conforme o produto e SLA contratados. Serviços adicionais do Grupo QOS podem ser avaliados separadamente.</span></div>
    </section>,
    <section className="inst397-stage inst397-governance" key="governance">
      <header className="inst397-headerline"><span className="inst397-eyebrow">04 / OPERAÇÃO E LGPD</span><h2>O que acontece depois que a proteção entra em operação?</h2><p>O SOC próprio da QOS funciona 24/7, com equipe especializada, gestão de alertas, escalonamento e playbooks. Na Concierge, essas capacidades são aplicadas aos serviços contratados, com atendimento, registros e informações para acompanhamento da gestão.</p></header>
      <div className="inst397-governance-body inst400-governance-body">
        <div className="inst397-incident-flow inst400-incident-flow">
          <article><Eye size={25}/><strong>Monitorar</strong><span>Receber e acompanhar sinais do ambiente protegido</span></article>
          <article><SearchCheck size={25}/><strong>Analisar</strong><span>Validar alertas, contexto e criticidade</span></article>
          <article><ShieldCheck size={25}/><strong>Acionar</strong><span>Executar ou escalar medidas conforme o playbook e autorização</span></article>
          <article><FileCheck2 size={25}/><strong>Registrar</strong><span>Documentar atendimentos e produzir evidências do serviço</span></article>
        </div>
        <aside className="inst397-governance-focus inst400-governance-focus"><span><LockKeyhole size={19}/> VISIBILIDADE PARA A GESTÃO</span><strong>Quem tratou? O que foi feito? O que ainda precisa de decisão?</strong><p>Histórico de eventos, encaminhamentos, indicadores e relatórios periódicos, quando previstos no contrato, ajudam a acompanhar a operação e justificar prioridades de segurança.</p><div className="inst400-soc-pill"><Eye size={15}/> SOC QOS 24/7 · Monitoramento, análise e escalonamento</div></aside>
      </div>
      <div className="inst397-law-links inst400-law-links"><span>LGPD: medidas de proteção, análise de incidentes e responsabilização</span><button type="button" onClick={()=>setLaw('art46')}>Art. 46 <ExternalLink size={14}/></button><button type="button" onClick={()=>setLaw('art48')}>Art. 48 <ExternalLink size={14}/></button><button type="button" onClick={()=>setLaw('art52')}>Art. 52 <ExternalLink size={14}/></button></div>
      <small className="inst397-disclaimer">Controles e registros apoiam a governança. Conformidade e comunicação de incidentes dependem de avaliação do controlador, da legislação e das circunstâncias.</small>
    </section>,
    <section className="inst397-stage inst397-finish" key="finish">
      <header className="inst397-headerline"><span className="inst397-eyebrow">05 / PRÓXIMO PASSO</span><h2>Por onde faz sentido começar na sua empresa?</h2><p>Agora que você conhece a Concierge e a estrutura da QOS, quero entender o cenário de {company}. Podemos começar por rede e acessos, proteção dos dispositivos ou recuperação de dados. A escolha define o levantamento técnico e os próximos passos.</p></header>
      <div className="inst397-next-grid">
        <article><Network size={32}/><strong>Rede e acessos</strong><p>Links, firewall atual, VPN, redes internas, políticas e monitoramento.</p><small>FIREWALL</small></article>
        <article><Monitor size={32}/><strong>Dispositivos</strong><p>Parque, solução atual, ameaças, cobertura, alertas e resposta.</p><small>ENDPOINT</small></article>
        <article><Database size={32}/><strong>Continuidade</strong><p>Dados críticos, volumetria, retenção, testes e objetivos de recuperação.</p><small>BACKUP</small></article>
      </div>
      <div className="inst397-finish-brand"><div><ConciergeBrandLockup compact /></div><span>A próxima etapa usa os dados informados na conversa, sem presumir detalhes que ainda não foram validados.</span></div>
    </section>,
  ];

  return <div className="institutional-deck inst397-deck">
    <nav className="institutional-progress inst397-progress" aria-label="Etapas da apresentação">
      {labels.map((label,index)=><button key={label} type="button" className={index===safeSlide?'active':index<safeSlide?'done':''} aria-current={index===safeSlide?'step':undefined} onClick={()=>onSlide(index)}><span>{String(index+1).padStart(2,'0')}</span>{label}</button>)}
    </nav>
    <div className="institutional-slide-frame inst397-frame" key={safeSlide}>{screens[safeSlide]}</div>
    <footer className="v3-presentation-footer institutional-footer inst397-footer"><button type="button" className="v3-btn secondary" onClick={()=>onSlide(Math.max(0,safeSlide-1))} disabled={safeSlide===0}><ArrowLeft size={17}/> Voltar</button><span>{String(safeSlide+1).padStart(2,'0')} / {String(labels.length).padStart(2,'0')} · {labels[safeSlide]}</span><button type="button" className="v3-btn" onClick={safeSlide===labels.length-1?onFinish:()=>onSlide(safeSlide+1)}>{safeSlide===labels.length-1?'Finalizar apresentação':'Continuar'} <ArrowRight size={17}/></button></footer>
    <dialog ref={dialogRef} className="institutional-law-dialog inst397-law-dialog" onClose={()=>setLaw(null)}>{law&&<div><button type="button" className="institutional-law-close" aria-label="Fechar" onClick={()=>setLaw(null)}><X size={20}/></button><span className="inst397-eyebrow">LGPD / {lawDetails[law].label}</span><h2>{lawDetails[law].title}</h2><p>{lawDetails[law].body}</p><div className="institutional-law-executive"><strong>Na prática, para a empresa</strong><p>{lawDetails[law].context}</p></div><a href={lawUrl} target="_blank" rel="noreferrer">Consultar fonte oficial <ExternalLink size={15}/></a></div>}</dialog>
  </div>;
}
