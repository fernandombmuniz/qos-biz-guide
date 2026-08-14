/* ─── Firewall Recommendation Engine ─── */

export interface FWModel {
  name: string;
  maxUsers: number;
  throughput: number;
}

export const sonicwallModels: FWModel[] = [
  { name: 'TZ80', maxUsers: 60, throughput: 750 },
  { name: 'TZ370', maxUsers: 100, throughput: 1000 },
  { name: 'TZ470', maxUsers: 120, throughput: 1500 },
  { name: 'TZ570', maxUsers: 200, throughput: 2000 },
  { name: 'TZ670', maxUsers: 250, throughput: 2500 },
  { name: 'NSA 2700', maxUsers: 300, throughput: 3000 },
  { name: 'NSA 3700', maxUsers: 400, throughput: 3500 },
];

export const fortinetModels: FWModel[] = [
  { name: '40F', maxUsers: 60, throughput: 600 },
  { name: '50G', maxUsers: 120, throughput: 1100 },
  { name: '90G', maxUsers: 200, throughput: 2200 },
  { name: '120G', maxUsers: 250, throughput: 2800 },
  { name: '200F', maxUsers: 300, throughput: 3000 },
  { name: '400F', maxUsers: 500, throughput: 6000 },
  { name: '600F', maxUsers: 700, throughput: 10500 },
];

/** Parse speed strings like "100Mbps", "1Gbps", "1.5 Gbps" to Mbps */
export const parseSpeedToMbps = (speed: string): number => {
  if (!speed) return 0;
  const num = parseFloat(speed.replace(/[^\d.,]/g, '').replace(',', '.'));
  if (isNaN(num)) return 0;
  const lower = speed.toLowerCase();
  if (lower.includes('gbps') || lower.includes('gb')) return num * 1000;
  return num;
};

/** Get usage profile factor */
export const getProfileFactor = (usage: string): number => {
  const u = usage ? usage.toLowerCase() : '';
  if (u === 'low' || u === 'baixo' || u === 'leve') return 0.5;
  if (u === 'high' || u === 'alto') return 1.0;
  return 0.75;
};

/** Helper to compute target effective user count accounting for growth */
export const calculateEffectiveUsers = (
  userCount: number,
  increaseUsers?: boolean,
  userGrowthEstimate?: string,
  plannedUsersInput?: number,
): number => {
  if (typeof plannedUsersInput === 'number' && plannedUsersInput > 0) {
    return plannedUsersInput;
  }
  if (increaseUsers && userGrowthEstimate) {
    const cleaned = userGrowthEstimate.trim();
    const num = parseInt(cleaned.replace(/[^\d]/g, ''), 10);
    if (!isNaN(num)) {
      if (cleaned.startsWith('+')) {
        return userCount + num;
      }
      if (num > userCount) {
        return num;
      }
    }
  }
  return userCount;
};

export interface PickedModelResult {
  model: FWModel;
  fits: boolean;
}

/** Pick the smallest model satisfying maxUsers >= requiredUsers AND throughput >= requiredThroughput */
export const pickModel = (
  models: FWModel[],
  requiredUsers: number,
  requiredThroughput: number,
): PickedModelResult => {
  const found = models.find(
    (m) => m.maxUsers >= requiredUsers && m.throughput >= requiredThroughput,
  );
  if (found) {
    return { model: found, fits: true };
  }
  return { model: models[models.length - 1], fits: false };
};

export interface RecommendationResult {
  sonicwall: FWModel;
  fortinet: FWModel;
  sonicwallFits: boolean;
  fortinetFits: boolean;
  adjustedMbps: number;
  totalLinksMbps: number;
  factor: number;
  factorPercentLabel: string;
  effectiveUsers: number;
  initialUsers: number;
  vpnClientToSite: number;
  vpnSiteToSite: number;
  vpnTotal: number;
  vlanCount: number;
  idsIps: boolean;
  trafficInspection: boolean;
  dpiSsl: boolean;
  usageLabel: string;
  dpiSslNote: string | null;
  exceedsCapacityNote: string | null;
  formulaText: string;
}

