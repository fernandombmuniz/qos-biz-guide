import {useEffect,useRef,useState} from 'react';
import {Activity,AlertTriangle,ArrowRight,CheckCircle2,ChevronRight,Clock3,Database,Download,ExternalLink,FileWarning,HardDrive,Info,Laptop,LockKeyhole,Mail,Monitor,MousePointer2,Play,RotateCcw,ShieldCheck,Server,Users,Wifi,XCircle} from 'lucide-react';
import type {Profile} from '../context/ProfileContext';
import type {Facts} from './model';
import {serviceAssessment,serviceCostDefaults} from './ServiceIntelligence';
import type {Service,Signal} from './ServiceIntelligence';

type Props={service:Service;chapter:number;profile:Profile;facts:Facts;updateFact:(key:string,value:string)=>void;money:(amount:number)=>string};
const val=(x:unknown,empty='A confirmar')=>x===undefined||x===null||String(x).trim()===''?empty:String(x);
const count=(x:unknown)=>Math.max(0,Number(x)||0);
const statusText=(s:Signal['state'])=>s==='attention'?'Ponto de atenção':s==='confirmed'?'Controle informado':'A confirmar';
const lgpdUrl='https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm';

function ServiceExecutive({service,profile:p,facts:f}:Omit<Props,'chapter'|'updateFact'|'money'>){
 const a=serviceAssessment(service,p,f);const endpoint=service==='endpoint';const total=count(p.deviceCount);
 const main=endpoint?val(p.deviceCount?`${p.deviceCount} dispositivos`:'') : val(p.backupTotalVolumeToProtect);
 const metrics=endpoint?[
  ['Parque informado',main],['Windows',p.endpointsWindows?String(p.endpointsWindows):'A confirmar'],['Servidores',String(count(p.windowsServerCount)+count(p.linuxServerCount))],['Agentes ativos',val(f.endpointCoveredCount)],
 ]:[['Dados a proteger',main],['Máquinas virtuais',val(p.backupVirtualServers)],['Retenção',val(p.backupDesiredRetention)],['Serviço prioritário',val(p.backupMostCriticalSystem)]];
 const problems=a.signals.filter(s=>s.state==='attention').slice(0,2);
 return <section className="svc-screen svc-exec"><div className="svc-hero"><div><span className="v3-kicker">VISÃO EXECUTIVA DO AMBIENTE</span><h2>{p.companyName||'Sua empresa'}</h2><p>{endpoint?'Dispositivos, proteção e capacidade de resposta.':'Dados, disponibilidade e capacidade de recuperação.'} Uma visão formada somente com informações fornecidas na conversa.</p></div><aside className="svc-hero-aside"><small>{endpoint?'PESSOAS E EQUIPAMENTOS':'SERVIÇO ESSENCIAL'}</small><strong>{endpoint?val(p.deviceCount?`${p.deviceCount} dispositivos`:''):val(p.backupMostCriticalSystem)}</strong><span>{endpoint?'Parque declarado pelo cliente':'Sistema a priorizar na recuperação'}</span></aside></div>
 <div className="svc-score-band"><article className="svc-score-main"><span>POSTURA DECLARADA</span><strong>{a.score===null?'A avaliar':`${a.score}/100`}</strong><p>{a.assessed} de {a.total} controles avaliados. Sem respostas suficientes, a nota não é calculada.</p></article><div className="svc-score-details"><div><strong>{a.attention}</strong><span>Pontos de atenção</span></div><div><strong>{a.positive}</strong><span>Controles informados</span></div><div><strong>{a.unknown}</strong><span>A confirmar</span></div></div></div>
 <div className="svc-metrics">{metrics.map(([name,value])=><article key={name}><span>{name}</span><strong>{value}</strong></article>)}</div>
 <div className="svc-exec-bottom"><div className="svc-core-visual"><span className="v3-kicker">{endpoint?'COBERTURA DO PARQUE':'CADEIA DE RECUPERAÇÃO'}</span>{endpoint?<><div className="svc-coverage"><div className="svc-coverage-bar"><i style={{width:total&&f.endpointCoveredCount!==undefined?`${Math.min(100,100*count(f.endpointCoveredCount)/total)}%`:'0%'}}/></div><p>{f.endpointCoveredCount!==undefined?`${Math.min(count(f.endpointCoveredCount),total||Infinity)} dispositivos com agente ativo informados de ${total||'total não confirmado'}.`:'A quantidade de agentes ativos precisa ser confirmada. Não assumimos que um equipamento fora do domínio está desprotegido.'}</p></div></>:<div className="svc-mini-flow"><span>Dados e sistemas</span><ArrowRight/><span>Cópias</span><ArrowRight/><span>Teste de retorno</span></div>}</div><div className="svc-exec-reading"><span className="v3-kicker">LEITURA INICIAL</span><h3>O que merece atenção</h3>{problems.length?problems.map(s=><div key={s.id}><AlertTriangle size={17}/><p><b>{s.title}</b><span>{s.impact}</span></p></div>):<div><Info size={17}/><p><b>O cenário ainda precisa ser confirmado</b><span>Os controles declarados e os pontos pendentes serão apresentados no aprofundamento.</span></p></div>}</div></div></section>;
}
function ServiceEnvironment({service,profile:p,facts:f}:Omit<Props,'chapter'|'updateFact'|'money'>){
 const endpoint=service==='endpoint';const items=endpoint?[
  {name:'Usuários e estações',value:val(p.deviceCount?`${p.deviceCount} dispositivos`:''),detail:`Windows: ${val(p.endpointsWindows)} | macOS: ${val(p.endpointsMac)}`,tip:'Confirmar versões, inventário e sistemas operacionais.'},
  {name:'Proteção atual',value:val(f.endpointVendor),detail:`Licença: ${val(f.endpointLicense)}`,tip:'Verificar edição, console e recursos de detecção e resposta habilitados.'},
  {name:'Cobertura dos agentes',value:val(f.endpointCoveredCount),detail:'Quantidade de agentes ativos declarados',tip:'Reconciliar a lista de dispositivos com agentes ativos e saudáveis.'},
  {name:'Resposta',value:f.response==='yes'?'Processo informado':f.response==='no'?'Sem processo definido':'A confirmar',detail:`Operação: ${val(f.endpointOps)}`,tip:'Confirmar isolamento, autorização, escalonamento e cobertura fora do expediente.'},
 ]:[
  {name:'Ambiente de produção',value:val(p.backupMostCriticalSystem),detail:`Volume: ${val(p.backupTotalVolumeToProtect)}`,tip:'Mapear aplicações, banco de dados, máquinas virtuais e dependências.'},
  {name:'Rotina de cópias',value:val(p.backupCurrentFrequency),detail:`Retenção: ${val(p.backupDesiredRetention)}`,tip:'Confirmar escopo, retenção efetiva, tarefas falhas e destinos.'},
  {name:'Proteção das cópias',value:f.isolated==='yes'?'Isolamento informado':f.isolated==='no'?'Sem isolamento informado':'A confirmar',detail:`Destino: ${val(f.backupDest)}`,tip:'Validar segregação, imutabilidade, privilégios e acesso ao repositório.'},
  {name:'Restauração',value:f.tested==='yes'?'Restore testado':f.tested==='no'?'Sem teste informado':'A confirmar',detail:`RTO desejado: ${val(p.backupMaxAcceptableDowntime)}`,tip:'O teste é a evidência para discutir tempo de retorno e integridade.'},
 ];
 const [selected,setSelected]=useState(0);const node=items[selected];
 return <section className="svc-screen"><header><span className="v3-kicker">AMBIENTE DO CLIENTE</span><h2>{endpoint?'Onde estão os dispositivos e a capacidade de reação.':'O caminho entre os dados e o retorno da operação.'}</h2><p>Clique nos elementos para aprofundar. A representação é lógica e usa dados declarados, sem descoberta automática.</p></header><div className="svc-map-layout"><div className="svc-map"><div className="svc-map-track">{items.map((item,i)=><button type="button" key={item.name} onClick={()=>setSelected(i)} className={selected===i?'selected':''} aria-pressed={selected===i}><span>{i===0?<Laptop/>:i===1?<ShieldCheck/>:i===2?<Database/>:<Activity/>}</span><small>{item.name}</small><strong>{item.value}</strong></button>)}</div></div><aside className="svc-map-inspect"><span className="v3-kicker">PONTO SELECIONADO</span><h3>{node.name}</h3><strong>{node.value}</strong><p>{node.detail}</p><div><small>O que vale validar</small><p>{node.tip}</p></div></aside></div></section>;
}
function ServiceRisks({service,profile:p,facts:f}:Omit<Props,'chapter'|'updateFact'|'money'>){
 const a=serviceAssessment(service,p,f);const items=[...a.signals.filter(x=>x.state==='attention'),...a.signals.filter(x=>x.state==='unknown'),...a.signals.filter(x=>x.state==='confirmed')];const [active,setActive]=useState('');const chosen=items.find(x=>x.id===active)||items[0];
 return <section className="svc-screen"><header><span className="v3-kicker">RISCOS E EVIDÊNCIAS</span><h2>O que cada resposta revela sobre o ambiente.</h2><p>As situações abaixo mostram consequências possíveis e medidas que valem ser verificadas. A ausência de resposta não representa falha confirmada.</p></header><div className="svc-risk-layout"><div className="svc-risk-options">{items.map(x=><button type="button" key={x.id} onClick={()=>setActive(x.id)} aria-pressed={chosen?.id===x.id} className={`${x.state} ${chosen?.id===x.id?'selected':''}`}><span>{x.state==='attention'?<AlertTriangle size={20}/>:x.state==='confirmed'?<CheckCircle2 size={20}/>:<Clock3 size={20}/>}</span><div><b>{x.title}</b><small>{statusText(x.state)}</small></div><ChevronRight size={17}/></button>)}</div>{chosen&&<article className="svc-risk-detail"><span className="v3-kicker">LEITURA DO CENÁRIO</span><h3>{chosen.title}</h3><div><small>O que foi informado</small><p>{chosen.evidence}</p></div><div><small>Possível consequência</small><p>{chosen.impact}</p></div><div><small>O que vale confirmar</small><p>{chosen.action}</p></div>{chosen.lgpd&&<aside><b><LockKeyhole size={16}/> {chosen.lgpd}</b><p>O risco regulatório depende da natureza dos dados, do incidente e das obrigações aplicáveis. Multa não é automática.</p><a href={lgpdUrl} target="_blank" rel="noreferrer">Consultar a LGPD <ExternalLink size={14}/></a></aside>}</article>}</div></section>;
}

