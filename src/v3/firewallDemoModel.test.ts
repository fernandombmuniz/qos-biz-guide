import {describe,expect,it} from 'vitest';
import {demoOutcome,nextDemoStage} from './firewallDemoModel';

describe('Three deterministic presentation scenarios',()=>{
  it.each(['phishing','download','c2'] as const)('%s is blocked when demo policy is enabled',scenario=>{
    const result=demoOutcome(scenario,'concierge');
    expect(result.blocked).toBe(true);
    expect(result.state).toBe('blocked');
    expect(result.log).toContain('SOC');
  });
  it.each(['phishing','download','c2'] as const)('%s passes without demo rule',scenario=>{
    const result=demoOutcome(scenario,'baseline');
    expect(result.blocked).toBe(false);
    expect(result.state).toBe('allowed');
    expect(result.log).not.toContain('SOC');
  });
  it('all scenarios use distinct executive outcomes',()=>{
    expect(new Set(['phishing','download','c2'].map(s=>demoOutcome(s as 'phishing'|'download'|'c2','concierge').headline)).size).toBe(3);
  });
  it('stops at the final step',()=>{expect(nextDemoStage(0)).toBe(1);expect(nextDemoStage(3)).toBe(4);expect(nextDemoStage(4)).toBe(4)});
});
