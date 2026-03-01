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
  const num = parseFloat(speed.replace(/[^\d.,]/g, '').replace(',', '.'));
  if (isNaN(num)) return 0;
  const lower = speed.toLowerCase();
  if (lower.includes('gbps') || lower.includes('gb')) return num * 1000;
  return num;
};

/** Get usage profile factor */
const getProfileFactor = (usage: string): number => {
  const u = usage.toLowerCase();
  if (u === 'low' || u === 'baixo') return 0.5;
  if (u === 'high' || u === 'alto') return 1.0;
  return 0.75;
};

/** Pick the smallest model satisfying users AND throughput, then escalate */
const pickModel = (
  models: FWModel[],
  users: number,
  adjustedMbps: number,
  escalate: number,
): FWModel => {
  let idx = models.findIndex(
    (m) => m.maxUsers >= users && m.throughput >= adjustedMbps,
  );
  if (idx === -1) idx = models.length - 1;
  idx = Math.min(idx + escalate, models.length - 1);
  return models[idx];
};

export interface RecommendationResult {
  sonicwall: FWModel;
  fortinet: FWModel;
  adjustedMbps: number;
  totalLinksMbps: number;
  factor: number;
  vpnTotal: number;
  vlanCount: number;
  usageLabel: string;
}

export const recommend = (
  users: number,
  linkSpeeds: string[],
  usage: string,
  vpnTotal: number,
  vlanCount: number,
  sslInspection: boolean,
): RecommendationResult => {
  const totalLinksMbps = linkSpeeds.reduce((s, sp) => s + parseSpeedToMbps(sp), 0);
  const factor = getProfileFactor(usage);
  const adjustedMbps = totalLinksMbps * factor;

  let escalate = 0;
  if (vpnTotal > 10) escalate++;
  if (vlanCount > 5) escalate++;
  if (sslInspection) escalate++;

  const usageLabel =
    usage === 'low' ? 'Baixo' : usage === 'high' ? 'Alto' : 'Médio';

  return {
    sonicwall: pickModel(sonicwallModels, users, adjustedMbps, escalate),
    fortinet: pickModel(fortinetModels, users, adjustedMbps, escalate),
    adjustedMbps,
    totalLinksMbps,
    factor,
    vpnTotal,
    vlanCount,
    usageLabel,
  };
};
