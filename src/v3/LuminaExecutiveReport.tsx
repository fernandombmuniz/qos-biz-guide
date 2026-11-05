import type { ReactNode } from 'react';
import type { Profile } from '../context/ProfileContext';
import type { Facts, Finding, Module } from './model';

import conciergeLogo from '../assets/logo-concierge.jpg';
import qosLogo from '../assets/logo_qostecnologia.jpg';
import reportBackground from './assets/lumina-report-background.png';
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
function nice(v:unknown) { const s=String(v??'').trim();return s && s!=='0' && s!=='undefined' ? s : 'A confirmar'; }
function statusName(s:Finding['state']) {return s==='attention'?'Ponto de atenção':s==='confirmed'?'Controle informado':'A confirmar';}
function Page({children,kicker,title,sub,client,step}:{children:ReactNode;kicker:string;title:string;sub?:string;client:string;step?:string}) {
 return <section className="lumina-page">
   <img className="lumina-page-backdrop" src={reportBackground} alt="" aria-hidden="true" />
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
 <img className="lumina-page-backdrop" src={reportBackground} alt="" aria-hidden="true" />
 <div className="lumina-p-top"><span>CONCIERGE LÚMINA</span><span>LEITURA EXECUTIVA</span></div>
 <div className="lumina-cover-mark"><Brand profile={p}/></div>
 <div className="lumina-cover-main"><span className="lumina-p-kicker">RELATÓRIO EXECUTIVO · AMBIENTE E SEGURANÇA</span><h1>{p.companyName||'Empresa em levantamento'}</h1><p>Toda proteção começa pela compreensão do que precisa ser protegido.</p><div className="lumina-cover-summary">Primeira leitura dos controles, das dependências e dos temas que merecem atenção, construída a partir das informações fornecidas durante a reunião.</div></div>
 <div className="lumina-cover-meta"><div><span>CONTATO</span><strong>{nice(p.contactName)}</strong></div><div><span>DATA DA DEVOLUTIVA</span><strong>{stamp}</strong></div><div><span>OBJETIVO DA CONVERSA</span><strong>{nice(f.goal)}</strong></div></div>
 <div className="lumina-cover-bottom"><div><span>COMPREENDER</span><i/><span>VISUALIZAR</span><i/><span>PROTEGER</span></div><span>Concierge Segurança Digital · Grupo QOS Tecnologia</span></div>
 </section>}

/** Diagrama nativo do relatório, redesenhado para a página A4.
 * Não reutiliza as caixas de layout da apresentação, que têm altura livre e
 * cabos calculados por getBoundingClientRect e escapavam da página impressa.
 * Preserva os mesmos equipamentos, ligações e dados, sem criar dados novos.
 */
