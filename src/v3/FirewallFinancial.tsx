import {Calculator,ExternalLink,Info,SlidersHorizontal,TrendingUp} from 'lucide-react';
import type {Profile} from '../context/ProfileContext';
import type {Facts} from './model';
type Props={profile:Profile;facts:Facts;updateFact:(k:string,v:string)=>void;money:(n:number)=>string};
const num=(x:unknown)=>Math.max(0,Number(x)||0);
const ready=(v:unknown)=>v!==undefined&&v!=='';
export function firewallCostDefaults(profile:Profile,facts:Facts){
 const level=facts.criticalityLevel||'high';
 const ratio=level==='critical'?.85:level==='moderate'?.40:.65;
 const users=num(profile.userCount);
 const affected=Math.max(0,Math.round(users*ratio));
 const hours=facts.downtimeProfile==='lt1'?1:facts.downtimeProfile==='1to4'?3:facts.downtimeProfile==='4to8'?6:facts.downtimeProfile==='gt8'?10:4;
 const unit=level==='critical'?95:level==='moderate'?45:65;
 const extra=level==='critical'?12000:level==='moderate'?2000:6000;
 return {affected,hours,unit,extra,level};
}
export default function FirewallFinancial({profile,facts,updateFact,money}:Props){
 const base=firewallCostDefaults(profile,facts);
 const input=(key:string,fallback:number)=>ready(facts[key])?num(facts[key]):fallback;
 const affected=input('financeAffectedUsers',base.affected),hours=input('financeHours',base.hours),hourly=input('financeCostPerUserHour',base.unit),extra=input('internalRecovery',base.extra);
 const monthly=ready(facts.internalMonthly)?num(facts.internalMonthly):0,setup=ready(facts.internalSetup)?num(facts.internalSetup):0;
 const downtime=affected*hours*hourly,impact=downtime+extra,investment=monthly*12+setup;
 const hasInvestment=ready(facts.internalMonthly)&&ready(facts.internalSetup);
 const edit=(key:string,label:string,value:number)=> <label><span>{label}</span><input type="number" min="0" value={String(value)} onChange={e=>updateFact(key,e.target.value)}/></label>;
 const fraction=impact>0?Math.round(downtime/impact*100):0;
 return <section className="fw-financial fw-finance-clean"><header className="fw-clean-heading"><span className="v3-kicker">CENÁRIO FINANCEIRO</span><h2>Quanto custaria uma interrupção?</h2><p>Simulação ajustável com o cliente. Os valores representam uma hipótese de discussão, não uma previsão de perda.</p></header>
  <div className="fw-finance-clean-hero"><article className="fw-finance-clean-impact"><span>IMPACTO HIPOTÉTICO</span><strong>{money(impact)}</strong><p>Cenário de {hours} {hours===1?'hora':'horas'} com {affected} {affected===1?'pessoa afetada':'pessoas afetadas'}.</p><div className="fw-finance-clean-bar" role="img" aria-label={`Horas improdutivas ${money(downtime)}, recuperação adicional ${money(extra)}`}><i style={{width:`${fraction}%`}}/><i style={{width:`${100-fraction}%`}}/></div><div className="fw-finance-clean-legend"><span><b/>{money(downtime)} · Interrupção</span><span><b/>{money(extra)} · Recuperação</span></div></article><article className="fw-finance-clean-investment"><span>INVESTIMENTO NO PRIMEIRO ANO</span><strong>{hasInvestment?money(investment):'A informar'}</strong><p>Implantação + 12 mensalidades, quando os valores forem preenchidos.</p><small>A contratação não garante prevenção ou economia equivalente ao cenário simulado.</small></article></div>
  <details className="fw-finance-clean-inputs" open><summary><SlidersHorizontal size={19}/> Ajustar premissas da simulação <span>Valores editáveis</span></summary><div className="fw-finance-clean-groups"><div><div className="fw-finance-clean-group-title"><Calculator size={18}/><b>Impacto de uma parada</b></div><div className="fw-finance-inputs">{edit('financeAffectedUsers','Pessoas afetadas',affected)}{edit('financeHours','Horas de interrupção',hours)}{edit('financeCostPerUserHour','Custo/hora por pessoa (R$)',hourly)}{edit('internalRecovery','Recuperação adicional (R$)',extra)}</div></div><div><div className="fw-finance-clean-group-title"><TrendingUp size={18}/><b>Investimento previsto</b></div><div className="fw-finance-inputs">{edit('internalMonthly','Mensalidade Concierge (R$)',monthly)}{edit('internalSetup','Implantação (R$)',setup)}</div><p className="fw-finance-clean-disclaimer">Premissas iniciais ajustáveis. A proposta comercial final define o investimento.</p></div></div><p className="fw-finance-clean-equation">Cálculo: {affected} pessoas × {hours} horas × {money(hourly)} + {money(extra)} de recuperação</p></details>
  <details className="fw-finance-research"><summary><Info size={17}/> Origem e limites da estimativa</summary><p>O estudo IBM Brasil 2026 apresentou custo médio de R$ 7,44 milhões por violação de dados na amostra pesquisada. Esse valor não é usado no cálculo, pois não representa uma média específica para empresas do porte do cliente. As premissas acima são cenários editáveis de discussão.</p><a href="https://brasil.newsroom.ibm.com/cost-of-a-data-breach-brasil-2026" target="_blank" rel="noreferrer">Estudo IBM 2026 <ExternalLink size={14}/></a></details>
 </section>;
}
