import { useMemo } from 'react';
import { useProfile, Profile } from '@/context/ProfileContext';

export const getEndpointExposureDetails = (score: number) => {
  if (score >= 75) return { label: 'Seguro', color: 'bg-emerald-500', textColor: 'text-emerald-500', gradientClass: 'bg-gradient-to-r from-emerald-400 to-emerald-500' };
  if (score >= 50) return { label: 'Moderado', color: 'bg-yellow-500', textColor: 'text-yellow-500', gradientClass: 'bg-gradient-to-r from-yellow-400 to-yellow-500' };
  if (score >= 26) return { label: 'Elevado', color: 'bg-orange-500', textColor: 'text-orange-500', gradientClass: 'bg-gradient-to-r from-orange-400 to-orange-500' };
  return { label: 'Crítico', color: 'bg-red-500', textColor: 'text-red-500', gradientClass: 'bg-gradient-to-r from-red-500 to-red-600' };
};

export const getControlState = (value: any, type: 'boolean' | 'string' | 'number' | 'protection' | 'mfa' | 'admin', defaultVal?: any) => {
  if (value === undefined || value === null || value === '' || value === -1) return -1;
  
  if (type === 'boolean') {
    return value === true || value === 'yes' ? 1 : (value === false || value === 'no' ? 0 : -1);
  }
  
  if (type === 'protection') {
    if (value === 'none') return 0;
    if (value === 'edr' || value === 'signature') return 1;
    return -1;
  }

  if (type === 'mfa') {
    if (value === true || value === 'yes') return 1;
    if (value === false || value === 'no') return 0;
    return -1;
  }

  if (type === 'admin') {
    if (value === true || value === 'yes') return 0; // Se tem admin, é risco (estado 0)
    if (value === false || value === 'no') return 1; // Se NÃO tem admin, é seguro (estado 1)
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

  const isRelevant = profile.deviceCount > 0 ||
    profile.hasWindowsServer ||
    profile.hasLinuxServer ||
    profile.protectionType !== 'none' ||
    profile.byod ||
    profile.monitoring247;

  const diagnosticData = useMemo(() => {
    const controls = {
      // PILAR 1: PROTEÇÃO DO DISPOSITIVO
      edr: { 
        state: profile.protectionType === 'edr' ? 1 : (profile.protectionType === 'none' || profile.protectionType === 'signature' ? 0 : -1), 
        pts: 40, 
        label: 'EDR Presente', 
        riskLabel: 'Ausência de EDR (Detecção Comportamental)', 
        pillar: 1,
        desc: 'A ausência de detecção e resposta em endpoints (EDR) deixa o ambiente vulnerável a ataques fileless e comportamentos anômalos que burlam antivírus tradicionais.\n\nFonte: CrowdStrike Global Threat Report 2025.' 
      },
      av: { 
        state: getControlState(profile.protectionType !== 'none', 'boolean'), 
        pts: 20, 
        label: 'Proteção de Endpoint', 
        riskLabel: 'Uso de Antivírus Tradicional (Baseado em Assinatura)', 
        pillar: 1,
        desc: 'O antivírus tradicional é ineficaz contra ameaças modernas de dia zero e ransomware que não utilizam arquivos conhecidos.\n\nFonte: Sophos State of Ransomware 2024.' 
      },
      update: { 
        state: getControlState(profile.autoUpdate, 'boolean'), 
        pts: 25, 
        label: 'Atualizações Automáticas', 
        riskLabel: 'Políticas de Patch e Atualização Inexistentes', 
        pillar: 1,
        desc: 'Software desatualizado possui vulnerabilidades conhecidas (CVEs) que são ativamente exploradas como porta de entrada por atacantes.\n\nFonte: CISA Known Exploited Vulnerabilities Catalog.' 
      },
      domain: { 
        state: getControlState(!profile.devicesOutOfDomain, 'boolean'), 
        pts: 15, 
        label: 'Gestão de Domínio', 
        riskLabel: 'Dispositivos Fora do Domínio (Sem GPO)', 
        pillar: 1,
        desc: 'Máquinas fora do domínio não recebem políticas centralizadas de segurança, dificultando a auditoria e padronização.\n\nFonte: CIS Controls.' 
      },

      // PILAR 2: EXPOSIÇÃO HUMANA
      admin: { 
        state: getControlState(profile.itTeamSize > 0 ? false : (profile.userCount > 0 ? true : -1), 'admin'),
        pts: 30, 
        label: 'Privilégios Restritos', 
        riskLabel: 'Usuários com Privilégio de Administrador Local', 
        pillar: 2,
        desc: 'Usuários com direitos administrativos podem desativar defesas, instalar softwares maliciosos e facilitar a escalada de privilégios.\n\nFonte: Microsoft Digital Defense Report 2024.' 
      },
      mfa: { 
        state: getControlState(profile.vpnMfa, 'mfa'), 
        pts: 30, 
        label: 'Autenticação Forte', 
        riskLabel: 'Ausência de MFA (Múltiplo Fator)', 
        pillar: 2,
        desc: 'Ataques de roubo de credenciais são o vetor inicial em 80% dos incidentes. A falta de MFA torna o ambiente vulnerável.\n\nFonte: Verizon DBIR 2024.' 
      },
      remote: { 
        state: getControlState(profile.vpnRemoteAccess === 0, 'boolean'), 
        pts: 20, 
        label: 'Exposição Remota Controlada', 
        riskLabel: 'Alta Superfície de Acesso Remoto', 
        pillar: 2,
        desc: 'Acessos remotos sem controles rigorosos ampliam drasticamente os pontos de entrada para ataques.\n\nFonte: CrowdStrike 2025.' 
      },
      byod: { 
        state: getControlState(!profile.byod, 'boolean'), 
        pts: 20, 
        label: 'Governança de Ativos', 
        riskLabel: 'Uso de BYOD sem Gerenciamento', 
        pillar: 2,
        desc: 'Dispositivos pessoais (BYOD) sem telemetria e controle impossibilitam o compliance.\n\nFonte: IBM X-Force.' 
      },

      // PILAR 3: CAPACIDADE DE DETECÇÃO
      logs: { 
        state: getControlState(profile.centralConsole, 'boolean'), 
        pts: 35, 
        label: 'Visibilidade Centralizada', 
        riskLabel: 'Logs de Endpoint Não Centralizados', 
        pillar: 3,
        desc: 'Sem a centralização de logs, é impossível correlacionar eventos suspeitos entre diferentes dispositivos.\n\nFonte: IBM X-Force 2025.' 
      },
      monit: { 
        state: getControlState(profile.monitoring247, 'boolean'), 
        pts: 35, 
        label: 'Monitoramento Contínuo', 
        riskLabel: 'Falta de Monitoramento Contínuo (SOC 24/7)', 
        pillar: 3,
        desc: 'Ameaças cibernéticas não respeitam horário comercial. Sem monitoramento 24x7, o tempo de permanência do atacante aumenta.\n\nFonte: IBM Cost of a Data Breach.' 
      },
      response: { 
        state: getControlState(profile.incidentResponsePlan || profile.socMonitoring, 'boolean'), 
        pts: 30, 
        label: 'Resposta a Incidentes', 
        riskLabel: 'Ausência de Capacidade de Resposta Ativa', 
        pillar: 3,
        desc: 'Detectar não é suficiente. Sem um plano e equipe para resposta imediata, o impacto do ataque é inevitável.\n\nFonte: NIST Cybersecurity Framework.' 
      }
    };

    const allControls = Object.values(controls);
    const informedControls = allControls.filter(c => c.state !== -1);
    const insufficientData = informedControls.length < 4;

    const calcPillar = (pillarId: number) => {
      const items = allControls.filter(c => c.pillar === pillarId);
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

    const p1Score = calcPillar(1);
    const p2Score = calcPillar(2);
    const p3Score = calcPillar(3);

    // Média ponderada dos três pilares (atribuindo pesos iguais para simplificação ou específicos)
    const finalScore = Math.round((p1Score + p2Score + p3Score) / 3);

    const risks = allControls
      .filter(c => c.state === 0)
      .map(c => ({
        id: c.label.toLowerCase().replace(/\s/g, '-'),
        label: c.riskLabel,
        points: c.pts,
        description: c.desc,
        source: c.pillar === 1 ? 'Proteção do Dispositivo' : (c.pillar === 2 ? 'Exposição Humana' : 'Capacidade de Detecção')
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
      articles.push({ id: '46', title: 'Art. 46 – Segurança dos dados pessoais', desc: 'A ausência de EDR fere o dever de adotar medidas técnicas aptas a proteger os dados contra acessos não autorizados.' });
    }
    if (!profile.monitoring247) {
      score += 30;
      articles.push({ id: '48', title: 'Art. 48 – Comunicação de incidentes', desc: 'Sem monitoramento contínuo, a detecção e notificação ágil de vazamentos de dados tornam-se inviáveis.' });
    }
    if (!profile.securityPolicy) {
      score += 30;
      articles.push({ id: '50', title: 'Art. 50 – Boas práticas e governança', desc: 'A falta de diretrizes formais de segurança de endpoint indica negligência na governança de dados pessoais.' });
    }
    
    return { 
      score: Math.min(100, score), 
      articles, 
      exposure: getEndpointExposureDetails(100 - score) 
    };
  }, [profile, diagnosticData.insufficientData]);

  return {
    isRelevant,
    diagnosticData,
    riskScore,
    exposure,
    lgpdData
  };
};
