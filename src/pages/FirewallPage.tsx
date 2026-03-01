import { useState } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { detectAllRisks } from '@/utils/pdfExport';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Users, Laptop, Globe, Lock, AlertTriangle, TrendingUp, CheckCircle2, XCircle, Play } from 'lucide-react';

const FirewallPage = () => {
  const { profile } = useProfile();
  const risks = detectAllRisks(profile).filter((r) => r.category === 'firewall');

  // Simulation state
  const [simAttack, setSimAttack] = useState('ransomware');
  const [simMode, setSimMode] = useState<'without' | 'with'>('without');
  const [simRunning, setSimRunning] = useState(false);
  const [simStep, setSimStep] = useState(0);

  // Calculator state
  const [avgCost, setAvgCost] = useState(500000);
  const [probability, setProbability] = useState(30);
  const [monthly, setMonthly] = useState(5000);
  const [implCost, setImplCost] = useState(15000);

  const potentialLoss = avgCost * (probability / 100);
  const annualInvestment = monthly * 12 + implCost;
  const avoidedLoss = potentialLoss - annualInvestment;
  const roi = annualInvestment > 0 ? ((avoidedLoss / annualInvestment) * 100) : 0;

  const attacks: Record<string, { without: string[]; with: string[] }> = {
    ransomware: {
      without: ['Phishing recebido por colaborador', 'Execução do payload malicioso', 'Escalação de privilégios', 'Movimento lateral na rede', 'Criptografia de dados críticos', 'Resgate exigido — operação paralisada'],
      with: ['Phishing recebido por colaborador', 'Firewall bloqueia comunicação C&C', 'IDS detecta atividade anômala', 'SOC 24/7 isola o incidente', 'Operação mantida sem interrupção'],
    },
    bruteforce: {
      without: ['Atacante identifica VPN exposta', 'Tentativas de força bruta iniciadas', 'Credenciais comprometidas', 'Acesso não autorizado à rede interna', 'Exfiltração de dados sensíveis'],
      with: ['Atacante identifica VPN', 'Limite de tentativas ativado', 'MFA bloqueia acesso não autorizado', 'Alerta gerado no SOC', 'Atacante bloqueado automaticamente'],
    },
    segmentation: {
      without: ['Dispositivo comprometido na rede', 'Sem segmentação — acesso total', 'Servidores críticos acessados', 'Dados expostos', 'Compliance violada'],
      with: ['Dispositivo comprometido em VLAN isolada', 'Firewall inter-VLAN bloqueia propagação', 'Microsegmentação protege servidores', 'Incidente contido automaticamente'],
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

  const totalVpns = profile.vpnSiteToSite + profile.vpnRemoteAccess;

  const differentials = [
    'Firewall gerenciado 24/7 com SOC dedicado',
    'Atualizações de assinaturas em tempo real',
    'Monitoramento contínuo de ameaças avançadas',
    'Segmentação de rede com microsegmentação',
    'Inspeção SSL/TLS completa',
    'IDS/IPS com regras customizadas',
    'Relatórios executivos mensais',
    'SLA de resposta a incidentes',
    'Conformidade NIST, ISO 27001',
    'Suporte técnico especializado',
  ];

  return (
    <div className="min-h-screen bg-background pt-20 pb-16 px-4">
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <Shield className="mx-auto text-primary mb-4" size={48} />
          <h1 className="text-3xl font-bold text-foreground">Concierge Firewall</h1>
          <p className="text-muted-foreground mt-2">Análise de perímetro e proteção de rede</p>
        </motion.div>

        {/* 1. Visão Geral */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6">Visão Geral do Ambiente</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Users, label: 'Usuários', value: profile.userCount },
              { icon: Laptop, label: 'Dispositivos', value: profile.deviceCount },
              { icon: Globe, label: 'Links', value: profile.internetLinks.length },
              { icon: Lock, label: 'VPNs', value: totalVpns },
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
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* 3. Simulação */}
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
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: isActive ? 1 : 0.3 }}
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

        {/* 4. Calculadora */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <TrendingUp className="text-primary" size={20} /> Calculadora Financeira
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

        {/* 5. Diferenciais */}
        <section>
          <h2 className="text-xl font-bold text-foreground mb-6">Diferenciais Concierge Firewall</h2>
          <div className="glass-card p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {differentials.map((d, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 py-2"
                >
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

export default FirewallPage;