export interface RecommendationInput {
  users: number;
  linkSpeeds: string[];
  usage: string;
  vpnClientToSite?: number;
  vpnSiteToSite?: number;
  vpnTotal?: number;
  vlanCount?: number;
  idsIps?: boolean;
  trafficInspection?: boolean;
  dpiSsl?: boolean;
  increaseUsers?: boolean;
  userGrowthEstimate?: string;
  plannedUsers?: number;
}

export const recommend = (
  usersOrInput: number | RecommendationInput,
  linkSpeeds?: string[],
  usage?: string,
  vpnTotalParam?: number,
  vlanCountParam?: number,
  sslInspectionParam?: boolean,
  extraOptions?: {
    vpnClientToSite?: number;
    vpnSiteToSite?: number;
    idsIps?: boolean;
    trafficInspection?: boolean;
    increaseUsers?: boolean;
    userGrowthEstimate?: string;
    plannedUsers?: number;
  },
): RecommendationResult => {
  let opts: RecommendationInput;

  if (typeof usersOrInput === 'object') {
    opts = usersOrInput;
  } else {
    opts = {
      users: usersOrInput,
      linkSpeeds: linkSpeeds || [],
      usage: usage || 'medium',
      vpnTotal: vpnTotalParam || 0,
      vlanCount: vlanCountParam || 0,
      dpiSsl: sslInspectionParam || false,
      ...extraOptions,
    };
  }

  const initialUsers = opts.users || 0;
  const effectiveUsers = calculateEffectiveUsers(
    initialUsers,
    opts.increaseUsers,
    opts.userGrowthEstimate,
    opts.plannedUsers,
  );

  const links = opts.linkSpeeds || [];
  const totalLinksMbps = links.reduce((s, sp) => s + parseSpeedToMbps(sp), 0);
  const factor = getProfileFactor(opts.usage || '');
  const adjustedMbps = totalLinksMbps * factor;

  const vpnC2S = opts.vpnClientToSite ?? 0;
  const vpnS2S = opts.vpnSiteToSite ?? 0;
  const vpnTotal = opts.vpnTotal !== undefined ? opts.vpnTotal : vpnC2S + vpnS2S;

  const vlanCount = opts.vlanCount || 0;
  const idsIps = opts.idsIps ?? false;
  const trafficInspection = opts.trafficInspection ?? false;
  const dpiSsl = opts.dpiSsl ?? false;

  const usageLower = (opts.usage || '').toLowerCase();
  const usageLabel =
    usageLower === 'low' || usageLower === 'baixo' || usageLower === 'leve'
      ? 'Leve'
      : usageLower === 'high' || usageLower === 'alto'
      ? 'Alto'
      : 'Médio';

  const factorPercentLabel = `${Math.round(factor * 100)}%`;

  const sonicwallRes = pickModel(sonicwallModels, effectiveUsers, adjustedMbps);
  const fortinetRes = pickModel(fortinetModels, effectiveUsers, adjustedMbps);

  const dpiSslNote = dpiSsl
    ? 'DPI-SSL habilitado: requer validação da capacidade de inspeção criptografada do appliance.'
    : null;

  const exceedsCapacity = !sonicwallRes.fits || !fortinetRes.fits;
  const exceedsCapacityNote = exceedsCapacity
    ? 'Capacidade acima dos limites cadastrados. Necessária validação técnica.'
    : null;

  const formulaText = `${totalLinksMbps} Mbps × ${factorPercentLabel} = ${adjustedMbps} Mbps`;

  return {
    sonicwall: sonicwallRes.model,
    fortinet: fortinetRes.model,
    sonicwallFits: sonicwallRes.fits,
    fortinetFits: fortinetRes.fits,
    adjustedMbps,
    totalLinksMbps,
    factor,
    factorPercentLabel,
    effectiveUsers,
    initialUsers,
    vpnClientToSite: vpnC2S,
    vpnSiteToSite: vpnS2S,
    vpnTotal,
    vlanCount,
    idsIps,
    trafficInspection,
    dpiSsl,
    usageLabel,
    dpiSslNote,
    exceedsCapacityNote,
    formulaText,
  };
};