function ReportNetworkTopology({p,f}:{p:Profile;f:Facts}) {
 const links=(p.internetLinks||[]).filter(link=>link.provider||link.speed).slice(0,4);
 const wan=links.length?links:[{provider:'Link a confirmar',speed:'Velocidade a confirmar'}];
 const vlanNames=String(p.vlanNames||'').split(',').map(x=>x.trim()).filter(Boolean);
 const apCount=Math.max(0,Number(p.apQuantity)||0);
 const apDraw=Math.min(apCount,5);
 const svgText=(value:string,max:number)=> value.length>max?`${value.slice(0,max-1)}…`:value;
 const ipsec=nice(f.ipsecTunnels),ssl=nice(f.sslUsers);
 return <div className="lumina-topology-art" aria-label="Visão lógica da rede com links de internet, borda de segurança, switch, segmentação, pontos de acesso e VPN">
   <svg viewBox="0 0 1080 392" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Topologia lógica da rede informada pelo cliente">
    <defs>
     <linearGradient id="lumina-edge-gradient" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#153d53"/><stop offset="1" stopColor="#0c2639"/></linearGradient>
     <linearGradient id="lumina-wifi-glow" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#38d3ea" stopOpacity=".35"/><stop offset="1" stopColor="#38d3ea" stopOpacity=".02"/></linearGradient>
    </defs>
    <text x="24" y="21" fill="#64e1f0" fontSize="12" fontWeight="800" letterSpacing="1.4">CONECTIVIDADE EXTERNA</text>
    {wan.map((l,i)=>{
      const cx=links.length<=2?185+i*160:135+i*132;
      return <g key={`wan-${i}`}>
        <rect x={cx-47} y="35" width="94" height="72" rx="12" fill="#11354a" stroke="#2c8196"/>
        <circle cx={cx} cy="58" r="12" fill="none" stroke="#55d5e6" strokeWidth="1.7"/>
        <path d={`M ${cx-12} 58 H ${cx+12} M ${cx} 46 Q ${cx-11} 58 ${cx} 70 Q ${cx+11} 58 ${cx} 46`} stroke="#55d5e6" strokeWidth="1.3" fill="none"/>
        <text x={cx} y="83" fill="#f4f9fd" fontSize="12" textAnchor="middle" fontWeight="700">{svgText(nice(l.provider),14)}</text>
        <text x={cx} y="99" fill="#afc6d7" fontSize="10" textAnchor="middle">{svgText(nice(l.speed),18)}</text>
        <path d={`M${cx} 107 V125 H310 V198`} fill="none" stroke="#36cadd" strokeWidth="2" strokeLinejoin="round"/>
        <circle cx={cx} cy="107" r="3.5" fill="#51e1ed"/>
      </g>;
    })}
    <text x="24" y="158" fill="#64e1f0" fontSize="12" fontWeight="800" letterSpacing="1.4">BORDA E SEGURANÇA</text>
    <text x="24" y="183" fill="#f1f9fd" fontSize="21" fontWeight="750">{svgText(nice(p.firewallModel||p.firewallType),25)}</text>
    <rect x="24" y="198" width="490" height="58" rx="10" fill="url(#lumina-edge-gradient)" stroke="#3b8aa0" strokeWidth="1.4"/>
    <circle cx="42" cy="210" r="3" fill="#2ed6bd"/><circle cx="54" cy="210" r="3" fill="#62849a"/><circle cx="66" cy="210" r="3" fill="#62849a"/>
    {Array.from({length:8},(_,i)=><rect key={i} x={41+i*51} y="225" width="42" height="15" rx="1.5" fill="#061d2e" stroke="#568ca4" strokeWidth="1"/>)}
    <text x="484" y="218" textAnchor="end" fill="#8bcfe0" fontSize="10" fontWeight="700">EDGE</text>
    <text x="24" y="273" fill="#9bbbd0" fontSize="10">Políticas e redundância a confirmar</text>
    <path d="M290 256 V302 H345 V320" fill="none" stroke="#36cadd" strokeWidth="2.4" strokeLinejoin="round"/>
    <circle cx="290" cy="256" r="4" fill="#62e3f0"/>
    <text x="550" y="157" fill="#64e1f0" fontSize="12" fontWeight="800" letterSpacing="1.4">ACESSO REMOTO</text>
    <path d="M514 228 H560 V232 H586" fill="none" stroke="#39cddd" strokeDasharray="7 7" strokeWidth="2"/>
    <rect x="589" y="179" width="205" height="95" rx="12" fill="#0c293b" stroke="#2b6178"/>
    <text x="606" y="203" fill="#eff8fd" fontSize="20" fontWeight="700">VPN</text>
    <text x="606" y="224" fill="#acc4d5" fontSize="11">SSL-VPN: {svgText(ssl,12)}</text>
    <text x="606" y="243" fill="#acc4d5" fontSize="11">IPsec: {svgText(ipsec,12)}</text>
    <text x="606" y="261" fill="#83a7bb" fontSize="10">Volumes declarados</text>
    <text x="25" y="310" fill="#64e1f0" fontSize="12" fontWeight="800" letterSpacing="1.4">DISTRIBUIÇÃO / ACESSO</text>
    <rect x="25" y="320" width="522" height="44" rx="8" fill="#102f44" stroke="#3b8aa0" strokeWidth="1.2"/>
    {Array.from({length:10},(_,i)=><rect key={i} x={39+i*48} y="331" width="37" height="14" rx="1.4" fill="#061d2e" stroke="#568ca4" strokeWidth=".9"/>)}
    <text x="39" y="357" fill="#a4c2d4" fontSize="10">{Number(p.switchCount)||'A confirmar'} switch{Number(p.switchCount)===1?'':'es'}</text>
    <path d="M547 340 H579 V335 H598" stroke="#36cadd" strokeWidth="2" fill="none"/>
    <rect x="602" y="304" width="210" height="60" rx="10" fill="#102e43" stroke="#2a6379"/>
    <text x="616" y="325" fill="#62e1ee" fontSize="11" fontWeight="800">SEGMENTAÇÃO</text>
    <text x="616" y="344" fill="#eef8fd" fontSize="13" fontWeight="700">{Number(p.vlanCount)||'A confirmar'} VLAN{Number(p.vlanCount)===1?'':'s'}</text>
    <text x="616" y="357" fill="#9fbdd0" fontSize="10">{svgText(vlanNames.join(' / ')||'Redes a confirmar',30)}</text>
    <path d="M812 335 H839" stroke="#36cadd" strokeWidth="2" fill="none"/>
    <text x="844" y="312" fill="#62e1ee" fontSize="11" fontWeight="800">ACESSO SEM FIO</text>
    <text x="844" y="329" fill="#eaf7fc" fontSize="12">{apCount||'A confirmar'} APs</text>
    {Array.from({length:apDraw||3},(_,i)=>{
      const cx=863+i*42;
      return <g key={i}><circle cx={cx} cy="351" r="15" fill="url(#lumina-wifi-glow)" stroke="#31b9d7"/><path d={`M${cx-8} 347 Q${cx} 339 ${cx+8} 347 M${cx-5} 351 Q${cx} 346 ${cx+5} 351`} stroke="#62e3ed" fill="none" strokeWidth="1.7" strokeLinecap="round"/><circle cx={cx} cy="356" r="1.5" fill="#62e3ed"/></g>;
    })}
   </svg>
 </div>;
}

