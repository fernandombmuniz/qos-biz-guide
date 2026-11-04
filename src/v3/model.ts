import type { Profile } from '../context/ProfileContext';
export type Module = 'overview'|'firewall'|'endpoint'|'backup';
export type Facts = Record<string,string>;
export type Finding = {id:string; module:Module; title:string; evidence:string; meaning:string; action:string; state:'attention'|'confirmed'|'unknown'};
export const modules = [{id:'overview' as Module,label:'Panorama',sub:'Prioridades e decisões',number:'01'},{id:'firewall' as Module,label:'Firewall',sub:'Rede, acessos e disponibilidade',number:'02'},{id:'endpoint' as Module,label:'Endpoint',sub:'Proteção, investigação e resposta',number:'03'},{id:'backup' as Module,label:'Backup',sub:'Dados, continuidade e recuperação',number:'04'}];
export const chapters = ['Seu ambiente','O que merece atenção','Na prática','Nossa atuação','Impacto e investimento','Próximos passos'];
export type Question = {key:string;label:string;help?:string;options:[string,string][]; module:Module};
const yn:[string,string][]=[['yes','Sim'],['no','Não'],['unknown','A confirmar'],['na','Não se aplica']];
export const questions:Question[] = [
 {module:'firewall',key:'firewall',label:'Qual é a proteção atual da rede?',options:[['ngfw','Firewall corporativo NGFW'],['dedicated','Firewall dedicado / open source'],['router','Roteador corporativo'],['isp','Roteador da operadora'],['none','Nenhuma'],['unknown','A confirmar']]},
 {module:'firewall',key:'ips',label:'Há prevenção de intrusão ativa?',help:'Confirme a configuração e a licença, quando necessárias.',options:yn},
 {module:'firewall',key:'segmentation',label:'As redes têm separação e regras de acesso definidas?',help:'VLANs e políticas entre as redes precisam ser consideradas juntas.',options:yn},
 {module:'firewall',key:'vpn',label:'Existem acessos por VPN?',options:yn},
 {module:'firewall',key:'mfa',label:'Os acessos remotos exigem MFA?',options:yn},
 {module:'firewall',key:'ha',label:'Existe redundância do firewall (HA)?',options:yn},
 {module:'firewall',key:'haNeed',label:'A continuidade exige redundância do firewall?',options:yn},
 {module:'firewall',key:'inspection',label:'Existe requisito de inspeção SSL/TLS?',help:'Requisito a considerar no dimensionamento, conforme o ambiente.',options:yn},
 {module:'firewall',key:'networkOps',label:'Quem acompanha os eventos de segurança da rede?',options:[['soc','Equipe especializada 24/7'],['team','Equipe em horário definido'],['reactive','Verificação quando surge um problema'],['none','Sem responsável definido'],['unknown','A confirmar']]},
 {module:'endpoint',key:'protection',label:'Qual proteção está instalada nos computadores?',options:[['managed','EDR acompanhado por equipe especializada'],['edr','EDR'],['av','Antivírus corporativo'],['basic','Proteção básica / nativa'],['none','Sem proteção'],['unknown','A confirmar']]},
 {module:'endpoint',key:'console',label:'Existe gestão central dos agentes e das políticas?',options:yn},
 {module:'endpoint',key:'endpointOps',label:'Quem investiga e trata os alertas?',options:[['soc','Equipe especializada 24/7'],['team','Responsável em horário definido'],['reactive','Alguém verifica quando pode'],['none','Sem responsável definido'],['unknown','A confirmar']]},
 {module:'endpoint',key:'response',label:'Existe um processo definido de resposta e contenção?',options:yn},
 {module:'endpoint',key:'patch',label:'Há rotina para atualizações e correção de falhas?',options:yn},
 {module:'endpoint',key:'admin',label:'O uso de administrador local é restrito?',options:yn},
 {module:'backup',key:'backup',label:'Existe backup para os dados do escopo?',options:[['yes','Sim, para todo o escopo informado'],['partial','Somente para parte do escopo'],['no','Não'],['unknown','A confirmar']]},
 {module:'backup',key:'tested',label:'A recuperação foi testada e documentada?',options:yn},
 {module:'backup',key:'isolated',label:'Existe cópia isolada ou protegida contra alteração?',help:'Confirmar tecnologia, credenciais e configuração da proteção.',options:yn},
 {module:'backup',key:'backupOps',label:'As tarefas e falhas de backup são acompanhadas?',options:yn},
 {module:'backup',key:'recoveryPlan',label:'Existe ordem de recuperação dos serviços prioritários?',options:yn},
];
export function applicable(q:Question,f:Facts){return !(q.key==='mfa' && (f.vpn==='no'||f.vpn==='na'));}
export function label(key:string,value:string){return questions.find(q=>q.key===key)?.options.find(o=>o[0]===value)?.[1] || (value==='unknown'?'A confirmar':value||'A confirmar');}
export function analyze(p:Profile,f:Facts):Finding[]{
 const out:Finding[]=[];
 const add=(m:Module,key:string,title:string,meaning:string,action:string,bad:string[],good:string[]=['yes'])=>{let v=f[key]||'unknown';if(v==='na')return;let state:Finding['state']=bad.includes(v)?'attention':good.includes(v)?'confirmed':'unknown';out.push({id:key,module:m,title:state==='unknown'?`${title}: confirmar`:title,evidence:`${questions.find(q=>q.key===key)?.label} ${label(key,v)}.`,meaning:state==='unknown'?'Ainda falta informação para concluir sobre este controle.':state==='confirmed'?'O controle foi informado como existente. Sua aplicação e evidências podem ser confirmadas no aprofundamento.':meaning,action:state==='confirmed'?'Validar cobertura, configuração e rotina de revisão.':action,state});};
 add('firewall','firewall','Proteção do perímetro','O cenário informado pede avaliar controles de tráfego e visibilidade.','Levantar políticas e necessidades antes de definir o equipamento.',['router','isp','none'],['ngfw','dedicated']);
 add('firewall','ips','Prevenção de intrusão','A prevenção de exploração não foi confirmada como ativa.','Validar prevenção de ameaças, licenciamento e configuração.',['no']);
 add('firewall','segmentation','Separação entre redes','A separação e as regras entre redes precisam ser estruturadas.','Mapear fluxos permitidos e redes que exigem isolamento.',['no']);
 if(f.vpn!=='no'&&f.vpn!=='na') add('firewall','mfa','Autenticação no acesso remoto','O acesso remoto foi informado sem MFA.','Revisar autenticação e políticas de acesso remoto.',['no']);
 if(f.haNeed==='yes')add('firewall','ha','Continuidade do firewall','Foi informada necessidade de redundância sem HA existente.','Validar arquitetura de alta disponibilidade e dependências.',['no']);
 add('firewall','networkOps','Acompanhamento da rede','O acompanhamento foi informado como reativo ou sem responsável.','Definir análise, acionamento e responsabilidades.',['reactive','none'],['soc','team']);
 add('endpoint','protection','Proteção dos dispositivos','A proteção atual precisa ser comparada às necessidades de prevenção, investigação e resposta.','Validar capacidades da solução e necessidades do parque.',['basic','none'],['managed','edr','av']);
 add('endpoint','console','Gestão central','A gestão dos agentes e das políticas não está centralizada.','Mapear cobertura e administração das políticas.',['no']);
 add('endpoint','endpointOps','Investigação dos alertas','Os alertas podem depender de acompanhamento eventual.','Definir triagem, cobertura e acionamento para resposta.',['none','reactive'],['soc','team']);
 add('endpoint','response','Processo de resposta','Não foi informado um processo definido para contenção.','Definir critérios, autorizações e comunicação.',['no']);
 add('endpoint','patch','Atualização dos dispositivos','Não foi informada uma rotina de correção.','Levantar responsabilidades e janela de atualização.',['no']);
 add('endpoint','admin','Privilégios locais','O uso administrativo não foi informado como restrito.','Validar exceções e aplicação de menor privilégio.',['no']);
 add('backup','backup','Cobertura das cópias','Parte ou todo o escopo pode estar sem cópia.','Confirmar os ativos e dados que precisam ser protegidos.',['no','partial']);
 add('backup','tested','Recuperação validada','Existe incerteza sobre a capacidade e o tempo de retorno.','Planejar teste de recuperação e registrar o resultado.',['no']);
 add('backup','isolated','Proteção das cópias','A cópia pode depender do mesmo ambiente ou de controles a revisar.','Validar isolamento, proteção contra alteração e credenciais.',['no']);
 add('backup','backupOps','Acompanhamento das tarefas','Falhas de cópia podem não ser tratadas a tempo.','Definir verificação das tarefas e tratamento de falhas.',['no']);
 add('backup','recoveryPlan','Ordem de recuperação','Não existe uma sequência definida para restabelecer os serviços.','Definir dependências e prioridade dos serviços.',['no']);
 return out;
}
export function filterFindings(all:Finding[],m:Module){return (m==='overview'?all:all.filter(x=>x.module===m)).sort((a,b)=>['attention','unknown','confirmed'].indexOf(a.state)-['attention','unknown','confirmed'].indexOf(b.state));}
export function contextStats(p:Profile,f:Facts,m:Module):[string,string][]{
 const n=(v:number)=>v>0?String(v):'A confirmar';
 if(m==='firewall')return [['Usuários',n(p.userCount)],['Links',p.internetLinks.filter(l=>l.speed).map(l=>l.speed).join(' + ')||'A confirmar'],['SSL-VPN simultâneos',f.sslUsers||'A confirmar'],['Túneis IPsec',f.ipsecTunnels||'A confirmar']];
 if(m==='endpoint')return [['Dispositivos',n(p.deviceCount)],['Windows / Mac',`${n(p.endpointsWindows)} / ${n(p.endpointsMac)}`],['Proteção',label('protection',f.protection)],['Acompanhamento',label('endpointOps',f.endpointOps)]];
 if(m==='backup')return [['Sistema prioritário',p.backupMostCriticalSystem||p.criticalApp||'A confirmar'],['Volume',p.backupTotalVolumeToProtect||p.backupSize||'A confirmar'],['Retenção',p.backupDesiredRetention||'A confirmar'],['Recuperação testada',label('tested',f.tested)]];
 return [['Usuários',n(p.userCount)],['Dispositivos',n(p.deviceCount)],['Prioridade',f.goal||'A definir na conversa'],['Interlocutor',p.contactName||'A confirmar']];
}
export function scenario(m:Module,f:Facts):{title:string;steps:string[];controls:string[]} {
 if(m==='firewall' && (f.goal==='Disponibilidade'||f.haNeed==='yes'))return {title:'Indisponibilidade de um componente',steps:['Um link ou equipamento fica indisponível.','É necessário identificar quais serviços dependem dele.','As alternativas de conectividade e redundância são acionadas, quando existentes.','A equipe verifica o retorno dos serviços e registra a ocorrência.'],controls:['Links e dependências mapeados','Redundância validada','Monitoramento e acionamento','Teste documentado']};
 if(m==='firewall')return {title:f.vpn==='yes'?'Tentativa de acesso remoto indevido':'Tráfego suspeito entre redes',steps:[f.vpn==='yes'?'Uma tentativa de acesso usa uma credencial comprometida.':'Um dispositivo tenta comunicar com um destino suspeito.','As políticas e os controles configurados avaliam a conexão.','Os eventos disponíveis ajudam a analisar origem, destino e alcance.','A equipe avalia contenção e comunica o que exige decisão.'],controls:['Autenticação e políticas','Prevenção e regras de acesso','Logs e contexto','Equipe e responsabilidades']};
 if(m==='endpoint')return {title:'Da atividade suspeita à resposta',steps:['Um computador apresenta uma atividade suspeita.','A solução registra sinais conforme suas capacidades e configuração.','A equipe investiga o contexto e verifica o alcance.','A contenção prevista é executada conforme autorização e capacidade.','O cliente recebe contexto, ações e pendências.'],controls:['Cobertura dos agentes','Políticas configuradas','Investigação','Contenção autorizada','Comunicação']};
 if(m==='backup')return {title:'Recuperação de um serviço prioritário',steps:['Um serviço ou conjunto de dados fica indisponível.','A equipe identifica o ponto de recuperação e as dependências.','A cópia é validada e a restauração é iniciada.','O responsável valida integridade e funcionamento.','A operação é restabelecida e o resultado é documentado.'],controls:['Escopo protegido','Cópia acessível e protegida','Plano de recuperação','Validação funcional','Registro do teste']};
 return {title:'Como as camadas se conectam',steps:['Um evento afeta uma parte do ambiente.','Rede, computadores e acessos ajudam a limitar e compreender o alcance.','As equipes coordenam investigação e contenção.','O plano de recuperação apoia o retorno dos serviços afetados.','As lições orientam as próximas melhorias.'],controls:['Controles de rede','Proteção dos dispositivos','Operação e resposta','Continuidade','Plano de evolução']};
}