type DemoKind='mail'|'script'|'backup-failure'|'restore';
type DemoConfig={
 id:DemoKind;
 label:string;
 badge:string;
 title:string;
 subtitle:string;
 actionLabel:string;
 cardTitle:string;
 description:string;
 fileName:string;
 stepLabels:[string,string,string,string];
 phaseText:[string,string,string,string];
 resultManagedTitle:string;
 resultManagedText:string;
 resultBaselineTitle:string;
 resultBaselineText:string;
 gatewayManaged:string;
 gatewayBaseline:string;
 controlManaged:string;
 controlBaseline:string;
};

function getServiceDemo(service:Service, scenario:DemoKind):DemoConfig{
 if(service==='endpoint'){
  if(scenario==='script') return {
   id:'script',label:'Comportamento suspeito',badge:'EDR',title:'Processo suspeito na estação',subtitle:'Possível tentativa de acesso a recursos internos',actionLabel:'Executar arquivo',cardTitle:'Um processo acessa arquivos e tenta alcançar a rede',description:'Um arquivo inicia alterações incomuns e procura compartilhamentos internos. O EDR avalia comportamento, contexto e resposta possível.',fileName:'Processo local em análise',stepLabels:['Executar arquivo','Tentativa na rede','Decisão de contenção','Registro e resposta'],phaseText:['O arquivo foi executado localmente e iniciou ações no endpoint.','O agente correlaciona alterações de arquivos e tentativas de acesso a outros recursos da rede.','A ação é confirmada e a estação pode ser contida conforme a política demonstrativa.','O resultado fica visível para explicar contenção e resposta.'],resultManagedTitle:'Atividade contida para investigação',resultManagedText:'A demonstração mostra o endpoint isolando a ação suspeita e disponibilizando o evento para triagem. A contenção real depende da edição, da política e das autorizações.',resultBaselineTitle:'Atividade seguiu sem contenção demonstrada',resultBaselineText:'Sem a camada demonstrativa, a execução continua. Outros controles podem existir no ambiente real, mas a reação tende a depender de descoberta posterior.',gatewayManaged:'O agente analisou o comportamento e aplicou a contenção prevista para a demonstração.',gatewayBaseline:'Sem a camada demonstrativa, a ação não encontrou contenção nesta cena.',controlManaged:'Triagem, investigação e contenção orientadas pelo SOC conforme escopo.',controlBaseline:'A percepção depende dos controles ativos e da equipe disponível.'};
  return {
   id:'mail',label:'Arquivo recebido por e-mail',badge:'E-MAIL',title:'Anexo recebido por um colaborador',subtitle:'Documento externo com comportamento suspeito',actionLabel:'Abrir anexo',cardTitle:'Um e-mail trouxe um arquivo para a estação',description:'A demonstração mostra a abertura de um anexo vindo de fora. O Endpoint observa a ação no dispositivo e decide o tratamento conforme a política ilustrativa.',fileName:'Documento_Recebido.zip',stepLabels:['Abrir o anexo','Atividade no endpoint','Decisão de proteção','Registro e resposta'],phaseText:['O colaborador tenta abrir o anexo no notebook.','O agente acompanha a ação e coleta sinais do comportamento local.','A proteção decide entre conter a ação ou permitir a continuidade nesta cena.','O resultado fica disponível para explicar investigação e resposta.'],resultManagedTitle:'Ação bloqueada e evento registrado',resultManagedText:'A demonstração mostra o Endpoint impedindo a ação suspeita e encaminhando o evento para análise. O bloqueio real depende do agente, da edição e da configuração.',resultBaselineTitle:'O arquivo seguiu sem bloqueio demonstrado',resultBaselineText:'Sem a camada ilustrativa, o arquivo prossegue e a identificação do problema pode depender de outros controles ou de reclamação do usuário.',gatewayManaged:'O agente avaliou a ação local e bloqueou o comportamento previsto para esta demonstração.',gatewayBaseline:'Sem a camada demonstrativa, a ação não encontrou bloqueio nesta cena.',controlManaged:'Triagem, contexto e resposta coordenada com o SOC conforme o serviço.',controlBaseline:'A percepção depende de quem notar o problema e do tempo disponível para agir.'};
 }
 if(scenario==='restore') return {
  id:'restore',label:'Restauração de sistema',badge:'RESTORE',title:'O sistema crítico precisa voltar',subtitle:'Pedido de restauração do serviço prioritário',actionLabel:'Iniciar restauração',cardTitle:'A operação solicita retorno do sistema prioritário',description:'A demonstração mostra uma restauração orientada. O foco está na evidência da cópia, na ordem de retorno e na validação do serviço.',fileName:'ERP_Producao',stepLabels:['Solicitar restauração','Localizar cópia','Executar retorno','Validação e evidência'],phaseText:['A operação informa indisponibilidade e pede a restauração do sistema prioritário.','A equipe precisa localizar a cópia adequada e confirmar o ponto de recuperação.','A restauração é conduzida para devolver o serviço à operação.','O resultado ajuda a explicar recuperação e evidência de retorno.'],resultManagedTitle:'Restauração conduzida com evidência',resultManagedText:'A demonstração mostra um fluxo orientado de restauração, com cópia localizada e validação do serviço. O retorno real depende da cópia íntegra, do ambiente e dos testes.',resultBaselineTitle:'Retorno depende de esforço manual',resultBaselineText:'Sem essa rotina demonstrativa, a recuperação tende a exigir busca manual, mais validações e maior incerteza sobre o tempo de retorno.',gatewayManaged:'A rotina demonstrativa guiou a seleção da cópia e o retorno do serviço.',gatewayBaseline:'Sem a rotina demonstrativa, o processo fica mais manual e menos previsível.',controlManaged:'Acompanhamento da restauração, validação e priorização do retorno.',controlBaseline:'A resposta depende de localização manual, acesso às cópias e disponibilidade da equipe.'};
 return {
  id:'backup-failure',label:'Falha em tarefa de backup',badge:'BACKUP',title:'Uma cópia programada apresentou falha',subtitle:'A rotina noturna terminou sem concluir a tarefa',actionLabel:'Analisar falha',cardTitle:'O painel indica falha na tarefa programada',description:'A demonstração mostra uma execução com erro. O objetivo é explicar visibilidade, tratamento da falha e necessidade de evidência para a continuidade.',fileName:'Tarefa de backup noturna',stepLabels:['Falha percebida','Validação da rotina','Ação corretiva','Registro e evidência'],phaseText:['A rotina de backup apresentou falha e a cópia esperada não concluiu.','O painel precisa mostrar o erro e o contexto para identificar o alcance.','A equipe decide o tratamento para restaurar a rotina e reduzir exposição.','O resultado ajuda a explicar visibilidade e resposta.'],resultManagedTitle:'Falha identificada e encaminhada',resultManagedText:'A demonstração mostra visibilidade da falha, tratamento orientado e evidência do que precisa ser corrigido. O resultado real depende da plataforma, da cópia e da operação.',resultBaselineTitle:'Falha pode permanecer sem leitura',resultBaselineText:'Sem rotina demonstrativa, a falha pode ficar sem tratamento imediato e só ser percebida quando alguém precisar da cópia.',gatewayManaged:'A operação recebeu visibilidade da falha e direcionou o tratamento da rotina.',gatewayBaseline:'Sem a rotina demonstrativa, a falha pode passar sem leitura ou ação rápida.',controlManaged:'Acompanhamento da rotina, triagem da falha e revisão da cópia.',controlBaseline:'A percepção pode ser tardia, dependendo de quem consulte o painel ou precise restaurar.'};
}

