import type { Profile } from '../context/ProfileContext';
import type { Facts, Finding } from './model';
/** Leitura operacional complementar. Respostas ausentes não viram falhas confirmadas. */
export function firewallOperationalFindings(profile:Profile,facts:Facts):Finding[]{
 const out:Finding[]=[];
 const add=(id:string,title:string,state:Finding['state'],evidence:string,meaning:string,action:string)=>out.push({id,module:'firewall',title,evidence,meaning,action,state});
 if(facts.afterHours==='no'){
  add('coverage_after_hours','Cobertura fora do expediente','attention','Não há atendimento fora do expediente, segundo o levantamento.','Um incidente fora do horário pode depender do retorno da equipe para receber atenção.','Confirmar acionamento, prioridade e responsáveis nos períodos sem cobertura.');
 }else if(facts.afterHours==='yes'){
  add('coverage_after_hours','Cobertura fora do expediente','confirmed','Cobertura fora do horário informada.','Há atendimento relatado; escopo e tempo de resposta precisam ser confirmados.','Confirmar SLA, acionamento e evidência de atendimento.');
 }
 if(facts.playbook==='no'){
  add('incident_playbook','Procedimento para incidentes','attention','Foi informada ausência de procedimento definido.','No momento de um incidente, decisões e contatos podem precisar ser organizados durante a ocorrência.','Definir responsáveis, contatos, critérios de escalonamento e uma rotina de teste.');
 }else if(facts.playbook==='yes'){
  add('incident_playbook','Procedimento para incidentes','confirmed','Procedimento informado como existente.','O fluxo foi informado, mas sua aplicação e atualização ainda podem ser validadas.','Confirmar revisão, responsáveis e último exercício.');
 }
 const links=(profile.internetLinks||[]).filter(l=>l.provider||l.speed);
 if(links.length===1&&['critical','high'].includes(facts.criticalityLevel||'')){
  add('single_link','Dependência de conectividade','attention','Apenas um link foi informado para uma operação de criticidade relevante.','Uma indisponibilidade do único link informado pode afetar os acessos e serviços que dependem dele.','Validar redundância, procedimentos de contingência e tolerância à parada.');
 }else if(links.length>1){
  add('link_failover','Failover dos links','unknown',`${links.length} links informados; não houve comprovação de failover.`,'Ter mais de um link não comprova redundância configurada ou testada.','Validar roteamento, failover e testes de contingência.');
 }
 return out;
}
