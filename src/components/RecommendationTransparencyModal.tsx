import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, ShieldCheck, Server, AlertTriangle, Cpu } from 'lucide-react';
import { RecommendationResult } from '@/utils/firewallRecommendation';

interface RecommendationTransparencyModalProps {
  rec: RecommendationResult;
  internetLinksCount: number;
}

const RecommendationTransparencyModal: React.FC<RecommendationTransparencyModalProps> = ({
  rec,
  internetLinksCount,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-primary/30 text-primary hover:bg-primary/10 mt-4 font-semibold"
        >
          <HelpCircle size={16} />
          Como chegamos nessa recomendação?
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col glass-card border-border/50 p-0">
        <DialogHeader className="p-6 md:p-8 pb-4 border-b border-white/10">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <Cpu size={22} className="text-primary" />
            Como chegamos nessa recomendação?
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            Detalhamento do dimensionamento técnico baseado na Tabela Concierge.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 md:p-8 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Section 1: Ambiente considerado */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Ambiente considerado
            </h4>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-secondary/20 p-3 rounded-lg border border-border/30">
                <span className="text-xs text-muted-foreground block">Usuários</span>
                <span className="text-sm font-bold text-foreground">
                  {rec.initialUsers}
                  {rec.effectiveUsers > rec.initialUsers && (
                    <span className="text-xs text-primary ml-1 block font-normal">
                      (dimensionado p/ {rec.effectiveUsers})
                    </span>
                  )}
                </span>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg border border-border/30">
                <span className="text-xs text-muted-foreground block">Links de internet</span>
                <span className="text-sm font-bold text-foreground">{internetLinksCount}</span>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg border border-border/30">
                <span className="text-xs text-muted-foreground block">Banda total informada</span>
                <span className="text-sm font-bold text-foreground">{rec.totalLinksMbps} Mbps</span>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg border border-border/30">
                <span className="text-xs text-muted-foreground block">Perfil de utilização</span>
                <span className="text-sm font-bold text-foreground">{rec.usageLabel}</span>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg border border-border/30">
                <span className="text-xs text-muted-foreground block">Fator de utilização</span>
                <span className="text-sm font-bold text-foreground">{rec.factorPercentLabel}</span>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg border border-border/30">
                <span className="text-xs text-muted-foreground block">Throughput de referência</span>
                <span className="text-sm font-bold text-primary">{rec.adjustedMbps} Mbps</span>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg border border-border/30">
                <span className="text-xs text-muted-foreground block">VPN Client-to-Site</span>
                <span className="text-sm font-bold text-foreground">{rec.vpnClientToSite}</span>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg border border-border/30">
                <span className="text-xs text-muted-foreground block">VPN Site-to-Site</span>
                <span className="text-sm font-bold text-foreground">{rec.vpnSiteToSite}</span>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg border border-border/30">
                <span className="text-xs text-muted-foreground block">VLANs</span>
                <span className="text-sm font-bold text-foreground">{rec.vlanCount}</span>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg border border-border/30">
                <span className="text-xs text-muted-foreground block">IDS/IPS</span>
                <span className="text-sm font-bold text-foreground">
                  {rec.idsIps ? 'Ativo' : 'Inativo'}
                </span>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg border border-border/30">
                <span className="text-xs text-muted-foreground block">Inspeção de tráfego</span>
                <span className="text-sm font-bold text-foreground">
                  {rec.trafficInspection ? 'Ativa' : 'Inativa'}
                </span>
              </div>

              <div className="bg-secondary/20 p-3 rounded-lg border border-border/30">
                <span className="text-xs text-muted-foreground block">DPI-SSL</span>
                <span className="text-sm font-bold text-foreground">
                  {rec.dpiSsl ? 'Ativado' : 'Desativado'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Resultado da tabela */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Resultado da Tabela Concierge
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/30">
                <div className="flex items-center gap-2 mb-1">
                  <Server size={18} className="text-primary" />
                  <span className="text-xs text-muted-foreground uppercase font-bold">
                    SonicWall Recomendado
                  </span>
                </div>
                <p className="text-2xl font-black text-primary">{rec.sonicwall.name}</p>
                <p className="text-xs text-foreground/80 mt-1">
                  Capacidade cadastrada: Até <strong>{rec.sonicwall.maxUsers}</strong> usuários •{' '}
                  <strong>{rec.sonicwall.throughput} Mbps</strong> throughput
                </p>
              </div>

              <div className="bg-primary/5 p-4 rounded-xl border border-primary/30">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={18} className="text-primary" />
                  <span className="text-xs text-muted-foreground uppercase font-bold">
                    Fortinet Recomendado
                  </span>
                </div>
                <p className="text-2xl font-black text-primary">{rec.fortinet.name}</p>
                <p className="text-xs text-foreground/80 mt-1">
                  Capacidade cadastrada: Até <strong>{rec.fortinet.maxUsers}</strong> usuários •{' '}
                  <strong>{rec.fortinet.throughput} Mbps</strong> throughput
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Fórmula */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Fórmula de cálculo de throughput
            </h4>
            <div className="bg-secondary/40 p-4 rounded-xl border border-border/40 text-center">
              <p className="text-lg font-mono font-bold text-primary">{rec.formulaText}</p>
            </div>
          </div>

          {/* Section 4: Justificativa Técnica */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Justificativa Técnica
            </h4>

            <div className="bg-secondary/20 p-4 rounded-xl border border-border/30 space-y-2 text-xs text-foreground/80 leading-relaxed">
              <p>
                • O sistema procura na Tabela Concierge o menor equipamento que atende
                simultaneamente à quantidade de usuários e à capacidade de tráfego calculada para o
                ambiente.
              </p>
              <p>
                • VPNs, VLANs e recursos de segurança são considerados na caracterização técnica do
                ambiente. Eles somente devem alterar o equipamento quando houver um limite
                quantitativo correspondente cadastrado na tabela de dimensionamento.
              </p>
            </div>
          </div>

          {/* Section 5: Warnings if DPI-SSL active or capacity exceeded */}
          {rec.dpiSslNote && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-medium text-amber-200 leading-relaxed">
                {rec.dpiSslNote}
              </p>
            </div>
          )}

          {rec.exceedsCapacityNote && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
              <p className="text-xs font-medium text-red-200 leading-relaxed">
                {rec.exceedsCapacityNote}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RecommendationTransparencyModal;
