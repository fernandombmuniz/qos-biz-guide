import type { ReactNode } from 'react';
import type { Profile } from '../context/ProfileContext';
import type { Facts, Finding, Module } from './model';

import conciergeLogo from '../assets/logo-concierge.jpg';
import qosLogo from '../assets/logo_qostecnologia.jpg';
import './lumina-executive-report.css';

type Props = { profile: Profile; facts: Facts; findings: Finding[]; route: Module[]; meetingDate?: Date };

const moduleNames: Record<string,string> = { firewall:'Firewall', endpoint:'Endpoint',backup:'Backup' };
const keyInfo: Record<string, { impact:string; verify:string }> = {
  firewall: {impact:'Sem políticas e inspeção confirmadas na borda, o ambiente pode ter menos capacidade de restringir acessos e investigar conexões suspeitas.',verify:'Confirmar equipamento, licenças, políticas, logs e recursos de segurança efetivamente ativos.'},
  ips: {impact:'Tentativas de exploração e tráfego malicioso podem exigir controles de prevenção adicionais aos de um roteador convencional.',verify:'Validar IPS, assinaturas, regras aplicadas e cobertura da inspeção.'},
  networkOps: {impact:'Quando a análise depende de alguém perceber uma falha, eventos relevantes podem demorar mais a ser identificados e tratados.',verify:'Identificar responsáveis, cobertura, alertas, registros e rotina de resposta.'},
  incident: {impact:'A ausência de procedimentos claros pode atrasar a contenção, a comunicação e a recuperação durante um incidente.',verify:'Confirmar papéis, contatos, escalonamento e procedimentos documentados e testados.'},
  segmentation: {impact:'Sem controle do tráfego entre redes, um acesso indevido pode alcançar sistemas que deveriam estar isolados.',verify:'Revisar VLANs, regras inter-redes e separação de visitantes e sistemas críticos.'},
  protection: {impact:'Proteção básica pode não oferecer a visibilidade e as ações de resposta necessárias diante de comportamentos suspeitos.',verify:'Comparar capacidades efetivas de prevenção, detecção e resposta, considerando o parque.'},
  endpointOps: {impact:'Alertas sem triagem contínua podem permanecer sem investigação até afetarem usuários e sistemas.',verify:'Confirmar telemetria, responsáveis, cobertura e escalonamento.'},
  backup: {impact:'Ativos fora do escopo de cópia podem ficar sem caminho definido de recuperação após falha ou incidente.',verify:'Validar cobertura por ativo, frequência, retenção e destino das cópias.'},
  tested: {impact:'Sem restaurações testadas, o tempo e a efetividade de recuperação permanecem incertos.',verify:'Planejar restauração controlada e registrar tempo, integridade e resultado.'},
};
// Avoid fixed-page overflow for lengthy responses. Long findings receive their own page.
function groupFindings(items:Finding[]):Finding[][] {
  const pages:Finding[][]=[];let current:Finding[]=[];let used=0;
  for(const item of items){
    const weight=(item.title+item.evidence+item.meaning+item.action).length;
    if(current.length && (current.length>=2 || used+weight>700)){pages.push(current);current=[];used=0;}
    current.push(item);used+=weight;
  }
  if(current.length)pages.push(current);
  return pages;
}
function groupRows<T extends {value:string}>(items:T[]):T[][] {
 const pages:T[][]=[];let current:T[]=[];let used=0;
 for(const item of items){const weight=item.value.length;if(current.length&&(current.length>=12||used+weight>900)){pages.push(current);current=[];used=0;}current.push(item);used+=weight;}
 if(current.length)pages.push(current);return pages;
}
function nice(v:unknown) { const s=String(v??'').trim();return s && s!=='0' && s!=='undefined' ? s : 'A confirmar'; }
function statusName(s:Finding['state']) {return s==='attention'?'Ponto de atenção':s==='confirmed'?'Controle informado':'A confirmar';}
function Page({children,kicker,title,sub,client,step}:{children:ReactNode;kicker:string;title:string;sub?:string;client:string;step?:string}) {
 return <section className="lumina-page">
   <div className="lumina-p-top"><span>CONCIERGE LÚMINA</span><span>{kicker.toUpperCase()}</span></div>
   <div className="lumina-p-title"><div><div className="lumina-p-kicker">{kicker}</div><h2>{title}</h2>{sub&&<p>{sub}</p>}</div></div>
   <div className="lumina-p-body">{children}</div>
   <footer className="lumina-p-foot"><span>{client} · Leitura consultiva e preliminar</span><span>{step||'Concierge Segurança Digital · Grupo QOS'}</span></footer>
 </section>;
}
function Brand({profile,small=false}:{profile:Profile;small?:boolean}) {
 return <div className={'lumina-brand'+(small?' lumina-brand-small':'')}>
   <div className="lumina-brand-client">{profile.companyLogo?<img src={profile.companyLogo} alt={`Logo ${profile.companyName||'cliente'}`}/>:<strong>{profile.companyName||'Empresa em levantamento'}</strong>}</div>
   <span className="lumina-brand-divider" aria-hidden="true"/>
   <div className="lumina-brand-concierge"><img src={conciergeLogo} alt="Concierge Segurança Digital"/></div>
 </div>;
}
function Metric({label,value,foot}:{label:string;value:string;foot?:string}) {return <div className="lumina-metric"><span>{label}</span><strong>{value}</strong>{foot&&<small>{foot}</small>}</div>}
function StatusLegend({a,c,u}:{a:number;c:number;u:number}) {return <div className="lumina-status-legend"><span><i className="lumina-dot-att"/>{a} atenção</span><span><i className="lumina-dot-ok"/>{c} informados</span><span><i className="lumina-dot-pending"/>{u} a confirmar</span></div>}
function GradeRing({value}:{value:number|null}) {const progress=value===null?0:Math.max(0,Math.min(100,value));return <div className="lumina-gauge"><svg viewBox="0 0 160 160" role="img" aria-label={value===null?'Indicador não disponível':`Indicador ${value} de 100`}><circle cx="80" cy="80" r="61" fill="none" stroke="#20455d" strokeWidth="15"/><circle cx="80" cy="80" r="61" fill="none" stroke="#3bd5f3" strokeWidth="15" strokeDasharray={`${progress*3.832} 383.2`} transform="rotate(-90 80 80)" strokeLinecap="round"/></svg><div><strong>{value===null?'—':value}</strong><span>/100</span></div></div>}
function Cover({p,f,stamp}:{p:Profile;f:Facts;stamp:string}) {return <section className="lumina-page lumina-cover">
 <div className="lumina-p-top"><span>CONCIERGE LÚMINA</span><span>LEITURA EXECUTIVA</span></div>
 <div className="lumina-cover-mark"><Brand profile={p}/></div>
 <div className="lumina-cover-main"><span className="lumina-p-kicker">RELATÓRIO EXECUTIVO · AMBIENTE E SEGURANÇA</span><h1>{p.companyName||'Empresa em levantamento'}</h1><p>Toda proteção começa pela compreensão do que precisa ser protegido.</p><div className="lumina-cover-summary">Primeira leitura dos controles, das dependências e dos temas que merecem atenção, construída a partir das informações fornecidas durante a reunião.</div></div>
 <div className="lumina-cover-meta"><div><span>CONTATO</span><strong>{nice(p.contactName)}</strong></div><div><span>DATA DA DEVOLUTIVA</span><strong>{stamp}</strong></div><div><span>OBJETIVO DA CONVERSA</span><strong>{nice(f.goal)}</strong></div></div>
 <div className="lumina-cover-bottom"><div><span>COMPREENDER</span><i/><span>VISUALIZAR</span><i/><span>PROTEGER</span></div><span>Concierge Segurança Digital · Grupo QOS Tecnologia</span></div>
 </section>}

