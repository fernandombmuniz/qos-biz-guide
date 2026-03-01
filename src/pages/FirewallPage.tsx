import { useState, useMemo } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { detectAllRisks } from '@/utils/pdfExport';
import { recommend } from '@/utils/firewallRecommendation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import {
  Shield, Users, Laptop, Globe, Lock, AlertTriangle, TrendingUp,
  CheckCircle2, XCircle, Play, Wifi, Server, Phone, Network,
  Activity, Building2, Award, Clock, FileText, Layers, DollarSign,
} from 'lucide-react';
import logoConcierge from '@/assets/logo-concierge.jpg';

/* ─── helpers ─── */
const yesNo = (v: boolean) => (v ? 'Sim' : 'Não');
const optionLabel = (v: string, text: string) =>
  v === 'yes' ? 'Sim' : v === 'other' ? text || 'Outro' : 'Não';

/* ─── risk sources ─── */
const riskSources: Record<string, string> = {
  'Firewall Inexistente': 'Fonte: IBM Security — Cost of a Data Breach Report 2023.',
  'VPN sem MFA': 'Fonte: Verizon Data Breach Investigations Report 2023.',
  'Sem IDS/IPS': 'Fonte: ENISA Threat Landscape 2023.',
  'Sem Inspeção SSL': 'Fonte: IBM Security — Cost of a Data Breach Report 2023.',
  'Sem segmentação VLAN': 'Fonte: NIST SP 800-41 Rev.1.',
  'VoIP sem QoS': 'Fonte: Cisco Voice over IP Performance Monitoring.',
  'VPN sem monitoramento de logs': 'Fonte: Verizon Data Breach Investigations Report 2023.',
  'Licença do Firewall expirada': 'Fonte: ENISA Threat Landscape 2023.',
};

/* ─── reactive vs continuous table data ─── */
const reactiveRows = [
  { aspect: 'Resposta a incidentes', reactive: 'Ação após impacto.', continuous: 'Detecção e contenção antecipada.' },
  { aspect: 'Atualizações', reactive: 'Aplicadas quando necessário.', continuous: 'Rotina preventiva.' },
  { aspect: 'Visibilidade', reactive: 'Limitada.', continuous: 'Correlação e monitoramento contínuo.' },
  { aspect: 'Conformidade', reactive: 'Reativa.', continuous: 'Logs estruturados e rastreáveis.' },
];

/* ─── comparative table data ─── */
const compRows = [
  { feature: 'Objetivo', stateful: 'Controle por portas.', ngfw: 'Inspeção profunda por aplicação.' },
  { feature: 'IPS/IDS', stateful: 'Limitado ou inexistente.', ngfw: 'Integrado e atualizado.' },
  { feature: 'Inspeção SSL', stateful: 'Não realiza.', ngfw: 'Permite inspeção criptografada.' },
  { feature: 'Controle de aplicações', stateful: 'Não identifica aplicações modernas.', ngfw: 'Controle por aplicação (Layer 7).' },
  { feature: 'Web Filtering', stateful: 'Básico.', ngfw: 'Categorias e políticas.' },
  { feature: 'SD-WAN', stateful: 'Failover simples.', ngfw: 'Roteamento inteligente.' },
  { feature: 'Logs', stateful: 'Básicos.', ngfw: 'Integração com monitoramento.' },
  { feature: 'Operação', stateful: 'Manual.', ngfw: 'Gerenciado pelo SOC 24/7.' },
];

