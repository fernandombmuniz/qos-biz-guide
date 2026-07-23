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
import ScoreTransparencyModal from '@/components/ScoreTransparencyModal';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// @ts-ignore
import html2pdf from 'html2pdf.js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MaturityGauge } from '@/components/diagnostic/MaturityGauge';

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
  const allRisks = useMemo(() => {
    let risks: { id: string, label: string, points: number, desc: string, source: string }[] = [];
    
    const normalizeLabel = (label: string, source: string) => {
       const l = label.toLowerCase();
       if (l.includes('edr') || l.includes('endpoint') || l.includes('antivírus') || l.includes('av')) return 'Baixa maturidade de detecção comportamental em endpoints';
       if (l.includes('firewall') || l.includes('vpn') || source === 'Firewall / Rede' || l.includes('mfa')) return 'Exposição elevada em conectividade e acesso remoto';
       return label;
    };

    if (firewall.isRelevant) {
      risks = [...risks, ...firewall.activeRisks.map(r => ({ id: r.id, label: normalizeLabel(r.label, 'Firewall / Rede'), points: r.points, desc: r.description, source: 'Rede e Conectividade' }))];
    }
    if (endpoint.isRelevant && endpoint.diagnosticData.risks) {
      risks = [...risks, ...endpoint.diagnosticData.risks.map(r => ({ id: r.id, label: normalizeLabel(r.label, 'Endpoint'), points: r.points, desc: r.description, source: 'Endpoint e Detecção' }))];
    }
    if (backup.isRelevant) {
       const hasBackup = profile.backupHasSolution === 'yes' || profile.backupHasSolution === 'partial';
       if (!hasBackup) {
          risks.push({ id: 'no-backup', label: 'Ausência de cofre de dados seguro', points: 30, desc: 'O ambiente não possui sistema de backup formalizado, o que torna a recuperação de dados impossível em caso de desastre.', source: 'Continuidade Operacional' });
       } else {
          if (profile.backupAreBackupsTested !== 'yes') {
             risks.push({ id: 'no-restore-test', label: 'Incapacidade comprovada de recuperação rápida', points: 20, desc: 'Backups que não são testados regularmente podem falhar no momento da necessidade real.', source: 'Continuidade Operacional' });
          }
          if (profile.backupMaxAcceptableDowntime && (profile.backupMaxAcceptableDowntime.includes('dias') || profile.backupMaxAcceptableDowntime.includes('semanas'))) {
             risks.push({ id: 'high-rto', label: 'Tempo de inatividade operacional inaceitável', points: 15, desc: 'O tempo estimado para recuperação de desastres é muito alto, impactando a continuidade do negócio.', source: 'Continuidade Operacional' });
          }
       }
    }
    
    // Deduplicate labels so we don't show the exact same abstract risk label multiple times
    const uniqueRisks = [];
    const seen = new Set();
    for (const r of risks.sort((a, b) => b.points - a.points)) {
       if (!seen.has(r.label)) {
          seen.add(r.label);
          uniqueRisks.push(r);
       }
    }
    return uniqueRisks;
  }, [firewall, endpoint, backup, profile]);

  const globalRisks = useMemo(() => allRisks.slice(0, 4), [allRisks]);

  // Sector Benchmark Definition
  const sectorBenchmark = useMemo(() => {
    const s = profile.sector ? profile.sector.toLowerCase() : '';
    if (s.includes('juridico') || s.includes('advocacia') || s.includes('advogado')) return { name: 'Jurídico', score: 72 };
    if (s.includes('saude') || s.includes('hospital') || s.includes('clinica') || s.includes('medic')) return { name: 'Saúde', score: 65 };
    if (s.includes('transporte') || s.includes('logistica')) return { name: 'Transporte', score: 60 };
    if (s.includes('educacao') || s.includes('escola') || s.includes('ensino')) return { name: 'Educação', score: 55 };
    return { name: 'PME Geral', score: 68 };
  }, [profile.sector]);

  // Expanded domains for cyber risk intelligence
  const expandedDomains = useMemo(() => {
     const identityScore = profile.vpnMfa ? 85 : 30;
     const govScore = (profile.securityPolicy && profile.incidentResponsePlan) ? 80 : 40;
     
     // Derive third parties and cloud based on overall score (simulated if no direct data)
     const thirdPartyScore = Math.max(0, domainScores.overall - 10);
     const cloudScore = Math.max(0, domainScores.overall - 5);

     return [
        { name: 'Identidade e Acesso', score: identityScore, desc: 'Gestão de credenciais, MFA e autenticação.'},
        { name: 'Endpoint e Detecção', score: domainScores.endpoint, desc: 'Proteção comportamental em dispositivos.'},
        { name: 'Rede e Conectividade', score: domainScores.firewall, desc: 'Inspeção de borda e exposição remota.'},
        { name: 'Continuidade', score: domainScores.backup, desc: 'Resiliência de dados e recuperação.'},
        { name: 'Governança', score: govScore, desc: 'Políticas, conformidade e gestão de risco.'},
        { name: 'Terceiros', score: thirdPartyScore, desc: 'Risco de cadeia de suprimentos e vendors.'},
        { name: 'Cloud/SaaS', score: cloudScore, desc: 'Postura de segurança em serviços em nuvem.'}
     ];
  }, [domainScores, profile]);

  // 3. Financial Risk Consolidation (Dynamic)
  const financialMetrics = useMemo(() => {
    const users = profile.userCount ? parseInt(profile.userCount.toString().replace(/\D/g,'')) || 20 : 20;
    const sites = profile.vpnSiteToSite || 1;
    const s = profile.sector ? profile.sector.toLowerCase() : '';
    const isCritical = ['saúde', 'hospital', 'logística', 'transporte', 'indústria', 'financeiro'].some(sec => s.includes(sec));
    
    // Downtime days based on maturity
    const downtimeDays = domainScores.overall < 40 ? 14 : domainScores.overall < 70 ? 7 : 3;
    const dailyLossPerUser = 600; // Salary + overhead + unrealized profit average
    
    // Impact calculation
    const operationalImpact = users * dailyLossPerUser * downtimeDays;
    const technicalImpact = 50000 + (users * 1000) + (sites * 10000);
    const regulatoryImpact = isCritical ? 80000 : 25000;

    const totalEstimatedImpact = operationalImpact + technicalImpact + regulatoryImpact;
    
    // Probability based on maturity and exposure
    let probability = domainScores.overall < 40 ? 0.35 : domainScores.overall < 70 ? 0.15 : 0.05;
    if (profile.usesVpn && profile.vpnRemoteAccess > 0 && !profile.vpnMfa) {
       probability += 0.10;
    }
    if (!profile.monitoring247) {
       probability += 0.05;
    }

    const currentRiskValue = totalEstimatedImpact * probability;

    // Projected state after resilience improvements
    const projectedProbability = 0.05;
    const projectedDowntimeDays = 1; // Assuming fast containment and recovery
    const projectedOperationalImpact = users * dailyLossPerUser * projectedDowntimeDays;
    const projectedTotalImpact = projectedOperationalImpact + (technicalImpact * 0.4) + (regulatoryImpact * 0.1); 
    const projectedRiskValue = projectedTotalImpact * projectedProbability;

    const savingsValue = currentRiskValue - projectedRiskValue;

    const formatRange = (val: number) => {
       const min = Math.round((val * 0.8) / 1000) * 1000;
       const max = Math.round((val * 1.2) / 1000) * 1000;
       
       const toK = (n: number) => n >= 1000000 ? `${(n/1000000).toFixed(1).replace('.0','')}M` : `${n/1000}k`;
       return `R$ ${toK(min)} – R$ ${toK(max)}`;
    };

    return {
       currentImpactRaw: totalEstimatedImpact,
       currentRiskRaw: currentRiskValue,
       projectedRiskRaw: projectedRiskValue,
       savingsRaw: savingsValue,
       
       currentImpactStr: formatRange(totalEstimatedImpact),
       currentRiskStr: formatRange(currentRiskValue),
       projectedRiskStr: formatRange(projectedRiskValue),
       savingsStr: formatRange(savingsValue),
    };
  }, [profile, domainScores.overall]);

  // 4. Priority Calculation
  const priority = useMemo(() => {
    const list = [];
    if (domainScores.firewall !== null) list.push({ name: 'Exposição elevada em conectividade e acesso remoto', score: domainScores.firewall });
    if (domainScores.endpoint !== null) list.push({ name: 'Baixa maturidade de detecção comportamental em endpoints', score: domainScores.endpoint });
    if (domainScores.backup !== null) list.push({ name: 'Falta de resiliência e continuidade operacional', score: domainScores.backup });

    list.sort((a, b) => a.score - b.score);
    return list;
  }, [domainScores]);

  // 5. Investment & ROI Calculations
  const { simulatedAnnualCost, roiPercentage, isValidRoi } = useMemo(() => {
    const annualCost = (Number(monthlyCost) || 0) * 12 + (Number(implCost) || 0);
    const valid = annualCost > 0;
    
    // Base ROI on the conservative side of the savings (80%) to avoid overpromising
    const conservativeSavings = financialMetrics.savingsRaw * 0.8;
    const roi = valid ? ((conservativeSavings - annualCost) / annualCost) * 100 : 0;
    
    return {
      simulatedAnnualCost: annualCost,
      roiPercentage: Math.max(0, Math.round(roi)),
      isValidRoi: valid
    };
  }, [financialMetrics.savingsRaw, implCost, monthlyCost]);

  // Compatibility bindings for PDF
  const consolidatedFinancialRisk = financialMetrics.currentRiskRaw;
  const projectedFinancialRisk = financialMetrics.projectedRiskRaw;
  const estimatedSavings = financialMetrics.savingsRaw;

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

  // --- Executive Summary Logic ---
  const operationalMaturity = useMemo(() => {
    const score = domainScores.overall;
    if (score >= 90) return { label: 'Ambiente com controles operacionais bem distribuídos', color: 'text-emerald-500', bg: 'bg-emerald-500' };
    if (score >= 75) return { label: 'Ambiente com controles operacionais estruturados', color: 'text-blue-500', bg: 'bg-blue-500' };
    if (score >= 50) return { label: 'Ambiente com base operacional já estabelecida', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    if (score >= 25) return { label: 'Ambiente em fase de estruturação operacional', color: 'text-orange-500', bg: 'bg-orange-500' };
    return { label: 'Ambiente com oportunidades de estruturação inicial', color: 'text-red-500', bg: 'bg-red-500' };
  }, [domainScores.overall]);

  const executiveSummary = useMemo(() => {
    if (priority.length === 0) return 'O ambiente não possui dados suficientes para uma avaliação executiva precisa.';

    const { 
       sector, hasFirewall, protectionType, vpnMfa, usesVpn, vpnRemoteAccess, 
       monitoring247, vpnSiteToSite, activeLicense 
    } = profile;

    const hasBackup = profile.backupHasSolution === 'yes' || profile.backupHasSolution === 'partial';

    const s = sector ? sector.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
    
    // Hash based on company name to keep the text stable per client instead of randomly shifting on re-renders
    const companyHash = profile.companyName ? profile.companyName.length : 1;
    const pick = (arr: string[]) => arr[companyHash % arr.length];

    const noEmdpointMDR = protectionType !== 'edr' || !monitoring247;
    const noVPNMFA = usesVpn && vpnRemoteAccess > 0 && !vpnMfa;
    const noGoodFirewall = !hasFirewall || !activeLicense;
    const multiSite = vpnSiteToSite > 0;
    const noBackup = !hasBackup;

    // 1. Sector Specific Insights
    if (s.includes('transporte') || s.includes('logistica')) {
      if (multiSite && noGoodFirewall) {
         return pick([
            'Identificamos excelentes caminhos para otimizar a conectividade segura e a visibilidade operacional de dados entre as filiais da empresa.',
            'A interligação operacional entre as unidades pode ganhar maior robustez e resiliência por meio de controle centralizado de tráfego.'
         ]);
      }
      if (noEmdpointMDR) return 'Para a alta disponibilidade necessária na logística, o monitoramento ativo dos dispositivos principais trará maior estabilidade operacional no dia a dia.';
    }

    if (s.includes('juridico') || s.includes('advocacia') || s.includes('advogado')) {
      if (noVPNMFA) {
         return pick([
            'A postura operacional de trabalho remoto e proteção das contas administrativas pode ser ainda mais blindada com segundo fator de validação.',
            'O trâmite seguro de dados confidenciais e processos via conexões externas ganhará maior confiabilidade com autenticação multifator.'
         ]);
      }
      if (noGoodFirewall) return 'A segurança e integridade do acervo digital de processos e documentos podem ser aprimoradas com a atualização da proteção de perímetro.';
    }

    if (s.includes('saude') || s.includes('hospital') || s.includes('clinica') || s.includes('medic')) {
      if (noEmdpointMDR) {
         return pick([
            'A segurança no manuseio de dados de pacientes pode ser impulsionada com a adoção de telemetria moderna e prevenção ativa de ameaças nos computadores.',
            'Computadores com acesso a prontuários e sistemas de atendimento contam com oportunidades de evolução no monitoramento preventivo.'
         ]);
      }
      if (noBackup) return 'A continuidade operacional dos serviços médicos e laboratoriais pode ser fortalecida com estratégias modernas de isolamento e validação de cópias de segurança.';
    }

    if (s.includes('industria') || s.includes('manufatura')) {
       if (noGoodFirewall) return 'A estabilidade produtiva do chão de fábrica pode ser blindada por meio da separação inteligente entre as redes administrativa e industrial.';
       if (noBackup) return 'A continuidade das operações industriais ganhará maior resiliência com a implementação de redundâncias seguras e testes periódicos de restauração.';
    }

    if (s.includes('tecnologia') || s.includes('software')) {
       if (noVPNMFA) return 'A postura de acesso remoto para equipes de desenvolvimento e operações pode ganhar maior confiabilidade por meio de políticas de autenticação multifator.';
    }

    // 2. Cross-Sector Generic Insights (when no specific rule matched)
    const generalTexts = [];

    if (noVPNMFA) {
       generalTexts.push(
         'O ecossistema de acesso remoto atual pode ser fortalecido com duplo fator de autenticação para garantir a identidade dos usuários de forma segura.',
         'A postura de acessos externos e conexões remotas conta com excelentes oportunidades de aprimoramento em verificação multifator e auditoria.'
       );
    }

    if (noEmdpointMDR) {
       generalTexts.push(
          'O ambiente já possui controles importantes implementados, com ótimas oportunidades de fortalecimento em monitoramento contínuo, autenticação e resposta.',
          'A postura operacional de proteção dos computadores e servidores pode evoluir de defesas tradicionais para detecção e resposta preventivas.'
       );
    }

    if (noGoodFirewall) {
       generalTexts.push(
          'A segurança de perímetro e controle do fluxo de dados podem ser otimizados com a evolução para soluções inteligentes de firewall de nova geração.',
          'Foi identificada uma grande oportunidade para robustecer a segurança de borda da rede corporativa com filtros de tráfego modernos.'
       );
    }

    if (noBackup) {
       generalTexts.push(
          'A retenção de informações e a facilidade de restauração em caso de indisponibilidade representam uma importante oportunidade de evolução operacional.',
          'A continuidade das operações do negócio ganhará maior segurança com rotinas estruturadas e testes frequentes de recuperação de dados.'
       );
    }

    if (generalTexts.length > 0) {
       return pick(generalTexts);
    }

    // 3. Fallback for healthy environments or low-data profiles
    if (domainScores.overall > 80) {
       return 'O ambiente apresenta uma postura operacional avançada e consolidada, com excelente distribuição de controles e alta resiliência.';
    }
    if (domainScores.overall > 50) {
       return 'O ambiente já possui controles importantes implementados, com ótimas oportunidades de fortalecimento em monitoramento contínuo, autenticação e resposta.';
    }

    return 'Identificamos oportunidades fundamentais para iniciar a estruturação de controles preventivos em perímetro, dispositivos e cópias de segurança.';
  }, [profile, priority, domainScores.overall]);

  // Risk Priority Helper
  const getRiskPriority = (points: number) => {
    if (points >= 25) return { priority: 'Alta', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-t-orange-500' };
    if (points >= 15) return { priority: 'Média', color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-t-yellow-500' };
    return { priority: 'Observação', color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-t-blue-500' };
  };

  const getObservationContext = (riskId: string, riskLabel: string, profile: any) => {
    const label = (riskLabel || '').toLowerCase();
    const rid = (riskId || '').toLowerCase();
    
    if (label.includes('mfa') || rid.includes('mfa')) {
       return 'Foi informado uso de acesso remoto VPN sem a obrigatoriedade de múltiplo fator de autenticação (MFA).';
    }
    if (label.includes('monitoramento') || label.includes('edr') || rid.includes('edr')) {
       return 'A operação conta com proteção baseada em antivírus tradicional, sem telemetria contínua (EDR) ou monitoramento ativo 24/7.';
    }
    if (label.includes('backup') || rid.includes('backup')) {
       return 'Não foi confirmada a existência de um cofre de backup isolado e imutável para retenção dos dados.';
    }
    if (label.includes('restore') || rid.includes('restore-test')) {
       return 'Os processos de backup atuais não passam por testes regulares de restauração (restore).';
    }
    if (label.includes('firewall') || rid.includes('firewall')) {
       return 'A conectividade entre as unidades ou a saída de internet não possui inspeção de pacotes ativa por um firewall de nova geração.';
    }
    if (label.includes('rto') || rid.includes('rto')) {
       return `O tempo estimado de recuperação tolerado (${profile.backupMaxAcceptableDowntime || 'vários dias'}) excede limites de estabilidade para PMEs.`;
    }
    
    return 'Foram identificadas lacunas nos controles preventivos básicos informados durante o onboarding.';
  };

  const getImpactBullets = (riskId: string, riskLabel: string) => {
    const label = (riskLabel || '').toLowerCase();
    const rid = (riskId || '').toLowerCase();

    if (label.includes('mfa') || rid.includes('mfa')) {
       return ['Acesso indevido à rede', 'Vazamento silencioso de dados', 'Comprometimento de contas administrativas'];
    }
    if (label.includes('edr') || label.includes('monitoramento')) {
       return ['Atraso na descoberta de invasões', 'Movimentação lateral do atacante', 'Dificuldade em conter ransomwares'];
    }
    if (label.includes('backup') || label.includes('restore') || label.includes('rto')) {
       return ['Perda permanente de dados', 'Paralisação prolongada', 'Inviabilidade de recuperação pós-ataque'];
    }
    if (label.includes('firewall') || label.includes('rede')) {
       return ['Acesso não autorizado', 'Tráfego malicioso não bloqueado', 'Interceptação de comunicações'];
    }
    return ['Interrupção operacional', 'Risco financeiro indireto', 'Possível exposição de dados'];
  };

  // Operational Consequence Helper
  const getOperationalConsequence = (riskId: string, riskLabel: string, sector: string) => {
    const s = sector ? sector.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") : '';
    
    let baseConsequence = 'Pode impactar negativamente a estabilidade dos processos vitais de negócios.';
    const label = (riskLabel || '').toLowerCase();
    const rid = (riskId || '').toLowerCase();
    
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
    { title: 'Indisponibilidade por Ransomware', icon: ShieldAlert, color: 'text-orange-500', desc: 'Sistemas paralisados e dados inacessíveis, interrompendo a operação. Frequentemente se aproveita de acessos remotos sem proteção ou de dispositivos desatualizados.' },
    { title: 'Vazamento de Informações', icon: FileWarning, color: 'text-yellow-500', desc: 'Acesso não autorizado a dados de clientes ou sistemas internos. Ocorre tipicamente por falta de restrições de acesso e visibilidade de rede.' },
    { title: 'Acesso Indevido a Contas', icon: Key, color: 'text-blue-500', desc: 'Uso de credenciais legítimas por terceiros não autorizados. Facilitado pela ausência de validação de identidade (MFA) em acessos críticos.' },
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

        {/* 1. EXECUTIVE SUMMARY */}
        <SectionContainer title="Panorama Operacional">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] gap-8 items-stretch">
            
            {/* COLUNA ESQUERDA: Maturidade Title & Summary (Card Grande) */}
            <div className="glass-card p-8 lg:p-10 border-transparent flex flex-col justify-start gap-8 h-full relative shadow-xl bg-secondary/5">
               <div className="flex flex-col gap-6">
                  <h3 className={`text-3xl md:text-4xl font-black tracking-tight ${operationalMaturity.color}`}>
                     {operationalMaturity.label}
                  </h3>
                  <p className="text-lg text-foreground/80 leading-relaxed">
                     {executiveSummary}
                  </p>
               </div>

               {/* Base da avaliação */}
               <div className="bg-secondary/10 border border-border/50 rounded-xl p-6 mt-0">
                  <p className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                     <Info size={16} className="text-primary" />
                     Como avaliamos o ambiente
                  </p>
                  <p className="text-sm text-muted-foreground mb-5">
                     A avaliação considera controles operacionais essenciais vinculados a:
                  </p>
                  <ul className="text-sm text-foreground/80 space-y-3">
                     <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Identidade e acesso</li>
                     <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Proteção dos dispositivos</li>
                     <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Conectividade de rede</li>
                     <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Backup e continuidade</li>
                     <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 rounded-full bg-primary" /> Capacidade de resposta</li>
                  </ul>
                  <div className="mt-6 pt-5 border-t border-border/50 flex justify-between items-center">
                     <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Escopo:</strong> 18 controles técnicos avaliados em 7 categorias.
                     </p>
                  </div>
               </div>
            </div>

            {/* COLUNA DIREITA: Gauge & Referência (Card Compacto) */}
            <div className="glass-card p-8 border-transparent flex flex-col h-full bg-secondary/5 relative shadow-xl justify-start gap-6">
               
               {/* GAUGE AREA */}
               <div className="w-full flex justify-center items-center h-[190px] mb-2 relative">
                  <MaturityGauge score={domainScores.overall} />
               </div>
               
               {/* REFERÊNCIA OPERACIONAL RECOMENDADA */}
               <div className="w-full border-t border-border/20 pt-6 flex flex-col gap-5 flex-grow">
                  <div className="text-center lg:text-left">
                     <h4 className="text-sm font-bold text-foreground tracking-wider uppercase">
                        Referência Operacional Recomendada
                     </h4>
                     <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                        Referência operacional sugerida para empresas dependentes de internet, endpoints, acesso remoto e continuidade operacional.
                     </p>
                  </div>
                  
                  {/* MATURITY PROGRESSION CARDS */}
                  <div className="w-full space-y-3">
                     {/* Card 1: Situação atual */}
                     <div className="flex items-center justify-between p-4 bg-secondary/15 rounded-xl border border-border/30 hover:bg-secondary/25 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                           <div className="flex flex-col text-left">
                              <span className="text-xs font-bold text-foreground">Situação atual</span>
                              <span className="text-[10px] text-muted-foreground">Diagnóstico inicial do ambiente</span>
                           </div>
                        </div>
                        <span className="font-mono font-bold text-sm text-foreground">{domainScores.overall} / 100</span>
                     </div>

                     {/* Card 2: Após correções prioritárias */}
                     <div className="flex items-center justify-between p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 hover:bg-blue-500/10 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                           <div className="flex flex-col text-left">
                              <span className="text-xs font-bold text-blue-400">Após correções prioritárias</span>
                              <span className="text-[10px] text-blue-400/80">Projeção com controles recomendados</span>
                           </div>
                        </div>
                        <span className="font-mono font-bold text-sm text-blue-400">{Math.min(100, domainScores.overall + 14)} / 100</span>
                     </div>

                     {/* Card 3: Maturidade operacional avançada */}
                     <div className="flex items-center justify-between p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10 hover:bg-emerald-500/10 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                           <div className="flex flex-col text-left">
                              <span className="text-xs font-bold text-emerald-500">Maturidade operacional avançada</span>
                              <span className="text-[10px] text-emerald-500/80">Nível ideal de resiliência PME</span>
                           </div>
                        </div>
                        <span className="font-mono font-bold text-sm text-emerald-500">90+ / 100</span>
                     </div>
                  </div>
                  
                  {/* PROJECTION NOTES & METHODOLOGY */}
                  <div className="w-full pt-4 border-t border-border/20 flex flex-col items-center gap-3 mt-auto">
                     <p className="text-[11px] text-muted-foreground text-center leading-relaxed px-2">
                        A projeção considera os controles identificados como prioritários neste assessment.
                     </p>
                     
                     {/* Score Transparency Modal / Link */}
                     <ScoreTransparencyModal 
                        firewallScore={domainScores.firewall}
                        endpointScore={domainScores.endpoint}
                        backupScore={domainScores.backup}
                        overallScore={domainScores.overall}
                        risks={allRisks}
                     />
                  </div>
               </div>
            </div>

          </div>
        </SectionContainer>
        
        {/* IMPACTO FINANCEIRO */}
        <SectionContainer title="Impacto Financeiro e Operacional" icon={TrendingUp} iconColor="text-blue-500">
           <div className="glass-card p-6 border-transparent bg-secondary/10">
               <div className="flex justify-between items-center mb-6">
                    <div>
                       <h3 className="font-bold text-lg flex items-center gap-2"><TrendingUp className="text-blue-500" size={20}/> Cenário estimado de impacto operacional</h3>
                       <p className="text-xs text-muted-foreground mt-1">Estimativa utilizada para traduzir riscos técnicos em impacto operacional e financeiro aproximado.</p>
                    </div>
                    <p className="text-3xl font-extrabold font-mono text-foreground">{financialMetrics.currentRiskStr}</p>
               </div>
               <div className="space-y-3 pt-4 border-t border-border/50">
                   <p className="text-sm text-foreground/90"><span className="font-bold">Faixa referencial de custo por incidente grave:</span> {financialMetrics.currentImpactStr}</p>
                   <ul className="text-sm text-muted-foreground space-y-2 list-disc pl-4 marker:text-primary">
                     <li><strong className="text-foreground/70">Impacto Operacional:</strong> Paralisia abrupta de sistemas críticos da operação.</li>
                     <li><strong className="text-foreground/70">Perda de Produtividade:</strong> Despesa-base imobilizada em até {profile.userCount || 50} colaboradores inativos na folha de pagamento durante o tempo médio de parada.</li>
                     <li><strong className="text-foreground/70">Recuperação e Forense:</strong> Custos com suporte emergencial, recuperação e reorganização operacional.</li>
                   </ul>
                   <Dialog>
                     <DialogTrigger asChild>
                       <Button variant="link" className="text-xs text-muted-foreground mt-5 italic border-t border-border/30 pt-3 opacity-80 justify-start px-0 h-auto">
                          * Ver referências metodológicas utilizadas nesta simulação
                       </Button>
                     </DialogTrigger>
                     <DialogContent className="bg-[#0B1220] border-border/50 text-foreground">
                       <DialogHeader>
                         <DialogTitle>Referências Utilizadas</DialogTitle>
                         <DialogDescription className="text-muted-foreground pt-2">
                            Os cálculos de impacto e probabilidade consideram dados informados e frameworks globais consolidados:
                            <ul className="list-disc pl-4 mt-3 space-y-1 text-sm text-foreground/80 marker:text-primary">
                               <li><strong>IBM Cost of a Data Breach Report</strong></li>
                               <li><strong>Verizon DBIR</strong> (Data Breach Investigations Report)</li>
                               <li><strong>Sophos State of Ransomware</strong></li>
                               <li><strong>CIS Controls v8</strong></li>
                               <li><strong>NIST CSF</strong> (Cybersecurity Framework)</li>
                            </ul>
                         </DialogDescription>
                       </DialogHeader>
                     </DialogContent>
                   </Dialog>
               </div>
            </div>
        </SectionContainer>

        {/* 2. PONTOS DE ATENÇÃO OPERACIONAL */}
        {allRisks.length > 0 && (
          <SectionContainer title="Principais pontos de atenção operacional" icon={AlertCircle} iconColor="text-orange-500">
             <p className="text-lg text-muted-foreground mb-6">Com base na análise, estas são as maiores exposições priorizadas pelo impacto no seu fluxo de trabalho:</p>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {allRisks.slice(0, 3).map((risk, idx) => {
                   const priorityObj = getRiskPriority(risk.points);
                   const observation = getObservationContext(risk.id, risk.label, profile);
                   const bullets = getImpactBullets(risk.id, risk.label);

                   return (
                     <div key={idx} className={`glass-card p-6 flex flex-col border-t-4 ${priorityObj.border} bg-secondary/5 transition-all hover:bg-secondary/10`}>
                        <div className="flex justify-between items-start mb-4">
                           <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{risk.source}</span>
                           <span className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded border border-border/50 ${priorityObj.color} ${priorityObj.bg}`}>
                              Prioridade: {priorityObj.priority}
                           </span>
                        </div>
                        
                        <h4 className="font-bold text-foreground text-lg leading-tight mb-1">{risk.label}</h4>
                        <span className="text-xs font-bold text-muted-foreground/70 mb-5 block">Impacto na maturidade: -{risk.points} pontos</span>

                        <div className="space-y-4 flex-1">
                           <div>
                              <p className="text-xs font-bold text-foreground mb-1">O que observamos:</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">{observation}</p>
                           </div>
                           
                           <div>
                              <p className="text-xs font-bold text-foreground mb-1">Por que isso importa:</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">{risk.desc}</p>
                           </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-border/50">
                           <p className="text-xs font-bold text-foreground mb-2">Possível impacto operacional:</p>
                           <ul className="text-sm text-muted-foreground list-disc pl-4 marker:text-primary space-y-1">
                              {bullets.map((bullet, i) => (
                                 <li key={i}>{bullet}</li>
                              ))}
                           </ul>
                        </div>
                     </div>
                   );
                })}
             </div>
          </SectionContainer>
        )}

        {/* 3. CENÁRIOS DE RISCO */}
        <SectionContainer title="Como esses riscos podem afetar sua operação" icon={Target} iconColor="text-primary">
           <p className="text-muted-foreground mb-6 text-lg">Com base nas lacunas identificadas, estes são os cenários de incidente mais relevantes para o ambiente atual:</p>
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
           <p className="text-lg text-muted-foreground mb-6">A LGPD prevê sanções em casos de incidentes envolvendo dados pessoais, especialmente quando existem falhas relevantes de proteção ou ausência de controles mínimos:</p>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {[
                { art: 'Art. 46', title: 'Segurança Técnica Apropriada', desc: 'Ausência de controles preventivos essenciais (como autenticação forte e proteção contra malware) pode ser interpretada como inobservância das diretrizes de proteção de dados.' },
                { art: 'Art. 48', title: 'Comunicação de Incidentes (DPO)', desc: 'A falta de visibilidade no ambiente dificulta a identificação e comunicação ágil de incidentes, o que é exigido pela legislação para reduzir possíveis danos aos titulares.' },
                { art: 'Art. 50', title: 'Governança & Boas Práticas', desc: 'Operar sem monitoramento contínuo e processos documentados pode evidenciar a ausência de um programa efetivo de governança e boas práticas de segurança.' }
              ].map(lg => (
                  <div key={lg.art} className="glass-card p-6 border-t-2 border-blue-500/50 bg-blue-500/5 transition-colors hover:bg-blue-500/10">
                     <p className="text-xs font-black tracking-widest text-blue-500 mb-2">{lg.art}</p>
                     <p className="font-bold text-foreground mb-3 text-lg leading-tight">{lg.title}</p>
                     <p className="text-sm text-foreground/80 leading-relaxed">{lg.desc}</p>
                  </div>
              ))}
           </div>
           
           <div className="flex border border-blue-500/30 bg-blue-500/10 rounded-xl p-6 md:p-8 items-start gap-5">
              <TriangleAlert className="text-blue-500 shrink-0 mt-1" size={28} />
              <div>
                 <h4 className="font-bold text-foreground mb-2 text-xl">Possível exposição regulatória</h4>
                 <p className="text-base text-muted-foreground leading-relaxed">
                   A regulamentação exige zelo técnico adequado. Incidentes gerados por negligência arquitetônica podem resultar em sanções, multas e forte impacto na credibilidade corporativa {profile.companyName ? `da ${profile.companyName}` : 'do seu negócio'} perante o mercado.
                 </p>
              </div>
           </div>
        </SectionContainer>

        {/* 5. COMO MELHORAR O SCORE (Simulação) */}
        <SectionContainer title="Plano de evolução recomendado" icon={ArrowUpCircle} iconColor="text-emerald-500">
           <p className="text-lg text-muted-foreground mb-8">A projeção considera a implementação dos controles identificados como prioritários no assessment:</p>
           
           <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 w-full space-y-4">
                 {[
                   { name: 'Firewall gerenciado e isolamento de acessos', id: 1 },
                   { name: 'Endpoint com detecção comportamental e resposta rápida', id: 2 },
                   { name: 'Monitoramento contínuo e análise 24/7 de eventos', id: 3 },
                   { name: 'MFA e políticas rigorosas de acesso', id: 4 },
                   { name: 'Rotinas de backup isolado e recuperação estruturada', id: 5 },
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
                 <p className="text-muted-foreground font-medium mb-3 text-lg">Projeção da Maturidade Operacional:</p>
                 <div className="flex items-center justify-center gap-4 text-6xl md:text-7xl font-black text-foreground">
                    <span className="opacity-25">{domainScores.overall}%</span>
                    <ArrowRight className="text-emerald-500 animate-pulse" size={40} />
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-600 drop-shadow-sm">92%</span>
                 </div>
                 <p className="text-xs text-muted-foreground mt-8 uppercase tracking-widest font-black text-emerald-500/60 border-t border-emerald-500/20 pt-4 w-full">Com base na mitigação das lacunas estruturais apontadas</p>
              </div>
           </div>

           {/* ROI & INVESTMENT SECTION */}
           <div className="mt-16 pt-8 border-t border-border/50">
               <h4 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2"><PieChart size={24} className="text-primary"/> Justificativa Operacional</h4>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  {/* Comparaçao de Risco */}
                  <div className="glass-card p-6 flex flex-col justify-between border-t-2 border-t-yellow-500">
                     <p className="font-bold text-foreground mb-6">Comparação de Exposição Operacional</p>
                     <div className="space-y-4">
                        <div>
                           <p className="text-xs text-muted-foreground font-bold tracking-wider mb-1">ANTES (Situação Atual)</p>
                           <p className="text-xl font-bold text-red-400 opacity-90">{financialMetrics.currentRiskStr}</p>
                        </div>
                        <div className="border-t border-border/50 pt-4">
                           <p className="text-xs text-emerald-500/80 font-bold tracking-wider mb-1">DEPOIS (Melhoria de Resiliência)</p>
                           <p className="text-2xl font-black text-emerald-500">{financialMetrics.projectedRiskStr}</p>
                        </div>
                     </div>
                  </div>

                  {/* Economia Estimada -> Redução de Exposição */}
                  <div className="glass-card p-6 flex flex-col justify-between border-t-2 border-t-blue-500 bg-secondary/10">
                     <div>
                       <p className="font-bold text-foreground mb-1">Redução Estimada de Exposição Operacional</p>
                       <p className="text-sm text-muted-foreground mb-6">Redução anual do passivo de risco após adoção de controles geridos.</p>
                     </div>
                     <div className="flex items-center gap-4 border-l-4 border-blue-500 pl-4">
                        <DollarSign size={36} className="text-blue-500" />
                        <div>
                            <p className="text-2xl font-black text-foreground">{financialMetrics.savingsStr}</p>
                            <p className="text-[10px] font-bold text-blue-500 tracking-wider">RISCO MITIGADO AO ANO</p>
                        </div>
                     </div>
                  </div>

                  {/* ROI */}
                  <div className={`glass-card p-6 flex flex-col justify-between border-t-2 transition-colors ${isValidRoi ? 'border-t-emerald-500 bg-emerald-500/5' : 'border-t-border/50 bg-secondary/10'}`}>
                     <div className="mb-6">
                       <p className="font-bold text-foreground mb-1">Análise de Custo-Benefício</p>
                       <p className={`text-sm ${isValidRoi ? 'text-emerald-500/80' : 'text-muted-foreground'}`}>Simulação interativa de impacto vs investimento.</p>
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
                  <div className="glass-card p-6 bg-secondary/10 border border-border/50">
                     <h5 className="font-bold text-foreground flex items-center gap-2 mb-3"><ServerCrash size={18} className="text-muted-foreground"/> Limites de controles isolados</h5>
                     <p className="text-sm text-muted-foreground leading-relaxed">
                        Controles isolados reduzem parte do risco, mas perdem efetividade quando não existe monitoramento, correlação e processo de resposta.
                     </p>
                  </div>
                  <div className="glass-card p-6 bg-primary/5 border border-primary/20 hover:border-primary/50 transition-colors">
                     <h5 className="font-bold text-primary flex items-center gap-2 mb-3"><ActivitySquare size={18}/> Modelo recomendado de sustentação operacional</h5>
                     <p className="text-sm text-muted-foreground leading-relaxed">
                        Uma abordagem de sustentação unificada alia tecnologia e monitoramento. Essa combinação permite antecipar problemas, identificar incidentes em minutos e evitar paralisações prolongadas da operação.
                     </p>
                  </div>
               </div>

               {/* Modal Button */}
               <div className="flex justify-center">
                  <InvestmentMethodologyModal />
               </div>
           </div>
        </SectionContainer>

        {/* DOMAIN BREAKDOWN (Expanded to 7 Domains) */}
        <SectionContainer title="Mapeamento de Domínios de Risco" icon={Layers}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {expandedDomains.map((d, i) => (
                <div key={i} className={`glass-card p-5 flex flex-col relative overflow-hidden group`}>
                    <div className="mb-6">
                       <h4 className="font-bold text-base text-foreground mb-1">{d.name}</h4>
                       <p className="text-xs text-muted-foreground leading-relaxed">{d.desc}</p>
                    </div>
                    {d.score !== null && d.score > 0 ? (
                        <div className="mt-auto">
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-foreground/70">{getLabel(d.score)}</p>
                                <p className="text-2xl font-black">{d.score}</p>
                            </div>
                            <div className="w-full bg-secondary h-1.5 shadow-inner overflow-hidden rounded-full">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${d.score}%` }} className={`h-full ${getGradient(d.score)}`}></motion.div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-auto pt-6 border-t border-border/30">
                            <p className="text-center text-xs font-bold text-muted-foreground">S/ DADOS</p>
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