function ServiceSimulation({service}: {service:Service}){
 const endpoint=service==='endpoint';
 const [mode,setMode]=useState<'concierge'|'baseline'>('concierge');
 const [scenario,setScenario]=useState<DemoKind>(endpoint?'mail':'backup-failure');
 const [stage,setStage]=useState(0);
 const blocked=mode==='concierge';
 const cfg=getServiceDemo(service, scenario);
 const progress=stage===0?0:stage===1?36:stage===2?(blocked?68:86):(blocked?68:100);
 const statusLabel=stage===0?'Pronto para iniciar':stage===1?'Ação em andamento':stage===2?'Em análise':blocked?'Tratado':'Sem contenção demonstrada';
 const currentText=cfg.phaseText[Math.min(stage,3)];
 const stageImpact:{[key in DemoKind]:[string,string,string,string]}={
  mail:[
   'O anexo pode conter código indesejado. Abrir um arquivo externo sem validação amplia o risco de execução não autorizada.',
   'Sem agente e telemetria, a atividade pode passar despercebida, dificultando localizar o dispositivo e identificar o que foi executado.',
   'Sem contenção, um processo malicioso pode acessar arquivos, credenciais ou recursos da rede, dependendo dos privilégios disponíveis.',
   'Uma resposta tardia amplia o tempo de exposição. Com detecção e resposta previstas na solução, a equipe ganha contexto para conter e investigar.'
  ],
  script:[
   'O usuário executou um arquivo que inicia várias alterações em sequência. A atividade pode indicar abuso de ferramentas ou comportamento malicioso.',
   'Uma estação comprometida pode tentar alcançar outros recursos. A movimentação lateral depende de credenciais, permissões e conectividade disponíveis.',
   'Sem isolamento ou bloqueio, a atividade pode continuar e alcançar arquivos compartilhados ou outras máquinas. Isso precisa ser investigado, não presumido.',
   'O EDR pode disponibilizar evidências e permitir contenção quando os recursos estão habilitados. O SOC avalia alcance e orienta a próxima ação.'
  ],
  'backup-failure':[
   'A cópia programada falhou. O último ponto recuperável pode ser mais antigo do que a empresa imagina.',
   'Sem alertas e acompanhamento, a falha pode se repetir por dias, aumentando a janela de perda de dados em uma recuperação.',
   'É necessário corrigir a causa, acompanhar a nova execução e confirmar se existe uma cópia utilizável.',
   'Registrar a falha e a correção ajuda a demonstrar controle da rotina. A capacidade de restauração ainda depende de teste.'
  ],
  restore:[
   'Uma aplicação crítica ficou indisponível. A equipe precisa saber qual versão dos dados recuperar e em que ordem.',
   'Sem inventário, cópia íntegra e RPO definido, a recuperação pode perder mais dados do que o negócio aceita.',
   'A restauração depende da integridade da cópia, infraestrutura disponível e sequência técnica correta. Não há retorno garantido.',
   'O serviço só deve ser considerado recuperado após validação funcional. A evidência do teste dá confiança para uma próxima emergência.'
  ]
 };
 const stageRisk=stageImpact[scenario][Math.min(stage,3)];
 const scenarioInterpretation=mode==='baseline'
   ? 'Sem a camada demonstrativa, a detecção e a reação podem depender de outras ferramentas, da equipe disponível e dos registros existentes.'
   : 'Com a política e a operação simuladas, o evento recebe contexto para análise e tratamento. Os recursos exatos dependem da solução contratada.';
 const pageRef=useRef<HTMLDivElement|null>(null);
 const actionRef=useRef<HTMLButtonElement|null>(null);
 const stateRef=useRef<HTMLDivElement|null>(null);
 const alertRef=useRef<HTMLDivElement|null>(null);
 const [pointer,setPointer]=useState({x:0,y:0,ready:false});
 useEffect(()=>{
  let frame=0;
  let arrivalFrame=0;
  const align=(fromStart=false)=>{
   const page=pageRef.current;
   if(!page)return;
   const host=page.getBoundingClientRect();
   const target=stage<=1?actionRef.current:stage===2?stateRef.current:(alertRef.current||stateRef.current);
   if(!target)return;
   const area=target.getBoundingClientRect();
   const destination={x:area.left-host.left+area.width*.56,y:area.top-host.top+Math.min(area.height*.58,44),ready:true};
   if(fromStart&&stage===0){
    setPointer({x:Math.max(20,host.width-50),y:Math.max(20,host.height-40),ready:true});
    arrivalFrame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>setPointer(destination));});
   }else{setPointer(destination);}
  };
  frame=requestAnimationFrame(()=>align(stage===0));
  const onResize=()=>align(false);
  window.addEventListener('resize',onResize);
  return()=>{cancelAnimationFrame(frame);cancelAnimationFrame(arrivalFrame);window.removeEventListener('resize',onResize);};
 },[stage,scenario,mode]);

 const responseWithSoc=endpoint
  ? ['Evento visível em console e triagem mais rápida','Contexto do endpoint ajuda a entender alcance e prioridade','Ação ou escalonamento segue o serviço e as autorizações']
  : ['Falha ou restauração entram em rotina acompanhada','A cópia, o ponto de retorno e o serviço ganham contexto','A equipe prioriza o retorno e registra a evidência necessária'];
 const responseWithoutSoc=endpoint
  ? ['A percepção pode depender do usuário ou de outro controle','A investigação pode começar mais tarde','A contenção pode atrasar ou nem acontecer no primeiro momento']
  : ['A falha pode ficar sem leitura até alguém precisar da cópia','A restauração tende a depender de busca manual e mais validações','O tempo de retorno fica menos previsível'];
 const scenarios=endpoint
  ? [{id:'mail' as DemoKind,label:'Arquivo recebido por e-mail'},{id:'script' as DemoKind,label:'Comportamento suspeito'}]
  : [{id:'backup-failure' as DemoKind,label:'Falha em tarefa de backup'},{id:'restore' as DemoKind,label:'Restauração de sistema'}];
 const reset=(nextMode=mode,nextScenario=scenario)=>{setMode(nextMode);setScenario(nextScenario);setStage(0);};
 const next=()=>setStage(s=>s===3?0:s+1);
 return <section className="svc-screen svc-demo upgraded"><header><span className="v3-kicker">SIMULAÇÃO INTERATIVA</span><h2>Uma situação do dia a dia. Duas formas de reagir.</h2><p>A demonstração segue o mesmo padrão visual do Firewall. Você controla o ritmo e pode explicar cada etapa antes de avançar.</p></header>
 <div className="fw-lab-modes svc-lab-modes">{scenarios.map(x=><button type="button" key={x.id} className={scenario===x.id?'active':''} onClick={()=>reset(mode,x.id)}>{x.label}</button>)}</div>
 <div className="fw-lab-defenses svc-lab-defenses"><span>Cenário da simulação</span><div><button type="button" className={blocked?'active':''} onClick={()=>reset('concierge')}>{endpoint?'Com Concierge Endpoint + SOC':'Com Concierge Backup + operação'}</button><button type="button" className={!blocked?'active alt':''} onClick={()=>reset('baseline')}>{endpoint?'Sem essa rotina de Endpoint':'Sem essa rotina de Backup'}</button></div></div>
 <div className="fw-lab-console enhanced svc-lab-console">
  <div className="fw-lab-laptop realistic svc-lab-laptop">
   <div className="fw-lab-toolbar"><i/><i/><i/><span>{endpoint?'Estação de trabalho do colaborador':'Console da operação de backup'}</span></div>
   <div className="fw-lab-browser light svc-lab-browser">
    <div className="fw-lab-address"><LockKeyhole size={15}/><span>{endpoint?'console-endpoint.exemplo.invalid':'backup-console.exemplo.invalid'}</span></div>
    <div ref={pageRef} className="fw-lab-browser-page interactive svc-lab-page" role="button" tabIndex={0} onClick={next} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();next();}}}>
      <div className="fw-lab-page-top"><b>{cfg.title}</b><small>{cfg.subtitle}</small></div>
      <div className="fw-lab-page-body svc-lab-body">
        <div className="fw-lab-page-card svc-lab-card">
          <span>{cfg.badge}</span>
          <strong>{cfg.cardTitle}</strong>
          <p>{cfg.description}</p>
          <button ref={actionRef} type="button" onClick={e=>{e.stopPropagation();next();}}>{stage===0?cfg.actionLabel:stage<3?'Avançar análise':'Reiniciar demonstração'} {stage===0? <Play size={16}/> : stage<3? <ArrowRight size={16}/> : <RotateCcw size={16}/>}</button>
        </div>
        <div aria-hidden="true" className={`svc-guided-pointer ${pointer.ready?'ready':''} ${stage===1?'clicking':''}`} style={{left:pointer.x,top:pointer.y}}><MousePointer2 size={27}/><i/></div>
        {stage>0 && <div ref={stateRef} className={`fw-lab-download-state svc-lab-state ${stage===3?(blocked?'blocked':'passed'):stage===2?'scanning':'downloading'}`}>
          <div className="fw-lab-download-head"><b><Download size={16}/>{cfg.fileName}</b><small>{stage===1?cfg.stepLabels[0]:stage===2?cfg.stepLabels[1]:blocked?cfg.stepLabels[2]:cfg.stepLabels[3]}</small></div>
          <div className="fw-lab-progress"><i style={{width:`${progress}%`}}/></div>
          {stage===3 && blocked && <div ref={alertRef} className="fw-lab-inline-alert"><ShieldCheck size={18}/><div><strong>{cfg.resultManagedTitle}</strong><p>{cfg.resultManagedText}</p></div></div>}
          {stage===3 && !blocked && <div ref={alertRef} className="fw-lab-inline-alert warning"><AlertTriangle size={18}/><div><strong>{cfg.resultBaselineTitle}</strong><p>{cfg.resultBaselineText}</p></div></div>}
        </div>}
      </div>
    </div>
   </div>
  </div>
  <div className="fw-lab-link enhanced"><Wifi size={25}/><i className={stage>0?'moving':''}/><span>{stage===0?'Aguardando ação':stage===1?'Evento em andamento':stage===2?'Política e contexto em análise':'Resultado demonstrado'}</span></div>
  <div className={`fw-lab-gateway enhanced ${stage>=2?'active':''} ${stage===3?(blocked?'good':'danger'):''}`}><div className="fw-lab-gateway-top">{stage===3?(blocked?<ShieldCheck size={34}/>:<AlertTriangle size={34}/>):endpoint?<Laptop size={34}/>:<Server size={34}/>}<b>{blocked?(endpoint?'Concierge Endpoint':'Concierge Backup'):(endpoint?'Sem Concierge Endpoint':'Sem Concierge Backup')}</b></div><small>{stage===0?'Aguardando o início da demonstração.':stage===1?'O evento foi iniciado e aguarda leitura do contexto.':stage===2?(blocked?cfg.gatewayManaged:cfg.gatewayBaseline):(blocked?cfg.gatewayManaged:cfg.gatewayBaseline)}</small><span>{statusLabel}</span><div className="fw-lab-status-pill">{stage===3?(blocked?'Evento tratado':'Tratamento a validar'):'Em análise'}</div></div>
 </div>
 <div className="fw-lab-stepper svc-lab-stepper">{cfg.stepLabels.map((title,i)=><button type="button" key={title} className={stage===i?'active':stage>i?'done':''} onClick={()=>setStage(i)}><b>{String(i+1).padStart(2,'0')}</b><span>{title}</span></button>)}</div>
 <div className="fw-lab-result enhanced svc-lab-result"><div>{stage===0?<Info size={24}/>:stage<3?<Activity size={24}/>:blocked?<CheckCircle2 size={24}/>:<XCircle size={24}/>}</div><div className="svc-step-explanation"><p>{currentText}</p><p className="svc-step-risk"><strong>O que pode acontecer:</strong> {stageRisk} <span className="svc-step-context">{scenarioInterpretation}</span></p></div><div className="fw-lab-controls"><button type="button" className="secondary" onClick={()=>setStage(0)}><RotateCcw size={16}/> Reiniciar</button><button type="button" onClick={next}>{stage===0?'Iniciar':stage<3?'Próxima etapa':'Repetir'} <ArrowRight size={16}/></button></div></div>
 <div className="fw-lab-response-grid svc-lab-response-grid"><article className="with-soc"><div className="fw-lab-response-head"><ShieldCheck size={18}/><strong>{endpoint?'Com SOC / operação estruturada':'Com rotina estruturada de backup'}</strong></div><small>{blocked?'A demonstração mostra o fluxo apoiado pela Concierge.':'Mesmo mudando de cenário, este bloco explica o ganho de operação estruturada.'}</small><ul>{responseWithSoc.map(item=><li key={item}>{item}</li>)}</ul></article><article className="without-soc"><div className="fw-lab-response-head"><Clock3 size={18}/><strong>{endpoint?'Sem rotina estruturada':'Sem rotina estruturada de recuperação'}</strong></div><small>{endpoint?'Quando não existe leitura contínua, a detecção e a contenção podem atrasar.':'Sem visibilidade e validação frequente, a confiança na cópia e no retorno tende a cair.'}</small><ul>{responseWithoutSoc.map(item=><li key={item}>{item}</li>)}</ul></article></div>
 <p className="fw-lab-foot">Demonstração fictícia. Ela ajuda a visualizar etapas, decisão e resposta, mas não comprova detecção real, restauração testada nem garantia de prevenção.</p></section>;
}
function ServiceProtection({service,profile:p}: {service:Service;profile:Profile}){
 const endpoint=service==='endpoint';const layers=endpoint?[
 ['Cobertura','Definir quais dispositivos e servidores precisam de agente e política.'],['Prevenção','Usar os recursos de proteção previstos na edição contratada.'],['Investigação','Dar contexto a alertas, comportamento e possíveis impactos.'],['Resposta','Escalonar e executar ações permitidas pelo processo e escopo.'],
 ]:[['Cobertura','Definir sistemas, dados e serviços dentro do escopo.'],['Rotina','Acompanhar tarefas de cópia, falhas e retenção.'],['Proteção','Revisar mecanismos de isolamento e proteção das cópias.'],['Recuperação','Apoiar testes, ordem de retorno e tratamento de falhas.']];
 return <section className="svc-screen svc-protection"><header><span className="v3-kicker">COMO A CONCIERGE ATUA</span><h2>{endpoint?'Do sinal no dispositivo à resposta coordenada.':'Da cópia à capacidade de voltar a operar.'}</h2><p>A operação do cliente permanece no centro. A Concierge acrescenta acompanhamento e processos dentro do serviço contratado.</p></header><div className="svc-protection-main"><div className="svc-protection-core"><span>AMBIENTE DO CLIENTE</span><Database size={30}/><h3>{p.companyName||'Sua empresa'}</h3><p>{endpoint?'Usuários, dispositivos e servidores':'Dados, serviços e recuperação'}</p></div><div className="svc-protection-layers">{layers.map(([title,body],i)=><article key={title}><span>0{i+1}</span><div><h3>{title}</h3><p>{body}</p></div><CheckCircle2 size={21}/></article>)}</div></div><div className="svc-protection-footer"><ShieldCheck size={21}/><strong>SOC 24/7</strong><span>Monitoramento e tratamento conforme o serviço contratado, responsabilidades e autorizações.</span></div></section>;
}
function ServiceFinancial({service,profile:p,facts:f,updateFact, money}:Omit<Props,'chapter'>){
 const base=serviceCostDefaults(service,p,f);const get=(key:string,defaultValue:number)=>f[key]!==undefined&&f[key]!==''?count(f[key]):defaultValue;
 const key=(x:string)=>`${service}Finance${x}`;
 const affected=get(key('Affected'),base.affected),hours=get(key('Hours'),base.hours),hourly=get(key('Hourly'),base.hourly),recovery=get(key('Recovery'),base.recovery);
 const monthly=get(key('Monthly'),0),setup=get(key('Setup'),0);const impact=affected*hours*hourly+recovery;const investment=monthly*12+setup;
 const hasPricing=f[key('Monthly')]!==undefined&&f[key('Monthly')]!==''&&f[key('Setup')]!==undefined&&f[key('Setup')]!=='';
 const input=(name:string,label:string,value:number)=> <label><span>{label}</span><input type="number" min="0" value={value} onChange={e=>updateFact(key(name),e.target.value)}/></label>;
 return <section className="svc-screen svc-finance"><header><span className="v3-kicker">IMPACTO E INVESTIMENTO</span><h2>{service==='endpoint'?'Quanto custaria um incidente que parasse parte do parque?':'Quanto custaria uma interrupção com recuperação demorada?'}</h2><p>Uma simulação de cenário, com premissas visíveis e ajustáveis. Valores iniciais não representam médias de PMEs brasileiras.</p></header><div className="svc-finance-hero"><article><span>Impacto hipotético da interrupção</span><strong>{money(impact)}</strong><small>{affected} pessoas × {hours} horas + recuperação</small></article><article><span>Investimento no primeiro ano</span><strong>{hasPricing?money(investment):'A informar'}</strong><small>Implantação + 12 mensalidades</small></article></div><div className="svc-finance-editors"><section><h3>Premissas do incidente</h3><div>{input('Affected','Pessoas afetadas',affected)}{input('Hours','Horas de indisponibilidade',hours)}{input('Hourly','Custo médio por pessoa/hora (R$)',hourly)}{input('Recovery','Recuperação e despesas adicionais (R$)',recovery)}</div></section><section><h3>Investimento previsto</h3><div>{input('Monthly','Mensalidade Concierge (R$)',monthly)}{input('Setup','Implantação (R$)',setup)}</div><aside><Info size={17}/><p>A solução pode melhorar previsibilidade e resposta, mas não garante que o incidente seja evitado ou que exista economia equivalente ao cenário.</p></aside></section></div><p className="svc-disclaimer">Premissas de simulação, não previsão de perda nem comparação de ROI. Valores comerciais sujeitos à proposta formal. Dados financeiros de Endpoint e Backup são independentes.</p></section>;
}
function ServiceConclusion({service,profile:p,facts:f}:Omit<Props,'chapter'|'updateFact'|'money'>){
 const a=serviceAssessment(service,p,f);const selected=a.signals.filter(s=>s.state==='attention').concat(a.signals.filter(s=>s.state==='unknown')).slice(0,3);
 return <section className="svc-screen svc-conclusion"><header><span className="v3-kicker">PRIORIDADES DA CONVERSA</span><h2>{service==='endpoint'?'O que vale resolver primeiro no parque.':'O que vale confirmar para confiar na recuperação.'}</h2><p>Próximos temas baseados nas respostas, sem transformar pontos desconhecidos em problemas confirmados.</p></header><div className="svc-conclusion-list">{(selected.length?selected:[{id:'complete',title:'Aprofundar evidências de operação',state:'confirmed' as const,impact:'Os controles foram informados. Ainda é necessário validar a aplicação real.',action:'Revisar evidências, cobertura e próximos passos.'}]).map((s,i)=><article key={s.id}><span>0{i+1}</span><div><small>{statusText(s.state)}</small><h3>{s.title}</h3><p>{s.action}</p></div><ChevronRight size={22}/></article>)}</div><div className="svc-conclusion-close"><CheckCircle2 size={24}/><div><strong>O próximo passo nasce desta conversa.</strong><p>Depois de encerrar o compartilhamento, registre internamente as responsabilidades, o prazo e as informações que ainda precisam ser confirmadas.</p></div></div></section>;
}
export default function ServicePresentation(props:Props){const {service,chapter,profile,facts,updateFact,money}=props;const short={service,profile,facts};switch(chapter){case 0:return <ServiceExecutive {...short}/>;case 1:return <ServiceEnvironment {...short}/>;case 2:return <ServiceRisks {...short}/>;case 3:return <ServiceSimulation key={service} service={service}/>;case 4:return <ServiceProtection service={service} profile={profile}/>;case 5:return <ServiceFinancial service={service} profile={profile} facts={facts} updateFact={updateFact} money={money}/>;default:return <ServiceConclusion {...short}/>;}}
