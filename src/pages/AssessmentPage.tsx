import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useProfile } from '@/context/ProfileContext';
import { useFirewallScore } from '@/hooks/useFirewallScore';
import { useEndpointScore } from '@/hooks/useEndpointScore';
import { useBackupScore } from '@/hooks/useBackupScore';
import MethodologyModal from '@/components/MethodologyModal';
import { 
  FileCheck, Layers, BadgeAlert, TrendingUp, Presentation, AlertCircle, 
  ShieldAlert, FileWarning, Key, Crosshair, Target, ArrowUpCircle, 
  ShieldCheck, ArrowRight, TriangleAlert, PieChart, DollarSign, Percent, ServerCrash, ActivitySquare, Info, Download
} from 'lucide-react';
import HeroHeader from '@/components/diagnostic/HeroHeader';
import SectionContainer from '@/components/diagnostic/SectionContainer';
import InvestmentMethodologyModal from '@/components/InvestmentMethodologyModal';
import { AssessmentPDFTemplate } from '@/components/diagnostic/AssessmentPDFTemplate';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const AssessmentPage = () => {
  const { profile } = useProfile();
  const firewall = useFirewallScore();
  const endpoint = useEndpointScore();
  const backup = useBackupScore();

  const [implCost, setImplCost] = useState<number | ''>('');
  const [monthlyCost, setMonthlyCost] = useState<number | ''>('');

  const baseUsers = profile.userCount ? parseInt(profile.userCount.toString().replace(/\D/g,'')) || 0 : 0; 
  const monthlyEstimateMin = baseUsers > 0 ? baseUsers * 120 : 0;
  const monthlyEstimateMax = baseUsers > 0 ? baseUsers * 180 : 0;

  // 1. Unified Score Calculations
  const domainScores = useMemo(() => {
    let domainsAvaliados = 0;
    let sumScore = 0;

    const fwScorePosture = Math.max(0, 100 - (firewall.riskScore * (100 / 135)));

    if (firewall.isRelevant) {
      domainsAvaliados++;
      sumScore += fwScorePosture;
    }
    
    if (endpoint.isRelevant) {
      domainsAvaliados++;
      sumScore += endpoint.riskScore;
    }

    if (backup.isRelevant && !backup.backupScoreData.insufficientData) {
      domainsAvaliados++;
      sumScore += backup.backupScoreData.score;
    }

    const overall = domainsAvaliados > 0 ? Math.round(sumScore / domainsAvaliados) : 0;

    return {
      firewall: firewall.isRelevant ? Math.round(fwScorePosture) : null,
      endpoint: endpoint.isRelevant ? endpoint.riskScore : null,
      backup: (backup.isRelevant && !backup.backupScoreData.insufficientData) ? backup.backupScoreData.score : null,
      overall,
      evaluatedDomains: domainsAvaliados
    };
  }, [firewall, endpoint, backup]);

  // 2. Global Risks Consolidation for "Por que esse score?"
  const globalRisks = useMemo(() => {
    let risks: { id: string, label: string, points: number, desc: string, source: string }[] = [];
    if (firewall.isRelevant) {
      risks = [...risks, ...firewall.activeRisks.map(r => ({ id: r.id, label: r.label, points: r.points, desc: r.description, source: 'Firewall / Rede' }))];
    }
    if (endpoint.isRelevant && endpoint.diagnosticData.risks) {
      risks = [...risks, ...endpoint.diagnosticData.risks.map(r => ({ id: r.id, label: r.label, points: r.points, desc: r.description, source: 'Endpoint' }))];
    }
    return risks.sort((a, b) => b.points - a.points).slice(0, 4); // Top 4
  }, [firewall, endpoint]);

  // 3. Financial Risk Consolidation
  const consolidatedFinancialRisk = useMemo(() => {
    const totalImpact = 450000;
    const baseProb = domainScores.overall < 40 ? 0.35 : domainScores.overall < 70 ? 0.15 : 0.05;
    return totalImpact * baseProb;
  }, [domainScores.overall]);

  // 4. Priority Calculation
  const priority = useMemo(() => {
    const list = [];
    if (domainScores.firewall !== null) list.push({ name: 'Firewall / Rede', score: domainScores.firewall });
    if (domainScores.endpoint !== null) list.push({ name: 'Endpoint', score: domainScores.endpoint });
    if (domainScores.backup !== null) list.push({ name: 'Backup & RTO', score: domainScores.backup });

    list.sort((a, b) => a.score - b.score);
    return list;
  }, [domainScores]);

  // 5. Investment & ROI Calculations
  const { estimatedSavings, simulatedAnnualCost, roiPercentage, projectedFinancialRisk, isValidRoi } = useMemo(() => {
    const projectedProb = 0.05; // 92% is high score -> 5% prob
    const totalImpact = 450000;
    const projectedAle = totalImpact * projectedProb;
    
    const savings = consolidatedFinancialRisk - projectedAle;
    
    const annualCost = (Number(monthlyCost) || 0) * 12 + (Number(implCost) || 0);
    const valid = annualCost > 0;
    
    const roi = valid ? ((savings - annualCost) / annualCost) * 100 : 0;
    
    return {
      projectedFinancialRisk: projectedAle,
      estimatedSavings: savings,
      simulatedAnnualCost: annualCost,
      roiPercentage: Math.max(0, Math.round(roi)),
      isValidRoi: valid
    };
  }, [consolidatedFinancialRisk, implCost, monthlyCost]);

  // 6. PDF Generation Handlers
  const [showPdfWarning, setShowPdfWarning] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const consolidatedLgpd = domainScores.overall > 0 ? Math.min(100, domainScores.overall + 5) : 0; 
  const consolidatedScore = domainScores.overall;

  const handleDownloadClick = () => {
    if (!profile.companyName || !isValidRoi) {
      setShowPdfWarning(true);
    } else {
      generatePdfAction();
    }
  };

  const generatePdfAction = async () => {
    setShowPdfWarning(false);
    setIsGeneratingPdf(true);
    
    setTimeout(() => {
        const element = document.getElementById('pdf-content');
        if (!element) {
           setIsGeneratingPdf(false);
           return;
        }

        const opt: any = {
          margin: 0,
          filename: `Security_Assessment_${profile.companyName ? profile.companyName.replace(/\s+/g, '_') : 'Empresa'}.pdf`,
          image: { type: 'jpeg' as const, quality: 0.98 },
          pagebreak: { mode: ['css', 'legacy'] },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true, windowWidth: 794 },
          jsPDF: { unit: 'px', format: [794, 1122], orientation: 'portrait' }
        };

        html2pdf().from(element).set(opt).save().then(() => {
           setIsGeneratingPdf(false);
        });
    }, 500);
  };

  // View state helpers
  const getGradient = (score: number | null) => {
    if (score === null) return 'bg-secondary';
    if (score >= 75) return 'bg-emerald-500';
    if (score >= 50) return 'bg-yellow-500';
    if (score >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getLabel = (score: number | null) => {
    if (score === null) return 'Não Avaliado';
    if (score >= 75) return 'Seguro';
    if (score >= 50) return 'Atenção';
    if (score >= 25) return 'Risco Alto';
    return 'Crítico';
  };

  const riskScenarios = [
    { title: 'Ataque de Ransomware', icon: ShieldAlert, color: 'text-red-500', desc: 'Criptografia em massa de dados críticos e servidores, paralisando a operação. Vetor inicial frequentemente se aproveita de falhas em endpoint de usuário ou conexões de rede desprotegidas.' },
    { title: 'Vazamento de Dados', icon: FileWarning, color: 'text-orange-500', desc: 'Exfiltração silenciosa de informações confidenciais corporativas. Ocorre tipicamente pela ausência de inspeção SSL de tráfego e falta de visibilidade / logs.' },
    { title: 'Roubo de Credenciais', icon: Key, color: 'text-yellow-500', desc: 'Ataques de força bruta contra VPNs ou contas privilegiadas. Facilitado ativamente pela ausência de múltiplo fator (MFA) efetivo nos pontos de acesso externo.' },
  ];

  if (!profile.onboardingComplete) {
     return (
       <div className="min-h-screen pt-24 px-4 pb-16 flex items-center justify-center">
         <div className="glass-card max-w-lg w-full p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
            <AlertCircle size={48} className="text-yellow-500" />
            <h2 className="text-2xl font-bold text-foreground">Ambiente Não Avaliado</h2>
            <p>Dados insuficientes para gerar a análise executiva narrativa. Preencha o onboarding para os domínios de Firewall, Endpoint ou Backup.</p>
         </div>
       </div>
     );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-6xl mx-auto space-y-20">

        <HeroHeader
          title="Concierge"
          titleAccent="Security Assessment"
          subtitle={profile.companyName ? `Diagnóstico de risco da ${profile.companyName}` : "Diagnóstico de risco do ambiente"}
          companyName={profile.companyName}
          companyLogo={profile.companyLogo}
          contactName={profile.contactName}
          contactRole={profile.contactRole}
          icon={Presentation}
        />

        {/* 1. SCORE GERAL E PRIORIDADES */}
        <SectionContainer title="Maturidade de Segurança Consolidada">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Overall Score */}
            <div className="col-span-1 md:col-span-4 glass-card p-8 flex flex-col items-center justify-center border-t-8" style={{ borderTopColor: getGradient(domainScores.overall).replace('bg-', '') }}>
                <p className="text-muted-foreground font-bold uppercase tracking-wide text-xs mb-2">Score Geral do Ambiente</p>
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br ${getGradient(domainScores.overall) === 'bg-red-500' ? 'from-red-500 to-red-700' : 'from-foreground to-foreground/50'}`}>
                    {domainScores.overall}%
                </motion.div>
                <p className="text-xl font-bold mt-2 text-foreground/80">{getLabel(domainScores.overall)}</p>
                <p className="text-sm mt-4 text-center text-muted-foreground">Avaliado sobre {domainScores.evaluatedDomains} domínios essenciais de infraestrutura.</p>
            </div>

            {/* Financial Risk & Priority Summary */}
            <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
                
                {/* Priority Highlight Expanded */}
                {priority.length > 0 && (
                  <div className={`glass-card p-6 border-l-4 ${priority[0].score < 50 ? 'border-l-red-500 bg-red-500/5' : 'border-l-orange-500 bg-orange-500/5'}`}>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-lg flex items-center gap-2"><BadgeAlert className="text-red-500" size={20}/> Prioridade: {priority[0].name}</h3>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                          Dentre os vetores diagnosticados, o escopo <span className="font-bold text-foreground">{priority[0].name}</span> representa a frente mais vulnerável e apresenta a menor maturidade técnica atualmente. 
                          Seu score base é <span className="font-bold border-b border-red-500">{priority[0].score}/100</span>.
                      </p>
                      <div className="bg-background/80 p-4 rounded-lg border border-border/60">
                        <p className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2"><Crosshair size={14} className="text-red-400"/> Consequência Prática</p>
                        <p className="text-xs text-muted-foreground">A fragilidade crônica neste componente permite que ameaças bypassen defesas, estabelecendo um "ponto único de falha" inicial para a cadeia de ataque. Antes de ramificar orçamentos, focar estrategicamente na mitigação desta superfície deve ser a principal diretriz.</p>
                      </div>
                  </div>
                )}

                {/* Financial Overview Expanded */}
                <div className="glass-card p-6 border-transparent bg-secondary/10">
                   <div className="flex justify-between items-center mb-6">
                        <div>
                           <h3 className="font-bold text-lg flex items-center gap-2"><TrendingUp className="text-blue-500" size={20}/> Exposição Financeira Estimada (ALE)</h3>
                           <p className="text-xs text-muted-foreground mt-1">Estimativa de risco cibernético financeiro anual (Probabilidade × Impacto).</p>
                        </div>
                        <p className="text-3xl font-extrabold font-mono text-foreground">R$ {consolidatedFinancialRisk.toLocaleString('pt-BR')}</p>
                   </div>
                   <div className="space-y-3 pt-4 border-t border-border/50">
                       <p className="text-sm text-foreground/90"><span className="font-bold">Faixa referencial de custo por incidente grave:</span> Entre R$ 150.000 e R$ 500.000</p>
                       <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4 marker:text-primary">
                         <li><strong className="text-foreground/70">Impacto Operacional:</strong> Paralisia abrupta de sistemas críticos como ERPs judiciais e fiscais.</li>
                         <li><strong className="text-foreground/70">Perda de Produtividade:</strong> Despesa-base imobilizada em até {profile.userCount || 50} colaboradores inativos na folha de pagamento durante o "downtime".</li>
                         <li><strong className="text-foreground/70">Recuperação e Forense:</strong> Custos inflacionados com consultoria especialista, negociação legal e reconstrução de TI corrompida.</li>
                       </ul>
                   </div>
                </div>
            </div>
          </div>
        </SectionContainer>

        {/* 2. POR QUE ESSE SCORE (Global Risks Narrative) */}
        {globalRisks.length > 0 && (
          <SectionContainer title="Por que o seu ambiente recebeu esse Score?" icon={AlertCircle} iconColor="text-orange-500">
             <p className="text-lg text-muted-foreground mb-6">Ao identificar a falta dos controles a seguir, os modelos das agências (NIST / CIS) consideram o ambiente severamente ofuscado:</p>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {globalRisks.map((risk, idx) => (
                   <div key={idx} className="glass-card p-5 border-l-2 border-l-orange-500 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-orange-500/10">
                      <div className="flex items-center gap-2 mb-2">
                         <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-secondary text-primary rounded-full tracking-wider">{risk.source}</span>
                         <h4 className="font-bold text-foreground text-base tracking-tight">{risk.label}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed mt-3">{risk.desc}</p>
                   </div>
                ))}
             </div>
          </SectionContainer>
        )}

        {/* 3. CENÁRIOS DE RISCO (Kill Chain) */}
        <SectionContainer title="Cenários de Risco no Seu Ambiente (Kill Chain)" icon={Target} iconColor="text-primary">
           <p className="text-muted-foreground mb-6 text-lg">Com base nas vulnerabilidades sistêmicas identificadas, estes são os fluxos predatórios mais prováveis de comprometer sua operação nos moldes atuais:</p>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {riskScenarios.map((cen, idx) => (
                 <div key={idx} className="glass-card p-6 flex flex-col items-start border-transparent hover:border-border/50 transition-all group">
                    <cen.icon size={36} className={`${cen.color} mb-5 group-hover:scale-110 transition-transform origin-left`} />
                    <h4 className="font-bold text-foreground mb-3 text-lg leading-tight">{cen.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1">{cen.desc}</p>
                 </div>
              ))}
           </div>
        </SectionContainer>

        {/* 4. EXP. REGULATÓRIA LGPD */}
        <SectionContainer title="Exposição Regulatória (LGPD)" icon={FileCheck} iconColor="text-blue-500">
           <p className="text-lg text-muted-foreground mb-6">A falha na proteção não resulta apenas em ataque digital, mas infração das obrigações civis exigidas no Brasil:</p>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[
                { art: 'Art. 46', title: 'Segurança Técnica Apropriada', desc: 'A ausência de prevenção efetiva de ponta-a-ponta (como MFA em conexões, criptografia inter-vilan e EDR comportamental) fere a exigência de proteção contínua sobre dados pessoais de clientes e fornecedores.' },
                { art: 'Art. 48', title: 'Comunicação de Incidentes (DPO)', desc: 'A falha de visibilidade sistêmica sem um SOC 24/7 de retaguarda atrasa absurdamente os alertas de vazamento, tornando inviável comunicar Autoridades num prazo razoável legal (72 horas).' },
                { art: 'Art. 50', title: 'Governança & Boas Práticas', desc: 'As abordagens amadoras de suporte (break/fix) sem processos documentados ou monitoramento central indicam negligência às regras orgânicas e à estruturação de compliance cibernético exigida na regulamentação.' }
              ].map(lg => (
                  <div key={lg.art} className="glass-card p-6 border-t-2 border-blue-500/50 bg-blue-500/5 transition-colors hover:bg-blue-500/10">
                     <p className="text-xs font-black tracking-widest text-blue-500 mb-2">{lg.art}</p>
                     <p className="font-bold text-foreground mb-3 text-lg leading-tight">{lg.title}</p>
                     <p className="text-sm text-foreground/80 leading-relaxed">{lg.desc}</p>
                  </div>
              ))}
           </div>
           
           <div className="flex border border-red-500/30 bg-red-500/10 rounded-xl p-6 md:p-8 items-start gap-5">
              <TriangleAlert className="text-red-500 shrink-0 mt-1" size={28} />
              <div>
                 <h4 className="font-bold text-foreground mb-2 text-xl">Potenciais Sanções Administrativas</h4>
                 <p className="text-base text-muted-foreground leading-relaxed">
                   De acordo com provisões já efetivadas e aplicadas pela Autoridade Nacional de Proteção de Dados (ANPD) sobre vazamentos reais no Brasil, infrações por arquitetura exposta acarretarão em severas 
                   <strong className="text-foreground mx-1">multas limitadas a até 2% do faturamento da sua empresa</strong> 
                   (no teto de R$ 50 mi). Sem citar os incomensuráveis danos à imagem corporativa do {profile.companyName ? `da ${profile.companyName}` : 'seu negócio'} ao mercado.
                 </p>
              </div>
           </div>
        </SectionContainer>

        {/* 5. COMO MELHORAR O SCORE (Simulação) */}
        <SectionContainer title="Como Mudar a História / Elevação de Maturidade" icon={ArrowUpCircle} iconColor="text-emerald-500">
           <p className="text-lg text-muted-foreground mb-8">Esta é a simulação de resiliência caso os controles de postura avançada fornecidos pelo Grupo QOS (Concierge) sejam aderidos integralmente na fundação do ambiente:</p>
           
           <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 w-full space-y-4">
                 {[
                   { name: 'Inspeção profunda de perímetro com prevenção de surpresas cibernéticas (NGFW)', id: 1 },
                   { name: 'Defesa baseada em IA e bloqueio real contra ramsomeware via Telemetria Endpoints (EDR)', id: 2 },
                   { name: 'Monitoramento Contínuo Residente e detecção em poucas horas(SOC Especialista 24/7)', id: 3 },
                   { name: 'Controles restritos de Identidade e Políticas Zero-Trust integradas (MFA/Segmentação)', id: 4 },
                 ].map(item => (
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} 
                        whileInView={{ opacity: 1, x: 0 }} 
                        viewport={{ once: true }} 
                        key={item.id} 
                        className="flex items-center gap-3 p-5 bg-secondary/30 rounded-xl border border-border/50 hover:bg-secondary/50 transition-colors"
                    >
                       <ShieldCheck className="text-emerald-500 shrink-0" size={24} />
                       <p className="font-medium text-foreground text-sm md:text-base leading-snug">{item.name}</p>
                    </motion.div>
                 ))}
              </div>
              
              <div className="glass-card flex-[0.7] w-full p-8 md:p-12 flex flex-col justify-center text-center items-center relative overflow-hidden border-emerald-500/20 bg-emerald-500/5">
                 <div className="absolute -right-8 -top-8 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
                 <p className="text-muted-foreground font-medium mb-3 text-lg">Projeção do Score Arquitetônico:</p>
                 <div className="flex items-center justify-center gap-4 text-6xl md:text-7xl font-black text-foreground">
                    <span className="opacity-25">{domainScores.overall}%</span>
                    <ArrowRight className="text-emerald-500 animate-pulse" size={40} />
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-600 drop-shadow-sm">92%</span>
                 </div>
                 <p className="text-xs text-muted-foreground mt-8 uppercase tracking-widest font-black text-emerald-500/60 border-t border-emerald-500/20 pt-4 w-full">Redução Absoluta da Superfície de Ataque</p>
              </div>
           </div>

           {/* ROI & INVESTMENT SECTION */}
           <div className="mt-16 pt-8 border-t border-border/50">
               <h4 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2"><PieChart size={24} className="text-primary"/> Justificativa de Investimento e ROI</h4>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Comparaçao de Risco */}
                  <div className="glass-card p-6 flex flex-col justify-between border-t-2 border-t-yellow-500">
                     <p className="font-bold text-foreground mb-6">Comparação Risco Financeiro</p>
                     <div className="space-y-4">
                        <div>
                           <p className="text-xs text-muted-foreground font-bold tracking-wider mb-1">ANTES (Situação Atual)</p>
                           <p className="text-xl font-bold text-red-400 opacity-90">R$ {consolidatedFinancialRisk.toLocaleString('pt-BR')}</p>
                        </div>
                        <div className="border-t border-border/50 pt-4">
                           <p className="text-xs text-emerald-500/80 font-bold tracking-wider mb-1">DEPOIS (Modelo Concierge)</p>
                           <p className="text-2xl font-black text-emerald-500">R$ {projectedFinancialRisk.toLocaleString('pt-BR')}</p>
                        </div>
                     </div>
                  </div>

                  {/* Economia Estimada */}
                  <div className="glass-card p-6 flex flex-col justify-between border-t-2 border-t-blue-500 bg-secondary/10">
                     <div>
                       <p className="font-bold text-foreground mb-1">Economia Estimada</p>
                       <p className="text-sm text-muted-foreground mb-6">Redução anual do passivo de risco após blindagem.</p>
                     </div>
                     <div className="flex items-center gap-4 border-l-4 border-blue-500 pl-4">
                        <DollarSign size={36} className="text-blue-500" />
                        <div>
                            <p className="text-3xl font-black text-foreground">R$ {estimatedSavings.toLocaleString('pt-BR')}</p>
                            <p className="text-xs font-bold text-blue-500 tracking-wider">EVITADO AO ANO</p>
                        </div>
                     </div>
                  </div>

                  {/* ROI */}
                  <div className={`glass-card p-6 flex flex-col justify-between border-t-2 transition-colors ${isValidRoi ? 'border-t-emerald-500 bg-emerald-500/5' : 'border-t-border/50 bg-secondary/10'}`}>
                     <div className="mb-6">
                       <p className="font-bold text-foreground mb-1">Retorno (ROI Estimado)</p>
                       <p className={`text-sm ${isValidRoi ? 'text-emerald-500/80' : 'text-muted-foreground'}`}>Simulação interativa de impacto vs custo.</p>
                     </div>

                     <div className="space-y-4 mb-4">
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Implantação (R$)</label>
                              <input 
                                  type="number" 
                                  placeholder="Ex: 5000" 
                                  className="w-full bg-background/50 border border-border/50 rounded-lg p-2 text-sm text-foreground focus:border-primary outline-none transition-colors" 
                                  value={implCost} 
                                  onChange={(e) => setImplCost(e.target.value ? Number(e.target.value) : '')} 
                              />
                           </div>
                           <div>
                              <label className="text-[10px] uppercase font-bold text-muted-foreground block mb-1">Mensalidade (R$)</label>
                              <input 
                                  type="number" 
                                  placeholder="Ex: 2500" 
                                  className="w-full bg-background/50 border border-border/50 rounded-lg p-2 text-sm text-foreground focus:border-primary outline-none transition-colors" 
                                  value={monthlyCost} 
                                  onChange={(e) => setMonthlyCost(e.target.value ? Number(e.target.value) : '')} 
                              />
                           </div>
                        </div>
                        {monthlyEstimateMin > 0 && (
                            <p className="text-[10px] text-muted-foreground italic text-center opacity-80">
                                Estimativa base p/ seu cenário: R$ {monthlyEstimateMin.toLocaleString('pt-BR')} – R$ {monthlyEstimateMax.toLocaleString('pt-BR')} / mês
                            </p>
                        )}
                     </div>

                     <div className="flex items-center gap-4 border-t border-border/50 pt-4 mt-auto">
                        {isValidRoi ? (
                            <>
                                <div className="bg-emerald-500/20 p-2.5 rounded-xl">
                                    <Percent size={28} className="text-emerald-500 drop-shadow-md" />
                                </div>
                                <div>
                                   <p className="text-3xl font-black text-emerald-500">+{roiPercentage}%</p>
                                   <p className="text-[10px] font-bold text-emerald-500/80 tracking-wider mt-0.5">RETORNO POSITIVO 1º ANO</p>
                                </div>
                            </>
                        ) : (
                             <div className="flex items-start gap-3 w-full">
                                <Info size={16} className="text-muted-foreground shrink-0 mt-0.5" />
                                <p className="text-xs text-muted-foreground font-medium">Informe os valores acima para simular este cálculo.</p>
                             </div>
                        )}
                     </div>
                  </div>
               </div>
               
               {/* Why isolated tech doesn't work vs Managed Model */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                  <div className="glass-card p-6 bg-red-500/5 border border-red-500/10">
                     <h5 className="font-bold text-red-500/80 flex items-center gap-2 mb-3"><ServerCrash size={18}/> Por que tecnologia isolada não resolve?</h5>
                     <p className="text-sm text-muted-foreground leading-relaxed">
                        Apenas comprar licenças de softwares (Antivírus tradicionais ou Firewalls) gera uma falsa sensação de segurança. Sem <strong>monitoramento unificado e ativo</strong>, os alertas se perdem no ruído. Sem <strong>capacidade humana de resposta</strong>, malwares operam silenciosamente meses antes da contenção total.
                     </p>
                  </div>
                  <div className="glass-card p-6 bg-primary/5 border border-primary/20 hover:border-primary/50 transition-colors">
                     <h5 className="font-bold text-primary flex items-center gap-2 mb-3"><ActivitySquare size={18}/> O Modelo Gerenciado Concierge</h5>
                     <p className="text-sm text-muted-foreground leading-relaxed">
                        Injetamos tecnologias Enterprise de ponta atreladas a um <strong>SOC ativo 24/7</strong>. Analistas especializados fazem o monitoramento contínuo e a resposta imediata a ameaças cibernéticas, esmagando o tempo de detecção de semanas para poucos minutos. Cuidamos do front-end da segurança para você cuidar do core do seu negócio.
                     </p>
                  </div>
               </div>

               {/* Modal Button */}
               <div className="flex justify-center">
                  <InvestmentMethodologyModal />
               </div>
           </div>
        </SectionContainer>

        {/* DOMAIN BREAKDOWN (Original Existent but now positioned lower down) */}
        <SectionContainer title="Maturidade Específica por Domínio" icon={Layers}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: 'Firewall e Acesso', score: domainScores.firewall, desc: 'Proteção de rede e inspeção de borda interna / externa'},
                { name: 'Endpoints', score: domainScores.endpoint, desc: 'Proteção imutável nos dispositivos de usuários (Servidores/Wks)'},
                { name: 'Backup e Resiliência', score: domainScores.backup, desc: 'Cópias de segurança protegidas e continuidade rápida'}
              ].map((d, i) => (
                <div key={i} className={`glass-card p-6 flex flex-col relative overflow-hidden group`}>
                    <div className="mb-8">
                       <h4 className="font-bold text-lg text-foreground mb-1">{d.name}</h4>
                       <p className="text-sm text-muted-foreground">{d.desc}</p>
                    </div>
                    {d.score !== null ? (
                        <div className="mt-auto">
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-sm font-bold text-foreground/70">{getLabel(d.score)}</p>
                                <p className="text-3xl font-black">{d.score}</p>
                            </div>
                            <div className="w-full bg-secondary h-2 shadow-inner overflow-hidden rounded-full">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${d.score}%` }} className={`h-full ${getGradient(d.score)}`}></motion.div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-auto pt-6 border-t border-border/30">
                            <p className="text-center font-bold text-muted-foreground">NÃO AVALIADO (S/ DADOS)</p>
                        </div>
                    )}
                </div>
              ))}
            </div>
        </SectionContainer>
        
        <div className="flex justify-center mt-4">
           <MethodologyModal score={domainScores.firewall || 0} />
        </div>

        {/* PDF Download Action Box */}
        <section className="container mx-auto px-6 mb-20 mt-16 text-center relative z-10 w-full max-w-5xl">
             <div className="bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent h-px w-full max-w-2xl mx-auto mb-12"></div>
             
             <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-4">Finalizar Diagnóstico</h2>
             <p className="text-muted-foreground w-full max-w-lg mx-auto mb-8 text-sm">
                Exporte todo o detalhamento executivo, matemático e de conformidade em um relatório otimizado para tomada de decisão (Business Case).
             </p>

             <button 
                 onClick={handleDownloadClick}
                 disabled={isGeneratingPdf}
                 className="inline-flex items-center gap-3 bg-cyan-500 hover:bg-cyan-400 text-[#0B1220] px-8 py-4 rounded-xl font-bold uppercase tracking-widest transition-all disabled:opacity-50"
             >
                <Download size={24} />
                {isGeneratingPdf ? 'Gerando PDF (Aguarde)...' : 'Baixar Relatório'}
             </button>
        </section>

      </div>

      {/* --- INVISIBLE PRINT COMPONENT (OFF-SCREEN) --- */}
      <div className="absolute left-[-9999px] top-0 overflow-hidden w-0 h-0">
         <AssessmentPDFTemplate 
             profile={profile} 
             overallScore={consolidatedScore} 
             domainScores={domainScores} 
             priority={priority} 
             financialRisk={consolidatedFinancialRisk} 
             projectedAle={projectedFinancialRisk} 
             lgpdScore={consolidatedLgpd} 
             annualCost={simulatedAnnualCost} 
             isValidRoi={isValidRoi} 
             roiPercentage={roiPercentage} 
             estimatedSavings={estimatedSavings} 
             implCost={implCost} 
             monthlyCost={monthlyCost} 
             date={new Date().toLocaleDateString('pt-BR')}
         />
      </div>

      {/* --- VALIDATION DIALOG --- */}
      <Dialog open={showPdfWarning} onOpenChange={setShowPdfWarning}>
        <DialogContent className="glass-card border-border/50 p-6 min-w-96 bg-[#0B1220]/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl mb-2 text-foreground font-bold">
               <AlertCircle className="text-yellow-500" />
               Gerar Relatório
            </DialogTitle>
            <DialogDescription className="text-muted-foreground leading-relaxed">
               Algumas informações importantes podem estar incompletas (ex: Nome da Empresa ou Simulação de Valoração ROI nula).
               <br/><br/>O relatório será gerado exibindo as lacunas visuais de <em>"Não preenchido"</em> ou <em>"Pendente"</em>. Deseja prosseguir mesmo assim?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex gap-3 sm:justify-end">
             <Button variant="ghost" className="hover:bg-red-500/10 text-red-500 font-bold" onClick={() => setShowPdfWarning(false)}>Cancelar</Button>
             <Button className="bg-cyan-500 hover:bg-cyan-400 text-[#0B1220] font-bold" onClick={generatePdfAction}>
                Gerar mesmo assim
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssessmentPage;
