import { useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, ArrowRight, Check, CheckCircle2, ChevronRight,
  Clock3, Download, FileArchive, Globe2, Laptop, LockKeyhole,
  MousePointer2, Play, RotateCcw, Router, ShieldCheck, ShieldX, Wifi,
} from 'lucide-react';
import type { Facts } from './model';
import type { Profile } from '../context/ProfileContext';
import { demoOutcome, nextDemoStage } from './firewallDemoModel';
import type { DemoMode, DemoScenario, DemoStage } from './firewallDemoModel';

const PAGES = {
  phishing: {
    domain:'conta-exemplo.invalid', brand:'Central de acesso', eyebrow:'VERIFICAÇÃO DE CONTA',
    title:'Sua sessão precisa ser confirmada',
    desc:'O colaborador recebeu uma mensagem solicitando a atualização do acesso ao e-mail corporativo.',
    action:'Abrir página de verificação', filename:'Página de login simulada',
  },
  download: {
    domain:'atualizacao-exemplo.invalid', brand:'Central de arquivos', eyebrow:'ATUALIZAÇÃO DE SOFTWARE',
    title:'Uma atualização está disponível',
    desc:'Um link recebido por e-mail oferece um instalador que parece legítimo.',
    action:'Baixar atualização', filename:'atualizacao_exemplo.zip',
  },
  c2: {
    domain:'destino-reputacao.exemplo.invalid', brand:'Atividade de rede', eyebrow:'COMUNICAÇÃO EM SEGUNDO PLANO',
    title:'Um dispositivo inicia uma conexão externa',
    desc:'Um processo desconhecido tenta falar com um destino classificado como malicioso. O usuário não percebe a tentativa.',
    action:'Simular conexão de saída', filename:'Conexão de saída fictícia',
  },
};

