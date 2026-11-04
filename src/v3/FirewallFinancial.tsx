import {Calculator,ExternalLink,Info,TrendingUp} from 'lucide-react';
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
 // Cenário inicial de discussão, não estatística de custo médio de PME.
 const unit=level==='critical'?95:level==='moderate'?45:65;
 const extra=level==='critical'?12000:level==='moderate'?2000:6000;
 return {affected,hours,unit,extra,level};
}
export default function FirewallFinancial({profile,facts,updateFact,money}:Props){
 const base=firewallCostDefaults(profile,facts);
 const input=(key:string,fallback:number)=>ready(facts[key])?num(facts[key]):fallback;
 const affected=input('financeAffectedUsers',base.affected),hours=input('financeHours',base.hours),hourly=input('financeCostPerUserHour',base.unit),extra=input('internalRecovery',base.extra);
 const monthly=ready(facts.internalMonthly)?num(facts.internalMonthly):0,setup=ready(facts.internalSetup)?num(facts.internalSetup):0;
 const impact=affected*hours*hourly+extra, investment=monthly*12+setup;
 const edit=(key:string,label:string,value:number)=> <label><span>{label}</span><input type="number" min="0" value={String(value)} onChange={e=>updateFact(key,e.target.value)} /></label>;
 return <section className="fw-financial upgraded"><header><span className="v3-kicker">IMPACTO FINANCEIRO</span><h2>Quanto uma parada relevante pode representar?</h2><p>A simulação parte do porte e da criticidade informados. Ajuste as premissas com o cliente para discutir um cenário plausível.</p></header>
 <div className="fw-finance-hero"><div><span>Cenário de interrupção</span><strong>{money(impact)}</strong><small>Impacto hipotético calculado a partir dos campos abaixo</small></div><div><span>Investimento no primeiro ano</span><strong>{ready(facts.internalMonthly)&&ready(facts.internalSetup)?money(investment):'A informar'}</strong><small>Implantação + 12 mensalidades, sujeitas à proposta formal</small></div></div>
 <div className="fw-finance-editors"><div className="fw-finance-editor"><div className="fw-finance-heading"><Calculator size={22}/><div><h3>Premissas da interrupção</h3><p>Valores iniciais de simulação, não médias de mercado.</p></div></div><div className="fw-finance-inputs">{edit('financeAffectedUsers','Pessoas afetadas',affected)}{edit('financeHours','Horas de interrupção',hours)}{edit('financeCostPerUserHour','Custo da hora afetada por pessoa (R$)',hourly)}{edit('internalRecovery','Recuperação e despesas adicionais (R$)',extra)}</div><p className="fw-finance-formula">{affected} pessoas × {hours} horas × {money(hourly)} + {money(extra)} em recuperação</p></div>
 <div className="fw-finance-editor"><div className="fw-finance-heading"><TrendingUp size={22}/><div><h3>Investimento previsto</h3><p>Preencha conforme o cenário comercial em discussão.</p></div></div><div className="fw-finance-inputs">{edit('internalMonthly','Mensalidade Concierge (R$)',monthly)}{edit('internalSetup','Implantação (R$)',setup)}</div><div className="fw-finance-basis"><strong>Comparação responsável</strong><p>Uma mensalidade previsível pode tornar a gestão de segurança mais organizada. O investimento não garante que uma parada ou incidente deixará de acontecer, e os valores não representam economia assegurada.</p></div></div></div>
 <details className="fw-finance-research"><summary><Info size={17}/> Pesquisa brasileira e limites da estimativa</summary><p>A IBM divulgou em outubro de 2026 custo médio de R$ 7,44 milhões por violação de dados no Brasil. A amostra não representa exclusivamente pequenas e médias empresas, portanto esse número não é usado para calcular o cenário acima. A simulação usa apenas as informações do cliente e hipóteses editáveis para pessoas, duração, custo horário e recuperação.</p><a href="https://brasil.newsroom.ibm.com/cost-of-a-data-breach-brasil-2026" target="_blank" rel="noreferrer">Ver estudo IBM 2026 <ExternalLink size={14}/></a><p>Outras referências, como Sophos State of Ransomware 2025, apresentam recortes globais por número de funcionários, mas não definem uma média brasileira confiável para este cliente.</p></details>
 </section>;
}
