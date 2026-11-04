import {describe,it,expect} from 'vitest';
import {assessFirewall} from './firewallAssessment';
import {firewallCostDefaults} from './FirewallFinancial';
import type {Profile} from '../context/ProfileContext';
import type {Facts} from './model';
const profile={userCount:85,companyName:'Empresa exemplo'} as Profile;
describe('Firewall: postura e premissas financeiras',()=>{
 it('não considera respostas ausentes como falhas confirmadas',()=>{
  const a=assessFirewall(profile,{} as Facts);
  expect(a.score).toBeNull();expect(a.attention).toBe(0);expect(a.unknown).toBeGreaterThan(0);
 });
 it('conecta falta de cobertura e de procedimento ao risco informado',()=>{
  const a=assessFirewall(profile,{edgeType:'isp-router',ips:'no',segmentation:'no',networkOps:'reactive',afterHours:'no',playbook:'no'} as Facts);
  expect(a.attention).toBeGreaterThanOrEqual(5);
  expect(a.signals.find(x=>x.id==='playbook')?.law).toContain('48');
  expect(a.signals.find(x=>x.id==='edge')?.law).toContain('46');
 });
 it('deriva exposição financeira do porte e da criticidade, sem usar estatística de mercado',()=>{
  const baseline=firewallCostDefaults(profile,{criticalityLevel:'high',downtimeProfile:'1to4'} as Facts);
  expect(baseline.affected).toBe(55);expect(baseline.hours).toBe(3);expect(baseline.unit).toBe(65);expect(baseline.extra).toBe(6000);
 });
});
