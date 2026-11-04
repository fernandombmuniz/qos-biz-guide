import { Finding } from './model';
import { grade, privacyMeaning, sources } from './experience';

export function References({technical=false}:{technical?:boolean}){
 return <details className="v3-references"><summary>Referências e limites desta leitura</summary><p>Consulta às fontes: 29/10/2026. A leitura aplicada ao cliente é uma interpretação consultiva das respostas, não uma avaliação realizada pelos autores destas fontes.</p>{Object.entries(sources).filter(([key])=>technical||['lgpd','anpd'].includes(key)).map(([key,s])=><a key={key} href={s.url} target="_blank" rel="noreferrer">{s.title} ↗</a>)}</details>;
}
export function EnvironmentGrade({findings}:{findings:Finding[]}){
 const g=grade(findings);
 return <div className="v3-grade"><div><span className="v3-kicker">INDICADOR CONCIERGE · CONTROLES INFORMADOS</span><strong>{g.score===null?'Em levantamento':g.score}<small>{g.score!==null?' / 100':''}</small></strong><p>{g.answered} de {g.total} critérios com resposta conclusiva · cobertura {g.coverage}%</p></div><details><summary>Como a nota é calculada</summary><p>Critérios com o mesmo peso. Nota = controles informados como existentes ÷ critérios com resposta conclusiva × 100. Respostas ausentes e “A confirmar” reduzem a cobertura, sem valer zero. “Não se aplica” é excluído.</p><p>Exibimos nota somente com pelo menos 60% de cobertura. É um limite editorial desta metodologia, versão 1.0. Mesmo 100/100 não comprova eficácia: faltam evidências técnicas. O indicador não representa chance de ataque, certificação NIST ou conformidade LGPD.</p><p>Proteção instalada é apenas um critério; investigação e resposta são avaliadas separadamente. O indicador não compara fabricantes.</p></details></div>;
}
export function PrivacyContext({finding}:{finding:Finding}){
 return <details className="v3-privacy"><summary>Relação com proteção de dados e LGPD</summary><p>{privacyMeaning(finding)}</p><p>{finding.state==='unknown'?'Primeiro confirme o controle e quais dados estão envolvidos.':finding.state==='confirmed'?'O controle foi informado como existente; confirme sua cobertura e as evidências.':'O ponto informado merece avaliação no contexto dos dados e dos processos afetados.'}</p><p>Quando há tratamento de dados pessoais, o art. 46 orienta a adoção de medidas técnicas e administrativas de segurança. Este achado isolado não permite concluir descumprimento da LGPD.</p><References/></details>;
}
