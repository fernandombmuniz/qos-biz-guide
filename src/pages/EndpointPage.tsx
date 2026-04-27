import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/context/ProfileContext';
import {
  Monitor, Laptop, Shield, Server, Smartphone, AlertTriangle, TrendingUp, Search, Users, Globe, ShieldAlert, ZapOff, Unlink, Clock,
  ShieldCheck, UserCheck, Activity, ExternalLink, CreditCard, Lock, Database, Coins, ArrowDownCircle, Percent, ChevronDown, CheckCircle2, DollarSign, Award, MapPin, FileCheck, ArrowRight,
  Presentation, Handshake, Target, Crosshair, HelpCircle, Info, Download, Trash2, Zap, LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';
import {
  Collapsible, CollapsibleTrigger, CollapsibleContent,
} from '@/components/ui/collapsible';

import logoQos from '@/assets/logo_qostecnologia.jpg';
import shieldConciergeLogo from '@/assets/shieldconcierge.png';

import HeroHeader from '@/components/diagnostic/HeroHeader';
import SectionContainer from '@/components/diagnostic/SectionContainer';
import InfoCards from '@/components/diagnostic/InfoCards';
import SimulationContainer from '@/components/diagnostic/SimulationContainer';
import EndpointMethodologyModal from '@/components/diagnostic/EndpointMethodologyModal';
import DiagnosticCards from '@/components/diagnostic/DiagnosticCards';

import { useEndpointScore } from '@/hooks/useEndpointScore';

const EndpointPage = () => {
  const { profile } = useProfile();
  const { diagnosticData, riskScore, exposure, lgpdData } = useEndpointScore();

  const [displayRiskScore, setDisplayRiskScore] = useState(0);
  const [displayLgpdScore, setDisplayLgpdScore] = useState(0);

  // Simulation state
  const [selectedScenario, setSelectedScenario] = useState('ransomware');
  const [simMode, setSimMode] = useState<'without' | 'with'>('without');
  const [simRunning, setSimRunning] = useState(false);
  const [simStep, setSimStep] = useState(0);

  useEffect(() => {
    if (diagnosticData.insufficientData) return;
    
    // Risk Score Animation
    let startRisk = 0;
    const duration = 800;
    const incrementRisk = riskScore / (duration / 16);
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
    const incrementLgpd = lgpdData.score / (duration / 16);
    const timerLgpd = setInterval(() => {
      startLgpd += incrementLgpd;
      if (startLgpd >= lgpdData.score) {
        setDisplayLgpdScore(lgpdData.score);
        clearInterval(timerLgpd);
      } else {
        setDisplayLgpdScore(Math.floor(startLgpd));
      }
    }, 16);

    return () => {
      clearInterval(timerRisk);
      clearInterval(timerLgpd);
    };
  }, [riskScore, lgpdData.score, diagnosticData.insufficientData]);

  /* ── attack sim data ── */
  const attacks: Record<string, { without: string[]; with: string[] }> = {
    ransomware: {
      without: [
        'Usuário recebe e-mail de phishing convincente',
        'Payload malicioso é baixado e executado localmente',
        'Antivírus tradicional não detecta (malware polimórfico)',
        'Escalação de privilégios via credenciais em cache',
        'Criptografia de arquivos locais e mapeamentos de rede',
        'Operação paralisada: Resgate exigido em criptomoedas'
      ],
      with: [
        'Usuário recebe e-mail de phishing convincente',
        'EDR detecta execução de processo suspeito (PowerShell)',
        'Bloqueio imediato da execução por IA comportamental',
        'SOC 24/7 recebe alerta e isola o host automaticamente',
        'Incidente contido em minutos: Zero impacto nos dados'
      ],
    },
    credentials: {
      without: [
        'Atacante utiliza credenciais vazadas em fóruns',
        'Tentativa de login bem-sucedida (ausência de MFA)',
        'Acesso remoto estabelecido em estação de trabalho',
        'Extração silenciosa de segredos de negócio e e-mails',
        'Vazamento massivo de dados sensíveis da empresa'
      ],
      with: [
        'Atacante tenta utilizar credenciais vazadas',
        'Solicitação de MFA bloqueia o acesso inicial',
        'Login suspeito de localidade incomum gera alerta',
        'SOC invalida credenciais e força troca de senhas',
        'Ataque neutralizado na camada de autenticação'
      ],
    },
    lateral: {
      without: [
        'Notebook pessoal (BYOD) comprometido conecta na rede',
        'Ausência de monitoramento no endpoint desprotegido',
        'Atacante inicia scanner de rede e movimentação lateral',
        'Servidor de arquivos acessado via vulnerabilidade local',
        'Toda a infraestrutura comprometida a partir de um host'
      ],
      with: [
        'Notebook pessoal tenta conexão suspeita na rede',
        'EDR identifica atividade de scanner lateral proibida',
        'Isolamento imediato do host pela política Zero-Trust',
        'Analista do SOC confirma ameaça e inicia remediação',
        'Rede protegida: Atacante não conseguiu se propagar'
      ],
    },
  };

  const runSimulation = () => {
    setSimStep(0);
    setSimRunning(true);
    const steps = attacks[selectedScenario][simMode];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setSimStep(i);
      if (i >= steps.length) clearInterval(interval);
    }, 1000);
  };

  const scenarios = [
    { id: 'ransomware', label: 'Ransomware', icon: ShieldAlert, color: 'text-red-500', description: 'Criptografia total e paralisia.' },
    { id: 'credentials', label: 'Roubo de Contas', icon: Lock, color: 'text-orange-500', description: 'Infiltração via credenciais capturadas.' },
    { id: 'lateral', label: 'Movimentação Lateral', icon: Unlink, color: 'text-indigo-500', description: 'Propagação de ameaças na rede interna.' }
  ];

  const financialImpact = useMemo(() => {
    const baseImpact = selectedScenario === 'ransomware' ? 350000 : (selectedScenario === 'credentials' ? 200000 : 250000);
    const prob = riskScore < 25 ? 0.35 : (riskScore < 50 ? 0.25 : (riskScore < 75 ? 0.15 : 0.08));
    const impact = baseImpact * (profile.deviceCount / 20 || 1); // Escalonamento por tamanho
    const ale = impact * prob;

    return { impact, ale, prob: Math.round(prob * 100) };
  }, [riskScore, selectedScenario, profile.deviceCount]);

  if (!profile.onboardingComplete && diagnosticData.insufficientData) {
    return (
      <div className="min-h-screen pt-24 px-4 pb-16 flex items-center justify-center">
        <div className="glass-card max-w-lg w-full p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
          <AlertTriangle size={48} className="text-yellow-500" />
          <h2 className="text-2xl font-bold text-foreground">Ambiente Endpoint Não Avaliado</h2>
          <p>Dados insuficientes para gerar o diagnóstico de segurança. Preencha o onboarding de Endpoints para continuar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-20">

        {/* 1. HERO HEADER */}
        <HeroHeader
          title="Concierge"
          titleAccent="Endpoint"
          subtitle="Security Assessment"
          companyName={profile.companyName}
          companyLogo={profile.companyLogo}
          contactName={profile.contactName}
          contactRole={profile.contactRole}
          icon={Monitor}
        />

        {/* 2. VISÃO GERAL DO AMBIENTE */}
        <SectionContainer title="Visão Geral do Ambiente Endpoint">
          <InfoCards
            cards={[
              { icon: Users, label: 'Usuários Totais', value: profile.userCount || '0' },
              { icon: Laptop, label: 'Estações / Laptops', value: profile.deviceCount || '0' },
              { icon: Server, label: 'Servidores Win/Linux', value: (profile.hasWindowsServer ? 1 : 0) + (profile.hasLinuxServer ? 1 : 0) || '0' },
              { icon: Smartphone, label: 'BYOD Ativos', value: profile.byod ? 'Sim' : 'Não' },
            ]}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass-card p-5 space-y-2">
              <h4 className="text-lg font-semibold text-foreground flex items-center gap-2"><Monitor size={18} className="text-primary" /> Inventário de Ativos</h4>
              <p className="text-sm text-muted-foreground">Endpoints Windows: {profile.deviceCount}</p>
              <p className="text-sm text-muted-foreground">Servidores: {profile.hasWindowsServer ? 'Windows' : ''} {profile.hasLinuxServer ? 'Linux' : ''}</p>
              <p className="text-sm text-foreground font-medium pt-2 border-t border-border/50 mt-1">Superfície Total: {profile.deviceCount + (profile.hasWindowsServer ? 1 : 0)} dispositivos</p>
            </div>

            <div className="glass-card p-5 space-y-2">
              <h4 className="text-lg font-semibold text-foreground flex items-center gap-2"><UserCheck size={18} className="text-primary" /> Perfil de Usuário</h4>
              <p className="text-sm text-muted-foreground">Acesso Remoto (VPN): {profile.vpnRemoteAccess > 0 ? 'Habilitado' : 'Não utiliza'}</p>
              <p className="text-sm text-muted-foreground">MFA em Acesso Remoto: {profile.vpnMfa ? 'Sim' : 'Não'}</p>
              <p className="text-sm text-muted-foreground">Usuários com Admin Local: {profile.itTeamSize > 0 ? 'Limitado' : 'Não informado'}</p>
            </div>
          </div>
        </SectionContainer>

        {/* 3. DIAGNÓSTICO DE SEGURANÇA */}
        <SectionContainer title="Diagnóstico de Segurança Endpoint" icon={AlertTriangle} iconColor="text-destructive">
          <p className="text-lg text-foreground/80 mb-8 leading-relaxed">
            Avaliamos a resiliência dos seus dispositivos frente a ataques de nova geração (Ransomware 2.0, Exploits fileless e roubo de credenciais). A análise considera não apenas o software de proteção, mas o comportamento humano e a visibilidade operacional.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'Proteção do Dispositivo', score: diagnosticData.p1Score, icon: ShieldCheck, color: 'text-emerald-500', desc: 'EDR, AV e Atualizações' },
              { label: 'Exposição Humana', score: diagnosticData.p2Score, icon: UserCheck, color: 'text-blue-500', desc: 'Admin, MFA e BYOD' },
              { label: 'Capacidade de Detecção', score: diagnosticData.p3Score, icon: Activity, color: 'text-indigo-500', desc: 'Logs, SOC e Resposta' }
            ].map((p, i) => (
              <div key={i} className="glass-card p-6 border-border/40 hover:border-primary/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{p.label}</p>
                  <p className={`text-2xl font-black ${p.color}`}>{p.score}%</p>
                </div>
                <p className="text-xs text-muted-foreground mb-4">{p.desc}</p>
                <div className="w-full bg-secondary/30 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${p.score}%` }} 
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className={`h-full ${p.color.replace('text-', 'bg-')}`} 
                  />
                </div>
              </div>
            ))}
          </div>

          <DiagnosticCards
            title="Score de Postura de Segurança"
            subtitle="Maturidade técnica baseada nos pilares de proteção, exposição e detecção."
            score={riskScore}
            maxScore={100}
            displayScore={displayRiskScore}
            exposure={exposure}
            risks={diagnosticData.risks}
            emptyMessage="Nenhum risco crítico detectado na camada de endpoint."
          />

          {/* LGPD SCORE COLLAPSIBLE */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mt-8">
            <Collapsible>
              <div className="glass-card p-6 border-l-4 border-l-blue-500">
                <CollapsibleTrigger className="w-full text-left group">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-lg font-bold text-foreground">Score de Exposição LGPD (Endpoint)</p>
                      <p className="text-base text-muted-foreground mt-1 pr-6">Conformidade técnica sobre o dado pessoal residente nos dispositivos finais.</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`text-3xl md:text-5xl font-extrabold ${lgpdData.exposure?.textColor}`}>{displayLgpdScore}%</p>
                          <p className={`text-base md:text-lg font-bold ${lgpdData.exposure?.label} mt-1`}>{lgpdData.exposure?.label}</p>
                        </div>
                        <ChevronDown size={28} className="text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${lgpdData.exposure?.gradientClass}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${lgpdData.score}%` }}
                      transition={{ duration: 1.2, ease: 'easeOut' }}
                    />
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="mt-6 pt-6 border-t border-border/40">
                    <h4 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                      <FileCheck size={20} className="text-blue-500" /> Implicações Regulatórias
                    </h4>
                    <div className="space-y-6">
                      {lgpdData.articles.map((art, idx) => (
                        <div key={idx} className="border-l-2 border-primary/30 pl-4 py-1">
                          <h6 className="font-bold text-foreground text-base mb-1">{art.title}</h6>
                          <p className="text-sm text-foreground/80 leading-relaxed mb-2">{art.desc}</p>
                        </div>
                      ))}
                      <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl mt-4">
                        <p className="text-sm text-foreground/90">
                          A negligência na proteção do endpoint é um dos principais gatilhos para multas da ANPD, podendo chegar a <span className="font-bold">2% do faturamento</span>.
                        </p>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </motion.div>
        </SectionContainer>

        {/* 4. FATORES DE RISCO */}
        <SectionContainer title="Fatores de Risco no Ambiente" icon={Target} iconColor="text-primary">
            <p className="text-lg text-muted-foreground mb-8">Ao identificar a ausência dos controles a seguir, o ambiente é considerado "ofuscado" e vulnerável a ameaças modernas:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {diagnosticData.risks.map((risk, idx) => (
                    <div key={idx} className="glass-card p-5 border-l-2 border-l-orange-500 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-secondary text-primary rounded-full tracking-wider">{risk.source}</span>
                             <h4 className="font-bold text-foreground text-base tracking-tight">{risk.label}</h4>
                          </div>
                          <span className="text-[10px] font-black text-orange-500 uppercase">Impacto: {risk.points >= 35 ? 'Crítico' : 'Alto'}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed mt-3">{risk.description}</p>
                    </div>
                ))}
                {diagnosticData.risks.length === 0 && (
                  <div className="col-span-2 text-center py-12 glass-card border-dashed">
                     <p className="text-muted-foreground">Nenhum fator de risco crítico detectado com base nas informações fornecidas.</p>
                  </div>
                )}
            </div>
        </SectionContainer>

        {/* 5. SIMULAÇÃO DE IMPACTO */}
        <SectionContainer title="Simulação de Impacto Financeiro" icon={TrendingUp} iconColor="text-orange-500">
            <p className="text-muted-foreground mb-8 text-lg">Baseado no modelo <span className="font-bold text-foreground">ALE (Annualized Loss Expectancy)</span>, estimamos a exposição financeira anual em caso de incidentes graves:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {scenarios.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => setSelectedScenario(s.id)}
                  className={`glass-card p-6 text-left transition-all border-2 relative overflow-hidden group ${selectedScenario === s.id ? 'border-primary ring-4 ring-primary/10 bg-primary/5' : 'border-transparent opacity-60 hover:opacity-100 hover:bg-secondary/30'}`}
                >
                  <div className={`absolute -right-4 -top-4 opacity-5 transition-transform group-hover:scale-110 ${selectedScenario === s.id ? 'opacity-10' : ''}`}>
                    <s.icon size={100} />
                  </div>
                  <s.icon className={`${s.color} mb-4`} size={32} />
                  <p className="font-bold text-lg mb-1">{s.label}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-8 border-orange-500/30 bg-orange-500/5">
                <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-4">Impacto por Incidente Grave</p>
                <div className="flex items-baseline gap-2">
                   <p className="text-5xl font-black text-foreground">R$ {Math.round(financialImpact.impact).toLocaleString('pt-BR')}</p>
                </div>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">Considerando custos de forense, restauração de backup, multas regulatórias e inatividade operacional.</p>
              </div>
              <div className="glass-card p-8 border-red-500/30 bg-red-500/5">
                 <p className="text-xs font-black uppercase tracking-widest text-red-500 mb-4">Risco Financeiro Anual (ALE)</p>
                 <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-black text-foreground">R$ {Math.round(financialImpact.ale).toLocaleString('pt-BR')}</p>
                 </div>
                 <p className="text-sm text-muted-foreground mt-4 leading-relaxed">Exposição financeira anual baseada em uma probabilidade estimada de <span className="font-bold text-red-500">{financialImpact.prob}%</span> para o seu nível de score ({riskScore}%).</p>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-secondary/20 border border-border/30 flex items-center justify-between gap-4">
               <p className="text-xs text-muted-foreground flex items-center gap-2 italic">
                 <span className="flex items-center gap-1"><Info size={14} /> Fonte: IBM Cost of a Data Breach Report 2024–2025.</span>
               </p>
               <EndpointMethodologyModal score={riskScore} />
            </div>
        </SectionContainer>

        {/* 6. SIMULAÇÃO DE ATAQUE EM ENDPOINT */}
        <SectionContainer 
          title="Simulação de Ataque em Endpoint" 
          subtitle="Como ataques modernos acontecem dentro do ambiente"
          icon={Crosshair}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Bloco 1 - Sem Proteção */}
            <div className="glass-card p-8 border-red-500/30 bg-red-500/5 relative overflow-hidden group">
               <div className="absolute -right-8 -top-8 text-red-500/10 rotate-12 transition-transform group-hover:scale-110 duration-500">
                  <ZapOff size={160} />
               </div>
               <h3 className="text-xl font-bold text-red-500 mb-6 flex items-center gap-2">
                 <ShieldAlert size={24} /> Cenário sem proteção gerenciada
               </h3>
               <ul className="space-y-4 relative z-10">
                 {[
                   'Usuário recebe e-mail de phishing',
                   'Credencial é comprometida',
                   'Acesso legítimo é utilizado',
                   'Script malicioso é executado (PowerShell / malware fileless)',
                   'Movimentação lateral entre máquinas',
                   'Dados são criptografados ou exfiltrados'
                 ].map((item, i) => (
                   <li key={i} className="flex items-start gap-3 text-foreground/80">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                      <span className="text-sm md:text-base">{item}</span>
                   </li>
                 ))}
               </ul>
               <div className="mt-8 pt-6 border-t border-red-500/20">
                  <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">Resultado:</p>
                  <p className="text-lg font-bold text-foreground">Alta probabilidade de ransomware ou vazamento</p>
               </div>
            </div>

            {/* Bloco 2 - Com Concierge */}
            <div className="glass-card p-8 border-emerald-500/30 bg-emerald-500/5 relative overflow-hidden group">
               <div className="absolute -right-8 -top-8 text-emerald-500/10 -rotate-12 transition-transform group-hover:scale-110 duration-500">
                  <ShieldCheck size={160} />
               </div>
               <h3 className="text-xl font-bold text-emerald-500 mb-6 flex items-center gap-2">
                 <ShieldCheck size={24} /> Cenário com proteção gerenciada
               </h3>
               <ul className="space-y-4 relative z-10">
                 {[
                   'EDR identifica comportamento anômalo',
                   'Execução suspeita bloqueada',
                   'Sessão comprometida isolada',
                   'Endpoint é colocado em quarentena',
                   'SOC analisa e responde ao incidente',
                   'Ataque contido antes de impacto operacional'
                 ].map((item, i) => (
                   <li key={i} className="flex items-start gap-3 text-foreground/80">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span className="text-sm md:text-base">{item}</span>
                   </li>
                 ))}
               </ul>
               <div className="mt-8 pt-6 border-t border-emerald-500/20">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">Resultado:</p>
                  <p className="text-lg font-bold text-foreground">Ataque interrompido com impacto mínimo</p>
               </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground italic text-sm">
              "Os cenários acima refletem diretamente o nível atual de proteção identificado no diagnóstico de endpoint."
            </p>
          </div>
        </SectionContainer>

        {/* 7. COMPARATIVO TÉCNICO (Obrigatório) */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
               <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Antivírus Tradicional vs EDR Gerenciado</h2>
               <p className="text-muted-foreground mt-1">Por que as defesas baseadas em assinaturas não são mais suficientes.</p>
            </div>
          </div>
          <div className="glass-card overflow-hidden border-border/40">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead className="py-4">Recurso / Capacidade</TableHead>
                  <TableHead className="text-center py-4">Antivírus Tradicional</TableHead>
                  <TableHead className="text-center text-primary font-bold py-4">EDR Gerenciado (Concierge)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { r: 'Método de Detecção', av: 'Baseado em Assinaturas (Conhecidos)', edr: 'Análise Comportamental & IA (Desconhecidos)', icon: Search },
                  { r: 'Ataques Fileless (PowerShell)', av: 'Invisível / Bypassed', edr: 'Detecção em tempo real de scripts', icon: ZapOff },
                  { r: 'Visibilidade de Movimentação', av: 'Zero (Cego na rede)', edr: 'Telemetria completa do "Kill Chain"', icon: Eye },
                  { r: 'Resposta a Incidentes', av: 'Manual / Reativa pelo usuário', edr: 'Isolamento automático & SOC 24/7', icon: Crosshair },
                  { r: 'Hunting Proativo', av: 'Não existe', edr: 'Busca contínua por IoCs (Ameaças Ocultas)', icon: Activity },
                  { r: 'Forense Pós-Incidente', av: 'Logs básicos / Incompletos', edr: 'Timeline completa de cada processo', icon: Clock },
                ].map((row, i) => (
                  <TableRow key={i} className="hover:bg-primary/5 transition-colors">
                    <TableCell className="font-bold py-4 flex items-center gap-3 italic text-foreground">
                      <row.icon size={16} className="text-primary/60" /> {row.r}
                    </TableCell>
                    <TableCell className="text-center opacity-70 py-4 text-sm">{row.av}</TableCell>
                    <TableCell className="text-center font-bold text-primary py-4 text-sm bg-primary/5">{row.edr}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* 8. INSTITUCIONAL */}
        <section className="space-y-10">
          <div className="flex flex-col md:flex-row items-end justify-between gap-4">
             <div>
                <h2 className="text-2xl font-black text-foreground uppercase tracking-tight">Grupo QOS / <span className="text-primary">Concierge</span></h2>
                <p className="text-muted-foreground mt-1">Sua retaguarda estratégica em resiliência cibernética.</p>
             </div>
             <img src={logoQos} alt="Logo QOS" className="h-10 opacity-60 grayscale hover:grayscale-0 transition-all" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass-card p-8 flex flex-col gap-6 bg-primary/5 border-primary/20">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                      <Activity className="text-white" size={24} />
                   </div>
                   <h3 className="text-xl font-bold">SOC Ativo 24/7</h3>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Não apenas instalamos tecnologia; operamos sua segurança. Nosso <span className="font-bold text-foreground">Security Operations Center</span> monitora cada alerta do seu ambiente em tempo real, 365 dias por ano, respondendo a incidentes antes que eles se tornem manchetes.
                </p>
                <div className="flex gap-4 mt-auto">
                   <div className="flex flex-col">
                      <p className="text-2xl font-black text-primary">15min</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">SLA de Resposta Crítica</p>
                   </div>
                   <div className="w-px h-10 bg-border/50 mx-2" />
                   <div className="flex flex-col">
                      <p className="text-2xl font-black text-primary">24x7</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground">Monitoramento Humano</p>
                   </div>
                </div>
             </div>

             <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Award, t: '24 Anos', s: 'Experiência de Mercado' },
                  { icon: ShieldCheck, t: 'ISO 27001', s: 'Conformidade Global' },
                  { icon: MapPin, t: 'Porto Digital', s: 'Hub de inovação' },
                  { icon: Handshake, t: '+500', s: 'Empresas Protegidas' },
                ].map((box, i) => (
                  <div key={i} className="glass-card p-6 flex flex-col items-center justify-center text-center hover:bg-secondary/50 transition-colors">
                    <box.icon size={32} className="text-primary/40 mb-3" />
                    <p className="font-bold text-lg leading-tight">{box.t}</p>
                    <p className="text-xs text-muted-foreground mt-1">{box.s}</p>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* 9. CTA FINAL */}
        <div className="flex flex-col items-center gap-6 py-12 border-t border-border/30">
           <h3 className="text-2xl font-black text-center max-w-2xl">A segurança do seu endpoint não pode depender de sorte. Evolua hoje para uma defesa gerenciada.</h3>
           <div className="flex gap-4">
              <Button size="lg" className="gradient-primary text-primary-foreground font-bold px-8 h-14 text-base shadow-xl shadow-primary/20">
                Falar com Especialista <ArrowRight className="ml-2" size={18} />
              </Button>
           </div>
        </div>

      </div>
    </div>
  );
};

export default EndpointPage;
