import {describe,it,expect} from 'vitest';
import {recommendFirewall,parseBandwidth} from './firewallSizing';
describe('dimensionamento Concierge',()=>{
 it('interpreta Mbps e Gbps',()=>{expect(parseBandwidth('1,5 Gbps')).toBe(1500);expect(parseBandwidth('500 Mbps')).toBe(500)});
 it('não escolhe NSA 3800 nem 600F para 85 usuários',()=>{
  const r=recommendFirewall({users:85,links:[{speed:'700 Mbps'},{speed:'200 Mbps'}],usage:'medium',sslVpnUsers:28,ipsecTunnels:4});
  expect(r.sonicwall.primary?.model).toBe('TZ280');expect(r.fortinet.primary?.model).toBe('50G');
 });
 it('prioriza pico medido em vez da banda contratada',()=>{
  const r=recommendFirewall({users:120,links:[{speed:'1 Gbps'},{speed:'500 Mbps'}],usage:'low',measuredPeakMbps:300});
  expect(r.peakMbps).toBe(300);expect(r.sonicwall.primary?.model).toBe('TZ380');expect(r.fortinet.primary?.model).toBe('50G');
 });
 it('não recomenda automaticamente diante de 15 Gbps sem medição',()=>{
  const r=recommendFirewall({users:120,links:[{speed:'15 Gbps'}],usage:'low'});
  expect(r.readiness).toBe('revisão técnica');expect(r.sonicwall.primary).toBeNull();
 });
 it('não inventa recomendação sem dados suficientes',()=>{
  const r=recommendFirewall({users:85,links:[],usage:'low'});
  expect(r.readiness).toBe('insuficiente');expect(r.fortinet.primary).toBeNull();
 });
 it('escolhe menor equipamento em caso leve',()=>{
  const r=recommendFirewall({users:20,links:[{speed:'500 Mbps'}],usage:'low'});
  expect(r.sonicwall.primary?.model).toBe('TZ80');expect(r.fortinet.primary?.model).toBe('40F');
 });
});
