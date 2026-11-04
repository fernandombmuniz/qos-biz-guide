import {useState} from 'react';
import {AlertTriangle,CheckCircle2,ChevronDown,ExternalLink,ShieldCheck,Scale,Clock3} from 'lucide-react';
import type {Profile} from '../context/ProfileContext';
import type {Facts} from './model';
import {assessFirewall} from './firewallAssessment';
export default function FirewallRiskStory({profile,facts}:{profile:Profile;facts:Facts}){
 const a=assessFirewall(profile,facts);const [active,setActive]=useState<string>('');
 const items=[...a.signals.filter(s=>s.state==='attention'),...a.signals.filter(s=>s.state==='unknown'),...a.signals.filter(s=>s.state==='confirmed')].slice(0,6);
 const chosen=items.find(i=>i.id===active)||items[0];
 return <section className="fw-risks"><header className="fw-risks-header"><span className="v3-kicker">LEITURA DO AMBIENTE</span><h2>O que pode acontecer se um controle falhar?</h2><p>Os pontos abaixo usam as respostas da empresa. Se alguma informação não foi confirmada, mostramos como hipótese de validação.</p></header>
 <div className="fw-risk-meta"><div><strong>{a.attention}</strong><span>Pontos de atenção</span></div><div><strong>{a.unknown}</strong><span>A verificar</span></div><div><strong>{a.score===null?'A confirmar':`${a.score}/100`}</strong><span>Postura declarada</span></div></div>
 <div className="fw-risk-layout"><div className="fw-risk-options">{items.map(item=><button type="button" key={item.id} onClick={()=>setActive(item.id)} aria-pressed={chosen?.id===item.id} className={`${chosen?.id===item.id?'selected':''} ${item.state}`}><span>{item.state==='attention'?<AlertTriangle size={20}/>:item.state==='confirmed'?<CheckCircle2 size={20}/>:<Clock3 size={20}/>}</span><div><strong>{item.title}</strong><small>{item.state==='attention'?'Atenção informada':item.state==='confirmed'?'Controle informado':'A validar'}</small></div><ChevronDown size={17}/></button>)}</div>
 {chosen&&<article className="fw-risk-detail"><span className="v3-kicker">LEITURA CONSULTIVA</span><h3>{chosen.title}</h3><div className="fw-risk-evidence"><small>O que foi informado</small><strong>{chosen.evidence}</strong></div><div><small>Possível consequência</small><p>{chosen.effect}</p></div><div><small>O que vale verificar</small><p>{chosen.action}</p></div>{chosen.law&&<aside className="fw-legal-connection"><div><Scale size={19}/><b>{chosen.law}</b></div><p>{chosen.lawDetail}</p>{chosen.source&&<a href={chosen.source} target="_blank" rel="noreferrer">Consultar fonte oficial <ExternalLink size={14}/></a>}</aside>}</article>}
 </div><div className="fw-risk-guard"><ShieldCheck size={20}/><p>LGPD não exige a contratação de um firewall específico. Os artigos e controles apresentados ajudam a discutir medidas de segurança, evidências e resposta. Sanções dependem da infração e de processo próprio.</p></div></section>;
}
