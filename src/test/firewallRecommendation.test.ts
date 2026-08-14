import { describe, it, expect } from 'vitest';
import { recommend, sonicwallModels, fortinetModels } from '@/utils/firewallRecommendation';

describe('Firewall Recommendation Engine', () => {
  it('MANDATORY SCENARIO: 20 users, 500 Mbps total bandwidth, Leve profile -> TZ80 and 40F', () => {
    const result = recommend({
      users: 20,
      linkSpeeds: ['200 Mbps', '200 Mbps', '100 Mbps'], // Total = 500 Mbps
      usage: 'Leve',
      vpnClientToSite: 2,
      vpnSiteToSite: 1,
      vlanCount: 3,
      idsIps: true,
      trafficInspection: true,
      dpiSsl: false,
    });

    // Calculations
    expect(result.totalLinksMbps).toBe(500);
    expect(result.factor).toBe(0.5);
    expect(result.adjustedMbps).toBe(250);

    // SonicWall MUST be TZ80 (never TZ370 in this scenario)
    expect(result.sonicwall.name).toBe('TZ80');

    // Fortinet MUST be 40F (smallest model for 20 users & 250 Mbps)
    expect(result.fortinet.name).toBe('40F');

    expect(result.dpiSslNote).toBeNull();
    expect(result.exceedsCapacityNote).toBeNull();
  });

  it('verifies removal of escalate logic (large VPN/VLAN counts do not jump models)', () => {
    const result = recommend({
      users: 20,
      linkSpeeds: ['500 Mbps'],
      usage: 'low',
      vpnClientToSite: 15,
      vpnSiteToSite: 10,
      vpnTotal: 25,
      vlanCount: 12,
      idsIps: true,
      trafficInspection: true,
      dpiSsl: false,
    });

    expect(result.adjustedMbps).toBe(250);
    expect(result.sonicwall.name).toBe('TZ80');
    expect(result.fortinet.name).toBe('40F');
  });

  it('handles DPI-SSL enabled without artificially upgrading the model', () => {
    const result = recommend({
      users: 20,
      linkSpeeds: ['500 Mbps'],
      usage: 'low',
      vpnClientToSite: 2,
      vpnSiteToSite: 1,
      vlanCount: 3,
      idsIps: true,
      trafficInspection: true,
      dpiSsl: true,
    });

    expect(result.sonicwall.name).toBe('TZ80');
    expect(result.dpiSslNote).toBe(
      'DPI-SSL habilitado: requer validação da capacidade de inspeção criptografada do appliance.',
    );
  });

  it('handles planned growth for user sizing', () => {
    const result = recommend({
      users: 20,
      linkSpeeds: ['500 Mbps'],
      usage: 'low',
      increaseUsers: true,
      userGrowthEstimate: '70 usuários', // Growth target 70 users
    });

    expect(result.effectiveUsers).toBe(70);
    // TZ80 supports max 60 users, so 70 users requires TZ370
    expect(result.sonicwall.name).toBe('TZ370');
  });

  it('handles environment exceeding all registered table models', () => {
    const result = recommend({
      users: 1000,
      linkSpeeds: ['10 Gbps'],
      usage: 'high',
    });

    expect(result.sonicwallFits).toBe(false);
    expect(result.sonicwall.name).toBe('NSA 3700');
    expect(result.exceedsCapacityNote).toBe(
      'Capacidade acima dos limites cadastrados. Necessária validação técnica.',
    );
  });
});
