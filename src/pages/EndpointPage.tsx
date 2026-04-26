import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '@/context/ProfileContext';
import {
  Monitor, Laptop, Shield, Server, Smartphone, AlertTriangle, TrendingUp, Search, Users, Globe, ShieldAlert, ZapOff, Unlink, Clock,
  ShieldCheck, UserCheck, Activity, ExternalLink, CreditCard, Lock, Database, Coins, ArrowDownCircle, Percent, ChevronDown, CheckCircle2, DollarSign, Award, MapPin, FileCheck, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';

import logoQos from '@/assets/logo_qostecnologia.jpg';

import HeroHeader from '@/components/diagnostic/HeroHeader';
import SectionContainer from '@/components/diagnostic/SectionContainer';
import InfoCards from '@/components/diagnostic/InfoCards';
import SimulationContainer from '@/components/diagnostic/SimulationContainer';
import EndpointMethodologyModal from '@/components/diagnostic/EndpointMethodologyModal';
import DiagnosticCards from '@/components/diagnostic/DiagnosticCards';

// -- Constants --
const SCORE_THRESHOLDS = {
  CRITICAL: 25,
  ELEVATED: 50,
  MODERATE: 75,
  LOW: 100
};

import { useEndpointScore } from '@/hooks/useEndpointScore';

const EndpointPage = () => {
  const { profile } = useProfile();

  const { diagnosticData, riskScore, exposure, lgpdData } = useEndpointScore();
  const [displayRiskScore, setDisplayRiskScore] = useState(0);

  useEffect(() => {
    if (diagnosticData.insufficientData) return;
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
  }, [riskScore, diagnosticData.insufficientData]);

  // --- Impact Simulation ---
  const [selectedScenario, setSelectedScenario] = useState('ransomware');
  
  const scenarios = [
    { id: 'ransomware', label: 'Ransomware', icon: ShieldAlert, color: 'text-red-500', description: 'Criptografia total e paralisia.' },
    { id: 'credentials', label: 'Roubo de Contas', icon: Lock, color: 'text-orange-500', description: 'Infiltração via credenciais capturadas.' },
    { id: 'exfiltration', label: 'Vazamento de Dados', icon: Database, color: 'text-indigo-500', description: 'Exposição de segredos de negócio.' }
  ];

  const simulationResults = useMemo(() => {
    const prob = riskScore > 75 ? 8 : (riskScore > 50 ? 15 : (riskScore > 25 ? 25 : 35));
    const baseImpact = selectedScenario === 'ransomware' ? 4500 : (selectedScenario === 'credentials' ? 3200 : 8000);
    
    const users = profile.userCount || 10;
    const endpoints = profile.deviceCount || 10;
    
    const impact = (endpoints * baseImpact) + (users * 500);
    const annualRisk = Math.floor(impact * (prob / 100));
    
    return { prob, impact, annualRisk };
  }, [riskScore, selectedScenario, profile]);

  return (
    <div className="min-h-screen bg-transparent pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-20">

        {/* 1. HERO HEADER */}
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

        {/* 2. AMBIENTE */}
        <SectionContainer title="Visão Geral do Ambiente Endpoint">
          <InfoCards
            cards={[
              { icon: Users, label: 'Usuários', value: profile.userCount || '0' },
              { icon: Laptop, label: 'Dispositivos', value: profile.deviceCount || '0' },
              { icon: Shield, label: 'Endpoints Gerenciados', value: profile.deviceCount - (profile.outOfDomainCount || 0) },
              { icon: Unlink, label: 'Fora do Domínio', value: profile.outOfDomainCount || '0' },
            ]}
          />
        </SectionContainer>

        {/* 3. DIAGNÓSTICO */}
        <SectionContainer title="Diagnóstico de Segurança de Endpoint">
          {diagnosticData.insufficientData ? (
            <div className="glass-card p-12 text-center space-y-4">
              <AlertTriangle size={48} className="mx-auto text-yellow-500" />
              <h3 className="text-xl font-bold">Dados insuficientes para gerar diagnóstico de segurança.</h3>
              <p className="text-muted-foreground">Por favor, complete mais informações no onboarding de Endpoint para visualização do score.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                  { label: 'Proteção do Dispositivo', score: diagnosticData.p1Score, icon: ShieldCheck, color: 'text-emerald-500' },
                  { label: 'Exposição Humana', score: diagnosticData.p2Score, icon: UserCheck, color: 'text-blue-500' },
                  { label: 'Capacidade de Detecção', score: diagnosticData.p3Score, icon: Activity, color: 'text-indigo-500' }
                ].map((p, i) => (
                  <div key={i} className="glass-card p-6 border-border/40">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold opacity-70">{p.label}</p>
                      <p className={`text-2xl font-bold ${p.color}`}>{p.score}</p>
                    </div>
                    <div className="w-full bg-secondary/30 h-1.5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${p.score}%` }} 
                        className={`h-full ${p.color.replace('text-', 'bg-')}`} 
                      />
                    </div>
                  </div>
                ))}
              </div>

              <DiagnosticCards
                title="Score de Postura de Segurança"
                subtitle="Média ponderada baseada nos controles de integridade."
                score={riskScore}
                maxScore={100}
                displayScore={displayRiskScore}
                exposure={exposure}
                risks={diagnosticData.risks}
              />

              {/* 6. LGPD SCORE */}
              <div className="mt-12">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  <FileCheck size={24} className="text-blue-500" /> Score de Conformidade LGPD
                </h3>
                {lgpdData.articles.length === 0 ? (
                  <div className="glass-card p-6 border-l-4 border-l-emerald-500">
                    <p className="text-muted-foreground italic">Score LGPD aguardando análise do ambiente.</p>
                  </div>
                ) : (
                  <div className="glass-card p-6 border-l-4 border-l-red-500 bg-red-500/5">
                    <div className="flex justify-between items-center mb-8">
                       <div>
                         <p className="text-2xl font-bold text-foreground">Exposição Regulatória: {lgpdData.score}%</p>
                         <p className="text-red-400 font-bold">Risco {lgpdData.exposure?.label.split(' ')[1]}</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                      {lgpdData.articles.map(art => (
                        <div key={art.id} className="border-l-2 border-primary/30 pl-4 py-2">
                          <h4 className="font-bold text-foreground mb-1">{art.title}</h4>
                          <p className="text-sm text-muted-foreground">{art.desc}</p>
                        </div>
                      ))}
                      <div className="pt-4 border-t border-border/30">
                        <p className="text-sm font-bold text-red-400">Art. 52: Possibilidade de multas de até 2% do faturamento.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SectionContainer>

        {/* 7. SIMULAÇÃO IMPACTO */}
        {!diagnosticData.insufficientData && (
          <SectionContainer title="Simulação de Impacto de Ataque">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {scenarios.map(s => (
                <button 
                  key={s.id} 
                  onClick={() => setSelectedScenario(s.id)}
                  className={`glass-card p-4 text-left transition-all border-2 ${selectedScenario === s.id ? 'border-primary ring-2 ring-primary/20' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <s.icon className={s.color} size={24} />
                  <p className="font-bold mt-2">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6 bg-orange-500/5 border-orange-500/20">
                <p className="text-sm font-bold uppercase text-orange-500 mb-2">Impacto Financeiro</p>
                <p className="text-4xl font-extrabold text-foreground">R$ {simulationResults.impact.toLocaleString('pt-BR')}</p>
                <p className="text-xs text-muted-foreground mt-2">Custo de recuperação e perda de produtividade.</p>
              </div>
              <div className="glass-card p-6 bg-red-500/5 border-red-500/20">
                 <p className="text-sm font-bold uppercase text-red-500 mb-2">Risco Anual (ALE)</p>
                 <p className="text-4xl font-extrabold text-foreground">R$ {simulationResults.annualRisk.toLocaleString('pt-BR')}</p>
                 <p className="text-xs text-muted-foreground mt-2">Baseado em {simulationResults.prob}% de probabilidade anual.</p>
              </div>
            </div>
          </SectionContainer>
        )}

        {/* 8. COMPARATIVO */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Comparativo Técnico de Proteção</h2>
          <div className="glass-card overflow-hidden">
            <Table>
              <TableHeader className="bg-secondary/50">
                <TableRow>
                  <TableHead>Recurso</TableHead>
                  <TableHead className="text-center">Antivírus Tradicional</TableHead>
                  <TableHead className="text-center text-primary font-bold">EDR Gerenciado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { r: 'Detecção por Assinatura', av: 'Sim', edr: 'Sim' },
                  { r: 'Análise Comportamental', av: 'Limitada', edr: 'Avançada' },
                  { r: 'IA & Machine Learning', av: 'Não', edr: 'Nativo' },
                  { r: 'Resposta a Incidentes', av: 'Reativa', edr: 'Proativa (SOC)' },
                  { r: 'Isolamento de Host', av: 'Não', edr: 'Instantâneo' },
                  { r: 'Forense & Visibilidade', av: 'Baixa', edr: 'Completa' },
                ].map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{row.r}</TableCell>
                    <TableCell className="text-center opacity-70">{row.av}</TableCell>
                    <TableCell className="text-center font-bold text-primary">{row.edr}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>

        {/* 9. INSTITUCIONAL */}
        <section className="pt-12 border-t border-border/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-black mb-6">Modelo Operacional de Segurança</h2>
              <div className="grid grid-cols-2 gap-4">
                 {[
                   { icon: Award, t: '23 Anos', s: 'De atuação sólida' },
                   { icon: ShieldCheck, t: 'ISO 27001', s: 'Padrão internacional' },
                   { icon: MapPin, t: 'Porto Digital', s: 'Hub de inovação' },
                   { icon: Activity, t: 'SOC 24x7', s: 'Monitoramento real' },
                 ].map((box, i) => (
                   <div key={i} className="glass-card p-4 text-center">
                     <box.icon size={24} className="mx-auto text-primary mb-2" />
                     <p className="font-bold">{box.t}</p>
                     <p className="text-xs text-muted-foreground">{box.s}</p>
                   </div>
                 ))}
              </div>
            </div>
            <div className="flex flex-col justify-center">
               <img src={logoQos} alt="Logo QOS" className="h-12 w-fit mb-6 grayscale opacity-80" />
               <p className="text-muted-foreground leading-relaxed">
                 O Concierge Segurança Digital opera sob a infraestrutura do Grupo QOS, unindo tecnologia de ponta e processos certificados para garantir que seu negócio foque no crescimento enquanto nós cuidamos da resiliência cibernética.
               </p>
            </div>
          </div>
        </section>

        {/* 10. METODOLOGIA BOTAO */}
        <div className="flex justify-center pt-8">
           <EndpointMethodologyModal score={riskScore} />
        </div>

      </div>
    </div>
  );
};

export default EndpointPage;
