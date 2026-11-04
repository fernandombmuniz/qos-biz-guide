import type {Profile} from '../context/ProfileContext';
import type {Facts, Module} from './model';

export type Service = Extract<Module,'endpoint'|'backup'>;
export type Signal = {id:string;title:string;state:'attention'|'confirmed'|'unknown';evidence:string;impact:string;action:string;lgpd?:string};
const has=(v:unknown)=>v!==undefined&&v!==null&&String(v).trim()!==''&&v!=='unknown';
const number=(v:unknown)=>Math.max(0,Number(v)||0);
export function serviceAssessment(service:Service,p:Profile,f:Facts){
 const signals:Signal[]=[];
 const add=(id:string,title:string,value:unknown,bad:string[],good:string[],evidence:string,impact:string,action:string,lgpd?:string)=>{
  const state:Signal['state']=!has(value)?'unknown':bad.includes(String(value))?'attention':good.includes(String(value))?'confirmed':'unknown';
  signals.push({id,title,state,evidence:state==='unknown'?'Informação ainda não confirmada.':evidence,impact:state==='unknown'?`Possível consequência a validar: ${impact}`:impact,action,lgpd});
 };
 if(service==='endpoint'){
  const total=number(p.deviceCount);
  const covered=has(f.endpointCoveredCount)?number(f.endpointCoveredCount):null;
  add('endpoint-cover','Cobertura dos dispositivos',total&&covered!==null?(covered<total?'partial':'yes'):'unknown',['partial'],['yes'],`${covered??'A confirmar'} de ${total||'total a confirmar'} dispositivos com agente ativo.`, 'Dispositivos sem agente podem ficar fora da prevenção, detecção e resposta.','Conferir inventário, agentes ativos e cobertura por sistema operacional.','Art. 46: medidas técnicas e administrativas para proteger dados pessoais.');
  add('endpoint-protection','Capacidade de proteção',f.protection,['none','basic'],['managed','edr','av'],`Proteção atual: ${f.protection||'a confirmar'}.`,'A solução pode oferecer menos contexto para investigar comportamentos suspeitos.','Confirmar capacidades, políticas e edição contratada.');
  add('endpoint-console','Gestão central',f.console,['no'],['yes'],`Console central: ${f.console==='yes'?'informado':'não informado'}.`,'Políticas inconsistentes dificultam visibilidade sobre alertas e cobertura.','Verificar console, políticas e agentes que não se comunicam.','Art. 46: medidas de segurança e controle.');
  add('endpoint-response','Processo de contenção',f.response,['no'],['yes'],`Resposta estruturada: ${f.response==='yes'?'sim':'não'}.`,'Um evento pode permanecer ativo enquanto se decide quem pode agir.','Validar isolamento, escalonamento e autorizações.','Art. 48: avaliar a comunicação de incidentes que possam acarretar risco ou dano relevante.');
  add('endpoint-ops','Cobertura de investigação',f.endpointOps,['reactive','none'],['soc','team'],`Operação atual: ${f.endpointOps||'a confirmar'}.`,'Alertas fora do expediente podem ser tratados tardiamente.','Confirmar quem recebe alertas e qual é a rotina fora do horário.');
  add('endpoint-patch','Correções de segurança',f.patch,['no'],['yes'],`Rotina de atualização: ${f.patch||'a confirmar'}.`,'Vulnerabilidades conhecidas podem permanecer expostas.','Confirmar ciclo de atualização e exceções.');
 }else{
  add('backup-scope','Cobertura dos dados',f.backup,['no','partial'],['yes'],`Backup do escopo: ${f.backup||'a confirmar'}.`,'Sistemas fora da cópia podem precisar de reconstrução manual.','Confirmar cargas, retenção e responsabilidades.','Art. 46: medidas para proteger dados contra perda e acessos indevidos.');
  add('backup-test','Restauração testada',f.tested,['no'],['yes'],`Teste de restauração: ${f.tested||'a confirmar'}.`,'A existência de cópias não comprova o tempo nem a integridade de recuperação.','Validar teste recente, resultado e evidências.');
  add('backup-isolation','Proteção das cópias',f.isolated,['no'],['yes'],`Isolamento informado: ${f.isolated||'a confirmar'}.`,'Cópias acessíveis com as mesmas credenciais podem ser afetadas no mesmo incidente.','Avaliar cópia isolada, imutabilidade, privilégios e MFA.','Art. 46: proteção técnica e administrativa dos dados.');
  add('backup-ops','Monitoramento das tarefas',f.backupOps,['no'],['yes'],`Acompanhamento: ${f.backupOps||'a confirmar'}.`,'Erros podem passar despercebidos até a necessidade de recuperação.','Validar alertas, responsáveis e reprocessamento.');
  add('backup-plan','Plano e ordem de recuperação',f.recoveryPlan,['no'],['yes'],`Plano de recuperação: ${f.recoveryPlan||'a confirmar'}.`,'Sem prioridades, serviços essenciais podem demorar a voltar.','Mapear dependências, ordem de retorno e responsáveis.');
 }
 const assessed=signals.filter(s=>s.state!=='unknown');
 const score=assessed.length<2?null:Math.round(100*assessed.filter(s=>s.state==='confirmed').length/assessed.length);
 return {signals,score,assessed:assessed.length,total:signals.length,attention:signals.filter(s=>s.state==='attention').length,unknown:signals.filter(s=>s.state==='unknown').length,positive:signals.filter(s=>s.state==='confirmed').length};
}
export function serviceCostDefaults(service:Service,p:Profile,f:Facts){
 const critical=f[`${service}Criticality`]||'high';
 const ratio=critical==='critical'?.85:critical==='moderate'?.40:.65;
 const total=number(p.deviceCount)||number(p.userCount)||20;
 const affected=Math.max(1,Math.round(total*ratio));
 const hours=critical==='critical'?8:critical==='moderate'?3:5;
 const hourly=critical==='critical'?95:critical==='moderate'?45:65;
 const recovery=service==='endpoint'?(critical==='critical'?10000:4000):(critical==='critical'?16000:6000);
 return {affected,hours,hourly,recovery};
}
