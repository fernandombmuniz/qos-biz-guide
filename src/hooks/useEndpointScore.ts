import { useMemo } from 'react';
import { useProfile, Profile } from '@/context/ProfileContext';

export const getEndpointExposureDetails = (score: number) => {
  if (score > 75) return { label: 'Risco Baixo', color: 'bg-emerald-500', textColor: 'text-emerald-500', gradientClass: 'bg-gradient-to-r from-emerald-400 to-emerald-500' };
  if (score > 50) return { label: 'Risco Moderado', color: 'bg-yellow-500', textColor: 'text-yellow-500', gradientClass: 'bg-gradient-to-r from-yellow-400 to-yellow-500' };
  if (score > 25) return { label: 'Risco Elevado', color: 'bg-orange-500', textColor: 'text-orange-500', gradientClass: 'bg-gradient-to-r from-orange-400 to-orange-500' };
  return { label: 'Risco Crítico', color: 'bg-red-500', textColor: 'text-red-500', gradientClass: 'bg-gradient-to-r from-red-500 to-red-600' };
};

export const getControlState = (value: any, type: 'boolean' | 'string' | 'number' | 'protection', defaultVal?: any) => {
  if (value === undefined || value === null || value === '') return -1;
  
  if (type === 'boolean') {
    return value ? 1 : 0;
  }
  
  if (type === 'protection') {
    if (value === 'none') return 0;
    if (value === 'edr' || value === 'signature') return 1;
    return -1;
  }
  
  if (type === 'number') {
    if (value === 0 && defaultVal === 0) return -1;
    return value > 0 ? 1 : 0;
  }

  return 1;
};

