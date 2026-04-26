import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Calculator, FileWarning, TrendingDown, Percent, ShieldCheck } from 'lucide-react';

const InvestmentMethodologyModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" className="text-primary hover:bg-primary/10 gap-2 border border-primary/20 bg-primary/5 mt-4">
          <HelpCircle size={18} />
          Como chegamos nesse valor? (Metodologia)
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col glass-card border-border/50 p-6">
        <DialogHeader className="pb-4 border-b border-white/10">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="text-primary" size={24} />
            Metodologia de Assessment e ROI
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Entenda como calculamos o risco financeiro e a economia real do modelo Concierge.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6 space-y-8 overflow-y-auto custom-scrollbar">
          
          <div className="space-y-4">
            <h3 className="font-bold text-foreground flex items-center gap-2 border-b border-border/30 pb-2">
              <FileWarning className="text-orange-500" size={18} /> 1. Como a probabilidade e impacto foram definidos?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O <strong>IBM Cost of a Data Breach Report</strong> estabelece correlação entre maturidade técnica e custo de incidentes. Utilizamos uma métrica-base (ALE - Annual Loss Expectancy) comum em PMEs de ~R$ 450.000 como "Dano Total" num caso de falha crítica que trave operações e vaze dados.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O sistema utiliza a pontuação do Assessment para escalar a <strong>probabilidade</strong>. Scores abaixo de 40% recebem probabilidade alta (35%), multiplicando de forma letal o impacto estimado que sua empresa carrega sem saber.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-foreground flex items-center gap-2 border-b border-border/30 pb-2">
               <TrendingDown className="text-blue-500" size={18} /> 2. Risco Atual (ALE) vs Risco Projetado
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              O "Score Projetado de 92%" significa incorporar serviços estruturados. Segundo o <strong>Sophos State of Ransomware</strong>, blindar a rede com defesas especializadas alinhado a um SOC gerenciado abaixa incrivelmente o risco final, reduzindo a probabilidade p/ quase zero (adotamos 5%).
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-bold text-foreground flex items-center gap-2 border-b border-border/30 pb-2">
               <Percent className="text-emerald-500" size={18} /> 3. Como chegamos no cálculo do ROI?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Economia Ano:</strong> Risco Financeiro Atual (ANTES) menos O Risco Reduzido pós-Concierge (DEPOIS).
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong>Custo Simulado:</strong> Considera-se uma baseline média de serviço gerenciado estipulada em R$ 120 mensais por colaborador declarado nos levantamentos de Endpoint.
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
               <strong>Retorno sobre o Investimento (ROI %) =</strong> <code>(Economia Simulada - Custo) / Custo</code>. <br/>
               Isto justifica categoricamente que "cibersegurança não é custo operatório, mas sim proteção ativa do caixa".
            </p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-4 mt-8">
             <ShieldCheck className="text-primary shrink-0" size={24} />
             <p className="text-xs text-foreground/80 leading-relaxed italic">
               * Importante: Estes números não configuram proposta comercial ou promessa de cobertura legal. Servem exclusivamente para embasar tomadores de decisão (C-Levels) sobre o valor tangível de investir na prevenção de superfície através da correlação matemática de referenciais globais de cyber segurança.
             </p>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentMethodologyModal;