/* ─── main component ─── */
const FirewallPage = () => {
  const { profile } = useProfile();
  const risks = detectAllRisks(profile).filter((r) => r.category === 'firewall');

  // Simulation state
  const [simAttack, setSimAttack] = useState('ransomware');
  const [simMode, setSimMode] = useState<'without' | 'with'>('without');
  const [simRunning, setSimRunning] = useState(false);
  const [simStep, setSimStep] = useState(0);

  // Simulação Concierge – local investment inputs
  const [implantacao, setImplantacao] = useState(0);
  const [mensalidade, setMensalidade] = useState(0);
  const total12 = implantacao + mensalidade * 12;

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

  /* ───────── render ───────── */
  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-20">

        {/* ── 1. CABEÇALHO PERSONALIZADO ── */}
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

        {/* ── 3. RISCOS IDENTIFICADOS ── */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <AlertTriangle className="text-danger" size={20} /> Riscos Identificados
          </h2>
          {risks.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <CheckCircle2 className="mx-auto text-success mb-2" size={32} />
              <p className="text-foreground font-medium">Nenhum risco crítico detectado na camada de firewall.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {risks.map((risk, i) => (
                <motion.div
                  key={risk.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground text-sm">{risk.title}</h4>
                    <span className={`text-sm font-bold ${risk.severity >= 80 ? 'text-danger' : risk.severity >= 60 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                      {risk.severity}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{risk.description}</p>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${risk.severity >= 80 ? 'gradient-danger' : risk.severity >= 60 ? 'bg-yellow-400' : 'bg-muted-foreground'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${risk.severity}%` }}
                      transition={{ duration: 1, delay: i * 0.15 }}
                    />
                  </div>
                  {riskSources[risk.title] && (
                    <p className="text-[10px] text-muted-foreground/60 mt-2 italic">{riskSources[risk.title]}</p>
                  )}
                </motion.div>
              ))}
            </div>
          )}
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
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isCurrent ? (isSuccess ? 'bg-success/10 border border-success/30' : isDanger ? 'bg-danger/10 border border-danger/30' : 'bg-primary/10 border border-primary/30') : 'bg-secondary/30'}`}
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

        {/* ── 5. SIMULAÇÃO CONCIERGE ── */}
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

        {/* ── 6. ARQUITETURA CONCIERGE ── */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">Arquitetura Concierge</h2>
          <p className="text-sm text-muted-foreground mb-6">Modelo operacional de segurança gerenciada para perímetro e continuidade.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {[
              { icon: Shield, title: 'SOC 24/7', desc: 'Monitoramento contínuo com análise de eventos e resposta a incidentes.' },
              { icon: Clock, title: '23 anos de mercado (Grupo QOS)', desc: 'Experiência consolidada em redes e segurança em ambientes críticos.' },
              { icon: Award, title: 'ISO 27001', desc: 'Processos alinhados às melhores práticas de gestão de segurança.' },
              { icon: Layers, title: 'Firewall como serviço (Concierge)', desc: 'Operação contínua com governança e visibilidade.' },
            ].map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-card p-5"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <d.icon size={18} className="text-primary-foreground" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">{d.title}</h4>
                </div>
                <p className="text-xs text-muted-foreground">{d.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Atuação Reativa vs Operação Contínua */}
          <h3 className="text-sm font-semibold text-foreground mb-3">Atuação Reativa vs Operação Contínua</h3>
          <div className="glass-card p-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground font-semibold">Aspecto</TableHead>
                  <TableHead className="text-center text-muted-foreground">Atuação Reativa</TableHead>
                  <TableHead className="text-center text-primary font-semibold">Operação Contínua (SOC Concierge)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reactiveRows.map((row) => (
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

        {/* ── 7. COMPARATIVO TÉCNICO ── */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-2">Comparativo Técnico</h2>
          <p className="text-sm text-muted-foreground mb-6">Firewall Stateful vs NGFW Gerenciado Concierge</p>
          <div className="glass-card p-6 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-foreground font-semibold">Recurso</TableHead>
                  <TableHead className="text-center text-muted-foreground">Firewall Stateful</TableHead>
                  <TableHead className="text-center text-primary font-semibold">NGFW Gerenciado Concierge</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compRows.map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell className="text-sm text-foreground font-medium">{row.feature}</TableCell>
                    <TableCell className="text-sm text-center text-muted-foreground">{row.stateful}</TableCell>
                    <TableCell className="text-sm text-center text-foreground">{row.ngfw}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* ── 8. CONCEITO CASTELO ── */}
        <section className="text-center space-y-8 pb-8">
          <div className="glass-card p-10 max-w-2xl mx-auto space-y-6">
            <div className="relative mx-auto w-48 h-48 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-border/30" />
              <div className="absolute -top-2 left-1/2 -translate-x-1/2"><Users size={16} className="text-muted-foreground" /></div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2"><Server size={16} className="text-muted-foreground" /></div>
              <div className="absolute top-1/2 -left-2 -translate-y-1/2"><Globe size={16} className="text-muted-foreground" /></div>
              <div className="absolute top-1/2 -right-2 -translate-y-1/2"><Laptop size={16} className="text-muted-foreground" /></div>
              <div className="w-24 h-24 rounded-xl gradient-primary flex items-center justify-center shadow-lg shadow-primary/20">
                <Building2 size={36} className="text-primary-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-foreground font-medium leading-relaxed">
                A proteção não é apenas um equipamento.
              </p>
              <p className="text-primary font-semibold">
                É uma arquitetura contínua de defesa.
              </p>
            </div>

            <div className="flex items-center justify-center gap-4 text-[10px] text-muted-foreground/50">
              <span>Firewall</span>
              <span>•</span>
              <span>SOC 24/7</span>
              <span>•</span>
              <span>Monitoramento</span>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default FirewallPage;