function NetworkDiagram({p,f}:{p:Profile;f:Facts}) {
 const links=(p.internetLinks||[]).filter(l=>l.provider||l.speed).slice(0,4);
 const l=links.length?links:[{provider:'Link',speed:'A confirmar'}];
 const switchText=(p.switchCount>0?`${p.switchCount} switch${p.switchCount>1?'es':''}`:'Switch a confirmar');
 const vlans=(p.vlanCount>0?`${p.vlanCount} VLAN${p.vlanCount>1?'s':''}`:'VLANs a confirmar');
 const aps=(p.apQuantity>0?`${p.apQuantity} APs`:'APs a confirmar');
 const esc=(s:string)=>s.length>31?s.slice(0,29)+'…':s;
 return <svg className="lumina-topo" viewBox="0 0 1100 390" role="img" aria-label="Diagrama lógico ilustrativo da rede informado na reunião">
 <defs><linearGradient id="lmEdge" x1="0" x2="1"><stop stopColor="#25b3d5"/><stop offset="1" stopColor="#39d4c4"/></linearGradient></defs>
 <g fill="none" stroke="#278bac" strokeWidth="2.2" strokeDasharray="6 5"><path d="M 550 74 V 112"/><path d="M 550 178 V 216"/><path d="M 550 280 V 310 H 260 V 327"/><path d="M 550 310 H 560 V 327"/><path d="M 550 310 H 880 V 327"/></g>
 <g fill="#09283a" stroke="#2c809a" strokeWidth="2"><rect x="368" y="8" rx="14" width="364" height="68"/><rect x="372" y="112" rx="14" width="356" height="66"/><rect x="372" y="215" rx="14" width="356" height="65"/><rect x="86" y="326" rx="14" width="348" height="58"/><rect x="450" y="326" rx="14" width="220" height="58"/><rect x="688" y="326" rx="14" width="322" height="58"/></g>
 <g textAnchor="middle" fill="#47e3ef" fontSize="12" fontWeight="700"><text x="550" y="30">CONECTIVIDADE EXTERNA</text><text x="550" y="134">BORDA / SEGURANÇA</text><text x="550" y="236">DISTRIBUIÇÃO</text><text x="260" y="345">REDES INTERNAS</text><text x="560" y="345">ACESSO SEM FIO</text><text x="850" y="345">ACESSO REMOTO</text></g>
 <g textAnchor="middle" fill="#e5f5ff" fontSize="15" fontWeight="600"><text x="550" y="57">{esc(l.map(x=>[x.provider,x.speed].filter(Boolean).join(' ')).join('  ·  '))}</text><text x="550" y="160">{esc(p.firewallModel||p.firewallType||'Proteção da borda a confirmar')}</text><text x="550" y="262">{switchText} · {esc(p.switchModel||'Modelo a confirmar')}</text><text x="260" y="369">{esc(vlans+(p.vlanNames?' · '+p.vlanNames:''))}</text><text x="560" y="369">{aps}</text><text x="850" y="369">SSL-VPN: {esc(f.sslUsers||'Pendente')} · IPsec: {esc(f.ipsecTunnels||'Pendente')}</text></g>
 </svg>;
}

