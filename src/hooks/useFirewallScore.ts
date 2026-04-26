import { useMemo } from 'react';
import { useProfile, Profile } from '@/context/ProfileContext';

export interface RiskVector {
  id: string;
  label: string;
  points: number;
  description: string;
  check: (p: Profile) => boolean;
}

export const riskVectors: RiskVector[] = [
  {
    id: 'no-ngfw',
    label: 'Ausência de Firewall NGFW',
    points: 30,
    description: 'Grande parte das ameaças modernas trafegam criptografadas. Sem inspeção SSL ativa, malware, ransomware e comunicação com servidores de comando e controle podem atravessar o perímetro sem análise adequada.\n\nFonte: Verizon DBIR 2024; CISA Known Exploited Vulnerabilities Catalog 2025; Palo Alto Unit 42 Threat Report 2024.',
    check: (p) => !p.hasFirewall || p.firewallType === 'router',
  },
  {
    id: 'no-ips',
    label: 'Falta de IPS Ativo',
    points: 25,
    description: 'Sem sistema de prevenção de intrusão, tentativas de exploração de vulnerabilidades conhecidas não são bloqueadas em tempo real. Mais de 30 mil vulnerabilidades foram registradas globalmente em 2024 e 2025, muitas exploradas poucas horas após divulgação.\n\nFonte: Verizon Data Breach Investigations Report 2024.',
    check: (p) => !p.idsIps,
  },
  {
    id: 'no-ssl',
    label: 'Ausência de Inspeção SSL',
    points: 20,
    description: 'Grande parte das ameaças modernas trafegam criptografadas. Sem inspeção SSL ativa, malware, ransomware e comunicação com servidores de comando e controle podem atravessar o perímetro sem análise adequada.\nBase técnica: Relatórios globais de laboratórios de segurança 2024–2025 indicam crescimento contínuo de ataques criptografados como vetor de evasão.\n\nFonte: FortiGuard Labs Threat Landscape Report 2024 e SonicWall Cyber Threat Report 2025',
    check: (p) => !p.sslInspection,
  },
  {
    id: 'no-vlan',
    label: 'Segmentação de Rede Inexistente',
    points: 15,
    description: 'Ambientes sem VLANs permitem movimentação lateral após comprometimento inicial, ampliando a superfície de ataque interna.\n\nFonte: CISA Zero Trust Maturity Model 2024; NIST SP 800-207; Microsoft Digital Defense Report 2024',
    check: (p) => !p.hasVlan || p.vlanCount === 0,
  },
  {
    id: 'no-logs',
    label: 'Logs Não Centralizados',
    points: 20,
    description: 'Sem visibilidade consolidada, o tempo médio de detecção de incidentes aumenta significativamente. Relatórios recentes indicam que o tempo médio global de detecção pode ultrapassar 190 dias sem correlação centralizada.\n\nFonte: IBM Cost of a Data Breach Report 2024.',
    check: (p) => !p.hasFirewall || !p.activeLicense,
  },
  {
    id: 'vpn-no-mfa',
    label: 'VPN Sem MFA',
    points: 15,
    description: 'Ataques modernos exploram credenciais comprometidas como principal vetor de entrada. A ausência de MFA aumenta significativamente o risco de acesso não autorizado.\n\nFonte: Relatórios globais de segurança de identidade 2024 indicam que credenciais comprometidas continuam sendo principal vetor inicial de ataque',
    check: (p) => p.usesVpn && !p.vpnMfa,
  },
  {
    id: 'no-policy',
    label: 'Operação Apenas Reativa',
    points: 10,
    description: 'Ambientes administrados apenas de forma reativa tendem a responder tardiamente a incidentes, ampliando impacto operacional.\n\nFonte: Relatórios globais de segurança corporativa',
    check: (p) => !p.securityPolicy,
  },
];

export const getExposureLevel = (score: number) => {
  if (score <= 25) return { label: 'Baixo', color: 'bg-emerald-500', textColor: 'text-emerald-500', gradientClass: 'bg-gradient-to-r from-emerald-400 to-emerald-500' };
  if (score <= 50) return { label: 'Moderado', color: 'bg-yellow-500', textColor: 'text-yellow-500', gradientClass: 'bg-gradient-to-r from-yellow-400 to-yellow-500' };
  if (score <= 75) return { label: 'Elevado', color: 'bg-orange-500', textColor: 'text-orange-500', gradientClass: 'bg-gradient-to-r from-orange-400 to-orange-500' };
  return { label: 'Crítico', color: 'bg-red-500', textColor: 'text-red-500', gradientClass: 'bg-gradient-to-r from-red-500 to-red-600' };
};

export const getLgpdExposure = (score: number) => {
  if (score <= 30) return { label: 'Baixo', color: 'bg-emerald-500', textColor: 'text-emerald-500', gradientClass: 'bg-gradient-to-r from-emerald-400 to-emerald-500' };
  if (score <= 60) return { label: 'Moderado', color: 'bg-yellow-500', textColor: 'text-yellow-500', gradientClass: 'bg-gradient-to-r from-yellow-400 to-yellow-500' };
  if (score <= 90) return { label: 'Elevado', color: 'bg-orange-500', textColor: 'text-orange-500', gradientClass: 'bg-gradient-to-r from-orange-400 to-orange-500' };
  return { label: 'Crítico', color: 'bg-red-500', textColor: 'text-red-500', gradientClass: 'bg-gradient-to-r from-red-500 to-red-600' };
};

export const useFirewallScore = () => {
  const { profile } = useProfile();

  // Relevance logic:
  // Firewall (Rede) is relevant if there are:
  // internetLinks (provided by default but usually user checks if speed > 0 or array length), hasFirewall, vpnRemoteAccess, vlan, loadBalancer, etc.
  const isRelevant = profile.hasFirewall || 
    (profile.internetLinks && profile.internetLinks.length > 0 && profile.internetLinks[0].speed !== '') ||
    profile.vpnRemoteAccess > 0 || 
    profile.hasVlan || 
    profile.sdwanOption !== 'no' || 
    profile.loadBalancerOption !== 'no';

  const activeRisks = useMemo(() => riskVectors.filter((v) => v.check(profile)), [profile]);
  const riskScore = useMemo(() => activeRisks.reduce((sum, v) => sum + v.points, 0), [activeRisks]);
  const exposure = getExposureLevel(riskScore);

  const annualRiskEstimate = useMemo(() => {
    const impact = 300000 * (riskScore / 135);
    const probability = riskScore <= 25 ? 0.1 : riskScore <= 50 ? 0.15 : riskScore <= 75 ? 0.25 : 0.3;
    return impact * probability;
  }, [riskScore]);

  const lgpdScore = useMemo(() => {
    let score = 0;
    if (!profile.hasFirewall || profile.firewallType === 'router') score += 20; 
    if (!profile.idsIps) score += 20;
    if (!profile.hasVlan || profile.vlanCount === 0) score += 15;
    if (profile.usesVpn && !profile.vpnMfa) score += 15;
    if (!profile.hasFirewall || !profile.activeLicense) score += 25;
    if (!profile.securityPolicy) score += 25;
    return score;
  }, [profile]);

  const lgpdExposure = getLgpdExposure(lgpdScore);

  return {
    isRelevant,
    activeRisks,
    riskScore,
    exposure,
    annualRiskEstimate,
    lgpdScore,
    lgpdExposure
  };
};
