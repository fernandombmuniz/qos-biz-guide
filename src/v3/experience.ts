import { Facts, Finding, Module, modules } from './model';

export const sources = {
 lgpd: {title:'LGPD · art. 46',url:'https://www.presidencia.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm'},
 anpd: {title:'ANPD · Guia de segurança da informação',url:'https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-sobre-seguranca-da-informacao-para-agentes-de-tratamento-de-pequeno-porte'},
 ransomware: {title:'CERT.br · Como acontece um ataque de ransomware',url:'https://www.cartilha.cert.br/docs/ransomware/entender/'},
 firewall: {title:'SonicWall · Bloqueio de conexões de comando e controle',url:'https://www.sonicwall.com/support/technical-documentation/docs/sonicos-7-1-security_services/Content/Botnet_Filter/botnet-configuring.htm'},
 recovery: {title:'Veeam · Verificação manual da recuperação',url:'https://helpcenter.veeam.com/docs/vbr/userguide/surebackup_manual.html'}
};
// Equal weights deliberately avoid unsupported precision and product rankings.
export function grade(findings:Finding[]){
 const known=findings.filter(x=>x.state!=='unknown');
 const confirmed=known.filter(x=>x.state==='confirmed').length;
 const coverage=findings.length?Math.round(known.length/findings.length*100):0;
 return {total:findings.length,answered:known.length,confirmed,coverage,
  score:known.length&&coverage>=60?Math.round(confirmed/known.length*100):null};
}
export function meetingRoute(f:Facts):Module[]{
 const valid:Module[]=['firewall','endpoint','backup'];
 const manual=(f.meetingModules||'').split(',').filter((x):x is Module=>valid.includes(x as Module));
 if(manual.length)return [...new Set(manual)];
 if(f.goal==='Controle dos acessos')return ['firewall'];
 if(f.goal==='Visibilidade e resposta')return ['endpoint'];
 if(f.goal==='Recuperação dos dados')return ['backup'];
 if(f.goal==='Disponibilidade')return ['firewall','backup'];
 return ['firewall','endpoint','backup'];
}
export function routeReason(f:Facts){
 return f.meetingModules?'Percurso escolhido para esta reunião.':'Sugestão pelo objetivo informado. Ajuste os temas antes de apresentar.';
}
export function chapterRoute(f:Facts):number[]{
 return [0,1,...(f.includeSimulation==='no'?[]:[2]),...(f.includeService==='yes'?[3]:[]),...(f.includeImpact==='yes'?[4]:[]),5];
}
export function nextChapter(current:number,route:number[],direction:1|-1){
 const i=route.indexOf(current);
 if(i<0)return direction===1?(route.find(x=>x>current)??route[route.length-1]):([...route].reverse().find(x=>x<current)??route[0]);
 return route[Math.max(0,Math.min(route.length-1,i+direction))];
}
export function privacyMeaning(x:Finding){
 const relevance:Record<string,string>={
 firewall:'Controles de rede ajudam a restringir acessos aos sistemas que tratam dados pessoais.',
 ips:'Prevenção de exploração pode reduzir caminhos de acesso indevido aos sistemas.',
 segmentation:'Separar redes e limitar fluxos ajuda a restringir o alcance de acessos indevidos.',
 mfa:'Uma credencial comprometida pode permitir acesso remoto a sistemas com dados pessoais.',
 ha:'Indisponibilidade do perímetro pode interromper o acesso legítimo aos sistemas.',
 networkOps:'Eventos e responsáveis definidos ajudam a identificar e investigar acessos suspeitos.',
 protection:'Arquivos com dados pessoais também podem ser afetados por atividade maliciosa no computador.',
 console:'Gestão central permite acompanhar a aplicação das políticas nos dispositivos.',
 endpointOps:'Alertas sem investigação podem atrasar a compreensão do alcance de um incidente.',
 response:'Um processo de contenção ajuda a organizar a resposta e preservar informações para análise.',
 patch:'Falhas sem correção podem facilitar acessos indevidos.',
 admin:'Privilégios excessivos podem ampliar o impacto de uma conta comprometida.',
 backup:'Dados fora do escopo de backup podem não estar disponíveis para recuperação.',
 tested:'Uma cópia sem recuperação validada não demonstra que os dados poderão ser restabelecidos.',
 isolated:'Cópias sujeitas ao mesmo incidente podem comprometer a recuperação.',
 backupOps:'Falhas de cópia sem acompanhamento podem passar despercebidas.',
 recoveryPlan:'Prioridades e dependências precisam ser conhecidas para recuperar serviços com dados pessoais.'
 };
 return relevance[x.id]||'Avalie o controle no contexto dos dados pessoais tratados.';
}
export const moduleLabel=(m:Module)=>modules.find(x=>x.id===m)!.label;
