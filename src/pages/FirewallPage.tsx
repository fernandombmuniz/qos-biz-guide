import { useState, useMemo } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { recommend } from '@/utils/firewallRecommendation';
import { motion } from 'framer-motion';
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
    description: 'Grande parte das ameaças modernas trafegam criptografadas. Sem inspeção SSL ativa, malware, ransomware e comunicação com servidores de comando e controle podem atravessar o perímetro sem análise adequada.\nBase técnica: Relatórios globais de laboratórios de segurança 2024–2025 indicam crescimento contínuo de ataques criptografados como vetor de evasão.\n\nFonte: FortiGuard Labs Threat Landscape Report 2024 e SonicWall Cyber Threat Report 2025.',
    check: (p) => !p.sslInspection,
  },
  {
    id: 'no-vlan',
    label: 'Segmentação de Rede Inexistente',
    points: 15,
    description: 'Ambientes sem VLANs permitem movimentação lateral após comprometimento inicial, ampliando a superfície de ataque interna.\n\nFonte: CISA Zero Trust Maturity Model 2024; NIST SP 800-207; Microsoft Digital Defense Report 2024.',
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
    description: 'Ataques modernos exploram credenciais comprometidas como principal vetor de entrada. A ausência de MFA aumenta significativamente o risco de acesso não autorizado.\n\nFonte: Relatórios globais de segurança de identidade 2024 indicam que credenciais comprometidas continuam sendo principal vetor inicial de ataque.',
    check: (p) => p.usesVpn && !p.vpnMfa,
  },
  {
    id: 'no-policy',
    label: 'Operação Apenas Reativa',
    points: 10,
    description: 'Ambientes administrados apenas de forma reativa tendem a responder tardiamente a incidentes, ampliando impacto operacional.',
    check: (p) => !p.securityPolicy,
  },
];

