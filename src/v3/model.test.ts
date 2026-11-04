import { describe,it,expect } from 'vitest';
import {defaultProfile} from '../context/ProfileContext';
import {analyze,filterFindings,scenario,applicable,questions} from './model';
describe('V3: conclusões rastreáveis e percursos',()=>{
 it('não trata respostas ausentes como controle ausente',()=>{const a=analyze(defaultProfile,{});expect(a.length).toBeGreaterThan(0);expect(a.every(x=>x.state==='unknown')).toBe(true);});
 it('separa controles existentes, ausentes e desconhecidos',()=>{const a=analyze(defaultProfile,{firewall:'ngfw',ips:'no'});expect(a.find(x=>x.id==='firewall')?.state).toBe('confirmed');expect(a.find(x=>x.id==='ips')?.state).toBe('attention');expect(a.find(x=>x.id==='console')?.state).toBe('unknown');});
 it('mantém o módulo isolado e prioriza ações',()=>{const a=filterFindings(analyze(defaultProfile,{tested:'no'}),'backup');expect(a.every(x=>x.module==='backup')).toBe(true);expect(a[0].id).toBe('tested');});
 it('remove conclusão de MFA de VPN quando não há VPN',()=>{const a=analyze(defaultProfile,{vpn:'no',mfa:'no'});expect(a.some(x=>x.id==='mfa')).toBe(false);expect(applicable(questions.find(q=>q.key==='mfa')!,{vpn:'no'})).toBe(false);});
 it('não infere necessidade de HA quando ela não foi informada',()=>{expect(analyze(defaultProfile,{ha:'no'}).some(x=>x.id==='ha')).toBe(false);expect(analyze(defaultProfile,{ha:'no',haNeed:'yes'}).find(x=>x.id==='ha')?.state).toBe('attention');});
 it('escolhe cenário pela prioridade do cliente',()=>{expect(scenario('firewall',{goal:'Disponibilidade'}).title).toContain('Indisponibilidade');expect(scenario('firewall',{vpn:'yes'}).title).toContain('acesso remoto');expect(scenario('backup',{}).steps.length).toBe(5);});
 it('não confunde ter EDR com ter equipe de resposta',()=>{const a=analyze(defaultProfile,{protection:'edr',endpointOps:'none'});expect(a.find(x=>x.id==='protection')?.state).toBe('confirmed');expect(a.find(x=>x.id==='endpointOps')?.state).toBe('attention');});
 it('não marca não aplicável como pendência ou falha',()=>{expect(analyze(defaultProfile,{isolated:'na'}).some(x=>x.id==='isolated')).toBe(false);});
});
