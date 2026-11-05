import {useState} from 'react';
import {AlertTriangle,ArrowUpRight,CheckCircle2,ChevronDown,Clock3,ExternalLink,Focus,Scale,ShieldCheck} from 'lucide-react';
import type {Profile} from '../context/ProfileContext';
import type {Facts} from './model';
import {assessFirewall} from './firewallAssessment';
import './firewall-risk-v392.css';

const stateText={attention:'Ponto de atenção',unknown:'Precisa validar',confirmed:'Controle informado'} as const;

export default function FirewallRiskStory({profile,facts}:{profile:Profile;facts:Facts}){
  const evaluation=assessFirewall(profile,facts);
  const [active,setActive]=useState('');
  const [showMore,setShowMore]=useState(false);
  const signals=[...evaluation.signals.filter(item=>item.state==='attention'),...evaluation.signals.filter(item=>item.state==='unknown'),...evaluation.signals.filter(item=>item.state==='confirmed')];
  const highlighted=signals.slice(0,3);
  const additional=signals.slice(3);
  const chosen=signals.find(item=>item.id===active)||signals[0];
  const total=evaluation.total||1;
  const choose=(id:string)=>setActive(id);

  return <section className="fw-risks fw-risk-v392">
    <header className="fw-v392-heading">
      <div><span className="v3-kicker">LEITURA DE RISCOS</span><h2>Onde a operação pode ficar exposta?</h2><p>Comece pelos pontos em destaque. Cada um revela o possível impacto e o que vale confirmar.</p></div>
      <div className="fw-v392-count"><strong>{evaluation.attention}</strong><span>ponto{evaluation.attention===1?'':'s'} de atenção</span></div>
    </header>

    <div className="fw-v392-overview" aria-label="Resumo dos controles avaliados">
      <div className="fw-v392-status-track" role="img" aria-label={`${evaluation.attention} pontos de atenção, ${evaluation.unknown} a confirmar, ${evaluation.positive} controles informados`}>
        {evaluation.attention>0&&<i className="attention" style={{flex:evaluation.attention}}/>}
        {evaluation.unknown>0&&<i className="unknown" style={{flex:evaluation.unknown}}/>}
        {evaluation.positive>0&&<i className="confirmed" style={{flex:evaluation.positive}}/>}
      </div>
      <div className="fw-v392-status-legend"><span><i className="attention"/>{evaluation.attention} atenção</span><span><i className="unknown"/>{evaluation.unknown} a confirmar</span><span><i className="confirmed"/>{evaluation.positive} controles informados</span><small>{evaluation.assessed} de {total} controles respondidos</small></div>
    </div>

    {highlighted.length>0&&<div className="fw-v392-spotlight" aria-label="Pontos em destaque">
      {highlighted.map((item,index)=><button key={item.id} type="button" className={`fw-v392-tile ${item.state} ${chosen?.id===item.id?'selected':''}`} onClick={()=>choose(item.id)} aria-pressed={chosen?.id===item.id}>
        <div className="fw-v392-tile-top"><span>0{index+1}</span>{item.state==='attention'?<AlertTriangle size={17}/>:item.state==='unknown'?<Clock3 size={17}/>:<CheckCircle2 size={17}/>}</div>
        <strong>{item.title}</strong><p>{item.effect}</p>
        <span className="fw-v392-tile-bottom">{stateText[item.state]} <ArrowUpRight size={16}/></span>
      </button>)}
    </div>}

    {chosen&&<article className={`fw-v392-focus ${chosen.state}`}>
      <div className="fw-v392-focus-label"><Focus size={17}/><span>EM FOCO</span><span className={`fw-v392-state ${chosen.state}`}>{stateText[chosen.state]}</span></div>
      <div className="fw-v392-focus-main"><div className="fw-v392-focus-impact"><h3>{chosen.title}</h3><small>O que pode acontecer</small><p>{chosen.effect}</p></div><div className="fw-v392-focus-action"><ShieldCheck size={21}/><div><small>O que vale verificar</small><strong>{chosen.action}</strong></div></div></div>
      <details className="fw-v392-evidence"><summary>Ver resposta informada e referência legal <ChevronDown size={16}/></summary><div className="fw-v392-evidence-content"><div><small>Informação levantada</small><p>{chosen.evidence}</p></div>{chosen.law&&<div><small>Contexto regulatório</small><strong><Scale size={15}/>{chosen.law}</strong><p>{chosen.lawDetail}</p>{chosen.source&&<a href={chosen.source} rel="noreferrer" target="_blank">Consultar fonte oficial <ExternalLink size={13}/></a>}</div>}</div></details>
    </article>}

    {additional.length>0&&<div className="fw-v392-others">
      <div className="fw-v392-others-title"><div><span className="v3-kicker">OUTRAS VERIFICAÇÕES</span><p>{additional.length} outro{additional.length===1?' ponto':'s pontos'} do levantamento, disponíveis para aprofundar.</p></div><button type="button" onClick={()=>setShowMore(v=>!v)} aria-expanded={showMore}>{showMore?'Recolher':'Ver todos'} <ChevronDown className={showMore?'expanded':''} size={17}/></button></div>
      {showMore&&<div className="fw-v392-other-chips">{additional.map(item=><button type="button" key={item.id} aria-pressed={chosen?.id===item.id} onClick={()=>choose(item.id)} className={`${item.state} ${chosen?.id===item.id?'selected':''}`}>{item.state==='attention'?<AlertTriangle size={15}/>:item.state==='unknown'?<Clock3 size={15}/>:<CheckCircle2 size={15}/>} {item.title}</button>)}</div>}
      {chosen&&!highlighted.some(item=>item.id===chosen.id)&&<button type="button" className="fw-v392-return" onClick={()=>setActive(highlighted[0]?.id||'')}>Voltar aos pontos em destaque</button>}
    </div>}
    <p className="fw-v392-disclaimer">Leitura baseada nas respostas do cliente. As referências legais contextualizam cuidados de segurança e não constituem conclusão de conformidade.</p>
  </section>;
}