function FindingCard({item,index}:{item:Finding;index:number}) {
 const info=keyInfo[item.id]||keyInfo[item.id.split(':').pop()||''];
 const impact= info?.impact || item.meaning || 'O controle merece avaliação no contexto do ambiente e da operação.';
 const verify= info?.verify || item.action || 'Confirmar configuração, cobertura e evidências.';
 return <article className={'lumina-finding lumina-finding-'+item.state}>
  <header><span className="lumina-finding-num">{String(index).padStart(2,'0')}</span><h3>{item.title}</h3><span className="lumina-finding-tag">{statusName(item.state)}</span></header>
  <div className="lumina-finding-grid"><div><span>O QUE FOI INFORMADO</span><p>{item.evidence||'Não informado.'}</p></div><div><span>O QUE PODE ACONTECER</span><p>{impact}</p></div><div><span>O QUE VALE VALIDAR</span><p>{verify}</p></div></div>
 </article>
}
const profileFacts: Array<[keyof Profile,string,Module]> = [
 ['userCount','Usuários','firewall'],['deviceCount','Dispositivos','endpoint'],['itTeamSize','Equipe de TI','firewall'],
 ['firewallModel','Firewall atual','firewall'],['vlanCount','VLANs','firewall'],['vlanNames','Redes / segmentação','firewall'],
 ['switchCount','Switches','firewall'],['switchBrand','Fabricante do switch','firewall'],['switchModel','Modelo do switch','firewall'],
 ['apQuantity','Pontos de acesso','firewall'],['apBrand','Fabricante dos APs','firewall'],['apModel','Modelo dos APs','firewall'],
 ['endpointsWindows','Computadores Windows','endpoint'],['endpointsMac','Macs','endpoint'],['windowsServerCount','Servidores Windows','endpoint'],['linuxServerCount','Servidores Linux','endpoint'],
 ['backupPhysicalServers','Servidores físicos','backup'],['backupVirtualServers','Máquinas virtuais','backup'],['backupTotalVolumeToProtect','Volume a proteger','backup'],
 ['backupDesiredRetention','Retenção desejada','backup'],['backupMostCriticalSystem','Sistema prioritário','backup'],['backupMaxAcceptableDowntime','Parada tolerável','backup'],
 ['backupMaxAcceptableDataLoss','Perda tolerável','backup'],['backupM365UsersCount','Usuários M365','backup'],
 ['firewallType','Tipo de borda atual','firewall'],['firewallTypeOther','Detalhes da borda','firewall'],['loadBalancerOption','Balanceamento de links','firewall'],['sdwanOption','SD-WAN','firewall'],['networkUsage','Perfil de uso da rede','firewall'],['vpnSiteToSite','VPN site-to-site','firewall'],['vpnRemoteAccess','VPN de acesso remoto','firewall'],
 ['windowsVersion','Versões Windows','endpoint'],['macVersion','Versões macOS','endpoint'],['windowsServerVersion','Versões Windows Server','endpoint'],['linuxServerCount','Servidores Linux','endpoint'],['outOfDomainCount','Dispositivos fora do domínio','endpoint'],['protectionType','Proteção atual','endpoint'],
 ['backupVirtualizationPlatform','Plataforma de virtualização','backup'],['backupCloudServersCount','Servidores em nuvem','backup'],['backupDesktopsNotebooksCount','Estações no backup','backup'],['backupHasNasStorage','NAS no ambiente','backup'],['backupHasSolution','Backup existente','backup'],['backupSolutionName','Solução atual de backup','backup'],['backupCurrentFrequency','Frequência das cópias','backup'],['backupCurrentRetention','Retenção atual','backup'],['backupAreBackupsTested','Testes de restauração','backup'],['backupLastTestDate','Último teste','backup'],['backupStorageLocation','Destinos atuais','backup'],['backupDesiredStorageStrategy','Estratégia de armazenamento','backup'],['backupMainLinkSpeed','Link para transferência','backup'],['backupAvailableWindow','Janela de backup','backup'],['backupMonthlyGrowth','Crescimento mensal','backup'],['backupM365ServicesToProtect','Serviços Microsoft 365','backup'],['backupGoogleWorkspaceUsersCount','Usuários Google Workspace','backup'],['backupGoogleWorkspaceServicesToProtect','Serviços Google Workspace','backup'],['backupImpactIfUnavailable','Impacto de indisponibilidade','backup'],['backupMostImpactedArea','Área mais impactada','backup'],['backupMainProjectMotivation','Motivação do projeto','backup']
];
const relevantFacts: Array<[string,string,Module]> = [
 ['sslUsers','SSL-VPN simultâneos','firewall'],['ipsecTunnels','Túneis IPsec','firewall'],['availability','Serviços dependentes da rede','firewall'],['peakTrafficMbps','Pico agregado Mbps','firewall'],
 ['endpointVendor','Solução atual de Endpoint','endpoint'],['endpointLicense','Licença','endpoint'],['coverage','Cobertura dos agentes','endpoint'],['byod','BYOD','endpoint'],
 ['hosts','Hosts de virtualização','backup'],['protectedVMs','VMs protegidas','backup'],['nas','NAS','backup'],['backupDest','Destino das cópias','backup'],['lastTest','Último teste de restauração','backup']
];

