import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Info, Shield, Server, HardDrive, AlertTriangle } from 'lucide-react';
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
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-4 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all gap-2"
        >
          <Info size={14} />
          Como chegamos nesse score?
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card border-border/40 p-0 gap-0 bg-[#0B1220]/95 backdrop-blur-xl">
        <DialogHeader className="p-8 pb-4 border-b border-white/5">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight text-foreground">
            Transparência do Score
          </DialogTitle>
          <p className="text-muted-foreground text-sm mt-1">
            Entenda a composição técnica e os critérios utilizados para o diagnóstico de maturidade.
          </p>
        </DialogHeader>

        <div className="p-8 space-y-10">
          {/* SEÇÃO 1 — COMO O SCORE É CALCULADO */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
              <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">1. Como o Score é Calculado</h3>
            </div>
            
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10">
              <p>
                Este score representa o nível de maturidade da segurança do ambiente. 
                O cálculo é feito a partir da avaliação de três domínios principais:
              </p>
              <ul className="space-y-2 font-medium text-foreground/90">
                <li className="flex items-center gap-2">• Firewall / Rede</li>
                <li className="flex items-center gap-2">• Endpoint / Dispositivos</li>
                <li className="flex items-center gap-2">• Backup / Continuidade</li>
              </ul>
              <p>
                Cada domínio recebe uma pontuação de 0 a 100 com base na presença ou ausência de controles de segurança. 
                O score geral é a média desses três domínios.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Firewall', score: firewallScore, icon: Shield, color: 'text-blue-500' },
                { label: 'Endpoint', score: endpointScore, icon: Server, color: 'text-purple-500' },
                { label: 'Backup', score: backupScore, icon: HardDrive, color: 'text-orange-500' },
                { label: 'Score Geral', score: overallScore, icon: Info, color: 'text-cyan-500', isTotal: true },
              ].map((item, idx) => (
                <div key={idx} className={`p-4 rounded-xl border ${item.isTotal ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/10'} flex flex-col items-center text-center`}>
                  <item.icon size={16} className={`${item.color} mb-2`} />
                  <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">{item.label}</p>
                  <p className={`text-xl font-black ${item.isTotal ? 'text-cyan-500' : 'text-foreground'}`}>
                    {item.score !== null ? `${item.score}%` : 'N/A'}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* SEÇÃO 2 — FATORES QUE IMPACTARAM O SCORE */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
              <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">2. Fatores que Impactaram o Score</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {risks.length > 0 ? (
                risks.map((risk, idx) => (
                  <div key={idx} className="glass-card p-4 border-l-2 border-l-orange-500/50 bg-orange-500/5 flex flex-col gap-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                        <AlertTriangle size={14} className="text-orange-500" />
                        {risk.label}
                      </h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${risk.points >= 20 ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
                        Impacto: {risk.points >= 20 ? 'Alto' : 'Médio'}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">{risk.desc}</p>
                    <span className="text-[9px] font-bold uppercase text-muted-foreground/50 mt-1">{risk.source}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 glass-card border-dashed border-white/10">
                  <p className="text-sm text-muted-foreground">Nenhum fator crítico detectado nos domínios avaliados.</p>
                </div>
              )}
            </div>
          </section>

          {/* SEÇÃO 3 — INTERPRETAÇÃO */}
          <section className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
              <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">3. Interpretação do Resultado</h3>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Shield size={80} className="text-emerald-500" />
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed relative z-10">
                "O ambiente apresenta funcionamento operacional, porém com lacunas relevantes de segurança.
                <br /><br />
                Os controles mais críticos estão ausentes nas camadas de rede e dispositivos, que são os principais vetores de ataque atualmente.
                <br /><br />
                A priorização recomendada deve começar pelos domínios com menor score."
              </p>
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScoreTransparencyModal;
