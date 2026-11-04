import { Activity, ArrowUpRight, CheckCircle2, CircleHelp, Globe2, KeyRound, Network, Shield, Users, Wifi } from 'lucide-react';
import type {Profile} from '../context/ProfileContext';
import type {Facts} from './model';
import {recommendFirewall} from './firewallSizing';
import {assessFirewall} from './firewallAssessment';

type Props={profile:Profile;facts:Facts;findings:any[]};
const known=(v:unknown)=>v!==undefined&&v!==null&&String(v).trim()!=='';
const cell=(v:unknown,suffix='')=>known(v)?`${v}${suffix}`:'A confirmar';

export function FirewallExecutive({profile,facts,findings}:Props){
 const links=(profile.internetLinks||[]).filter(l=>l.speed||l.provider);
 const result=recommendFirewall({users:profile.userCount,links,usage:facts.networkUseProfile||profile.networkUsage,measuredPeakMbps:Number(facts.peakTrafficMbps)||0,sslVpnUsers:Number(facts.sslUsers)||0,ipsecTunnels:Number(facts.ipsecTunnels)||0,vlanCount:profile.vlanCount,apCount:profile.apQuantity,needsHA:facts.haNeed==='yes'});
 const a=assessFirewall(profile,facts);
 const issues=a.signals.filter(x=>x.state==='attention').slice(0,2);
 const pending=a.unknown;
 const service=facts.availability||facts.criticalServices||'Sistemas críticos a confirmar';
 const metrics=[{icon:<Users/>,label:'Usuários',value:profile.userCount?String(profile.userCount):'A confirmar'},
  {icon:<Globe2/>,label:'Conectividade',value:links.length?`${links.length} links`:'A confirmar'},
  {icon:<Network/>,label:'Redes internas',value:profile.vlanCount?`${profile.vlanCount} VLANs`:'A confirmar'},
  {icon:<KeyRound/>,label:'Acesso remoto',value:known(facts.sslUsers)?`${facts.sslUsers} usuários`:'A confirmar'}];
 const readableProfile=facts.networkUseProfile==='low'?'Baixo':facts.networkUseProfile==='high'?'Alto':facts.networkUseProfile==='medium'?'Médio':'A confirmar';
 return <section className="fw-executive" aria-label="Visão executiva do ambiente">
  <div className="fw-executive-lead">
   <div><span className="v3-kicker">AMBIENTE INFORMADO</span><h2>{profile.companyName||'Sua empresa'}<span>Rede, acessos e continuidade</span></h2><p>Uma visão do que sustenta a operação hoje e dos pontos que merecem atenção.</p></div>
   <aside className="fw-business-box"><span>O que precisa continuar funcionando</span><strong>{service}</strong><small>Informado durante o levantamento</small></aside>
  </div>
  <div className="fw-score-row"><div className="fw-score-main"><span>POSTURA INFORMADA</span><strong>{a.score===null?'A avaliar':`${a.score}/100`}</strong><p>{a.confidence}. {a.assessed} de {a.total} controles respondidos. Respostas ausentes não são tratadas como falhas.</p></div><div className="fw-score-micro"><div><strong>{a.attention}</strong><span>Pontos de atenção</span></div><div><strong>{a.positive}</strong><span>Controles informados</span></div><div><strong>{a.unknown}</strong><span>A confirmar</span></div></div></div>
  <div className="fw-metric-row">{metrics.map(item=><article key={item.label}><span className="fw-metric-icon">{item.icon}</span><div><small>{item.label}</small><strong>{item.value}</strong></div></article>)}</div>
  <div className="fw-story-main">
   <div className="fw-network-panel"><div className="fw-panel-heading"><div><span className="v3-kicker">PANORAMA DO AMBIENTE</span><h3>Como essa rede se conecta</h3></div><span className="fw-profile-chip">Uso {readableProfile.toLowerCase()}</span></div>
    <div className="fw-route-line"><div><Globe2/><b>Internet</b><small>{links.length?links.map(l=>l.speed).join(' + '):'Links a confirmar'}</small></div><i/><div><Shield/><b>Borda atual</b><small>{cell(profile.firewallModel)}</small></div><i/><div><Network/><b>Ambiente interno</b><small>{profile.vlanCount?`${profile.vlanCount} VLANs`:'Segmentação a confirmar'}</small></div></div>
    <div className="fw-network-summary"><span>Capacidade contratada <b>{result.contractedMbps?`${(result.contractedMbps/1000).toLocaleString('pt-BR',{maximumFractionDigits:2})} Gbps`:'A confirmar'}</b></span><span>{result.peakSource==='estimado'?'Pico estimado':'Tráfego de pico'} <b>{result.peakMbps!==null?`${Math.round(result.peakMbps)} Mbps`:'A confirmar'}</b></span></div>
   </div>
   <div className="fw-reading-panel"><div className="fw-panel-heading"><div><span className="v3-kicker">LEITURA INICIAL</span><h3>O que merece atenção</h3></div><Activity/></div>
     {issues.length?issues.map(x=><div className="fw-reading-item" key={x.id}><span className="fw-reading-dot"/><div><strong>{x.title}</strong><p>{x.effect}</p></div></div>):<div className="fw-reading-item"><CircleHelp/><div><strong>{pending?'Alguns controles ainda precisam ser confirmados':'Nenhum ponto crítico identificado nas respostas'}</strong><p>{pending?'Vamos validar os itens pendentes antes de concluir sobre a postura da rede.':'A avaliação depende do escopo informado e não substitui análise técnica.'}</p></div></div>}
     <div className="fw-reading-footer"><CheckCircle2/><span>{pending} {pending===1?'item':'itens'} a confirmar. Leitura baseada em dados declarados.</span></div>
   </div>
  </div>
  <div className="fw-executive-close"><span>Próxima leitura</span><strong>Ver a topologia e conectar os controles às consequências para a operação e a LGPD.</strong><ArrowUpRight/></div>
 </section>;
}
