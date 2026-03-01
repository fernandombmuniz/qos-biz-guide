import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { detectAllRisks } from '@/utils/pdfExport';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Monitor, Laptop, Server, Smartphone, AlertTriangle, CheckCircle2, XCircle, Play, TrendingUp, Shield } from 'lucide-react';

const EndpointPage = () => {
  const { profile } = useProfile();
  const risks = detectAllRisks(profile).filter((r) => r.category === 'endpoint');

  const [simMode, setSimMode] = useState<'without' | 'with'>('without');
  const [simRunning, setSimRunning] = useState(false);
  const [simStep, setSimStep] = useState(0);

  const [avgCost, setAvgCost] = useState(300000);
  const [probability, setProbability] = useState(40);
  const [monthly, setMonthly] = useState(3000);
  const [implCost, setImplCost] = useState(8000);

  const potentialLoss = avgCost * (probability / 100);
  const annualInvestment = monthly * 12 + implCost;
  const avoidedLoss = potentialLoss - annualInvestment;
  const roi = annualInvestment > 0 ? ((avoidedLoss / annualInvestment) * 100) : 0;

  const totalEndpoints = profile.endpointsWindows + profile.endpointsMac;

  const simulation = {
    without: ['E-mail de phishing recebido', 'Usuário clica no anexo malicioso', 'Payload executado no endpoint', 'Antivírus não detecta (zero-day)', 'Criptografia dos arquivos locais', 'Propagação para rede compartilhada', 'Resgate exigido — operação paralisada'],
    with: ['E-mail de phishing recebido', 'Usuário clica no anexo malicioso', 'EDR detecta comportamento anômalo', 'Processo malicioso isolado em sandbox', 'SOC 24/7 notificado automaticamente', 'Endpoint restaurado — zero impacto'],
  };

  const runSimulation = () => {
    setSimStep(0);
    setSimRunning(true);
    const steps = simulation[simMode];
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setSimStep(i);
      if (i >= steps.length) clearInterval(interval);
    }, 800);
  };

  const comparison = [
    { feature: 'Detecção de ransomware zero-day', av: false, edr: true },
    { feature: 'Análise comportamental', av: false, edr: true },
    { feature: 'Rollback de alterações', av: false, edr: true },
    { feature: 'Isolamento automático', av: false, edr: true },
    { feature: 'Investigação forense', av: false, edr: true },
    { feature: 'Proteção contra fileless', av: false, edr: true },
    { feature: 'Console centralizada', av: 'Parcial', edr: true },
    { feature: 'Monitoramento 24/7', av: false, edr: true },
    { feature: 'Detecção por assinatura', av: true, edr: true },
    { feature: 'Custo por endpoint', av: 'Baixo', edr: 'Médio' },
  ];

  const differentials = [
    'EDR com detecção comportamental e IA',
    'Rollback automático pós-incidente',
    'Console unificada com visibilidade total',
    'Monitoramento SOC 24/7 dedicado',
    'Isolamento automático de endpoints',
    'Investigação forense integrada',
    'Proteção contra ameaças fileless',
    'Cobertura Windows, Mac e Linux',
    'Políticas granulares por grupo',
    'Relatórios de conformidade executivos',
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Monitor className="mx-auto text-primary mb-4" size={48} />
          <h1 className="text-3xl font-bold text-foreground">Concierge Endpoint</h1>
          <p className="text-muted-foreground mt-2">Proteção avançada de estações e servidores</p>
        </motion.div>

        {/* 1. Visão Geral */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6">Visão Geral dos Endpoints</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Laptop, label: 'Total Endpoints', value: totalEndpoints },
              { icon: Shield, label: 'Proteção Atual', value: profile.protectionType === 'edr' ? 'EDR' : profile.protectionType === 'signature' ? 'Assinatura' : 'Nenhum' },
              { icon: Server, label: 'Servidores', value: (profile.hasWindowsServer ? 1 : 0) + (profile.hasLinuxServer ? 1 : 0) },
              { icon: Smartphone, label: 'BYOD', value: profile.byod ? 'Sim' : 'Não' },
            ].map((card) => (
              <motion.div key={card.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-5 text-center">
                <card.icon className="mx-auto text-primary mb-2" size={24} />
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 2. Riscos */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <AlertTriangle className="text-danger" size={20} /> Riscos Detectados
          </h2>
          {risks.length === 0 ? (
            <div className="glass-card p-6 text-center">
              <CheckCircle2 className="mx-auto text-success mb-2" size={32} />
              <p className="text-foreground font-medium">Proteção EDR detectada. Riscos minimizados.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {risks.map((risk, i) => (
                <motion.div key={risk.title} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-foreground text-sm">{risk.title}</h4>
                    <span className={`text-sm font-bold ${risk.severity >= 80 ? 'text-danger' : 'text-yellow-400'}`}>{risk.severity}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{risk.description}</p>
                  <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                    <motion.div className={`h-full rounded-full ${risk.severity >= 80 ? 'gradient-danger' : 'bg-yellow-400'}`} initial={{ width: 0 }} animate={{ width: `${risk.severity}%` }} transition={{ duration: 1, delay: i * 0.15 }} />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* 3. Comparação EDR vs AV */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6">EDR vs Antivírus Tradicional</h2>
          <div className="glass-card overflow-hidden">
            <div className="grid grid-cols-3 gap-0 text-sm">
              <div className="p-4 font-semibold text-foreground bg-secondary/50">Recurso</div>
              <div className="p-4 font-semibold text-center text-muted-foreground bg-secondary/50">Antivírus</div>
              <div className="p-4 font-semibold text-center text-primary bg-secondary/50">EDR Concierge</div>
              {comparison.map((row, i) => (
                <>
                  <div key={`f-${i}`} className="p-4 text-foreground border-t border-border/30">{row.feature}</div>
                  <div key={`a-${i}`} className="p-4 text-center border-t border-border/30">
                    {row.av === true ? <CheckCircle2 className="mx-auto text-success" size={16} /> : row.av === false ? <XCircle className="mx-auto text-danger" size={16} /> : <span className="text-muted-foreground text-xs">{row.av}</span>}
                  </div>
                  <div key={`e-${i}`} className="p-4 text-center border-t border-border/30">
                    {row.edr === true ? <CheckCircle2 className="mx-auto text-success" size={16} /> : typeof row.edr === 'string' ? <span className="text-primary text-xs font-medium">{row.edr}</span> : null}
                  </div>
                </>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Simulação */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6">Simulação de Ataque — Phishing</h2>
          <div className="glass-card p-6">
            <div className="flex gap-3 mb-6">
              <Button variant={simMode === 'without' ? 'default' : 'outline'} size="sm"
                onClick={() => { setSimMode('without'); setSimRunning(false); setSimStep(0); }}
                className={simMode === 'without' ? 'gradient-danger text-danger-foreground' : ''}
              >
                <XCircle size={14} className="mr-1" /> Sem EDR
              </Button>
              <Button variant={simMode === 'with' ? 'default' : 'outline'} size="sm"
                onClick={() => { setSimMode('with'); setSimRunning(false); setSimStep(0); }}
                className={simMode === 'with' ? 'gradient-success text-success-foreground' : ''}
              >
                <CheckCircle2 size={14} className="mr-1" /> Com EDR
              </Button>
              <Button variant="outline" size="sm" onClick={runSimulation} className="ml-auto">
                <Play size={14} className="mr-1" /> Executar
              </Button>
            </div>
            <div className="space-y-3">
              {simulation[simMode].map((s, i) => {
                const isActive = simRunning && i < simStep;
                const isCurrent = simRunning && i === simStep - 1;
                const isLast = i === simulation[simMode].length - 1;
                const isSuccess = simMode === 'with' && isLast;
                const isDanger = simMode === 'without' && isLast;
                return (
                  <motion.div key={i} initial={{ opacity: 0.3 }} animate={{ opacity: isActive ? 1 : 0.3 }}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isCurrent ? (isSuccess ? 'bg-success/10 border border-success/30' : isDanger ? 'bg-danger/10 border border-danger/30' : 'bg-primary/10 border border-primary/30') : 'bg-secondary/30'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isActive ? (isSuccess ? 'gradient-success' : isDanger ? 'gradient-danger' : 'gradient-primary') : 'bg-secondary'} text-primary-foreground`}>
                      {i + 1}
                    </div>
                    <span className={`text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 5. Impacto Financeiro */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary" size={20} /> Impacto Financeiro
          </h2>
          <div className="glass-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Custo médio de ataque (R$)</Label>
                <Input type="number" value={avgCost} onChange={(e) => setAvgCost(Number(e.target.value))} className="bg-secondary border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Probabilidade anual (%)</Label>
                <Input type="number" value={probability} onChange={(e) => setProbability(Number(e.target.value))} className="bg-secondary border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Mensalidade estimada (R$)</Label>
                <Input type="number" value={monthly} onChange={(e) => setMonthly(Number(e.target.value))} className="bg-secondary border-border text-foreground" />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Custo de implantação (R$)</Label>
                <Input type="number" value={implCost} onChange={(e) => setImplCost(Number(e.target.value))} className="bg-secondary border-border text-foreground" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass-card p-5 text-center border-danger/30">
                <p className="text-xs text-muted-foreground mb-1">Perda Potencial</p>
                <p className="text-2xl font-bold text-danger">R$ {potentialLoss.toLocaleString('pt-BR')}</p>
              </div>
              <div className="glass-card p-5 text-center border-success/30">
                <p className="text-xs text-muted-foreground mb-1">Perda Evitada</p>
                <p className="text-2xl font-bold text-success">R$ {Math.max(0, avoidedLoss).toLocaleString('pt-BR')}</p>
              </div>
              <div className="glass-card p-5 text-center border-primary/30">
                <p className="text-xs text-muted-foreground mb-1">ROI</p>
                <p className="text-2xl font-bold text-primary">{roi > 0 ? '+' : ''}{roi.toFixed(0)}%</p>
              </div>
            </div>
          </div>
        </section>

        {/* Diferenciais */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6">Diferenciais Concierge Endpoint</h2>
          <div className="glass-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {differentials.map((d, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-3 py-2">
                  <CheckCircle2 size={16} className="text-primary shrink-0" />
                  <span className="text-sm text-foreground">{d}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EndpointPage;
