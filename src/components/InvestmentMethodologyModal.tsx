import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

const InvestmentMethodologyModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-primary hover:bg-primary/10 gap-2 border border-primary/20 bg-primary/5 mt-4">
          <HelpCircle size={18} />
          Como estimamos o impacto financeiro
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col glass-card border-border/50 p-0">
        <DialogHeader className="p-8 pb-6 border-b border-white/10">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2 uppercase tracking-tight">
            Como estimamos o impacto financeiro
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-2 leading-relaxed">
            Esta simulação traduz maturidade operacional em uma estimativa de exposição financeira para apoiar decisões executivas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-8 space-y-10 overflow-y-auto custom-scrollbar">
          
          {/* Modelo */}
          <div className="space-y-6">
            <p className="text-sm text-foreground/90 leading-relaxed bg-white/5 p-5 rounded-xl border border-white/10">
              O risco financeiro estimado considera um cenário de indisponibilidade operacional associado ao nível de maturidade identificado.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-secondary/10 p-6 rounded-xl border border-border/30 flex flex-col justify-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Cenário de Impacto Operacional</p>
                  <p className="text-3xl font-black text-foreground">R$ 450.000</p>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">Impacto base simulado para PMEs.</p>
               </div>
               <div className="bg-secondary/10 p-6 rounded-xl border border-border/30">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Probabilidade estimada conforme maturidade identificada</p>
                  <ul className="space-y-3 text-sm text-foreground/90">
                     <li className="flex justify-between items-center"><span className="text-muted-foreground">Abaixo de 40</span> <span className="font-bold text-red-400">35%</span></li>
                     <li className="flex justify-between items-center"><span className="text-muted-foreground">Entre 40 e 69</span> <span className="font-bold text-orange-400">15%</span></li>
                     <li className="flex justify-between items-center"><span className="text-muted-foreground">Acima de 70</span> <span className="font-bold text-emerald-400">5%</span></li>
                  </ul>
               </div>
            </div>
          </div>

          {/* O que entra e o que não entra */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <h3 className="font-bold text-foreground text-sm uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-border/30">
                   <CheckCircle2 size={16} className="text-emerald-500" /> O que entra nesta estimativa?
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                   {['Parada operacional', 'Recuperação emergencial', 'Perda de produtividade', 'Indisponibilidade', 'Suporte corretivo', 'Exposição de dados'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50 shrink-0" /> {item}
                      </li>
                   ))}
                </ul>
             </div>
             
             <div className="space-y-4">
                <h3 className="font-bold text-foreground text-sm uppercase tracking-widest flex items-center gap-2 pb-3 border-b border-border/30">
                   <XCircle size={16} className="text-red-500" /> O que esta análise não calcula?
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                   {['Multas específicas', 'Auditoria jurídica', 'Custos atuariais', 'Perda comercial futura', 'Indenizações'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-red-500/50 shrink-0" /> {item}
                      </li>
                   ))}
                </ul>
             </div>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-start gap-4 mt-8">
             <AlertCircle className="text-primary shrink-0 mt-0.5" size={20} />
             <p className="text-xs text-foreground/80 leading-relaxed">
               <strong>Disclaimer:</strong> Esta simulação não representa garantia de perda ou previsão financeira absoluta. Ela serve como referência executiva para comparar risco atual, risco reduzido e investimento preventivo.
             </p>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentMethodologyModal;
