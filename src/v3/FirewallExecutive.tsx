import type {CSSProperties} from 'react';
import {ArrowUpRight, CheckCircle2, CircleHelp, Globe2, KeyRound, Network, ShieldCheck, Users, Activity, ArrowRight, AlertTriangle} from 'lucide-react';
import type {Profile} from '../context/ProfileContext';
import type {Facts} from './model';
import {recommendFirewall} from './firewallSizing';
import {assessFirewall} from './firewallAssessment';
import './firewall-executive-v393.css';

type Props={profile:Profile;facts:Facts;findings:any[]};
const has=(value:unknown)=>value!==null&&value!==undefined&&String(value).trim()!=='';

export function FirewallExecutive({profile,facts}:Props){
 const links=(profile.internetLinks||[]).filter(link=>link.provider||link.speed);
 const sizing=recommendFirewall({users:profile.userCount,links,usage:facts.networkUseProfile||profile.networkUsage,measuredPeakMbps:Number(facts.peakTrafficMbps)||0,sslVpnUsers:Number(facts.sslUsers)||0,ipsecTunnels:Number(facts.ipsecTunnels)||0,vlanCount:profile.vlanCount,apCount:profile.apQuantity,needsHA:facts.haNeed==='yes'});
 const assessment=assessFirewall(profile,facts);
 const score=assessment.score;
 const total=Math.max(1,assessment.total);
 const controls=[
  {label:'Atenção',value:assessment.attention,klass:'attention'},
  {label:'Informados',value:assessment.positive,klass:'confirmed'},
  {label:'A confirmar',value:assessment.unknown,klass:'unknown'},
 ];
 const top=assessment.signals.find(item=>item.state==='attention');
 const priority=top?.title|| (assessment.unknown ? 'Confirmar controles pendentes' : 'Manter acompanhamento dos controles');
 const priorityBody=top?.effect|| (assessment.unknown ? 'Há dados que precisam ser validados antes de uma recomendação técnica.' : 'Não foram informados pontos de atenção nesta etapa. A avaliação técnica pode aprofundar a leitura.');
 const service=String(facts.availability||facts.criticalServices||'').trim();
 const metrics=[
  {icon:<Users size={18}/>,label:'Usuários',value:profile.userCount?String(profile.userCount):'Pendente'},
  {icon:<Globe2 size={18}/>,label:'Internet',value:links.length?`${links.length} ${links.length===1?'link':'links'}`:'Pendente'},
  {icon:<Network size={18}/>,label:'Redes internas',value:profile.vlanCount?`${profile.vlanCount} VLANs`:'Pendente'},
  {icon:<KeyRound size={18}/>,label:'VPN SSL',value:has(facts.sslUsers)?String(facts.sslUsers):'Pendente'},
 ];
 const speeds=sizing.contractedMbps?`${(sizing.contractedMbps/1000).toLocaleString('pt-BR',{maximumFractionDigits:2})} Gbps contratados`:'Capacidade a confirmar';

 return <section className="fw-executive fw-executive-clean fw-exec-v393" aria-label="Resumo executivo da rede">
  <header className="fw-exec-v393-header">
   <div><span className="v3-kicker">RESUMO EXECUTIVO</span><h2>{profile.companyName||'Sua empresa'}</h2><p>Uma primeira leitura da rede, dos acessos e do que vale aprofundar.</p></div>
   {service&&<div className="fw-exec-v393-operation"><span><Activity size={15}/> O que sustenta a operação</span><strong>{service}</strong></div>}
  </header>
  <div className="fw-exec-v393-metrics">{metrics.map(metric=><article key={metric.label}><span className="fw-exec-v393-metric-icon">{metric.icon}</span><div><small>{metric.label}</small><strong>{metric.value}</strong></div></article>)}</div>
  <div className="fw-exec-v393-main">
   <article className="fw-exec-v393-posture">
    <div className="fw-exec-v393-ring" style={{'--fw-ring-value':`${score??0}%`} as CSSProperties} role="img" aria-label={score===null?'Pontuação ainda não disponível':`Postura declarada: ${score} de 100`}><div><strong>{score===null?'?':score}</strong><small>{score===null?'Pendente':'/100'}</small></div></div>
    <div className="fw-exec-v393-posture-content">
     <span className="v3-kicker">POSTURA DECLARADA</span>
     <h3>{score===null?'Dados insuficientes para pontuar':`${assessment.assessed} de ${assessment.total} controles respondidos`}</h3>
     <p>{assessment.confidence}. Índice indicativo, baseado nas respostas e sem verificação técnica.</p>
     <div className="fw-exec-v393-track" role="img" aria-label={controls.map(x=>`${x.label}: ${x.value}`).join(', ')}>{controls.map(item=>item.value>0&&<span key={item.klass} className={item.klass} style={{flex:item.value}}/>)}</div>
     <div className="fw-exec-v393-legend">{controls.map(item=><span key={item.klass}><i className={item.klass}/><strong>{item.value}</strong> {item.label}</span>)}</div>
    </div>
   </article>
   <article className="fw-exec-v393-focus">
    <div className="fw-exec-v393-focus-label"><AlertTriangle size={16}/><span>PRIMEIRO PONTO PARA CONVERSAR</span></div>
    <h3>{priority}</h3>
    <p>{priorityBody}</p>
    <div className="fw-exec-v393-focus-bottom"><span><CircleHelp size={15}/>{assessment.unknown} {assessment.unknown===1?'informação pendente':'informações pendentes'}</span><span>Detalhes na etapa de riscos <ArrowRight size={16}/></span></div>
   </article>
  </div>
  <footer className="fw-exec-v393-footer"><div><ShieldCheck size={17}/><span><b>Próxima leitura:</b> visualizar o ambiente e conectar as respostas ao desenho da rede.</span></div><small>{speeds}</small><ArrowUpRight size={17}/></footer>
 </section>;
}
