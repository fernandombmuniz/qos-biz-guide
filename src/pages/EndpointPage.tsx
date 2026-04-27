import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProfile } from '@/context/ProfileContext';
import {
  Monitor, Laptop, Shield, Server, Smartphone, AlertTriangle, TrendingUp, Search, Users, Globe, ShieldAlert, ZapOff, Unlink, Clock,
  ShieldCheck, UserCheck, Activity, ExternalLink, CreditCard, Lock, Database, Coins, ArrowDownCircle, Percent, ChevronDown, CheckCircle2, DollarSign, Award, MapPin, FileCheck, ArrowRight,
  Presentation, Handshake, Target, Crosshair, HelpCircle, Info, Download, Trash2, Zap, LayoutDashboard, Eye, ClipboardList, Settings, Layers
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
import castleLogo from '@/assets/castlelogo.png';

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

  // Interactive Simulation State
  const [simPhase, setSimPhase] = useState<'idle' | 'running' | 'finished'>('idle');
  const [activeStep, setActiveStep] = useState(0);

  // Simulation steps data
  const riskSteps = [
    'Usuário recebe e-mail de phishing',
    'Credencial é comprometida',
    'Acesso legítimo é utilizado',
    'Execução de script malicioso (PowerShell / fileless)',
    'Movimentação lateral entre máquinas',
    'Dados criptografados ou exfiltrados'
  ];

  const protectedSteps = [
    'EDR identifica comportamento anômalo',
    'Execução suspeita bloqueada',
    'Sessão comprometida isolada',
    'Endpoint em quarentena',
    'SOC analisa e responde ao incidente',
    'Ataque interrompido com sucesso'
  ];

  const startSimulation = () => {
    setSimPhase('running');
    setActiveStep(0);
  };

  const resetSimulation = () => {
    setSimPhase('idle');
    setActiveStep(0);
  };

  useEffect(() => {
    if (simPhase === 'running') {
      if (activeStep < riskSteps.length) {
        const timer = setTimeout(() => {
          setActiveStep(prev => prev + 1);
        }, 800);
        return () => clearTimeout(timer);
      } else {
        setSimPhase('finished');
      }
    }
  }, [simPhase, activeStep]);

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

  const scenarios = [
    { id: 'ransomware', label: 'Ransomware', icon: ShieldAlert, color: 'text-red-500', description: 'Criptografia total e paralisia.' },
    { id: 'credentials', label: 'Roubo de Contas', icon: Lock, color: 'text-orange-500', description: 'Infiltração via credenciais capturadas.' },
    { id: 'lateral', label: 'Movimentação Lateral', icon: Unlink, color: 'text-indigo-500', description: 'Propagação de ameaças na rede interna.' }
  ];

  const financialImpact = useMemo(() => {
    const baseImpact = 350000;
    const prob = riskScore < 25 ? 0.35 : (riskScore < 50 ? 0.25 : (riskScore < 75 ? 0.15 : 0.08));
    const impact = baseImpact * (profile.deviceCount / 20 || 1);
    const ale = impact * prob;

    return { impact, ale, prob: Math.round(prob * 100) };
  }, [riskScore, profile.deviceCount]);

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

        {/* 6. SIMULAÇÃO DE ATAQUE EM ENDPOINT (INTERATIVA) */}
        <SectionContainer 
          title="Simulação de Ataque em Endpoint" 
          subtitle="Como ataques modernos evoluem dentro do ambiente"
          icon={Crosshair}
        >
          <div className="flex justify-center mb-10">
            {simPhase === 'idle' ? (
              <Button onClick={startSimulation} size="lg" className="gradient-primary text-primary-foreground font-bold px-8 h-12 shadow-xl shadow-primary/20">
                Iniciar simulação
              </Button>
            ) : simPhase === 'finished' ? (
              <Button onClick={resetSimulation} variant="outline" size="lg" className="border-primary/30 text-primary font-bold px-8 h-12">
                Reiniciar simulação
              </Button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Bloco 1 - Sem Proteção */}
            <div className="glass-card p-8 border-red-500/30 bg-red-500/5 relative overflow-hidden group">
               <div className="absolute -right-8 -top-8 text-red-500/10 rotate-12 transition-transform group-hover:scale-110 duration-500">
                  <ZapOff size={160} />
               </div>
               <h3 className="text-xl font-bold text-red-500 mb-6 flex items-center gap-2">
                 <ShieldAlert size={24} /> Cenário sem proteção gerenciada
               </h3>
               <ul className="space-y-4 relative z-10">
                 {riskSteps.map((item, i) => (
                   <AnimatePresence key={i}>
                     {activeStep > i && (
                       <motion.li 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 text-foreground/80"
                       >
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                          <span className="text-sm md:text-base">{item}</span>
                       </motion.li>
                     )}
                   </AnimatePresence>
                 ))}
               </ul>
               <AnimatePresence>
                {simPhase === 'finished' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 pt-6 border-t border-red-500/20"
                  >
                    <p className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">Resultado:</p>
                    <p className="text-lg font-bold text-foreground">Alta probabilidade de ransomware ou vazamento</p>
                  </motion.div>
                )}
               </AnimatePresence>
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
                 {protectedSteps.map((item, i) => (
                   <AnimatePresence key={i}>
                     {activeStep > i && (
                       <motion.li 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 text-foreground/80"
                       >
                          <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-sm md:text-base">{item}</span>
                       </motion.li>
                     )}
                   </AnimatePresence>
                 ))}
               </ul>
               <AnimatePresence>
                {simPhase === 'finished' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 pt-6 border-t border-emerald-500/20"
                  >
                    <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">Resultado:</p>
                    <p className="text-lg font-bold text-foreground">Ataque interrompido com impacto mínimo</p>
                  </motion.div>
                )}
               </AnimatePresence>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-muted-foreground italic text-sm">
              "Os cenários refletem diretamente o nível atual de proteção identificado no diagnóstico de endpoint."
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

        {/* 9. CAMINHO PARA REDUÇÃO DE RISCO (ESTILO FIREWALL) */}
        <section>
          <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-3 flex items-center">
            <img src={shieldConciergeLogo} alt="Shield Concierge" className="h-8 mr-2" />
            Caminho para Redução de Risco e Maturidade de Segurança
          </h2>
          <p className="text-lg text-muted-foreground mb-8">Jornada estruturada para evolução contínua da postura de segurança em dispositivos.</p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 border-primary/20 bg-primary/5">
                <h3 className="text-lg font-bold text-foreground mb-4">Questão para discussão</h3>
                <p className="text-base text-foreground/80 mb-5" style={{ lineHeight: '1.6' }}>
                  A análise técnica indica que a proteção de endpoints atual opera com lacunas críticas de visibilidade e resposta. A evolução para um modelo de EDR Gerenciado permite não apenas detectar, mas conter ameaças em segundos.
                </p>
                <p className="text-lg font-black text-primary mb-6">
                  Qual o nível de resiliência esperado para a operação dos dispositivos da organização?
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-5 text-center border-border/50 hover:border-primary/40 transition-colors cursor-pointer">
                    <Shield size={24} className="mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-bold text-foreground uppercase tracking-wider">Essencial</p>
                    <p className="text-xs text-muted-foreground mt-2" style={{ lineHeight: '1.5' }}>Proteção baseada em assinatura + Antimalware robusto.</p>
                  </div>
                  <div className="glass-card p-5 text-center border-primary/30 bg-primary/5 hover:border-primary/50 transition-colors cursor-pointer">
                    <Layers size={24} className="mx-auto text-primary mb-3" />
                    <p className="text-sm font-bold text-foreground uppercase tracking-wider">Avançado</p>
                    <p className="text-xs text-primary/80 mt-2" style={{ lineHeight: '1.5' }}>EDR + SOC 24/7 com isolamento automático e hunting.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-8 flex flex-col items-center justify-center gap-8">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Parceria Técnica e Operacional</p>
                <div className="flex items-center justify-center gap-12">
                  <img src={castleLogo} alt="Concierge Castle" className="h-32 object-contain drop-shadow-2xl" />
                  {profile.companyLogo && (
                    <img src={profile.companyLogo} alt="Logo da empresa" className="h-24 rounded-2xl object-contain bg-secondary/30 p-4 shadow-inner" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground italic text-center max-w-sm">
                  A decisão estratégica será orientada por critérios técnicos, operacionais e de continuidade de negócio.
                </p>
              </motion.div>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-black text-foreground uppercase tracking-tight mb-4">Próximos passos</h3>
              {[
                { icon: ClipboardList, title: 'Inventário detalhado', desc: 'Levantamento completo de sistemas operacionais e criticidade.' },
                { icon: Target, title: 'PoC (Prova de Conceito)', desc: 'Instalação assistida em grupo de controle para validação de telemetria.' },
                { icon: Settings, title: 'Definição de Políticas', desc: 'Configuração de níveis de bloqueio e automação de quarentena.' },
                { icon: Handshake, title: 'Apresentação Executiva', desc: 'Reunião final para alinhamento de SLA e início de operação SOC.' },
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-5 flex items-start gap-5 hover:bg-secondary/30 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                    <step.icon size={22} className="text-primary-foreground" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-foreground leading-tight">{step.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1.5" style={{ lineHeight: '1.5' }}>{step.desc}</p>
                  </div>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-6 border-primary/20 bg-primary/5 mt-6"
              >
                <p className="text-sm text-foreground/90 font-medium italic" style={{ lineHeight: '1.6' }}>
                  "O objetivo é transformar cada endpoint em um sensor inteligente, garantindo que a segurança acompanhe a mobilidade da força de trabalho."
                </p>
              </motion.div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

export default EndpointPage;