export default function FirewallAttackLab({ profile, facts }: { profile: Profile; facts: Facts }) {
  const [scenario,setScenario] = useState<DemoScenario>('phishing');
  const [mode,setMode] = useState<DemoMode>('concierge');
  const [stage,setStage] = useState<DemoStage>(0);
  const [run,setRun] = useState(0);
  const page = PAGES[scenario];
  const outcome = useMemo(()=>demoOutcome(scenario,mode),[scenario,mode]);
  const playing = stage>0 && stage<4;
  const clientOps = facts.networkOps==='managed'||facts.networkOps==='monitored';


  const reset=(nextScenario:DemoScenario=scenario,nextMode:DemoMode=mode)=>{
    setScenario(nextScenario);setMode(nextMode);setStage(0);setRun(n=>n+1);
  };
  const start=()=>{setRun(n=>n+1);setStage(stage>=4?1:nextDemoStage(stage));};
  const status=stage===0?'Pronto para demonstrar':stage===1?'Ação iniciada no notebook':stage===2?'Fluxo chegando à borda':stage===3?'Política em avaliação':outcome.headline;

  const scenarioButtons:[DemoScenario,string,typeof Globe2][]=[
    ['phishing','Site falso de login',Globe2],
    ['download','Download suspeito',Download],
    ['c2','Comunicação maliciosa',Activity],
  ];

  return <section className="fw-demo-v4" aria-label="Simulação ilustrativa de firewall">
    <div className="fw-demo-v4-header"><div><span className="v3-kicker">SIMULAÇÃO INTERATIVA</span><h2>Uma situação cotidiana. Dois resultados possíveis.</h2><p>Escolha a tentativa, veja a decisão na borda e compare a resposta operacional.</p></div><span className="fw-demo-v4-illustrative">Demonstração fictícia</span></div>
    <div className="fw-demo-v4-toolbar">
      <div className="fw-demo-v4-switch scenarios" aria-label="Escolher tentativa">
        {scenarioButtons.map(([value,title,Icon])=><button key={value} type="button" className={scenario===value?'selected':''} aria-pressed={scenario===value} onClick={()=>reset(value,mode)}><Icon size={16}/>{title}</button>)}
      </div>
      <div className="fw-demo-v4-switch mode" aria-label="Camada de proteção simulada">
        <button type="button" className={mode==='concierge'?'selected':''} aria-pressed={mode==='concierge'} onClick={()=>reset(scenario,'concierge')}><ShieldCheck size={16}/> Com Concierge + SOC</button>
        <button type="button" className={mode==='baseline'?'selected alternate':''} aria-pressed={mode==='baseline'} onClick={()=>reset(scenario,'baseline')}><Router size={16}/> Sem essa regra</button>
      </div>
    </div>
    <div className={`fw-demo-v4-theater mode-${mode} stage-${stage}`}>
      <div className="fw-demo-v4-laptop">
        <div className="fw-demo-v4-windowbar"><span className="fw-demo-v4-dots"><i/><i/><i/></span><span>Notebook do colaborador</span><span className="fw-demo-v4-window-type">SIMULAÇÃO</span></div>
        <div className="fw-demo-v4-browser">
          <div className="fw-demo-v4-url"><LockKeyhole size={15}/><span>{page.domain}</span><span className="fw-demo-v4-url-menu">•••</span></div>
          <div className="fw-demo-v4-site" aria-live="polite" aria-atomic="true">
            {stage===4 && mode==='concierge' ?
              <div className="fw-demo-v4-page-blocked">
                <div className="fw-demo-v4-block-icon"><ShieldX size={37}/></div><span>POLÍTICA DE DEMONSTRAÇÃO</span>
                <h3>{scenario==='phishing'?'Site suspeito bloqueado':scenario==='download'?'Download bloqueado':'Comunicação externa bloqueada'}</h3>
                <p>{outcome.reason}</p><div className="fw-demo-v4-page-event"><CheckCircle2 size={18}/> Evento ilustrativo disponível para triagem do SOC</div>
                <button type="button" className="fw-demo-v4-retry" onClick={start}><RotateCcw size={16}/> Repetir tentativa</button>
              </div>
            : stage===4 && mode==='baseline' ?
              <div className="fw-demo-v4-page-allowed">
                <div className="fw-demo-v4-allow-icon">{scenario==='phishing'?<Globe2 size={36}/>:scenario==='download'?<FileArchive size={36}/>:<Wifi size={36}/>}</div>
                <span>FLUXO PERMITIDO NESTA SIMULAÇÃO</span><h3>{scenario==='phishing'?'Página falsa carregada':scenario==='download'?'Transferência fictícia concluída':'Conexão de saída realizada'}</h3>
                <p>{outcome.reason}</p>
                {scenario==='phishing'?<div className="fw-demo-v4-fake-form"><label>Conta corporativa<input readOnly value="colaborador@empresa.exemplo" aria-label="Conta fictícia"/></label><label>Senha<input readOnly value="••••••••" aria-label="Senha fictícia"/></label><span>Formulário ilustrativo. Nenhum dado será enviado.</span></div>
                :<div className="fw-demo-v4-file-row">{scenario==='download'?<FileArchive size={20}/>:<Activity size={20}/>}<b>{page.filename}</b><Check size={18}/></div>}
                <div className="fw-demo-v4-allow-warning"><AlertTriangle size={17}/> A demonstração não abre sites, não baixa arquivos nem se conecta à internet.</div>
                <button type="button" className="fw-demo-v4-retry" onClick={start}><RotateCcw size={16}/> Repetir tentativa</button>
              </div>
            :<div className="fw-demo-v4-page-landing">
              <div className="fw-demo-v4-landing-brand">{scenario==='c2'?<Laptop size={21}/>:<Globe2 size={21}/>} {page.brand}</div>
              <span className="fw-demo-v4-page-eyebrow">{page.eyebrow}</span><h3>{page.title}</h3><p>{page.desc}</p>
              {scenario==='phishing'?<div className="fw-demo-v4-inbox-sample"><span>Nova mensagem</span><b>Confirme seu acesso corporativo</b><small>O e-mail contém um link para uma página desconhecida</small></div>
              :scenario==='download'?<div className="fw-demo-v4-file-row"><FileArchive size={22}/><div><b>{page.filename}</b><small>Arquivo externo de origem desconhecida</small></div><Download size={19}/></div>
              :<div className="fw-demo-v4-process-sample"><Activity size={21}/><div><strong>Processo desconhecido</strong><small>Tentativa de comunicação em segundo plano</small></div><span>SAÍDA</span></div>}
              <button className="fw-demo-v4-site-action" type="button" onClick={start}>{stage===0?page.action:stage===4?'Repetir demonstração':'Próxima etapa'}<ChevronRight size={20}/>{stage===1&&<span className="fw-demo-v4-click-cursor" aria-hidden="true"><MousePointer2 size={28}/></span>}</button>
              <div className="fw-demo-v4-site-feedback">{stage===0?'Clique para iniciar a demonstração':stage===1?'Clique recebido...':stage===2?'Conectando...':'Aguardando resposta da borda...'}</div>
            </div>}
          </div>
        </div>
      </div>
      <div className={`fw-demo-v4-path ${playing?'active':''} ${stage===4?(outcome.blocked?'blocked':'allowed'):''}`}><span className="fw-demo-v4-path-label">Tráfego</span><div className="fw-demo-v4-path-line"><i/></div><span className="fw-demo-v4-path-status">{stage<2?'Aguardando':stage<4?'Em análise':outcome.blocked?'Interrompido':'Permitido'}</span></div>
      <div className={`fw-demo-v4-edge ${stage===4?(outcome.blocked?'blocked':'allowed'):''}`}>
        <div className="fw-demo-v4-edge-heading">{mode==='concierge'?<ShieldCheck size={29}/>:<Router size={29}/>}<div><span>{mode==='concierge'?'BORDA GERENCIADA':'BORDA DE EXEMPLO'}</span><h3>{mode==='concierge'?'Concierge Firewall':'Sem regra de bloqueio'}</h3></div></div>
        <p>{mode==='concierge'?scenario==='phishing'?'Política web para bloquear domínio malicioso conhecido.':scenario==='download'?'Política para impedir a transferência simulada.':'Política de reputação para impedir conexão a destino malicioso conhecido.':'A regra da demonstração não foi aplicada. Outros controles reais podem existir.'}</p>
        <div className="fw-demo-v4-edge-state">{stage===4?(outcome.blocked?<ShieldX size={19}/>:<CheckCircle2 size={19}/>):<Activity size={19}/>}<b>{stage===4?(outcome.blocked?'BLOQUEADO':'PERMITIDO'):stage===0?'AGUARDANDO':'PROCESSANDO'}</b></div>
        <div className="fw-demo-v4-edge-list"><span><Check size={15}/>{mode==='concierge'?'Política de demonstração ativa':'Sem regra de bloqueio neste teste'}</span><span><Check size={15}/>{mode==='concierge'?'Registro disponível para o SOC':'Nenhum alerta de bloqueio gerado'}</span></div>
        {profile.firewallModel&&<small>Equipamento atual informado: {profile.firewallModel}</small>}
      </div>
    </div>
    <div className="fw-demo-v4-transport"><div className="fw-demo-v4-transport-status"><span className={`fw-demo-v4-light ${stage===4?(outcome.blocked?'blocked':'allowed'):''}`}/><div><strong>{status}</strong><small>{stage===4?outcome.log:'Clique para avançar. Você controla o ritmo da demonstração.'}</small></div></div><div className="fw-demo-v4-transport-actions">{playing&&<button type="button" onClick={()=>reset()}><RotateCcw size={16}/> Reiniciar</button>}{stage===4&&<button type="button" onClick={()=>reset()}><RotateCcw size={16}/> Reiniciar</button>}<button type="button" className="primary" onClick={start}><Play size={16}/>{stage===4?'Repetir cena':stage===0?'Iniciar simulação':'Próxima etapa'}</button></div></div>
    <div className="fw-demo-v4-timeline" aria-label="Etapas da simulação">{['Ação no dispositivo','Conexão solicitada','Decisão na borda','Resultado e resposta'].map((item,index)=><div key={item} className={stage===index+1?'active':stage>index+1?'complete':''}><span>{String(index+1).padStart(2,'0')}</span><b>{item}</b></div>)}</div>
    <div className={`fw-demo-v4-response ${mode==='concierge'?'managed':'manual'}`}><div className="fw-demo-v4-response-icon">{mode==='concierge'?<ShieldCheck size={27}/>:<Clock3 size={27}/>}</div><div><span>{mode==='concierge'?'APÓS O EVENTO':'DEPOIS DA CONEXÃO PERMITIDA'}</span><h3>{mode==='concierge'?'O SOC recebe contexto para analisar o evento.':'A identificação dependerá de outros controles e da rotina da equipe.'}</h3><p>{mode==='concierge'?'Registro, triagem e escalonamento seguem processos, políticas e escopo contratado. A conexão bloqueada não significa eliminação de todo o risco.':'Sem esta regra, o fluxo foi permitido na simulação. A detecção e a resposta dependem dos demais controles existentes e da disponibilidade da equipe.'}</p></div><span className="fw-demo-v4-response-tag">{mode==='concierge'?'Monitoramento e triagem':clientOps?'Verificar operação atual':'Resposta a validar'}</span></div>
    {stage===4&&<div className="fw-demo-v4-compare-cta"><span>{mode==='concierge'?'Como seria sem essa regra?':'Como seria com a política e o SOC?'}</span><button type="button" onClick={()=>{reset(scenario,mode==='concierge'?'baseline':'concierge');setStage(0);}}>Comparar outro cenário <ArrowRight size={17}/></button></div>}
    <p className="fw-demo-v4-disclaimer">Todas as páginas, credenciais, arquivos e comunicações exibidos são fictícios. O resultado de bloqueio pressupõe a regra demonstrativa configurada. Não há inspeção SSL DPI nem promessa de bloqueio universal.</p>
  </section>;
}