export default function LuminaExecutiveReport({profile:p,facts:f,findings,route,meetingDate}:Props) {
 const stamp=(meetingDate||new Date()).toLocaleDateString('pt-BR');
 const selected:Module[]=route.filter(x=>x!=='overview');
 const relevant=findings.filter(x=>selected.includes(x.module));
 const attention=relevant.filter(x=>x.state==='attention');
 const confirmed=relevant.filter(x=>x.state==='confirmed');
 const unknown=relevant.filter(x=>x.state==='unknown');
 const answered=attention.length+confirmed.length;
 const evaluated=relevant.length;
 // Matches the reading used by the original in-app grade: confirmed / conclusively answered.
 const grade=evaluated>=1&&answered/evaluated>=0.6&&answered>0?Math.round(100*confirmed.length/answered):null;
 
 const profileRows=profileFacts.filter(([k,,m])=>selected.includes(m) && (p[k]!==null&&p[k]!==undefined&&p[k]!==''&&p[k]!==0&&!['not_informed',''].includes(String(p[k])))).map(([k,label,m])=>({label,value:Array.isArray(p[k])?(p[k] as string[]).join(', '):String(p[k]),module:m}));
 const factRows=relevantFacts.filter(([k,,m])=>selected.includes(m)&&f[k]?.trim()).map(([k,label,m])=>({label,value:f[k],module:m}));
 const rows=[...profileRows,...factRows];
 const conclusion=attention[0]?.title||'Validar os controles de maior importância para a operação';
 const allControls=[...attention,...confirmed,...unknown];
 const groupedRisks=groupFindings(allControls);
 const rowsPages=groupRows(rows);
 const links=(p.internetLinks||[]).filter(x=>x.provider||x.speed);
 const displayStat=[{label:'Usuários',value:p.userCount>0?String(p.userCount):'A confirmar'},
 {label:'Links de internet',value:links.length?String(links.length):'A confirmar'},
 {label:'Redes internas',value:p.vlanCount>0?`${p.vlanCount} VLAN${p.vlanCount===1?'':'s'}`:'A confirmar'},
 {label:'Frentes analisadas',value:String(selected.length)}];
 return <div className="lumina-report" data-lumina-report>
  <Cover p={p} f={f} stamp={stamp}/>
  <Page kicker="01 / panorama" title="O que a conversa já mostrou" sub="Dados declarados e uma leitura inicial das prioridades, sem afirmar vulnerabilidades tecnicamente comprovadas." client={p.companyName||'Cliente'}>
    <div className="lumina-metric-row">{displayStat.map(s=><Metric key={s.label} {...s}/>)}</div>
    <div className="lumina-overview-grid"><article className="lumina-panel lumina-grade-panel"><span className="lumina-label">INDICADOR LÚMINA · CONTROLES INFORMADOS</span><div className="lumina-grade-content"><GradeRing value={grade}/><div><h3>{answered} de {evaluated} controles com resposta conclusiva</h3><p>Indicador declaratório, sem teste de eficácia. A pontuação depende dos controles informados como existentes e das respostas disponíveis.</p><div className="lumina-stacked"><span style={{width:(evaluated?attention.length/evaluated*100:0)+'%'}}/><span style={{width:(evaluated?confirmed.length/evaluated*100:0)+'%'}}/><span style={{width:(evaluated?unknown.length/evaluated*100:0)+'%'}}/></div><StatusLegend a={attention.length} c={confirmed.length} u={unknown.length}/></div></div></article>
    <article className="lumina-panel lumina-priority-panel"><span className="lumina-label">PRIMEIRO PONTO PARA CONVERSAR</span><h3>{conclusion}</h3><p>{attention[0]?.meaning || 'Uma validação técnica direcionada ajuda a definir o escopo e as prioridades.'}</p><div className="lumina-what"><strong>O que vale confirmar</strong><p>{attention[0]?.action || 'Escopo, cobertura, evidências e prioridades com a equipe de TI.'}</p></div></article></div>
    <div className="lumina-text-strip"><strong>Critério de leitura</strong><span>As respostas registradas ajudam a organizar prioridades. O índice não indica probabilidade de ataque, eficácia comprovada ou conformidade com a LGPD.</span></div>
  </Page>
  {selected.includes('firewall')&&<Page kicker="02 / rede e acessos" title="Como o ambiente se conecta" sub="Topologia lógica ilustrativa montada com as informações fornecidas, sujeita a validação com a equipe de TI." client={p.companyName||'Cliente'}>
   <div className="lumina-panel lumina-topo-panel"><NetworkDiagram p={p} f={f}/></div>
   <div className="lumina-network-metrics"><div><strong>Conectividade</strong>{links.length?links.map((l,i)=><p key={i}>{nice(l.provider)} · {nice(l.speed)}</p>):<p>A confirmar</p>}</div><div><strong>Ambiente interno</strong><p>{p.switchCount||'A confirmar'} switches · {p.vlanCount||'A confirmar'} VLANs · {p.apQuantity||'A confirmar'} APs</p></div><div><strong>Acesso remoto</strong><p>SSL-VPN: {nice(f.sslUsers)} · IPsec: {nice(f.ipsecTunnels)}</p></div></div>
   <div className="lumina-text-strip"><strong>Pontos de validação</strong><span>Confirmar failover ou balanceamento dos links, modelo e políticas da borda, regras entre redes e volumes de acesso remoto.</span></div>
  </Page>}
  <Page kicker="03 / distribuição dos controles" title="Onde merece atenção" sub="Distribuição das respostas entre pontos de atenção, controles informados e temas sem confirmação." client={p.companyName||'Cliente'}>
   <div className="lumina-distribution-panel lumina-panel"><div className="lumina-distribution-number"><strong>{attention.length}</strong><span>pontos de atenção</span></div><div className="lumina-distribution-graph"><div className="lumina-stacked"><span style={{width:(evaluated?attention.length/evaluated*100:0)+'%'}}/><span style={{width:(evaluated?confirmed.length/evaluated*100:0)+'%'}}/><span style={{width:(evaluated?unknown.length/evaluated*100:0)+'%'}}/></div><StatusLegend a={attention.length} c={confirmed.length} u={unknown.length}/><p>A classificação reflete respostas da reunião, não validação de configuração, presença de ameaças ou incidentes.</p></div></div>
   <div className="lumina-control-grid">{selected.map(m=><article className="lumina-panel" key={m}><span className="lumina-label">{moduleNames[m]}</span><strong>{relevant.filter(x=>x.module===m&&x.state==='attention').length}</strong><span>temas com atenção</span><div className="lumina-mini-graph"><span style={{width:`${relevant.filter(x=>x.module===m&&x.state==='attention').length/Math.max(relevant.filter(x=>x.module===m).length,1)*100}%`}}/></div><p>{relevant.filter(x=>x.module===m).length} controles analisados</p></article>)}</div>
   <div className="lumina-text-strip"><strong>Como ler o resultado</strong><span>O relatório detalha os controles nas páginas seguintes: informação declarada, possível consequência operacional e o que precisa ser confirmado.</span></div>
  </Page>
  {groupedRisks.map((pair,pageNo)=><Page key={'findings'+pageNo} kicker={`04 / análise dos controles · ${pageNo+1} de ${groupedRisks.length}`} title="O que pode acontecer na operação" sub="Cada ponto parte de uma resposta declarada. Possíveis impactos são cenários condicionais, não incidentes constatados." client={p.companyName||'Cliente'}>
   <div className="lumina-findings">{pair.map((item,i)=><FindingCard key={item.id} item={item} index={pageNo*2+i+1}/>)}</div>
  </Page>)}
  {rowsPages.length>0&&rowsPages.map((slice,i)=><Page key={'data'+i} kicker={`05 / dados da reunião · ${i+1} de ${rowsPages.length}`} title="Informações que orientam o escopo" sub="Campos efetivamente preenchidos na reunião. Valores não declarados não foram estimados." client={p.companyName||'Cliente'}><div className="lumina-data-grid">{slice.map((row,j)=><div key={i*12+j}><span>{row.label}</span><strong>{row.value}</strong><small>{moduleNames[row.module]}</small></div>)}</div><div className="lumina-text-strip"><strong>Revisão técnica</strong><span>Esses dados são uma base de conversa para dimensionar e validar a solução. Quantidades e premissas devem ser confirmadas antes da proposta final.</span></div></Page>)}
  <Page kicker="06 / encaminhamento" title="Da leitura inicial à proposta" sub="Próximos passos para transformar o levantamento em uma recomendação técnica e comercial alinhada ao ambiente." client={p.companyName||'Cliente'}>
    <div className="lumina-roadmap"><article><div className="lumina-roadmap-num">01</div><div><h3>Validar o escopo</h3><p>Alinhar com a equipe de TI o ambiente, as necessidades, os serviços envolvidos, as quantidades e os requisitos de operação.</p><div className="lumina-roadmap-note">Saída esperada: escopo técnico consolidado e premissas confirmadas.</div></div></article><article><div className="lumina-roadmap-num">02</div><div><h3>Apresentar a proposta técnica e comercial</h3><p>Detalhar a arquitetura recomendada, os serviços e responsabilidades previstos, as condições comerciais e as etapas de implantação, conforme o escopo validado.</p><div className="lumina-roadmap-note">Saída esperada: proposta estruturada para avaliação da gestão.</div></div></article></div>
    <div className="lumina-final-quote">Toda proteção começa pela compreensão do que precisa ser protegido.</div>
    <div className="lumina-final-brands"><img src={conciergeLogo} alt="Concierge Segurança Digital"/><img src={qosLogo} alt="Grupo QOS Tecnologia"/></div>
  </Page>
  <Page kicker="07 / metodologia" title="Como interpretar esta devolutiva" sub="Transparência sobre o que este documento mostra e o que permanece fora do escopo da primeira conversa." client={p.companyName||'Cliente'}>
   <div className="lumina-method-grid"><article className="lumina-panel"><span className="lumina-label">ORIGEM DOS DADOS</span><h3>Informações declaradas</h3><p>O conteúdo foi organizado a partir das respostas e dos dados informados na Lúmina durante a reunião. Não representa inspeção do ambiente.</p></article><article className="lumina-panel"><span className="lumina-label">INDICADOR</span><h3>Leitura indicativa</h3><p>Os controles são classificados como atenção, informados ou a confirmar. Para controles respondidos, o índice considera a proporção de controles informados como presentes, sem comprovar sua efetividade.</p></article><article className="lumina-panel"><span className="lumina-label">LIMITES</span><h3>Validação necessária</h3><p>O material não substitui auditoria, teste de intrusão, avaliação técnica de vulnerabilidades, análise de logs ou validação de configuração.</p></article><article className="lumina-panel"><span className="lumina-label">PROTEÇÃO DE DADOS</span><h3>Contexto da LGPD</h3><p>O artigo 46 da LGPD orienta a adoção de medidas técnicas e administrativas de segurança. Esta leitura isolada não permite concluir conformidade ou descumprimento legal.</p></article></div>
   <div className="lumina-references"><strong>Referências de consulta</strong><a href="https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html">LGPD · Art. 46</a><a href="https://www.gov.br/anpd/pt-br/assuntos/seguranca-e-sigilo-de-dados">ANPD · Segurança e sigilo de dados</a></div>
  </Page>
 </div>;
}
