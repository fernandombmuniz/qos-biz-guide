import { useState, useMemo, useEffect, useRef } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { recommend } from '@/utils/firewallRecommendation';
import { motion, useAnimation, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import {
  Collapsible, CollapsibleTrigger, CollapsibleContent,
} from '@/components/ui/collapsible';
import {
  Shield, Users, Laptop, Globe, Lock, AlertTriangle, TrendingUp,
  CheckCircle2, XCircle, Play, Wifi, Server, Phone, Network,
  Activity, Building2, Award, Clock, Layers, DollarSign, MapPin, ArrowRight,
  ChevronDown, Search, Settings, FileCheck, Eye, MessageSquare, ClipboardList, Presentation, Handshake,
} from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import logoConcierge from '@/assets/logo-concierge.jpg';
import castleLogo from '@/assets/castlelogo.png';
import shieldConciergeLogo from '@/assets/shieldconcierge.png';
import logoQos from '@/assets/logo_qostecnologia.jpg';
import MethodologyModal from '@/components/MethodologyModal';
import HeroHeader from '@/components/diagnostic/HeroHeader';
import SectionContainer from '@/components/diagnostic/SectionContainer';
import InfoCards from '@/components/diagnostic/InfoCards';
import DiagnosticCards from '@/components/diagnostic/DiagnosticCards';
import SimulationContainer from '@/components/diagnostic/SimulationContainer';

/* ─── helpers ─── */
const yesNo = (v: boolean) => (v ? 'Sim' : 'Não');
const optionLabel = (v: string, text: string) =>
  v === 'yes' ? 'Sim' : v === 'other' ? text || 'Outro' : 'Não';

/* ─── risk vectors ─── */
interface RiskVector {
  id: string;
  label: string;
  points: number;
  description: string;
  check: (p: any) => boolean; // true = control ABSENT = add points
}

const riskVectors: RiskVector[] = [
  {
    id: 'no-ngfw',
    label: 'Ausência de Firewall NGFW',
    points: 30,
    description: 'Grande parte das ameaças modernas trafegam criptografadas. Sem inspeção SSL ativa, malware, ransomware e comunicação com servidores de comando e controle podem atravessar o perímetro sem análise adequada.\n\nFonte: Verizon DBIR 2024; CISA Known Exploited Vulnerabilities Catalog 2025; Palo Alto Unit 42 Threat Report 2024.',
    check: (p) => !p.hasFirewall || p.firewallType === 'router',
  },
  {
    id: 'no-ips',
    label: 'Falta de IPS Ativo',
    points: 25,
    description: 'Sem sistema de prevenção de intrusão, tentativas de exploração de vulnerabilidades conhecidas não são bloqueadas em tempo real. Mais de 30 mil vulnerabilidades foram registradas globalmente em 2024 e 2025, muitas exploradas poucas horas após divulgação.\n\nFonte: Verizon Data Breach Investigations Report 2024.',
    check: (p) => !p.idsIps,
  },
  {
    id: 'no-ssl',
    label: 'Ausência de Inspeção SSL',
    points: 20,
    description: 'Grande parte das ameaças modernas trafegam criptografadas. Sem inspeção SSL ativa, malware, ransomware e comunicação com servidores de comando e controle podem atravessar o perímetro sem análise adequada.\nBase técnica: Relatórios globais de laboratórios de segurança 2024–2025 indicam crescimento contínuo de ataques criptografados como vetor de evasão.\n\nFonte: FortiGuard Labs Threat Landscape Report 2024 e SonicWall Cyber Threat Report 2025',
    check: (p) => !p.sslInspection,
  },
  {
    id: 'no-vlan',
    label: 'Segmentação de Rede Inexistente',
    points: 15,
    description: 'Ambientes sem VLANs permitem movimentação lateral após comprometimento inicial, ampliando a superfície de ataque interna.\n\nFonte: CISA Zero Trust Maturity Model 2024; NIST SP 800-207; Microsoft Digital Defense Report 2024',
    check: (p) => !p.hasVlan || p.vlanCount === 0,
  },
  {
    id: 'no-logs',
    label: 'Logs Não Centralizados',
    points: 20,
    description: 'Sem visibilidade consolidada, o tempo médio de detecção de incidentes aumenta significativamente. Relatórios recentes indicam que o tempo médio global de detecção pode ultrapassar 190 dias sem correlação centralizada.\n\nFonte: IBM Cost of a Data Breach Report 2024.',
    check: (p) => !p.hasFirewall || !p.activeLicense,
  },
  {
    id: 'vpn-no-mfa',
    label: 'VPN Sem MFA',
    points: 15,
    description: 'Ataques modernos exploram credenciais comprometidas como principal vetor de entrada. A ausência de MFA aumenta significativamente o risco de acesso não autorizado.\n\nFonte: Relatórios globais de segurança de identidade 2024 indicam que credenciais comprometidas continuam sendo principal vetor inicial de ataque',
    check: (p) => p.usesVpn && !p.vpnMfa,
  },
  {
    id: 'no-policy',
    label: 'Operação Apenas Reativa',
    points: 10,
    description: 'Ambientes administrados apenas de forma reativa tendem a responder tardiamente a incidentes, ampliando impacto operacional.\n\nFonte: Relatórios globais de segurança corporativa',
    check: (p) => !p.securityPolicy,
  },
];

const getExposureLevel = (score: number) => {
  if (score <= 25) return { label: 'Baixo', color: 'bg-emerald-500', textColor: 'text-emerald-500', gradientClass: 'bg-gradient-to-r from-emerald-400 to-emerald-500' };
  if (score <= 50) return { label: 'Moderado', color: 'bg-yellow-500', textColor: 'text-yellow-500', gradientClass: 'bg-gradient-to-r from-yellow-400 to-yellow-500' };
  if (score <= 75) return { label: 'Elevado', color: 'bg-orange-500', textColor: 'text-orange-500', gradientClass: 'bg-gradient-to-r from-orange-400 to-orange-500' };
  return { label: 'Crítico', color: 'bg-red-500', textColor: 'text-red-500', gradientClass: 'bg-gradient-to-r from-red-500 to-red-600' };
};

/* ─── comparative table data (new 4-col) ─── */
type CompCategory = 'all' | 'security' | 'operation' | 'governance';

interface CompRow {
  feature: string;
  stateful: string;
  ngfw: string;
  impact: string;
  category: CompCategory;
}

const compRows: CompRow[] = [
  { feature: 'Objetivo do equipamento', stateful: 'Roteamento e controle básico de conexões. Foco principal em conectividade.', ngfw: 'Proteção de perímetro com inspeção profunda de tráfego, prevenção de ameaças e visibilidade de aplicações.', impact: 'Com NGFW, a segurança deixa de ser complementar e passa a ser o centro da arquitetura de rede.', category: 'security' },
  { feature: 'IPS — Sistema de Prevenção de Intrusão', stateful: 'Não disponível nativamente.', ngfw: 'Bloqueio automático de tentativas de exploração de vulnerabilidades conhecidas.', impact: 'Redução significativa do risco de comprometimento inicial.', category: 'security' },
  { feature: 'IDS — Sistema de Detecção', stateful: 'Limitado ou inexistente.', ngfw: 'Detecção baseada em assinaturas e comportamento com geração de alertas.', impact: 'Visibilidade sobre tentativas de ataque, mesmo quando não bloqueadas.', category: 'security' },
  { feature: 'Antivírus de Gateway', stateful: 'Não realiza inspeção de arquivos na borda.', ngfw: 'Verificação de downloads e uploads com bloqueio de malware.', impact: 'Reduz risco de infecção em endpoints.', category: 'security' },
  { feature: 'Controle de Aplicações', stateful: 'Controle baseado apenas em portas.', ngfw: 'Identificação por aplicação independente da porta.', impact: 'Políticas granulares por tipo de aplicação.', category: 'security' },
  { feature: 'Web Filtering', stateful: 'Listas manuais simples.', ngfw: 'Categorização automática de milhões de sites.', impact: 'Redução de risco de phishing e navegação maliciosa.', category: 'security' },
  { feature: 'SD-WAN', stateful: 'Failover básico entre links.', ngfw: 'Balanceamento inteligente baseado em aplicação e latência.', impact: 'Melhor performance e disponibilidade.', category: 'operation' },
  { feature: 'Logs e Auditoria', stateful: 'Logs básicos locais.', ngfw: 'Logs detalhados com exportação para análise contínua.', impact: 'Base para auditorias e investigação.', category: 'governance' },
  { feature: 'Operação Contínua', stateful: 'Administração manual reativa.', ngfw: 'Monitoramento contínuo 24x7 com resposta especializada.', impact: 'Redução do tempo de detecção e resposta.', category: 'operation' },
];

/* ─── main component ─── */
const FirewallPage = () => {
  const { profile } = useProfile();

  // Simulation state
  const [simAttack, setSimAttack] = useState('ransomware');
  const [simMode, setSimMode] = useState<'without' | 'with'>('without');
  const [simRunning, setSimRunning] = useState(false);
  const [simStep, setSimStep] = useState(0);

  // Simulação Concierge – local investment inputs
  const [implantacao, setImplantacao] = useState(0);
  const [mensalidade, setMensalidade] = useState(0);
  const total12 = implantacao + mensalidade * 12;

  // Comparative filter
  const [compFilter, setCompFilter] = useState<CompCategory>('all');

  const totalVpns = profile.usesVpn ? profile.vpnSiteToSite + profile.vpnRemoteAccess : 0;
  const vlanCount = profile.hasVlan ? profile.vlanCount : 0;

  const rec = useMemo(
    () =>
      recommend(
        profile.userCount,
        profile.internetLinks.map((l) => l.speed),
        profile.networkUsage,
        totalVpns,
        vlanCount,
        profile.sslInspection,
      ),
    [profile.userCount, profile.internetLinks, profile.networkUsage, totalVpns, vlanCount, profile.sslInspection],
  );

  const usageLabel = rec.usageLabel;

  /* ── dynamic risk score ── */
  const activeRisks = useMemo(() => riskVectors.filter((v) => v.check(profile)), [profile]);
  const riskScore = useMemo(() => activeRisks.reduce((sum, v) => sum + v.points, 0), [activeRisks]);
  const exposure = getExposureLevel(riskScore);

  const annualRiskEstimate = useMemo(() => {
    const impact = 300000 * (riskScore / 135);
    const probability = riskScore <= 25 ? 0.1 : riskScore <= 50 ? 0.15 : riskScore <= 75 ? 0.25 : 0.3;
    return impact * probability;
  }, [riskScore]);

  /* ── LGPD regulatory exposure score ── */
  const lgpdScore = useMemo(() => {
    let score = 0;

    // Art. 46 (Segurança Técnica)
    if (!profile.hasFirewall || profile.firewallType === 'router') score += 20; // NGFW
    if (!profile.idsIps) score += 20; // IPS
    if (!profile.hasVlan || profile.vlanCount === 0) score += 15; // Segmentação
    if (profile.usesVpn && !profile.vpnMfa) score += 15; // MFA em VPN

    // Art. 48 (Comunicação de Incidentes - visibilidade)
    if (!profile.hasFirewall || !profile.activeLicense) score += 25; // Logs

    // Art. 49 (Governança e Boas Práticas)
    if (!profile.securityPolicy) score += 25; // Políticas e Governança

    return score;
  }, [profile]);

  const getLgpdExposure = (score: number) => {
    if (score <= 30) return { label: 'Baixo', color: 'bg-emerald-500', textColor: 'text-emerald-500', gradientClass: 'bg-gradient-to-r from-emerald-400 to-emerald-500' };
    if (score <= 60) return { label: 'Moderado', color: 'bg-yellow-500', textColor: 'text-yellow-500', gradientClass: 'bg-gradient-to-r from-yellow-400 to-yellow-500' };
    if (score <= 90) return { label: 'Elevado', color: 'bg-orange-500', textColor: 'text-orange-500', gradientClass: 'bg-gradient-to-r from-orange-400 to-orange-500' };
    return { label: 'Crítico', color: 'bg-red-500', textColor: 'text-red-500', gradientClass: 'bg-gradient-to-r from-red-500 to-red-600' };
  };

  const lgpdExposure = getLgpdExposure(lgpdScore);

  /* ── animated counters ── */
  const [displayRiskScore, setDisplayRiskScore] = useState(0);
  const [displayLgpdScore, setDisplayLgpdScore] = useState(0);

  useEffect(() => {
    // Risk Score Animation
    let startRisk = 0;
    const duration = 800; // ms
    const incrementRisk = riskScore / (duration / 16); // 60fps approx
    const timerRisk = setInterval(() => {
      startRisk += incrementRisk;
      if (startRisk >= riskScore) {
        setDisplayRiskScore(riskScore);
        clearInterval(timerRisk);
      } else {
        setDisplayRiskScore(Math.floor(startRisk));
      }
    }, 16);

    // LGPD Score Animation
    let startLgpd = 0;
    const incrementLgpd = lgpdScore / (duration / 16);
    const timerLgpd = setInterval(() => {
      startLgpd += incrementLgpd;
      if (startLgpd >= lgpdScore) {
        setDisplayLgpdScore(lgpdScore);
        clearInterval(timerLgpd);
      } else {
        setDisplayLgpdScore(Math.floor(startLgpd));
      }
    }, 16);

    return () => {
      clearInterval(timerRisk);
      clearInterval(timerLgpd);
    };
  }, [riskScore, lgpdScore]);

  /* ── attack sim data ── */
  const attacks: Record<string, { without: string[]; with: string[] }> = {
    ransomware: {
      without: [
        'Phishing recebido por colaborador',
        'Execução do payload malicioso',
        'Escalação de privilégios',
        'Movimento lateral na rede',
        'Criptografia de dados críticos',
        'Resgate exigido — operação paralisada',
      ],
      with: [
        'Phishing recebido por colaborador',
        'Firewall bloqueia comunicação C&C',
        'IDS detecta atividade anômala',
        'SOC 24/7 isola o incidente',
        'Operação mantida sem interrupção',
      ],
    },
    bruteforce: {
      without: [
        'Atacante identifica VPN exposta',
        'Tentativas de força bruta iniciadas',
        'Credenciais comprometidas',
        'Acesso não autorizado à rede interna',
        'Exfiltração de dados sensíveis',
      ],
      with: [
        'Atacante identifica VPN',
        'Limite de tentativas ativado',
        'MFA bloqueia acesso não autorizado',
        'Alerta gerado no SOC',
        'Atacante bloqueado automaticamente',
      ],
    },
    segmentation: {
      without: [
        'Dispositivo comprometido na rede',
        'Sem segmentação — acesso total',
        'Servidores críticos acessados',
        'Dados expostos',
        'Compliance violada',
      ],
      with: [
        'Dispositivo comprometido em VLAN isolada',
        'Firewall inter-VLAN bloqueia propagação',
        'Microsegmentação protege servidores',
        'Incidente contido automaticamente',
      ],
    },
  };

  const runSimulation = () => {
    setSimStep(0);
    setSimRunning(true);
    const steps = attacks[simAttack][simMode];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setSimStep(i);
      if (i >= steps.length) clearInterval(interval);
    }, 800);
  };

  const filteredCompRows = compFilter === 'all' ? compRows : compRows.filter((r) => r.category === compFilter);

  /* ───────── render ───────── */
  return (
    <div className="min-h-screen bg-transparent pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-20">

        <HeroHeader
          title="Concierge"
          titleAccent="Firewall"
          subtitle="Security Assessment"
          companyName={profile.companyName}
          companyLogo={profile.companyLogo}
          contactName={profile.contactName}
          contactRole={profile.contactRole}
          icon={Shield}
        />

        {/* ── 2. VISÃO GERAL DO AMBIENTE ── */}
        <SectionContainer title="Visão Geral do Ambiente">
          <InfoCards
            cards={[
              { icon: Users, label: 'Usuários', value: profile.userCount },
              { icon: Laptop, label: 'Dispositivos', value: profile.deviceCount },
              { icon: Globe, label: 'Links', value: profile.internetLinks.length },
              { icon: Lock, label: 'VPNs', value: totalVpns },
            ]}
          />

          {(profile.increaseUsers || profile.increaseDevices) && (
            <div className="glass-card p-4 mb-6">
              <p className="text-base text-muted-foreground flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                Crescimento previsto:
                {profile.increaseUsers && <span className="text-foreground font-medium ml-1">Usuários ({profile.userGrowthEstimate || 'sim'})</span>}
                {profile.increaseUsers && profile.increaseDevices && <span>•</span>}
                {profile.increaseDevices && <span className="text-foreground font-medium ml-1">Dispositivos ({profile.deviceGrowthEstimate || 'sim'})</span>}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5 space-y-2">
              <h4 className="text-lg font-semibold text-foreground flex items-center gap-2"><Globe size={18} className="text-primary" /> Links de Internet</h4>
              {profile.internetLinks.map((l, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  {l.provider || `Link ${i + 1}`} — {l.speed || '—'}
                  {l.increaseSpeed && <span className="text-primary ml-1">(aumento previsto)</span>}
                </p>
              ))}
              <p className="text-sm text-foreground font-medium pt-2 border-t border-border/50 mt-1">Banda total: {rec.totalLinksMbps} Mbps</p>
            </div>

            <div className="glass-card p-5 space-y-2">
              <h4 className="text-lg font-semibold text-foreground flex items-center gap-2"><Network size={18} className="text-primary" /> Segmentação</h4>
              <p className="text-sm text-muted-foreground">VLANs: {profile.hasVlan ? `${profile.vlanCount} — ${profile.vlanNames || '—'}` : 'Não utiliza'}</p>
              <p className="text-sm text-muted-foreground">VPN S2S: {profile.vpnSiteToSite} | Remota: {profile.vpnRemoteAccess}</p>
            </div>

            <div className="glass-card p-5 space-y-2">
              <h4 className="text-lg font-semibold text-foreground flex items-center gap-2"><Wifi size={18} className="text-primary" /> Access Points</h4>
              {profile.hasAP ? (
                <p className="text-sm text-muted-foreground">{profile.apBrand} {profile.apModel} — Qtd: {profile.apQuantity}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Não possui</p>
              )}
            </div>

            <div className="glass-card p-5 space-y-2">
              <h4 className="text-lg font-semibold text-foreground flex items-center gap-2"><Server size={18} className="text-primary" /> Switches Gerenciáveis</h4>
              {profile.managedSwitch ? (
                <p className="text-sm text-muted-foreground">{profile.switchBrand} {profile.switchModel} — Qtd: {profile.switchCount}</p>
              ) : (
                <p className="text-sm text-muted-foreground">Não possui</p>
              )}
            </div>

            <div className="glass-card p-5 space-y-3 md:col-span-2">
              <h4 className="text-lg font-semibold text-foreground flex items-center gap-2"><Activity size={18} className="text-primary" /> Arquitetura Adicional</h4>
            </div>
          </div>
        </SectionContainer>

        {/* ── 3. RISCOS IDENTIFICADOS (score dinâmico) ── */}
        <SectionContainer title="Riscos Identificados" icon={AlertTriangle} iconColor="text-destructive">
          <p className="text-lg text-foreground/80 mb-8" style={{ lineHeight: '1.6' }}>
            Com base nas informações capturadas no onboarding, avaliamos a exposição da infraestrutura frente às principais tendências de ameaça observadas em 2024 e 2025. A classificação considera ausência ou presença de controles críticos de segurança, segmentação, visibilidade e prevenção.
          </p>

          <DiagnosticCards
            title="Score Geral de Exposição"
            subtitle="Avaliação baseada na presença ou ausência de controles essenciais de segurança."
            score={riskScore}
            maxScore={135}
            exposure={exposure}
            displayScore={displayRiskScore}
            risks={activeRisks}
            emptyMessage="Nenhum risco crítico detectado na camada de firewall."
          />

          {/* 3. Score LGPD Expansível */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
            <Collapsible>
              <div className="glass-card p-6 border-l-4 border-l-blue-500">
                <CollapsibleTrigger className="w-full text-left group">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-lg font-bold text-foreground">Score de Exposição LGPD</p>
                      <p className="text-base text-muted-foreground mt-1 pr-6">Avaliação de exposição regulatória baseada na ausência de controles de segurança relacionados à proteção de dados pessoais.</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-3xl md:text-5xl font-extrabold ${lgpdExposure.textColor}`}>{displayLgpdScore}</p>
                          <p className={`text-base md:text-lg font-bold ${lgpdExposure.textColor} mt-1`}>{lgpdExposure.label}</p>
                        </div>
                        <ChevronDown size={28} className="text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${lgpdExposure.gradientClass}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((lgpdScore / 120) * 100, 100)}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
                    />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  {/* Detalhamento LGPD */}
                  <div className="mt-6 pt-6 border-t border-border/40">
                    <h4 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                      <FileCheck size={20} className="text-blue-500" /> Exposição Regulatória LGPD
                    </h4>

                    <div className="space-y-8">
                      {/* 1. Artigos relevantes (DINÂMICO) */}
                      <div>
                        <h5 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                          Artigos mais relevantes para o ambiente analisado
                        </h5>
                        <div className="space-y-6">
                          {(() => {
                            const articles = [];

                            // Art. 46 mapping
                            if (!profile.hasFirewall || profile.firewallType === 'router' || !profile.hasVlan || profile.vlanCount === 0 || !profile.socMonitoring || !profile.monitoring247 || !profile.activeLicense) {
                              articles.push({
                                title: "Art. 46 – Segurança dos dados pessoais",
                                text: "A LGPD estabelece que os agentes de tratamento devem adotar medidas técnicas e administrativas aptas a proteger os dados pessoais contra acessos não autorizados e situações acidentais ou ilícitas.",
                                url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
                              });
                            }

                            // Art. 48 mapping
                            if (!profile.socMonitoring || !profile.monitoring247 || !profile.incidentResponsePlan) {
                              articles.push({
                                title: "Art. 48 – Comunicação de incidentes",
                                text: "A lei exige que o controlador deverá comunicar à autoridade nacional e ao titular a ocorrência de incidente de segurança que possa acarretar risco ou dano relevante aos titulares.",
                                url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
                              });
                            }

                            // Art. 50 mapping
                            if (!profile.securityPolicy) {
                              articles.push({
                                title: "Art. 50 – Boas práticas e governança",
                                text: "Os controladores e operadores, no âmbito de suas competências, pelo tratamento de dados pessoais, individualmente ou por meio de associações, poderão formular regras de boas práticas e de governança.",
                                url: "https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm"
                              });
                            }

                            if (articles.length === 0) {
                              return (
                                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                                  <p className="text-sm text-foreground/80 leading-relaxed italic">
                                    "O ambiente apresenta controles relevantes de segurança. Ainda assim, a legislação de proteção de dados exige manutenção contínua de práticas de segurança e governança."
                                  </p>
                                </div>
                              );
                            }

                            return articles.map((art, idx) => (
                              <div key={idx} className="border-l-2 border-primary/30 pl-4 py-1">
                                <h6 className="font-bold text-foreground text-base mb-2">{art.title}</h6>
                                <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                                  {art.text}
                                </p>
                                <div className="flex flex-col gap-1">
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase">Fonte:</span>
                                  <a href={art.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                                    Lei Geral de Proteção de Dados – {art.title.split(' – ')[0]} <ArrowRight size={10} />
                                  </a>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </div>

                      {/* 2. Possível impacto regulatório (FIXO) */}
                      <div className="pt-6 border-t border-border/40">
                        <h5 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                          Possível impacto regulatório
                        </h5>
                        <div className="space-y-4">
                          <p className="text-sm text-foreground/80 leading-relaxed">
                            Em caso de incidentes envolvendo dados pessoais, a legislação brasileira prevê sanções administrativas aplicáveis pela Autoridade Nacional de Proteção de Dados (ANPD). Entre as penalidades previstas estão advertências, multas, bloqueio de dados e restrições operacionais.
                          </p>
                          <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl">
                            <p className="text-sm text-foreground/90">
                              De acordo com o <span className="font-bold">Art. 52</span> da Lei Geral de Proteção de Dados, as multas podem chegar a:
                            </p>
                            <p className="text-lg font-bold text-red-400 mt-2">
                              2% do faturamento da empresa, limitadas a R$ 50 milhões por infração.
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Fonte:</span>
                            <a href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                              Lei Geral de Proteção de Dados – Art. 52 <ArrowRight size={10} />
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* 3. Referência normativa (FIXO) */}
                      <div className="pt-6 border-t border-border/40">
                        <h5 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
                          Referência normativa
                        </h5>
                        <div className="bg-secondary/20 p-4 rounded-xl border border-border/30">
                          <p className="font-bold text-foreground text-sm">Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)</p>
                          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                            A LGPD estabelece princípios, direitos dos titulares e obrigações para organizações que realizam tratamento de dados pessoais no Brasil.
                          </p>
                          <div className="mt-4 pt-3 border-t border-border/30 flex flex-col gap-1">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase">Fonte oficial:</span>
                            <a href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                              https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm <ArrowRight size={10} />
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </motion.div>


          <p className="text-sm text-foreground/70 mt-6 mb-8" style={{ lineHeight: '1.6' }}>
            A exposição identificada não significa que um incidente esteja em andamento, mas indica que a infraestrutura apresenta lacunas exploráveis no cenário atual de ameaças. A inclusão de inspeção avançada, prevenção ativa e monitoramento contínuo reduz significativamente essa superfície de ataque.
          </p>

          {/* SIMULAÇÃO FINANCEIRA DE RISCO (NOVA SEÇÃO) */}
          <div className="mb-4">
            <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="text-orange-500" size={20} /> Simulação de Impacto Financeiro
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Impacto Potencial */}
              <div className="glass-card p-6 border-orange-500/30">
                <h4 className="text-lg font-bold text-foreground mb-4">Impacto financeiro potencial</h4>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-base text-muted-foreground">Score de exposição</span>
                    <span className="text-base font-bold text-foreground">{Math.round((riskScore / 135) * 100)}%</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-base text-muted-foreground">Impacto médio de incidente</span>
                    <span className="text-base font-bold text-foreground">R$ 300.000</span>
                  </div>
                </div>
                <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/20 text-center">
                  <p className="text-base text-orange-500 font-semibold mb-1">Impacto potencial estimado</p>
                  <p className="text-3xl font-extrabold text-foreground">
                    R$ {(300000 * (riskScore / 135)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>

              {/* Card Risco Financeiro Anual */}
              <div className="glass-card p-6 border-red-500/30">
                <h4 className="text-lg font-bold text-foreground mb-4">Risco financeiro anual estimado</h4>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-base text-muted-foreground">Impacto potencial estimado</span>
                    <span className="text-base font-bold text-foreground">
                      R$ {(300000 * (riskScore / 135)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/50">
                    <span className="text-base text-muted-foreground">Probabilidade anual estimada</span>
                    <span className="text-base font-bold text-foreground">
                      {riskScore >= 70 ? '30%' : riskScore >= 40 ? '15%' : '5%'}
                    </span>
                  </div>
                </div>
                <div className="bg-red-500/10 p-4 rounded-lg border border-red-500/20 text-center">
                  <p className="text-base text-red-500 font-semibold mb-1">Risco financeiro anual estimado</p>
                  <p className="text-3xl font-extrabold text-foreground">
                    R$ {annualRiskEstimate.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-secondary/20 border border-border/30">
              <p className="text-sm text-foreground/70 leading-relaxed text-center md:text-left">
                Cálculo estimado com base em impacto x probabilidade. Detalhes e fontes no botão ao lado.
              </p>
              <MethodologyModal score={riskScore} />
            </div>
          </div>
        </SectionContainer>

        {/* ── 4. SIMULAÇÃO DE ATAQUE (inalterada) ── */}
        <SimulationContainer
          title="Simulação de Ataque"
          attacks={[
            { id: 'ransomware', label: 'Ransomware Lateral' },
            { id: 'bruteforce', label: 'Força Bruta VPN' },
            { id: 'segmentation', label: 'Falha de Segmentação' },
          ]}
          currentAttack={simAttack}
          onAttackChange={setSimAttack}
          mode={simMode}
          onModeChange={setSimMode}
          running={simRunning}
          step={simStep}
          onRun={runSimulation}
          steps={attacks[simAttack][simMode]}
        />

        {/* ── 5. COMPARATIVO TÉCNICO (novo conteúdo com 4 colunas + filtros) ── */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3">Comparativo Técnico</h2>
          <p className="text-lg text-muted-foreground mb-6">Análise funcional entre firewall tradicional (stateful) e arquitetura NGFW gerenciada com monitoramento contínuo.</p>

          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { value: 'all' as CompCategory, label: 'Todos' },
              { value: 'security' as CompCategory, label: 'Segurança' },
              { value: 'operation' as CompCategory, label: 'Operação' },
              { value: 'governance' as CompCategory, label: 'Governança' },
            ].map((f) => (
              <Button key={f.value} variant={compFilter === f.value ? 'default' : 'outline'} size="sm"
                onClick={() => setCompFilter(f.value)}
                className={compFilter === f.value ? 'gradient-primary text-primary-foreground' : ''}
              >
                {f.label}
              </Button>
            ))}
          </div>

          <div className="glass-card p-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground font-semibold min-w-[160px]">Funcionalidade</TableHead>
                  <TableHead className="text-center text-muted-foreground min-w-[180px]">Firewall Stateful Tradicional</TableHead>
                  <TableHead className="text-center text-primary font-semibold min-w-[180px]">NGFW Gerenciado</TableHead>
                  <TableHead className="text-center text-foreground font-semibold min-w-[180px]">Impacto Prático</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCompRows.map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell className="text-base text-foreground font-semibold">{row.feature}</TableCell>
                    <TableCell className="text-sm text-center text-muted-foreground">{row.stateful}</TableCell>
                    <TableCell className="text-sm text-center text-foreground font-medium">{row.ngfw}</TableCell>
                    <TableCell className="text-sm text-center text-primary/90 font-medium">{row.impact}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* ── 6. MODELO OPERACIONAL DE SEGURANÇA ── */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-1">Grupo QOS / <span className="text-primary text-3xl font-extrabold">Concierge</span></h2>
          <p className="text-base text-muted-foreground mb-8">Contexto institucional e modelo de operação de segurança.</p>

          {/* 4 cards horizontais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Clock, title: '23 anos', desc: 'de atuação no mercado' },
              { icon: Award, title: 'ISO 27001', desc: 'Certificação de segurança' },
              { icon: MapPin, title: 'Porto Digital', desc: 'Sede em Recife' },
              { icon: Shield, title: 'SOC 24x7', desc: 'Monitoramento contínuo' },
            ].map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-5 text-center"
              >
                <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0 mx-auto mb-3">
                  <d.icon size={18} className="text-primary-foreground" />
                </div>
                <h4 className="text-base font-bold text-foreground">{d.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">{d.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Dois blocos lado a lado */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="glass-card p-8">
              <div className="flex items-center gap-4 mb-4">
                <img src={logoQos} alt="Logo QOS Tecnologia" className="h-10 object-contain rounded" />
                <h3 className="text-xl font-bold text-foreground">Sobre o Grupo QOS</h3>
              </div>
              <p className="text-base text-foreground/80 mb-4" style={{ lineHeight: '1.6' }}>
                O Grupo QOS atua há 23 anos no mercado de tecnologia e segurança da informação, com sede no Porto Digital em Recife. A Concierge Segurança Digital é a unidade especializada em serviços gerenciados de segurança.
              </p>
              <p className="text-base text-foreground/80" style={{ lineHeight: '1.6' }}>
                A empresa possui certificação ISO 27001, que atesta a conformidade do sistema de gestão de segurança da informação com padrões internacionais. Esta certificação exige controles rigorosos de segurança, processos documentados e auditorias periódicas.
              </p>
            </div>
            <div className="glass-card p-8">
              <h3 className="text-xl font-bold text-foreground mb-4">SOC — Security Operations Center</h3>
              <p className="text-base text-foreground/80 mb-4" style={{ lineHeight: '1.6' }}>
                O SOC (Security Operations Center — Centro de Operações de Segurança) funciona 24 horas por dia, 7 dias por semana, monitorando ambientes de clientes e respondendo a incidentes de segurança.
              </p>
              <p className="text-base text-foreground/80" style={{ lineHeight: '1.6' }}>
                A equipe do SOC é composta por analistas especializados em segurança de rede, resposta a incidentes e análise de ameaças. O monitoramento contínuo permite identificar e tratar eventos de segurança antes que causem impacto operacional.
              </p>
            </div>
          </div>

          {/* Tabela Reativa vs Contínua */}
          <div className="glass-card p-8 overflow-x-auto">
            <h3 className="text-xl font-bold text-foreground mb-6">Atuação reativa vs. operação contínua</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground font-semibold min-w-[140px]">Aspecto</TableHead>
                  <TableHead className="text-center text-muted-foreground min-w-[200px]">Atuação Reativa</TableHead>
                  <TableHead className="text-center text-primary font-semibold min-w-[200px]">Operação Contínua (SOC)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { aspect: 'Resposta a incidentes', reactive: 'Ação após identificação de problema pelo usuário ou indisponibilidade', continuous: 'Monitoramento contínuo com resposta antes do impacto operacional' },
                  { aspect: 'Atualizações de segurança', reactive: 'Aplicadas quando há tempo disponível ou após vulnerabilidade explorada', continuous: 'Planejadas e aplicadas proativamente, com validação de impacto' },
                  { aspect: 'Visibilidade de ameaças', reactive: 'Conhecimento limitado ao que causa problema visível', continuous: 'Análise contínua de logs e correlação de eventos suspeitos' },
                  { aspect: 'Conhecimento do ambiente', reactive: 'Dependência de documentação desatualizada ou memória da equipe', continuous: 'Baseline de comportamento normal e detecção de anomalias' },
                ].map((row) => (
                  <TableRow key={row.aspect}>
                    <TableCell className="text-sm text-foreground font-medium">{row.aspect}</TableCell>
                    <TableCell className="text-sm text-center text-muted-foreground">{row.reactive}</TableCell>
                    <TableCell className="text-sm text-center text-foreground">{row.continuous}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* ── 7. SIMULAÇÃO CONCIERGE (inalterada) ── */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
            <DollarSign className="text-primary" size={24} /> Simulação Concierge
          </h2>
          <p className="text-lg text-muted-foreground mb-8">Implantação, mensalidade e equipamento recomendado para o seu cenário.</p>

          {/* Bloco A – Resumo do Ambiente */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Usuários', value: profile.userCount },
              { label: 'Dispositivos', value: profile.deviceCount },
              { label: 'Links', value: profile.internetLinks.length },
              { label: 'Banda Total', value: `${rec.totalLinksMbps} Mbps` },
              { label: 'Perfil de Uso', value: usageLabel },
              { label: 'VPN Total', value: totalVpns },
              { label: 'VLANs', value: vlanCount },
              { label: 'SSL Inspection', value: profile.sslInspection ? 'Sim' : 'Não' },
            ].map((c) => (
              <div key={c.label} className="glass-card p-4 text-center">
                <p className="text-xs text-muted-foreground">{c.label}</p>
                <p className="text-lg font-bold text-foreground">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Bloco B – Investimento */}
          <div className="glass-card p-6 mb-8 mt-4">
            <h3 className="text-lg font-bold text-foreground mb-4">Investimento Estimado</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Implantação (R$)</Label>
                <Input type="number" value={implantacao || ''} onChange={(e) => setImplantacao(Number(e.target.value) || 0)} className="bg-secondary border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Mensalidade (R$)</Label>
                <Input type="number" value={mensalidade || ''} onChange={(e) => setMensalidade(Number(e.target.value) || 0)} className="bg-secondary border-border text-foreground" />
              </div>
              <div className="glass-card p-4 text-center flex flex-col justify-center border-primary/30">
                <p className="text-xs text-muted-foreground mb-1">Total 12 meses</p>
                <p className="text-2xl font-bold text-primary">R$ {total12.toLocaleString('pt-BR')}</p>
              </div>
            </div>

            {/* Comparativo com risco anual estimado */}
            <div className={`mt-6 p-6 rounded-lg border transition-all duration-300 ${implantacao === 0 && mensalidade === 0
              ? 'bg-secondary/10 border-border/30 opacity-60'
              : annualRiskEstimate - total12 > 0
                ? 'bg-emerald-500/5 border-emerald-500/20'
                : 'bg-secondary/20 border-border/50'
              }`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-foreground">Comparativo com risco anual estimado</h4>
                  <p className="text-sm text-muted-foreground">
                    {implantacao === 0 && mensalidade === 0
                      ? "Preencha os valores de investimento para simular a economia estimada."
                      : "Análise financeira comparando o investimento Concierge com o risco de exposição atual."}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 w-full md:w-auto">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Risco anual (diagnóstico)</p>
                    <p className="text-lg font-semibold text-foreground">R$ {annualRiskEstimate.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Investimento (anual)</p>
                    <p className="text-lg font-semibold text-foreground">R$ {total12.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="text-left md:text-right p-3 rounded bg-background/50 border border-border/30">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                      {annualRiskEstimate - total12 >= 0 ? "Economia estimada" : "Diferença estimada"}
                    </p>
                    <p className={`text-xl font-bold ${annualRiskEstimate - total12 >= 0 ? 'text-emerald-500' : 'text-foreground'}`}>
                      {annualRiskEstimate - total12 >= 0
                        ? `R$ ${(annualRiskEstimate - total12).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
                        : `R$ ${(total12 - annualRiskEstimate).toLocaleString('pt-BR', { maximumFractionDigits: 0 })} acima do risco`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/20 text-center md:text-left">
                <p className="text-[11px] text-muted-foreground">
                  Comparação baseada no risco anual estimado do cenário atual. Valores são estimativas e não representam eliminação total de risco.
                </p>
              </div>
            </div>
          </div>

          {/* Equipamento Recomendado */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
              <Server size={20} className="text-primary" /> Equipamento Recomendado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="glass-card p-6 text-center border-primary/30">
                <p className="text-sm text-muted-foreground mb-2">SonicWall</p>
                <p className="text-2xl font-bold text-primary">{rec.sonicwall.name}</p>
                <p className="text-xs text-muted-foreground mt-2">Até {rec.sonicwall.maxUsers} usuários • {rec.sonicwall.throughput} Mbps</p>
              </div>
              <div className="glass-card p-6 text-center border-primary/30">
                <p className="text-sm text-muted-foreground mb-2">Fortinet</p>
                <p className="text-2xl font-bold text-primary">{rec.fortinet.name}</p>
                <p className="text-xs text-muted-foreground mt-2">Até {rec.fortinet.maxUsers} usuários • {rec.fortinet.throughput} Mbps</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 8. DECISÃO E PRÓXIMOS PASSOS ── */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center">
            <img src={shieldConciergeLogo} alt="Shield Concierge" className="h-8 mr-2" />
            Caminho para Redução de Risco e Maturidade de Segurança
          </h2>
          <p className="text-lg text-muted-foreground mb-8">Jornada estruturada para evolução contínua da postura de segurança.</p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* LEFT COLUMN – 3/5 */}
            <div className="lg:col-span-3 space-y-6">
              {/* Questão para discussão */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8">
                <h3 className="text-lg font-bold text-foreground mb-4">Questão para discussão</h3>
                <p className="text-base text-foreground/80 mb-5" style={{ lineHeight: '1.6' }}>
                  A análise técnica indica que a infraestrutura atual opera sem camadas críticas de proteção. A evolução pode seguir dois caminhos distintos, cada um com implicações diferentes em termos de risco, investimento e maturidade operacional.
                </p>
                <p className="text-lg font-semibold text-primary mb-6">
                  Qual modelo de proteção é mais adequado ao momento atual da organização?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card p-4 text-center border-border/50 hover:border-primary/40 transition-colors cursor-pointer">
                    <Shield size={20} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm font-semibold text-foreground">Modelo A</p>
                    <p className="text-xs text-muted-foreground mt-1">Proteção Essencial</p>
                    <p className="text-xs text-foreground/60 mt-2" style={{ lineHeight: '1.5' }}>NGFW com IPS, filtro web e segmentação básica.</p>
                  </div>
                  <div className="glass-card p-4 text-center border-primary/30 hover:border-primary/50 transition-colors cursor-pointer">
                    <Layers size={20} className="mx-auto text-primary mb-2" />
                    <p className="text-sm font-semibold text-foreground">Modelo B</p>
                    <p className="text-xs text-primary mt-1">Operação Gerenciada</p>
                    <p className="text-xs text-foreground/60 mt-2" style={{ lineHeight: '1.5' }}>NGFW + SOC 24/7, SD-WAN e governança contínua.</p>
                  </div>
                </div>
              </motion.div>

              {/* Logo card */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8">
                <p className="text-sm font-medium text-muted-foreground mb-6 text-center">Parceria Técnica e Operacional</p>
                <div className="flex items-center justify-center gap-10">
                  <img src={castleLogo} alt="Concierge Castle" className="h-[120px] object-contain drop-shadow-lg" />
                  {profile.companyLogo && (
                    <img src={profile.companyLogo} alt="Logo da empresa" className="h-20 rounded-lg object-contain bg-secondary/30 p-2" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground/80 italic text-center mt-6">
                  A decisão será orientada por critérios técnicos, operacionais e financeiros.
                </p>
              </motion.div>
            </div>

            {/* RIGHT COLUMN – 2/5 */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold text-foreground mb-4">Próximos passos</h3>

              {[
                { icon: ClipboardList, title: 'Dimensionamento técnico', desc: 'Levantamento detalhado de requisitos, throughput e capacidade.' },
                { icon: Settings, title: 'Arquitetura recomendada', desc: 'Consolidação da topologia com NGFW, segmentação e SD-WAN.' },
                { icon: Presentation, title: 'Proposta formal', desc: 'Estruturação técnica e comercial para apresentação.' },
                { icon: Handshake, title: 'Apresentação executiva', desc: 'Reunião de alinhamento para decisão e cronograma.' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-5 flex items-start gap-4"
                >
                  <div className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <step.icon size={20} className="text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground">{step.title}</h4>
                    <p className="text-sm text-foreground/80 mt-1" style={{ lineHeight: '1.5' }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-5 border-primary/20 bg-primary/5 mt-4"
              >
                <p className="text-base text-foreground/90 font-medium" style={{ lineHeight: '1.6' }}>
                  O objetivo é garantir que a decisão de investimento esteja fundamentada em diagnóstico técnico, não em premissas comerciais.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default FirewallPage;