export const useEndpointScore = () => {
  const { profile } = useProfile();

  // Relevance logic:
  // Endpoint is relevant if there are:
  // endpoints > 0, servidores, proteção, BYOD, monitoramento
  const isRelevant = profile.deviceCount > 0 ||
    profile.hasWindowsServer ||
    profile.hasLinuxServer ||
    profile.protectionType !== 'none' ||
    profile.byod ||
    profile.monitoring247;

  const diagnosticData = useMemo(() => {
    const controls = {
      edr: { state: getControlState(profile.protectionType === 'edr', 'boolean'), pts: 40, label: 'EDR Presente', riskLabel: 'Ausência de EDR/XDR', desc: 'A ausência de detecção e resposta em endpoints (EDR) deixa o ambiente cego contra ataques fileless e comportamentos anômalos.\n\nFonte: CrowdStrike Global Threat Report' },
      av: { state: getControlState(profile.protectionType === 'signature' || profile.protectionType === 'edr', 'boolean'), pts: 25, label: 'Antivírus Presente', riskLabel: 'Ausência de Antivírus', desc: 'Sem proteção básica baseada em assinaturas, arquivos maliciosos conhecidos podem ser executados sem impedimento.\n\nFonte: Sophos State of Ransomware' },
      update: { state: getControlState(profile.autoUpdate, 'boolean'), pts: 20, label: 'Atualizações Automáticas', riskLabel: 'Falta de Atualizações Automáticas', desc: 'Software desatualizado possui vulnerabilidades conhecidas (CVEs) que são portas de entrada fáceis para atacantes.\n\nFonte: CISA KEV Catalog' },
      domain: { state: getControlState(!profile.devicesOutOfDomain, 'boolean'), pts: 15, label: 'Endpoints no Domínio', riskLabel: 'Endpoints fora do domínio', desc: 'Máquinas fora do domínio AD/GPO não recebem políticas centralizadas de segurança e auditoria.\n\nFonte: CIS Controls v8' },

      mfa: { state: getControlState(profile.vpnMfa, 'boolean'), pts: 40, label: 'MFA Habilitado', riskLabel: 'Ausência de MFA', desc: 'A falta de Segundo Fator de Autenticação facilita o roubo de credenciais e movimentação lateral.\n\nFonte: Microsoft Digital Defense' },
      admin: { state: getControlState(profile.itTeamSize > 0, 'boolean'), pts: 25, label: 'Usuários sem Admin Local', riskLabel: 'Uso de Admin Local', desc: 'Usuários com privilégios administrativos podem desativar defesas e facilitar escala de ataque.\n\nFonte: Microsoft Digital Defense' },
      byod: { state: getControlState(!profile.byod, 'boolean'), pts: 20, label: 'Ausência de BYOD', riskLabel: 'Uso de BYOD não controlado', desc: 'Dispositivos pessoais aumentam a superfície de ataque e dificultam a conformidade.\n\nFonte: IBM X-Force' },
      remote: { state: getControlState(profile.vpnRemoteAccess === 0, 'boolean'), pts: 15, label: 'Baixa Exposição Remota', riskLabel: 'Alta Exposição Remota', desc: 'Acessos remotos ampliam os pontos de entrada para força bruta e infiltração.\n\nFonte: CrowdStrike 2025' },

      logs: { state: getControlState(profile.centralConsole, 'boolean'), pts: 40, label: 'Logs Centralizados', riskLabel: 'Ausência de Logs Centralizados', desc: 'Sem logs centralizados, a investigação forense e correlação de eventos é impossível.\n\nFonte: IBM X-Force' },
      monit: { state: getControlState(profile.monitoring247, 'boolean'), pts: 35, label: 'Monitoramento Comportamental', riskLabel: 'Ausência de Monitoramento 24/7', desc: 'Ameaças que ocorrem fora do horário comercial podem passar despercebidas por dias.\n\nFonte: IBM Cost of Data Breach' },
      visib: { state: getControlState(profile.socMonitoring || profile.protectionType === 'edr', 'boolean'), pts: 25, label: 'Visibilidade Contínua', riskLabel: 'Falta de Visibilidade Contínua', desc: 'A falta de telemetria em tempo real impede o hunting proativo de ameaças.\n\nFonte: Microsoft Digital Defense' }
    };

    const allControls = Object.values(controls);
    const uninformedCount = allControls.filter(c => c.state === -1).length;
    const insufficientData = uninformedCount > (allControls.length / 2);

    const calcPillar = (items: any[]) => {
      let score = 0;
      let maxPossible = 0;
      
      items.forEach(item => {
        if (item.state !== -1) {
          maxPossible += item.pts;
          if (item.state === 1) score += item.pts;
        }
      });
      
      return maxPossible > 0 ? Math.round((score / maxPossible) * 100) : 0;
    };

    const p1Score = calcPillar([controls.edr, controls.av, controls.update, controls.domain]);
    const p2Score = calcPillar([controls.mfa, controls.admin, controls.byod, controls.remote]);
    const p3Score = calcPillar([controls.logs, controls.monit, controls.visib]);

    const activePillars = [p1Score, p2Score, p3Score];
    const finalScore = Math.round(activePillars.reduce((a, b) => a + b, 0) / activePillars.length);

    const risks = allControls
      .filter(c => c.state === 0)
      .map(c => ({
        id: c.label.toLowerCase().replace(/\s/g, '-'),
        label: c.riskLabel,
        points: c.pts,
        description: c.desc
      }));

    return { insufficientData, p1Score, p2Score, p3Score, finalScore, risks };
  }, [profile]);

  const riskScore = diagnosticData.finalScore;
  const exposure = getEndpointExposureDetails(riskScore);

  const lgpdData = useMemo(() => {
    if (diagnosticData.insufficientData) return { score: 0, articles: [], exposure: null };
    
    let score = 0;
    const articles = [];
    
    if (profile.protectionType !== 'edr') {
      score += 40;
      articles.push({ id: '46', title: 'Art. 46 – Medidas de Segurança', desc: 'A ausência de EDR fere o dever de adotar medidas técnicas aptas a proteger os dados contra acessos não autorizados.' });
    }
    if (!profile.monitoring247) {
      score += 30;
      articles.push({ id: '48', title: 'Art. 48 – Incidentes de Segurança', desc: 'Sem monitoramento contínuo, a detecção e notificação ágil exigida pela lei tornam-se inexequíveis.' });
    }
    if (!profile.securityPolicy) {
      score += 20;
      articles.push({ id: '50', title: 'Art. 50 – Boas Práticas', desc: 'A falta de diretrizes formais de segurança de endpoint demonstra falha na governança de dados.' });
    }
    
    return { 
      score: Math.min(100, score), 
      articles, 
      exposure: getEndpointExposureDetails(100 - score) 
    };
  }, [profile, diagnosticData.insufficientData]);

  // For the Assessment overall average we might need to standardise the risk score direction 
  // Wait, Endpoint is a "security posture score" (higher = better). Firewall is a "risk score" (higher = worse).
  // I need to be careful when consolidating these! 
  // Let me just expose the raw score, and the Assessment Page will normalize it.

  return {
    isRelevant,
    diagnosticData,
    riskScore, // this is a posture score (0-100) where 100 is best.
    exposure,
    lgpdData
  };
};
