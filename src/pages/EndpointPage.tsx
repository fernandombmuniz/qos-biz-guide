import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '@/context/ProfileContext';
import {
  Monitor, Laptop, Shield, Server, Smartphone, AlertTriangle, TrendingUp, Search, Users, Globe, ShieldAlert, ZapOff, Unlink, Clock,
  ShieldCheck, UserCheck, Activity, ExternalLink, CreditCard, Lock, Database, Coins, ArrowDownCircle, Percent
} from 'lucide-react';
import HeroHeader from '@/components/diagnostic/HeroHeader';
import SectionContainer from '@/components/diagnostic/SectionContainer';
import InfoCards from '@/components/diagnostic/InfoCards';
import DiagnosticCards from '@/components/diagnostic/DiagnosticCards';
import SimulationContainer from '@/components/diagnostic/SimulationContainer';

const EndpointPage = () => {
  const { profile } = useProfile();

  // --- Dynamic Risk Logic ---
  const endpointRisks = useMemo(() => {
    const risks = [];

    if (profile.protectionType !== 'edr') {
      risks.push({
        id: 'no-edr',
        label: 'Ausência de EDR/XDR',
        points: 40,
        description: 'Sem detecção e resposta avançada, o ambiente fica vulnerável a ameaças complexas e ataques zero-day que evadem defesas tradicionais.'
      });
    }

    if (profile.protectionType === 'signature') {
      risks.push({
        id: 'trad-av',
        label: 'Uso de Antivírus Tradicional',
        points: 25,
        description: 'A proteção baseada apenas em assinaturas é ineficaz contra malwares modernos, polimórficos e ataques sem arquivos.'
      });
    }

    if (!profile.autoUpdate) {
      risks.push({
        id: 'slow-patch',
        label: 'Patch Management Lento',
        points: 20,
        description: 'A ausência de atualizações automáticas deixa endpoints expostos a vulnerabilidades críticas conhecidas por longos períodos.'
      });
    }

    // Proxy for admin privileges: if IT team is small or BYOD is high, or just as a common risk factor
    if (profile.itTeamSize > 0 || profile.byod) {
      risks.push({
        id: 'local-admin',
        label: 'Privilégios Administrativos Locais',
        points: 15,
        description: 'Usuários com permissões de administrador podem desativar controles de segurança e facilitar a persistência de malwares.'
      });
    }

    if (profile.byod) {
      risks.push({
        id: 'byod-risk',
        label: 'Dispositivos BYOD sem Controle',
        points: 15,
        description: 'Equipamentos pessoais sem gestão corporativa introduzem sombras na visibilidade de segurança e riscos de vazamento de dados.'
      });
    }

    if (profile.devicesOutOfDomain) {
      risks.push({
        id: 'out-domain',
        label: 'Endpoints fora do Domínio',
        points: 20,
        description: 'Dispositivos fora da gerência centralizada do diretório dificultam a aplicação de GPOs e políticas de conformidade.'
      });
    }

    if (!profile.centralConsole) {
      risks.push({
        id: 'no-logs',
        label: 'Ausência de Logs Centralizados',
        points: 15,
        description: 'A falta de centralização de eventos impede a correlação de incidentes e a resposta rápida a anomalias no ambiente.'
      });
    }

    if (!profile.monitoring247) {
      risks.push({
        id: 'no-behavioral',
        label: 'Sem Monitoramento Comportamental',
        points: 30,
        description: 'Sem uma camada de análise 24/7 focada em comportamento, ataques furtivos podem permanecer ativos por meses sem detecção.'
      });
    }

    return risks;
  }, [profile]);

  // --- Dynamic Scoring Logic (3 Pillars) ---
  const pillarScores = useMemo(() => {
    // Pillar 1: Proteção do dispositivo (AV: 30, EDR: 40, AutoUpdate: 30)
    let p1 = 0;
    if (profile.protectionType === 'signature' || profile.protectionType === 'edr') p1 += 30;
    if (profile.protectionType === 'edr') p1 += 40;
    if (profile.autoUpdate) p1 += 30;

    // Pillar 2: Exposição humana (MFA: 40, !BYOD: 30, !LocalAdmin Proxy: 30)
    let p2 = 0;
    if (profile.vpnMfa) p2 += 40;
    if (!profile.byod) p2 += 30;
    if (profile.itTeamSize > 2) p2 += 30; // Proxy for better control over admin privileges

    // Pillar 3: Capacidade de detecção (Logs: 30, Behavioral: 40, Tools/EDR: 30)
    let p3 = 0;
    if (profile.centralConsole) p3 += 30;
    if (profile.monitoring247) p3 += 40;
    if (profile.protectionType === 'edr') p3 += 30;

    return {
      protection: p1,
      exposure: p2,
      detection: p3,
      final: Math.floor((p1 + p2 + p3) / 3)
    };
  }, [profile]);

  const riskScore = pillarScores.final;
  const [displayRiskScore, setDisplayRiskScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 800;
    const increment = riskScore / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= riskScore) {
        setDisplayRiskScore(riskScore);
        clearInterval(timer);
      } else {
        setDisplayRiskScore(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [riskScore]);

  // Exposure level logic (Updated Classification)
  const getExposureLevel = (score: number) => {
    if (score >= 76) return { label: 'Baixo', color: 'bg-emerald-500', textColor: 'text-emerald-500', gradientClass: 'bg-gradient-to-r from-emerald-400 to-emerald-500' };
    if (score >= 51) return { label: 'Moderado', color: 'bg-yellow-500', textColor: 'text-yellow-500', gradientClass: 'bg-gradient-to-r from-yellow-400 to-yellow-500' };
    if (score >= 26) return { label: 'Elevado', color: 'bg-orange-500', textColor: 'text-orange-500', gradientClass: 'bg-gradient-to-r from-orange-400 to-orange-500' };
    return { label: 'Crítico', color: 'bg-red-500', textColor: 'text-red-500', gradientClass: 'bg-gradient-to-r from-red-500 to-red-600' };
  };

  const exposure = getExposureLevel(riskScore);

  // Simulation states
  const [simAttack, setSimAttack] = useState('ransomware');
  const [simMode, setSimMode] = useState<'without' | 'with'>('without');
  const [simRunning, setSimRunning] = useState(false);
  const [simStep, setSimStep] = useState(0);

  const attacks = [
    { id: 'ransomware', label: 'Ransomware no Endpoint' },
    { id: 'phishing', label: 'Phishing Direcionado' },
  ];

  const steps = {
    ransomware: {
      without: ['Download de anexo malicioso', 'Execução de script fileless', 'Criptografia de arquivos locais', 'Propagação via rede lateral', 'Operação interrompida'],
      with: ['Download de anexo malicioso', 'EDR detecta comportamento anômalo', 'Processo isolado automaticamente', 'SOC 24/7 notificado', 'Ameaça eliminada com sucesso'],
    },
    phishing: {
      without: ['Link malicioso acessado', 'Credenciais digitadas em site falso', 'Acesso não autorizado ao e-mail', 'Exfiltração de dados sensíveis'],
      with: ['Link malicioso acessado', 'Navegação segura bloqueia o site', 'Alerta gerado no painel central', 'Credenciais permanecem seguras'],
    }
  };

  const runSimulation = () => {
    setSimStep(0);
    setSimRunning(true);
    const s = steps[simAttack as keyof typeof steps][simMode];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setSimStep(i);
      if (i >= s.length) clearInterval(interval);
    }, 800);
  };

  // --- Attack Impact Simulation Logic ---
  const [selectedScenario, setSelectedScenario] = useState('ransomware');

  const scenarios = [
    {
      id: 'ransomware',
      label: 'Ransomware',
      icon: ShieldAlert,
      color: 'text-red-500',
      description: 'Criptografia em massa de arquivos com interrupção total das operações.',
      baseImpact: 5000, // per device
      probFactor: 1.2
    },
    {
      id: 'credentials',
      label: 'Roubo de Credenciais',
      icon: Lock,
      color: 'text-orange-500',
      description: 'Acesso não autorizado a contas corporativas para fraude ou espionagem.',
      baseImpact: 8000, // per user
      probFactor: 1.5
    },
    {
      id: 'compromise',
      label: 'Comprometimento',
      icon: Monitor,
      color: 'text-amber-500',
      description: 'Infiltração silenciosa para movimentação lateral e persistência.',
      baseImpact: 3500, // per device
      probFactor: 1.0
    },
    {
      id: 'exfiltration',
      label: 'Exfiltração de Dados',
      icon: Database,
      color: 'text-indigo-500',
      description: 'Vazamento de informações sensíveis e impacto regulatório direto.',
      baseImpact: 12000, // per user
      probFactor: 0.8
    }
  ];

  const currentScenario = scenarios.find(s => s.id === selectedScenario) || scenarios[0];

  const simulationResults = useMemo(() => {
    // Probability is inverse to score (High score = low probability)
    // Base probability between 5% and 45% based on risk score
    const baseProb = Math.max(5, 50 - (riskScore * 0.45));
    const probability = Math.min(48, Math.floor(baseProb * currentScenario.probFactor));

    // Impact calculation
    const count = (selectedScenario === 'ransomware' || selectedScenario === 'compromise')
      ? (profile.deviceCount || 10)
      : (profile.userCount || 10);

    // Scale impact by protection type (EDR reduces impact by 60%, AV by 20%)
    let mitigation = 1.0;
    if (profile.protectionType === 'edr') mitigation = 0.4;
    else if (profile.protectionType === 'signature') mitigation = 0.8;

    const impact = Math.floor(count * currentScenario.baseImpact * mitigation);
    const annualRisk = Math.floor(impact * (probability / 100));

    return { probability, impact, annualRisk };
  }, [riskScore, currentScenario, profile, selectedScenario]);

  // --- Concierge Simulation Logic ---
  const [implCost, setImplCost] = useState('0');
  const [monthlyCost, setMonthlyCost] = useState('0');

  const conciergeResults = useMemo(() => {
    const impl = parseFloat(implCost) || 0;
    const monthly = parseFloat(monthlyCost) || 0;
    const annualServiceCost = impl + (monthly * 12);

    // Concierge reduces overall risk significantly
    // Probability reduction: 85%
    // Impact reduction: 50%
    const currentTotalALE = simulationResults.annualRisk;
    const mitigatedALE = currentTotalALE * 0.15 * 0.5;
    const riskReduction = currentTotalALE - mitigatedALE;
    const savings = riskReduction - annualServiceCost;

    return {
      annualServiceCost,
      riskReduction,
      savings,
      roi: annualServiceCost > 0 ? (savings / annualServiceCost) * 100 : 0
    };
  }, [implCost, monthlyCost, simulationResults.annualRisk]);

  return (
    <div className="min-h-screen bg-transparent pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-20">

        <HeroHeader
          title="Concierge"
          titleAccent="Endpoint"
          subtitle="Diagnóstico de Segurança de Endpoints"
          companyName={profile.companyName}
          companyLogo={profile.companyLogo}
          contactName={profile.contactName}
          contactRole={profile.contactRole}
          icon={Monitor}
        />

        <SectionContainer title="Visão Geral do Ambiente Endpoint">
          <div className="space-y-8">
            {/* Main Cards Row */}
            <InfoCards
              cards={[
                { icon: Users, label: 'Usuários', value: profile.userCount || "Não informado" },
                { icon: Laptop, label: 'Dispositivos', value: profile.deviceCount || "Não informado" },
                {
                  icon: Shield,
                  label: 'Managed Endpoints',
                  value: profile.deviceCount ? (profile.deviceCount - (profile.outOfDomainCount || 0)) : "Não informado"
                },
                { icon: Monitor, label: 'Unmanaged Endpoints', value: profile.outOfDomainCount || "Não informado" },
              ]}
            />

            {/* Additional Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* OS Group */}
              <div className="glass-card p-6 border-border/40">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                  <Monitor size={16} /> Sistemas Operacionais
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">Windows</span>
                    <span className="text-sm font-bold text-foreground">{profile.endpointsWindows || "Não informado"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">macOS</span>
                    <span className="text-sm font-bold text-foreground">{profile.endpointsMac || "Não informado"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">Linux</span>
                    <span className="text-sm font-bold text-foreground">{profile.linuxServerCount || "Não informado"}</span>
                  </div>
                </div>
              </div>

              {/* Work Environment Group */}
              <div className="glass-card p-6 border-border/40">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                  <Globe size={16} /> Ambiente de Trabalho
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">Endpoints Remotos</span>
                    <span className="text-sm font-bold text-foreground">{profile.vpnRemoteAccess || "Não informado"}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">Dispositivos BYOD</span>
                    <span className="text-sm font-bold text-foreground">{profile.byod ? 'Sim' : 'Não'}</span>
                  </div>
                </div>
              </div>

              {/* Existing Protection Group */}
              <div className="glass-card p-6 border-border/40">
                <h4 className="text-sm font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                  <Shield size={16} /> Proteção Existente
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">Antivírus Existente</span>
                    <span className="text-sm font-bold text-foreground">{profile.protectionType === 'signature' ? 'Sim' : 'Não'}</span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-border/30">
                    <span className="text-sm text-muted-foreground">EDR Existente</span>
                    <span className="text-sm font-bold text-foreground">{profile.protectionType === 'edr' ? 'Sim' : 'Não'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionContainer>

        <SectionContainer title="Superfície de Ataque Humana" icon={Users} iconColor="text-blue-500">
          <p className="text-lg text-foreground/80 mb-8" style={{ lineHeight: '1.6' }}>
            Análise de riscos baseada no comportamento e privilégios dos usuários. O fator humano continua sendo o elo mais explorado em vetores de ataque iniciais.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Privilégio Administrativo',
                value: profile.itTeamSize || 0,
                risk: 'Contas com altos privilégios são alvos primários para controle total do ambiente.',
                icon: Shield
              },
              {
                label: 'Usuários Remotos',
                value: profile.vpnRemoteAccess || 0,
                risk: 'Acessos externos ampliam a exposição a ataques de força bruta e interceptação.',
                icon: Globe
              },
              {
                label: 'Dispositivos Pessoais (BYOD)',
                value: profile.byod ? (profile.outOfDomainCount || profile.userCount || 0) : 0,
                risk: 'Dispositivos pessoais sem gerência direta aumentam o risco de vazamento e infecções.',
                icon: Smartphone
              },
              {
                label: 'Sem MFA Ativo',
                value: !profile.vpnMfa ? (profile.userCount || 0) : 0,
                risk: 'A falta de um segundo fator torna as credenciais vulneráveis a phishing e força bruta.',
                icon: AlertTriangle
              }
            ].map((item, i) => (
              <div key={i} className="glass-card p-6 flex flex-col h-full border-border/40 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon size={20} className="text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">{item.value === 0 ? '0' : item.value}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Usuários</span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-foreground mb-2">{item.label}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-auto">
                  {item.risk}
                </p>
              </div>
            ))}
          </div>
        </SectionContainer>

        <SectionContainer title="Superfície de Ataque de Dispositivos" icon={Shield} iconColor="text-indigo-500">
          <p className="text-lg text-foreground/80 mb-8" style={{ lineHeight: '1.6' }}>
            Avaliação técnica de vulnerabilidades e conformidade dos endpoints. Dispositivos sem proteção moderna ou fora de gerência centralizada representam as maiores brechas de segurança.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Endpoints sem Antivírus',
                value: profile.protectionType === 'none' ? (profile.deviceCount || 0) : 0,
                risk: 'Endpoints sem proteção básica são vulneráveis a malwares conhecidos e explorações simples.',
                icon: ShieldAlert
              },
              {
                label: 'Endpoints sem EDR',
                value: profile.protectionType !== 'edr' ? (profile.deviceCount || 0) : 0,
                risk: 'A ausência de detecção comportamental permite que ameaças avançadas operem sem serem detectadas.',
                icon: ZapOff
              },
              {
                label: 'Endpoints fora do Domínio',
                value: profile.outOfDomainCount || 0,
                risk: 'Dispositivos fora do domínio dificultam a aplicação de políticas de segurança e a visibilidade centralizada.',
                icon: Unlink
              },
              {
                label: 'Endpoints sem Atualização',
                value: !profile.autoUpdate ? (profile.deviceCount || 0) : 0,
                risk: 'Sistemas desatualizados possuem vulnerabilidades críticas conhecidas que são facilmente exploradas.',
                icon: Clock
              }
            ].map((item, i) => (
              <div key={i} className="glass-card p-6 flex flex-col h-full border-border/40 hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
                    <item.icon size={20} className="text-indigo-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">
                      {profile.deviceCount === 0 && (item.label !== 'Endpoints fora do Domínio' || profile.outOfDomainCount === 0)
                        ? 'Não informado'
                        : item.value}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Dispositivos</span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-foreground mb-2">{item.label}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed mt-auto">
                  {item.risk}
                </p>
              </div>
            ))}
          </div>
        </SectionContainer>

        <SectionContainer title="Diagnóstico de Segurança de Endpoint" icon={AlertTriangle} iconColor="text-destructive">
          <p className="text-lg text-foreground/80 mb-8" style={{ lineHeight: '1.6' }}>
            Avaliação focada na segurança das estações de trabalho e servidores. A camada de endpoint é hoje o principal alvo de ataques de ransomware e roubo de credenciais.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: 'Proteção do dispositivo',
                score: pillarScores.protection,
                icon: ShieldCheck,
                color: 'text-emerald-500',
                bg: 'bg-emerald-500/10'
              },
              {
                title: 'Exposição humana',
                score: pillarScores.exposure,
                icon: UserCheck,
                color: 'text-blue-500',
                bg: 'bg-blue-500/10'
              },
              {
                title: 'Capacidade de detecção',
                score: pillarScores.detection,
                icon: Activity,
                color: 'text-indigo-500',
                bg: 'bg-indigo-500/10'
              }
            ].map((pillar, i) => (
              <div key={i} className="glass-card p-6 border-border/40 relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-lg ${pillar.bg} flex items-center justify-center`}>
                    <pillar.icon size={20} className={pillar.color} />
                  </div>
                  <span className={`text-2xl font-bold ${pillar.color}`}>{pillar.score}</span>
                </div>
                <h4 className="text-sm font-bold text-foreground mb-4">{pillar.title}</h4>
                <div className="w-full bg-secondary/30 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${pillar.color.replace('text-', 'bg-')}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pillar.score}%` }}
                    transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                  />
                </div>
              </div>
            ))}
          </div>

          <DiagnosticCards
            title="Postura de Segurança Final"
            subtitle="Média ponderada dos três pilares fundamentais de segurança de endpoint."
            score={riskScore}
            maxScore={100}
            exposure={exposure}
            displayScore={displayRiskScore}
            risks={endpointRisks}
          />
        </SectionContainer>

        <SimulationContainer
          title="Simulação de Ataque"
          attacks={attacks}
          currentAttack={simAttack}
          onAttackChange={setSimAttack}
          mode={simMode}
          onModeChange={setSimMode}
          running={simRunning}
          step={simStep}
          onRun={runSimulation}
          steps={steps[simAttack as keyof typeof steps][simMode]}
        />

        <SectionContainer title="Simulação de Impacto de Ataque" icon={TrendingUp} iconColor="text-orange-500">
          <p className="text-lg text-foreground/80 mb-8" style={{ lineHeight: '1.6' }}>
            Estimativa de impacto financeiro baseada em cenários reais de incidentes em endpoints, considerando seu atual nível de maturidade e controle.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
            {scenarios.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedScenario(s.id)}
                className={`glass-card p-4 transition-all border text-left flex flex-col gap-3 ${selectedScenario === s.id
                  ? 'border-primary ring-1 ring-primary/30 bg-primary/5'
                  : 'border-border/40 hover:border-primary/20'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${s.color.replace('text-', 'bg-')}/10 flex items-center justify-center shrink-0`}>
                    <s.icon size={16} className={s.color} />
                  </div>
                  <span className="text-sm font-bold text-foreground">{s.label}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {s.description}
                </p>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 border-orange-500/30">
              <div className="flex items-center gap-2 mb-4 text-orange-500 text-sm font-bold uppercase tracking-wider">
                <AlertTriangle size={16} /> Probabilidade Estimada
              </div>
              <div className="space-y-4">
                <div className="text-4xl font-extrabold text-foreground">{simulationResults.probability}%</div>
                <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${simulationResults.probability}%` }}
                    transition={{ duration: 1 }}
                  />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Chance anual de ocorrência baseada no seu Security Posture Score.
                </p>
              </div>
            </div>

            <div className="glass-card p-6 border-red-500/30">
              <div className="flex items-center gap-2 mb-4 text-red-500 text-sm font-bold uppercase tracking-wider">
                <CreditCard size={16} /> Impacto Financeiro
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Impacto direto estimado</div>
                <div className="text-3xl font-extrabold text-foreground">
                  R$ {simulationResults.impact.toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Custo de remediação, perda de produtividade e multas regulatórias aplicáveis.
                </p>
              </div>
            </div>

            <div className="glass-card p-6 border-indigo-500/30 bg-indigo-500/5">
              <div className="flex items-center gap-2 mb-4 text-indigo-500 text-sm font-bold uppercase tracking-wider">
                <TrendingUp size={16} /> Risco Anual Médio
              </div>
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Expectativa anual de perda (ALE)</div>
                <div className="text-3xl font-extrabold text-foreground">
                  R$ {simulationResults.annualRisk.toLocaleString('pt-BR')}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border/30">
                <p className="text-xs text-muted-foreground leading-relaxed italic">
                  Budget recomendado para investimento anual em proteção para mitigar este cenário.
                </p>
              </div>
            </div>
          </div>
        </SectionContainer>

        <SectionContainer title="Simulação Concierge Endpoint" icon={ShieldCheck} iconColor="text-emerald-500">
          <p className="text-lg text-foreground/80 mb-8" style={{ lineHeight: '1.6' }}>
            A solução Concierge Endpoint combina tecnologia EDR de última geração com monitoramento 24/7 e resposta a incidentes, reduzindo drasticamente o risco residual do seu ambiente.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="glass-card p-6 border-primary/20 bg-primary/5">
                <h4 className="text-sm font-bold uppercase tracking-wider text-primary mb-6 flex items-center gap-2">
                  <Coins size={16} /> Detalhes do Investimento
                </h4>
                <div className="space-y-4 text-left">
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase font-bold">Valor de Implantação</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                      <input
                        type="text"
                        value={implCost}
                        onChange={(e) => setImplCost(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-background/50 border border-border/50 rounded-lg py-2 pl-10 pr-4 text-foreground font-bold focus:border-primary outline-none transition-colors"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-muted-foreground uppercase font-bold">Valor Mensal (Serviço)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">R$</span>
                      <input
                        type="text"
                        value={monthlyCost}
                        onChange={(e) => setMonthlyCost(e.target.value.replace(/\D/g, ''))}
                        className="w-full bg-background/50 border border-border/50 rounded-lg py-2 pl-10 pr-4 text-foreground font-bold focus:border-primary outline-none transition-colors"
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card p-6 border-border/40 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold uppercase tracking-widest mb-4">
                    <Clock size={14} /> Custo Total Anual
                  </div>
                  <div className="text-3xl font-extrabold text-foreground tracking-tight">
                    R$ {conciergeResults.annualServiceCost.toLocaleString('pt-BR')}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                  Investimento total em segurança gerenciada para proteção de 100% dos seus endpoints ativos.
                </p>
              </div>

              <div className="glass-card p-6 border-emerald-500/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold uppercase tracking-widest mb-4">
                    <ArrowDownCircle size={14} /> Redução de Risco
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-400 tracking-tight">
                    R$ {conciergeResults.riskReduction.toLocaleString('pt-BR')}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                  Valor financeiro que deixa de estar exposto anualmente através da mitigação proativa.
                </p>
              </div>

              <div className="md:col-span-2 glass-card p-6 border-primary/40 bg-primary/10 flex items-center justify-between group overflow-hidden relative">
                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-widest mb-3">
                    <TrendingUp size={14} /> ROI - Economia Potencial Estimada
                  </div>
                  <div className="text-5xl font-black text-foreground tracking-tighter">
                    R$ {conciergeResults.savings.toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="relative z-10 text-right">
                  <div className="text-xs text-muted-foreground uppercase font-bold mb-1">Impacto no Capex</div>
                  <div className="text-2xl font-bold text-primary">+{conciergeResults.roi.toFixed(0)}%</div>
                </div>
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 -skew-x-12 translate-x-16 group-hover:translate-x-8 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </SectionContainer>

        <SectionContainer title="Como o diagnóstico foi calculado" icon={Search} iconColor="text-primary">
          <div className="space-y-8">
            <div className="prose prose-invert max-w-none">
              <p className="text-lg text-foreground/80 leading-relaxed">
                O diagnóstico de segurança de endpoints considera controles recomendados por frameworks internacionais de cibersegurança. Esses controles ajudam a reduzir a superfície de ataque de dispositivos corporativos e melhorar a capacidade de detecção de ameaças.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Proteção do dispositivo',
                  desc: 'Higiene cibernética, endurecimento (hardening) e conformidade técnica das estações.',
                  icon: ShieldCheck,
                  color: 'text-emerald-500',
                  bg: 'bg-emerald-500/10'
                },
                {
                  title: 'Exposição humana',
                  desc: 'Gestão de privilégios, comportamento do usuário e vetores de engenharia social.',
                  icon: UserCheck,
                  color: 'text-blue-500',
                  bg: 'bg-blue-500/10'
                },
                {
                  title: 'Capacidade de detecção',
                  desc: 'Visibilidade proativa, análise comportamental e agilidade na resposta a incidentes.',
                  icon: Activity,
                  color: 'text-indigo-500',
                  bg: 'bg-indigo-500/10'
                }
              ].map((pillar, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 border-border/40"
                >
                  <div className={`w-12 h-12 rounded-xl ${pillar.bg} flex items-center justify-center mb-4`}>
                    <pillar.icon size={24} className={pillar.color} />
                  </div>
                  <h4 className="text-base font-bold text-foreground mb-2">{pillar.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {pillar.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="glass-card p-8 border-primary/20 bg-primary/5">
              <p className="text-base text-foreground/90 mb-6 italic" style={{ lineHeight: '1.6' }}>
                "Esse modelo de avaliação é inspirado em abordagens utilizadas por plataformas modernas de proteção de endpoints."
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border/30">
                <div>
                  <h5 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">CIS Critical Security Controls v8</h5>
                  <a
                    href="https://www.cisecurity.org/controls"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline font-medium"
                  >
                    cisecurity.org/controls <ExternalLink size={14} />
                  </a>
                </div>
                <div>
                  <h5 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">NIST Cybersecurity Framework</h5>
                  <a
                    href="https://www.nist.gov/cyberframework"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline font-medium"
                  >
                    nist.gov/cyberframework <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </SectionContainer>

      </div>
    </div>
  );
};

export default EndpointPage;
