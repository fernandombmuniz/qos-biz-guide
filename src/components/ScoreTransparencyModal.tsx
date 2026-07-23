import React, { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Info, Shield, Server, HardDrive, AlertCircle, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RiskFactor {
  id: string;
  label: string;
  points: number;
  desc: string;
  source: string;
}

interface ScoreTransparencyModalProps {
  firewallScore: number | null;
  endpointScore: number | null;
  backupScore: number | null;
  overallScore: number;
  risks: RiskFactor[];
}

const ScoreTransparencyModal: React.FC<ScoreTransparencyModalProps> = ({
  firewallScore,
  endpointScore,
  backupScore,
  overallScore,
  risks,
}) => {
  const exposureLevel = useMemo(() => {
    const score = overallScore;
    if (score < 40) return { grade: 'E', label: 'Crítico', color: 'text-red-500', bg: 'bg-red-500' };
    if (score < 55) return { grade: 'D', label: 'Elevado', color: 'text-orange-500', bg: 'bg-orange-500' };
    if (score < 70) return { grade: 'C', label: 'Atenção', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    if (score < 85) return { grade: 'B', label: 'Controlado', color: 'text-blue-500', bg: 'bg-blue-500' };
    return { grade: 'A', label: 'Resiliente', color: 'text-emerald-500', bg: 'bg-emerald-500' };
  }, [overallScore]);

  const getRiskPriority = (points: number) => {
    if (points >= 25) return { severity: 'Crítico', grade: 'Crítica', label: 'Crítico', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-l-red-500' };
    if (points >= 15) return { severity: 'Alto', grade: 'Alta', label: 'Alto', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-l-orange-500' };
    return { severity: 'Moderado', grade: 'Média', label: 'Moderado', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-l-yellow-500' };
  };

  const getOperationalConsequence = (riskId: string, riskLabel: string, sector: string) => {
    const s = sector ? sector.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
    
    let baseConsequence = 'Pode impactar negativamente a estabilidade dos processos vitais de negócios.';
    const label = riskLabel.toLowerCase();
    const rid = riskId.toLowerCase();
    
    if (label.includes('mfa') || rid.includes('mfa') || label.includes('fator')) {
       baseConsequence = 'Aumenta significativamente o risco de comprometimento de credenciais administrativas e acessos indevidos.';
    } else if (label.includes('monitoramento') || label.includes('soc') || label.includes('edr') || rid.includes('monitoring') || rid.includes('edr') || label.includes('detecção')) {
       baseConsequence = 'Aumenta o tempo médio de permanência de ameaças sem detecção no ambiente, permitindo movimentações laterais.';
    } else if (label.includes('teste') && label.includes('restore') || rid.includes('restore-test')) {
       baseConsequence = 'Não existe garantia prática de recuperação operacional em tempo hábil em caso de ataque de ransomware.';
    } else if (label.includes('backup') || rid.includes('backup') || label.includes('rto')) {
       baseConsequence = 'O ambiente não possui garantia de retenção segura, elevando drasticamente o risco de perda total de dados em desastres.';
    } else if (label.includes('firewall') || label.includes('rede') || rid.includes('firewall') || label.includes('inspeção') || label.includes('perímetro')) {
       baseConsequence = 'Reduz a visibilidade sobre o tráfego lateral e dificulta a contenção rápida de acessos ou comportamentos suspeitos.';
    } else {
       baseConsequence = 'Cria lacunas sistêmicas que facilitam invasões silenciosas e indisponibilidade não planejada.';
    }

    if (s.includes('transporte') || s.includes('logistica')) {
       return `${baseConsequence} No seu setor, isso pode impactar a comunicação, operação e conectividade em tempo real entre unidades.`;
    }
    if (s.includes('juridico') || s.includes('advocacia') || s.includes('advogado')) {
       return `${baseConsequence} Isso pode expor diretamente documentos sensíveis, dados de clientes e acessos privilegiados a processos.`;
    }
    if (s.includes('saude') || s.includes('hospital') || s.includes('clinica') || s.includes('medic')) {
       return `${baseConsequence} Em cenários críticos, pode comprometer a disponibilidade de sistemas clínicos vitais e expor prontuários.`;
    }
    if (s.includes('industria') || s.includes('manufatura')) {
       return `${baseConsequence} Isso agrava severamente o risco de paralisação prolongada no chão de fábrica e na cadeia de suprimentos.`;
    }

    return baseConsequence;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button 
          className="text-xs font-medium text-muted-foreground hover:text-primary underline underline-offset-4 decoration-muted-foreground/30 hover:decoration-primary/50 transition-all flex items-center gap-1.5 py-1 px-2 rounded hover:bg-primary/5 cursor-pointer"
        >
          <Info size={13} />
          Como avaliamos seu risco?
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto glass-card border-border/40 p-0 gap-0 bg-[#0B1220]/95 backdrop-blur-xl">
        <DialogHeader className="p-8 pb-6 border-b border-white/5">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-foreground">
            Como avaliamos seu risco operacional
          </DialogTitle>
          <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
            Esta análise mostra quais fatores mais impactaram a pontuação e como isso se traduz em risco para a operação.
          </p>
        </DialogHeader>

        <div className="p-8 space-y-12">
          
          {/* BLOCO 1: RESUMO DA PONTUAÇÃO */}
          <section className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="col-span-2 md:col-span-4 p-5 rounded-xl bg-white/5 border border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                 <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 tracking-widest">Nível de Exposição Atual</p>
                    <p className={`text-2xl font-black tracking-tight ${exposureLevel.color}`}>Classificação {exposureLevel.grade} &mdash; {exposureLevel.label}</p>
                 </div>
                 <div className="text-left md:text-right">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 tracking-widest">Benchmark PME</p>
                    <p className="text-lg font-bold text-blue-500">Média: 68/100</p>
                 </div>
              </div>

              {[
                { label: 'Score Geral', score: overallScore, icon: Target, isTotal: true },
                { label: 'Firewall & Rede', score: firewallScore, icon: Shield, color: 'text-blue-500' },
                { label: 'Endpoint', score: endpointScore, icon: Server, color: 'text-purple-500' },
                { label: 'Backup', score: backupScore, icon: HardDrive, color: 'text-orange-500' },
              ].map((item, idx) => (
                <div key={idx} className={`p-5 rounded-xl border flex flex-col justify-center items-center text-center ${item.isTotal ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/10'}`}>
                  {item.icon && <item.icon size={18} className={`${item.color || 'text-primary'} mb-3`} />}
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1 tracking-widest">{item.label}</p>
                  <p className={`text-3xl font-black ${item.isTotal ? 'text-primary' : 'text-foreground'}`}>
                    {item.score !== null ? `${item.score}` : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4 items-center justify-center pt-2">
               {['E - Crítico (0-39)', 'D - Elevado (40-54)', 'C - Atenção (55-69)', 'B - Controlado (70-84)', 'A - Resiliente (85-100)'].map((leg, i) => {
                  const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];
                  return (
                     <div key={i} className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${colors[i]}`} />
                        <span className="text-[10px] text-muted-foreground font-medium">{leg}</span>
                     </div>
                  );
               })}
            </div>
          </section>

          {/* BLOCO 2: O QUE MAIS REDUZIU A PONTUAÇÃO */}
          <section className="space-y-6">
            <h3 className="text-lg font-bold text-foreground tracking-tight border-b border-border/50 pb-2">O que mais reduziu sua pontuação</h3>
            <div className="grid grid-cols-1 gap-4">
              {risks.slice(0, 3).map((risk, idx) => {
                 const priorityObj = getRiskPriority(risk.points);
                 // We don't have profile here directly, so we pass an empty string or get it via context if we must.
                 // Actually, ScoreTransparencyModal doesn't receive `profile.sector`. Let's assume generic or we can pass it down.
                 // Let's pass empty string for sector here since it wasn't requested to change the interface.
                 const consequence = getOperationalConsequence(risk.id, risk.label, '');

                 return (
                   <div key={idx} className={`glass-card p-5 flex flex-col border-l-4 ${priorityObj.border} bg-secondary/5`}>
                      <div className="flex justify-between items-start mb-3">
                         <h4 className="font-bold text-foreground text-base leading-tight">{risk.label}</h4>
                         <div className={`px-2 py-0.5 rounded flex items-center justify-center ${priorityObj.bg}`}>
                            <span className={`text-[10px] uppercase font-bold tracking-widest ${priorityObj.color}`}>Severidade {priorityObj.severity}</span>
                         </div>
                      </div>
                      
                      <p className="text-xs font-bold text-red-400 mb-3">Impacto: -{risk.points} pontos</p>
                      
                      <p className="text-sm text-foreground/90 leading-relaxed mb-4">
                         "{risk.desc}"
                      </p>

                      <div className="bg-background/50 p-4 rounded-lg border border-border/40">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1.5">
                            <AlertCircle size={12} className="text-orange-400" /> Consequência Operacional
                         </p>
                         <p className="text-sm text-muted-foreground leading-relaxed">
                            {consequence}
                         </p>
                      </div>
                   </div>
                 );
              })}
              {risks.length === 0 && (
                 <div className="text-center py-8 glass-card border-dashed border-white/10">
                   <p className="text-sm text-muted-foreground">Nenhuma lacuna crítica identificada que reduza substancialmente a nota.</p>
                 </div>
              )}
            </div>
          </section>

          {/* BLOCO 3: COMO O CÁLCULO FUNCIONA */}
          <section className="space-y-6">
            <h3 className="text-lg font-bold text-foreground tracking-tight border-b border-border/50 pb-2">Como o cálculo funciona</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
               O sistema avalia controles essenciais relacionados à proteção da rede, proteção dos dispositivos e continuidade operacional. Cada controle implementado aumenta a maturidade do ambiente. Cada lacuna identificada reduz a pontuação do domínio correspondente.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-secondary/10 p-4 rounded-xl border border-border/30">
                  <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-2"><Shield size={14} className="text-blue-500" /> Firewall & Rede</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Avalia proteção perimetral, acesso remoto, VPN, MFA e controles de borda.</p>
               </div>
               <div className="bg-secondary/10 p-4 rounded-xl border border-border/30">
                  <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-2"><Server size={14} className="text-purple-500" /> Endpoint</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Avalia proteção dos dispositivos, capacidade de detecção e resposta.</p>
               </div>
               <div className="bg-secondary/10 p-4 rounded-xl border border-border/30">
                  <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-2"><HardDrive size={14} className="text-orange-500" /> Backup</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">Avalia continuidade operacional, backup e capacidade de recuperação.</p>
               </div>
            </div>
          </section>

          {/* BLOCO 4: LIMITES DA ANÁLISE */}
          <section className="bg-orange-500/5 p-5 rounded-xl border border-orange-500/20">
             <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Info size={14} /> Limites da Análise
             </h3>
             <p className="text-xs text-muted-foreground leading-relaxed">
                Esta avaliação é uma leitura inicial de maturidade operacional baseada nas informações fornecidas durante o onboarding. Ela não substitui auditoria formal, pentest ou análise forense.
             </p>
          </section>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScoreTransparencyModal;