const getExposureLevel = (score: number) => {
  if (score <= 25) return { label: 'Baixo', color: 'bg-emerald-500', textColor: 'text-emerald-500' };
  if (score <= 55) return { label: 'Moderado', color: 'bg-yellow-500', textColor: 'text-yellow-500' };
  if (score <= 90) return { label: 'Elevado', color: 'bg-orange-500', textColor: 'text-orange-500' };
  return { label: 'Crítico', color: 'bg-red-500', textColor: 'text-red-500' };
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
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-20">

        {/* ── 1. HEADER / CONTEXTO DO CLIENTE ── */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {profile.companyLogo && (
              <img src={profile.companyLogo} alt="Logo da empresa" className="h-16 rounded-lg object-contain bg-secondary/50 p-1" />
            )}
            <img src={logoConcierge} alt="Concierge" className="h-14 rounded-lg object-contain" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Arquitetura de Proteção Perimetral</h1>
            <p className="text-muted-foreground mt-2">
              Ambiente analisado para <span className="text-primary font-semibold">{profile.companyName || '—'}</span>
            </p>
          </div>
          {(profile.contactName || profile.contactRole) && (
            <p className="text-sm text-muted-foreground">
              Contato principal: <span className="text-foreground">{profile.contactName}</span>
              {profile.contactRole && <> — <span className="text-foreground">{profile.contactRole}</span></>}
            </p>
          )}
        </motion.section>

        {/* ── 2. VISÃO GERAL DO AMBIENTE ── */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6">Visão Geral do Ambiente</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Users, label: 'Usuários', value: profile.userCount },
              { icon: Laptop, label: 'Dispositivos', value: profile.deviceCount },
              { icon: Globe, label: 'Links', value: profile.internetLinks.length },
              { icon: Lock, label: 'VPNs', value: totalVpns },
            ].map((c) => (
              <motion.div key={c.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-5 text-center">
                <c.icon className="mx-auto text-primary mb-2" size={24} />
                <p className="text-2xl font-bold text-foreground">{c.value}</p>
                <p className="text-xs text-muted-foreground">{c.label}</p>
              </motion.div>
            ))}
          </div>

          {(profile.increaseUsers || profile.increaseDevices) && (
            <div className="glass-card p-4 mb-6">
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <TrendingUp size={14} className="text-primary" />
                Crescimento previsto:
                {profile.increaseUsers && <span className="text-foreground ml-1">Usuários ({profile.userGrowthEstimate || 'sim'})</span>}
                {profile.increaseUsers && profile.increaseDevices && <span>•</span>}
                {profile.increaseDevices && <span className="text-foreground ml-1">Dispositivos ({profile.deviceGrowthEstimate || 'sim'})</span>}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5 space-y-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Globe size={14} className="text-primary" /> Links de Internet</h4>
              {profile.internetLinks.map((l, i) => (
                <p key={i} className="text-xs text-muted-foreground">
                  {l.provider || `Link ${i + 1}`} — {l.speed || '—'}
                  {l.increaseSpeed && <span className="text-primary ml-1">(aumento previsto)</span>}
                </p>
              ))}
              <p className="text-xs text-foreground font-medium pt-1 border-t border-border/50">Banda total: {rec.totalLinksMbps} Mbps</p>
            </div>

            <div className="glass-card p-5 space-y-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Network size={14} className="text-primary" /> Segmentação</h4>
              <p className="text-xs text-muted-foreground">VLANs: {profile.hasVlan ? `${profile.vlanCount} — ${profile.vlanNames || '—'}` : 'Não utiliza'}</p>
              <p className="text-xs text-muted-foreground">VPN S2S: {profile.vpnSiteToSite} | Remota: {profile.vpnRemoteAccess}</p>
            </div>

            <div className="glass-card p-5 space-y-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Wifi size={14} className="text-primary" /> Access Points</h4>
              {profile.hasAP ? (
                <p className="text-xs text-muted-foreground">{profile.apBrand} {profile.apModel} — Qtd: {profile.apQuantity}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Não possui</p>
              )}
            </div>

            <div className="glass-card p-5 space-y-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Server size={14} className="text-primary" /> Switches Gerenciáveis</h4>
              {profile.managedSwitch ? (
                <p className="text-xs text-muted-foreground">{profile.switchBrand} {profile.switchModel} — Qtd: {profile.switchCount}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Não possui</p>
              )}
            </div>

            <div className="glass-card p-5 space-y-2 md:col-span-2">
              <h4 className="text-sm font-semibold text-foreground flex items-center gap-2"><Activity size={14} className="text-primary" /> Arquitetura Adicional</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
                <p><Phone size={12} className="inline mr-1 text-primary" />VoIP: {optionLabel(profile.voipOption, profile.voipText)}</p>
                <p><Network size={12} className="inline mr-1 text-primary" />SD-WAN: {optionLabel(profile.sdwanOption, profile.sdwanText)}</p>
                <p><Layers size={12} className="inline mr-1 text-primary" />Load Balancer: {optionLabel(profile.loadBalancerOption, profile.loadBalancerText)}</p>
                <p><Activity size={12} className="inline mr-1 text-primary" />QoS: {optionLabel(profile.qosOption, profile.qosText)}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. RISCOS IDENTIFICADOS (score dinâmico) ── */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="text-destructive" size={20} /> Riscos Identificados
          </h2>

          <p className="text-base text-foreground/80 mb-8" style={{ lineHeight: '1.6' }}>
            Com base nas informações capturadas no onboarding, avaliamos a exposição da infraestrutura frente às principais tendências de ameaça observadas em 2024 e 2025. A classificação considera ausência ou presença de controles críticos de segurança, segmentação, visibilidade e prevenção.
          </p>

          {/* Score geral */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-base font-semibold text-foreground">Score Geral de Exposição</p>
                <p className="text-sm text-muted-foreground">Máximo possível: 135 pontos</p>
              </div>
              <div className="text-right">
                <p className={`text-4xl font-bold ${exposure.textColor}`}>{riskScore}</p>
                <p className={`text-base font-bold ${exposure.textColor}`}>{exposure.label}</p>
              </div>
            </div>
            <div className="w-full bg-secondary rounded-full h-3.5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${exposure.color}`}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((riskScore / 135) * 100, 100)}%` }}
                transition={{ duration: 1.2 }}
              />
            </div>
            {activeRisks.length > 0 && (
              <p className="text-sm text-muted-foreground mt-3">
                Controles ausentes: {activeRisks.map((r) => r.label).join(', ')}.
              </p>
            )}
          </motion.div>

          {/* Risk vector cards – expandable */}
          {activeRisks.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <CheckCircle2 className="mx-auto text-success mb-2" size={32} />
              <p className="text-foreground font-medium">Nenhum risco crítico detectado na camada de firewall.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeRisks.map((risk, i) => {
                const descParts = risk.description.split('\n\nFonte:');
                return (
                  <motion.div
                    key={risk.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <Collapsible>
                      <div className="glass-card p-5">
                        <CollapsibleTrigger className="w-full text-left group">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-foreground text-base">{risk.label}</h4>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-bold ${exposure.textColor}`}>+{risk.points} pts</span>
                              <ChevronDown size={16} className="text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
                            </div>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${exposure.color}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${(risk.points / 30) * 100}%` }}
                              transition={{ duration: 1, delay: i * 0.15 }}
                            />
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="mt-4 pt-3 border-t border-border/30">
                            <p className="text-sm text-foreground/80" style={{ lineHeight: '1.6' }}>
                              {descParts[0]}
                            </p>
                            {descParts[1] && (
                              <p className="text-xs text-muted-foreground/60 mt-3 italic">Fonte:{descParts[1]}</p>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  </motion.div>
                );
              })}
            </div>
          )}

          <p className="text-base text-foreground/80 mt-6" style={{ lineHeight: '1.6' }}>
            A exposição identificada não significa que um incidente esteja em andamento, mas indica que a infraestrutura apresenta lacunas exploráveis no cenário atual de ameaças. A inclusão de inspeção avançada, prevenção ativa e monitoramento contínuo reduz significativamente essa superfície de ataque.
          </p>

          {/* Metodologia de Cálculo */}
          <div className="mt-8 glass-card p-5">
            <h4 className="text-sm font-semibold text-muted-foreground mb-2">Metodologia de Cálculo do Score</h4>
            <p className="text-sm text-foreground/70" style={{ lineHeight: '1.6' }}>
              O Score de Risco é calculado com base em matriz de probabilidade × impacto, considerando exposição técnica, ausência de controles críticos e superfície de ataque ativa. A pontuação considera frameworks reconhecidos internacionalmente como NIST Cybersecurity Framework (2024 update), MITRE ATT&CK Enterprise 2025, CIS Controls v8.1 e dados estatísticos do relatório IBM Cost of a Data Breach 2024.
            </p>

            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-1 text-sm text-primary/70 hover:text-primary mt-3 transition-colors">
                <ChevronDown size={14} className="transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
                Ver metodologia detalhada
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-3 pt-3 border-t border-border/30 space-y-2 text-sm text-foreground/60" style={{ lineHeight: '1.6' }}>
                  <p>• Probabilidade estimada com base em vetores ativos documentados no MITRE ATT&CK 2025</p>
                  <p>• Impacto estimado com base em:</p>
                  <p className="pl-3">— Custo médio de incidente (IBM 2024: US$ 4.45M média global)</p>
                  <p className="pl-3">— Tempo médio de detecção sem SOC (Mandiant 2024: 16 a 21 dias)</p>
                  <p className="pl-3">— Exploração de edge devices (Verizon DBIR 2024: 30%+ incidentes envolvendo dispositivos expostos)</p>
                  <p className="mt-2">• Classificação: 0–40 Baixo | 41–70 Moderado | 71–100 Crítico</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </section>

        {/* ── 4. SIMULAÇÃO DE ATAQUE (inalterada) ── */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6">Simulação de Ataque</h2>
          <div className="glass-card p-6">
            <div className="flex flex-wrap gap-3 mb-6">
              {[
                { value: 'ransomware', label: 'Ransomware Lateral' },
                { value: 'bruteforce', label: 'Força Bruta VPN' },
                { value: 'segmentation', label: 'Falha de Segmentação' },
              ].map((a) => (
                <Button key={a.value} variant={simAttack === a.value ? 'default' : 'outline'} size="sm"
                  onClick={() => { setSimAttack(a.value); setSimRunning(false); setSimStep(0); }}
                  className={simAttack === a.value ? 'gradient-primary text-primary-foreground' : ''}
                >
                  {a.label}
                </Button>
              ))}
            </div>
            <div className="flex gap-3 mb-6">
              <Button variant={simMode === 'without' ? 'default' : 'outline'} size="sm"
                onClick={() => { setSimMode('without'); setSimRunning(false); setSimStep(0); }}
                className={simMode === 'without' ? 'gradient-danger text-danger-foreground' : ''}
              >
                <XCircle size={14} className="mr-1" /> Sem Concierge
              </Button>
              <Button variant={simMode === 'with' ? 'default' : 'outline'} size="sm"
                onClick={() => { setSimMode('with'); setSimRunning(false); setSimStep(0); }}
                className={simMode === 'with' ? 'gradient-success text-success-foreground' : ''}
              >
                <CheckCircle2 size={14} className="mr-1" /> Com Concierge
              </Button>
              <Button variant="outline" size="sm" onClick={runSimulation} className="ml-auto">
                <Play size={14} className="mr-1" /> Executar
              </Button>
            </div>
            <div className="space-y-3">
              {attacks[simAttack][simMode].map((step, i) => {
                const isActive = simRunning && i < simStep;
                const isCurrent = simRunning && i === simStep - 1;
                const isLast = i === attacks[simAttack][simMode].length - 1;
                const isSuccess = simMode === 'with' && isLast;
                const isDanger = simMode === 'without' && isLast;
                return (
                  <motion.div key={i} initial={{ opacity: 0.3 }} animate={{ opacity: isActive ? 1 : 0.3 }}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isCurrent ? (isSuccess ? 'bg-emerald-500/10 border border-emerald-500/30' : isDanger ? 'bg-red-500/10 border border-red-500/30' : 'bg-primary/10 border border-primary/30') : 'bg-secondary/30'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isActive ? (isSuccess ? 'gradient-success' : isDanger ? 'gradient-danger' : 'gradient-primary') : 'bg-secondary'} text-primary-foreground`}>
                      {i + 1}
                    </div>
                    <span className={`text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{step}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 5. COMPARATIVO TÉCNICO (novo conteúdo com 4 colunas + filtros) ── */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">Comparativo Técnico</h2>
          <p className="text-base text-muted-foreground mb-6">Análise funcional entre firewall tradicional (stateful) e arquitetura NGFW gerenciada com monitoramento contínuo.</p>

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
                    <TableCell className="text-sm text-foreground font-medium">{row.feature}</TableCell>
                    <TableCell className="text-xs text-center text-muted-foreground">{row.stateful}</TableCell>
                    <TableCell className="text-xs text-center text-foreground">{row.ngfw}</TableCell>
                    <TableCell className="text-xs text-center text-primary/80">{row.impact}</TableCell>
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
            <div className="glass-card p-6">
              <h3 className="text-base font-bold text-foreground mb-3">Sobre o Grupo QOS</h3>
              <p className="text-sm text-foreground/80 mb-3" style={{ lineHeight: '1.6' }}>
                O Grupo QOS atua há 23 anos no mercado de tecnologia e segurança da informação, com sede no Porto Digital em Recife. A Concierge Segurança Digital é a unidade especializada em serviços gerenciados de segurança.
              </p>
              <p className="text-sm text-foreground/80" style={{ lineHeight: '1.6' }}>
                A empresa possui certificação ISO 27001, que atesta a conformidade do sistema de gestão de segurança da informação com padrões internacionais. Esta certificação exige controles rigorosos de segurança, processos documentados e auditorias periódicas.
              </p>
            </div>
            <div className="glass-card p-6">
              <h3 className="text-base font-bold text-foreground mb-3">SOC — Security Operations Center</h3>
              <p className="text-sm text-foreground/80 mb-3" style={{ lineHeight: '1.6' }}>
                O SOC (Security Operations Center — Centro de Operações de Segurança) funciona 24 horas por dia, 7 dias por semana, monitorando ambientes de clientes e respondendo a incidentes de segurança.
              </p>
              <p className="text-sm text-foreground/80" style={{ lineHeight: '1.6' }}>
                A equipe do SOC é composta por analistas especializados em segurança de rede, resposta a incidentes e análise de ameaças. O monitoramento contínuo permite identificar e tratar eventos de segurança antes que causem impacto operacional.
              </p>
            </div>
          </div>

          {/* Tabela Reativa vs Contínua */}
          <div className="glass-card p-6 overflow-x-auto">
            <h3 className="text-base font-bold text-foreground mb-4">Atuação reativa vs. operação contínua</h3>
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
          <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
            <DollarSign className="text-primary" size={20} /> Simulação Concierge
          </h2>
          <p className="text-sm text-muted-foreground mb-6">Implantação, mensalidade e equipamento recomendado para o seu cenário.</p>

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
          <div className="glass-card p-6 mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-4">Investimento Estimado</h3>
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
          </div>

          {/* Equipamento Recomendado */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Server size={16} className="text-primary" /> Equipamento Recomendado
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="glass-card p-5 text-center border-primary/30">
                <p className="text-xs text-muted-foreground mb-1">SonicWall</p>
                <p className="text-xl font-bold text-primary">{rec.sonicwall.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Até {rec.sonicwall.maxUsers} usuários • {rec.sonicwall.throughput} Mbps</p>
              </div>
              <div className="glass-card p-5 text-center border-primary/30">
                <p className="text-xs text-muted-foreground mb-1">Fortinet</p>
                <p className="text-xl font-bold text-primary">{rec.fortinet.name}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Até {rec.fortinet.maxUsers} usuários • {rec.fortinet.throughput} Mbps</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado em <span className="text-foreground">{profile.userCount}</span> usuários, <span className="text-foreground">{rec.adjustedMbps.toFixed(0)} Mbps</span> ajustados (perfil {usageLabel}), <span className="text-foreground">{totalVpns}</span> VPNs e <span className="text-foreground">{vlanCount}</span> VLANs.
            </p>
            <p className="text-[10px] text-muted-foreground/60 italic mt-3">
              O dimensionamento final pode ser refinado após validação técnica detalhada.
            </p>
          </div>
        </section>

        {/* ── 8. DECISÃO E PRÓXIMOS PASSOS ── */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">Caminho para Redução de Risco e Maturidade de Segurança</h2>
          <p className="text-base text-muted-foreground mb-8">Jornada estruturada para evolução contínua da postura de segurança.</p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* LEFT COLUMN – 3/5 */}
            <div className="lg:col-span-3 space-y-6">
              {/* Questão para discussão */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                <h3 className="text-base font-bold text-foreground mb-3">Questão para discussão</h3>
                <p className="text-sm text-foreground/80 mb-4" style={{ lineHeight: '1.6' }}>
                  A análise técnica indica que a infraestrutura atual opera sem camadas críticas de proteção. A evolução pode seguir dois caminhos distintos, cada um com implicações diferentes em termos de risco, investimento e maturidade operacional.
                </p>
                <p className="text-base font-semibold text-primary mb-5">
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
                    <p className="text-xs text-foreground/60 mt-2" style={{ lineHeight: '1.5' }}>NGFW + SOC 24/7, DPI-SSL, SD-WAN e governança contínua.</p>
                  </div>
                </div>
              </motion.div>

              {/* Logo card */}
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                <p className="text-xs text-muted-foreground mb-4 text-center">Parceria técnica e operacional</p>
                <div className="flex items-center justify-center gap-8">
                  <img src={castleLogo} alt="Concierge Castle" className="h-20 object-contain drop-shadow-lg" />
                  {profile.companyLogo && (
                    <img src={profile.companyLogo} alt="Logo da empresa" className="h-16 rounded-lg object-contain bg-secondary/50 p-1" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground/60 italic text-center mt-4">
                  A decisão será orientada por critérios técnicos, operacionais e financeiros.
                </p>
              </motion.div>
            </div>

            {/* RIGHT COLUMN – 2/5 */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-base font-bold text-foreground mb-2">Próximos passos</h3>

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
                  className="glass-card p-4 flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <step.icon size={16} className="text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{step.title}</h4>
                    <p className="text-sm text-foreground/70 mt-0.5" style={{ lineHeight: '1.5' }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-4 border-primary/20 bg-primary/5"
              >
                <p className="text-sm text-foreground/80" style={{ lineHeight: '1.6' }}>
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