/** Barra SVG: os segmentos não dependem de CSS flex nem do suporte do html2canvas a backgrounds de spans. */
function ControlBar({attention,confirmed,unknown}:{attention:number;confirmed:number;unknown:number}) {
 const total=attention+confirmed+unknown;
 const a=total?attention/total*100:0;
 const c=total?confirmed/total*100:0;
 const u=total?unknown/total*100:0;
 return <svg className="lumina-controlbar-svg" viewBox="0 0 1000 18" preserveAspectRatio="none" aria-label={`${attention} pontos de atenção, ${confirmed} controles informados, ${unknown} a confirmar`}>
  <rect width="1000" height="18" rx="9" fill="#1e4459"/>
  {a>0&&<rect x="0" y="0" width={a*10} height="18" fill="#f6b35e"/>}
  {c>0&&<rect x={a*10} y="0" width={c*10} height="18" fill="#29d3c6"/>}
  {u>0&&<rect x={(a+c)*10} y="0" width={u*10} height="18" fill="#709cb9"/>}
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
 
 const conclusion=attention[0]?.title||'Validar os controles de maior importância para a operação';
 const allControls=[...attention,...confirmed,...(unknown.length>2?unknown:[])];
 const groupedRisks=groupFindings(allControls);
 const links=(p.internetLinks||[]).filter(x=>x.provider||x.speed);
 const displayStat=[{label:'Usuários',value:p.userCount>0?String(p.userCount):'A confirmar'},
 {label:'Links de internet',value:links.length?String(links.length):'A confirmar'},
 {label:'Redes internas',value:p.vlanCount>0?`${p.vlanCount} VLAN${p.vlanCount===1?'':'s'}`:'A confirmar'},
 {label:'Frentes analisadas',value:String(selected.length)}];
 return <div className="lumina-report" data-lumina-report>
  <Cover p={p} f={f} stamp={stamp}/>
  <Page kicker="01 / panorama" title="O que a conversa já mostrou" sub="Dados declarados e uma leitura inicial das prioridades, sem afirmar vulnerabilidades tecnicamente comprovadas." client={p.companyName||'Cliente'}>
    <div className="lumina-metric-row">{displayStat.map(s=><Metric key={s.label} {...s}/>)}</div>
    <div className="lumina-overview-grid"><article className="lumina-panel lumina-grade-panel"><span className="lumina-label">INDICADOR LÚMINA · CONTROLES INFORMADOS</span><div className="lumina-grade-content"><GradeRing value={grade}/><div><h3>{answered} de {evaluated} controles com resposta conclusiva</h3><p>Indicador declaratório, sem teste de eficácia. A pontuação depende dos controles informados como existentes e das respostas disponíveis.</p><ControlBar attention={attention.length} confirmed={confirmed.length} unknown={unknown.length}/><StatusLegend a={attention.length} c={confirmed.length} u={unknown.length}/></div></div></article>
    <article className="lumina-panel lumina-priority-panel"><span className="lumina-label">PRIMEIRO PONTO PARA CONVERSAR</span><h3>{conclusion}</h3><p>{attention[0]?.meaning || 'Uma validação técnica direcionada ajuda a definir o escopo e as prioridades.'}</p><div className="lumina-what"><strong>O que vale confirmar</strong><p>{attention[0]?.action || 'Escopo, cobertura, evidências e prioridades com a equipe de TI.'}</p></div></article></div>
    <div className="lumina-text-strip"><strong>Critério de leitura</strong><span>As respostas registradas ajudam a organizar prioridades. O índice não indica probabilidade de ataque, eficácia comprovada ou conformidade com a LGPD.</span></div>
  </Page>
  {selected.includes('firewall')&&<Page kicker="02 / rede e acessos" title="Como o ambiente se conecta" sub="Topologia lógica ilustrativa montada com as informações fornecidas, sujeita a validação com a equipe de TI." client={p.companyName||'Cliente'}>
   <div className="lumina-panel lumina-topo-panel"><ReportNetworkTopology p={p} f={f}/></div>
   <div className="lumina-network-grid">
    <article className="lumina-panel"><span className="lumina-label">Conectividade</span>{links.length?links.map((l,i)=><p key={i}>{nice(l.provider)} · {nice(l.speed)}</p>):<p>A confirmar</p>}</article>
    <article className="lumina-panel"><span className="lumina-label">Rede e acessos</span><p>{p.switchCount||'A confirmar'} switch{Number(p.switchCount)===1?'':'es'} · {p.vlanCount||'A confirmar'} VLAN{Number(p.vlanCount)===1?'':'s'}</p><p>{p.apQuantity||'A confirmar'} APs</p></article>
    <article className="lumina-panel"><span className="lumina-label">Acesso remoto</span><p>SSL-VPN: {nice(f.sslUsers)}</p><p>IPsec: {nice(f.ipsecTunnels)}</p></article>
   </div>
   <div className="lumina-text-strip"><strong>Vale validar</strong><span>Failover dos links, políticas e recursos da borda, regras entre redes e volumes de VPN.</span></div>
  </Page>}
  <Page kicker="03 / distribuição dos controles" title="Onde merece atenção" sub="Distribuição dos controles conforme as respostas da reunião." client={p.companyName||'Cliente'}>
    <div className="lumina-distribution-stats">
      <article className="lumina-panel"><span className="lumina-label">Pontos de atenção</span><strong>{attention.length}</strong><p>Necessitam de aprofundamento.</p></article>
      <article className="lumina-panel"><span className="lumina-label">Controles informados</span><strong>{confirmed.length}</strong><p>Declarados como existentes.</p></article>
      <article className="lumina-panel"><span className="lumina-label">A confirmar</span><strong>{unknown.length}</strong><p>Sem evidências conclusivas.</p></article>
      <article className="lumina-panel"><span className="lumina-label">Total analisado</span><strong>{evaluated}</strong><p>Critérios da conversa.</p></article>
    </div>
    <div className="lumina-panel lumina-distribution-panel">
      <div className="lumina-distribution-number"><strong>{attention.length}</strong><span>pontos de atenção</span></div>
      <div className="lumina-distribution-graph"><ControlBar attention={attention.length} confirmed={confirmed.length} unknown={unknown.length}/><StatusLegend a={attention.length} c={confirmed.length} u={unknown.length}/><p>Uma leitura declaratória, sujeita à validação de políticas, funcionamento dos controles e evidências operacionais.</p></div>
    </div>
    <div className="lumina-module-breakdown">
      {selected.map(m=>{
        const subset=relevant.filter(x=>x.module===m);
        const a=subset.filter(x=>x.state==='attention').length;
        const c=subset.filter(x=>x.state==='confirmed').length;
        const u=subset.filter(x=>x.state==='unknown').length;
        return <article key={m} className="lumina-panel lumina-module-panel">
          <div className="lumina-module-head"><div><span className="lumina-label">FRENTE ANALISADA</span><h3>{moduleNames[m]}</h3><p>{subset.length} controles analisados na conversa</p></div><div className="lumina-module-score"><strong>{a}</strong><span>pontos de atenção</span></div></div>
          <ControlBar attention={a} confirmed={c} unknown={u}/>
          <StatusLegend a={a} c={c} u={u}/>
        </article>;
      })}
      {unknown.length>0&&unknown.length<=2&&<article className="lumina-panel lumina-module-panel lumina-validation-panel">
        <span className="lumina-label">PENDÊNCIAS DE VALIDAÇÃO</span>
        {unknown.map(item=><div key={item.id} className="lumina-validation-item"><strong>{item.title}</strong><p>{item.evidence||item.meaning||'Informação a confirmar na validação técnica.'}</p><small>{item.action||'Confirmar condições de operação e evidências.'}</small></div>)}
      </article>}
    </div>
    <div className="lumina-text-strip"><strong>Interpretação</strong><span>Nas páginas seguintes: informação levantada, possíveis impactos condicionais e pontos a validar. O indicador não representa risco medido, auditoria ou conformidade legal.</span></div>
  </Page>
  {groupedRisks.map((pair,pageNo)=><Page key={'findings'+pageNo} kicker={`04 / análise dos controles · ${pageNo+1} de ${groupedRisks.length}`} title="O que pode acontecer na operação" sub="Cada ponto parte de uma resposta declarada. Possíveis impactos são cenários condicionais, não incidentes constatados." client={p.companyName||'Cliente'}>
   <div className="lumina-findings">{pair.map((item,i)=><FindingCard key={item.id} item={item} index={pageNo*2+i+1}/>)}</div>
  </Page>)}
  <Page kicker="05 / encaminhamento" title="Da leitura inicial à proposta" sub="Próximos passos para transformar o levantamento em uma recomendação técnica e comercial alinhada ao ambiente." client={p.companyName||'Cliente'}>
    <div className="lumina-roadmap"><article><div className="lumina-roadmap-num">01</div><div><h3>Validar o escopo</h3><p>Alinhar com a equipe de TI o ambiente, as necessidades, os serviços envolvidos, as quantidades e os requisitos de operação.</p><div className="lumina-roadmap-note">Saída esperada: escopo técnico consolidado e premissas confirmadas.</div></div></article><article><div className="lumina-roadmap-num">02</div><div><h3>Apresentar a proposta técnica e comercial</h3><p>Detalhar a arquitetura recomendada, os serviços e responsabilidades previstos, as condições comerciais e as etapas de implantação, conforme o escopo validado.</p><div className="lumina-roadmap-note">Saída esperada: proposta estruturada para avaliação da gestão.</div></div></article></div>
    <div className="lumina-final-quote">Toda proteção começa pela compreensão do que precisa ser protegido.</div>
    <div className="lumina-final-brands"><img src={conciergeLogo} alt="Concierge Segurança Digital"/><img src={qosLogo} alt="Grupo QOS Tecnologia"/></div>
  </Page>
  <Page kicker="06 / metodologia" title="Como interpretar esta devolutiva" sub="Transparência sobre o que este documento mostra e o que permanece fora do escopo da primeira conversa." client={p.companyName||'Cliente'}>
   <div className="lumina-method-grid"><article className="lumina-panel"><span className="lumina-label">ORIGEM DOS DADOS</span><h3>Informações declaradas</h3><p>O conteúdo foi organizado a partir das respostas e dos dados informados na Lúmina durante a reunião. Não representa inspeção do ambiente.</p></article><article className="lumina-panel"><span className="lumina-label">INDICADOR</span><h3>Leitura indicativa</h3><p>Os controles são classificados como atenção, informados ou a confirmar. Para controles respondidos, o índice considera a proporção de controles informados como presentes, sem comprovar sua efetividade.</p></article><article className="lumina-panel"><span className="lumina-label">LIMITES</span><h3>Validação necessária</h3><p>O material não substitui auditoria, teste de intrusão, avaliação técnica de vulnerabilidades, análise de logs ou validação de configuração.</p></article><article className="lumina-panel"><span className="lumina-label">PROTEÇÃO DE DADOS</span><h3>Contexto da LGPD</h3><p>O artigo 46 da LGPD orienta a adoção de medidas técnicas e administrativas de segurança. Esta leitura isolada não permite concluir conformidade ou descumprimento legal.</p></article></div>
   <div className="lumina-references"><strong>Referências de consulta</strong><a href="https://www2.camara.leg.br/legin/fed/lei/2018/lei-13709-14-agosto-2018-787077-normaatualizada-pl.html">LGPD · Art. 46</a><a href="https://www.gov.br/anpd/pt-br/assuntos/seguranca-e-sigilo-de-dados">ANPD · Segurança e sigilo de dados</a></div>
  </Page>
 </div>;
}
