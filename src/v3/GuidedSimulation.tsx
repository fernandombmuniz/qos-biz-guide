import { useState } from 'react';
import { Monitor, Shield, Globe, Mail, File, Folder, LockKeyhole, Database, Server, RotateCcw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Profile } from '../context/ProfileContext';
import { Facts, Module, label } from './model';
import { References } from './AssessmentDetails';

type Props={module:Module;profile:Profile;facts:Facts};
export default function GuidedSimulation({module,profile:p,facts:f}:Props){
 const [step,setStep]=useState(0);
 const [variant,setVariant]=useState(f.goal==='Disponibilidade'?'availability':'traffic');
 const [protectedBranch,setProtectedBranch]=useState(false);
 const [point,setPoint]=useState('');
 const [validated,setValidated]=useState(false);
 const [clean,setClean]=useState(false);
 const [backupMode,setBackupMode]=useState('service');
 const [history,setHistory]=useState<string[]>([]);
 const [backStack,setBackStack]=useState<number[]>([]);
 const advance=(to:number,event:string)=>{setBackStack(s=>[...s,step]);setStep(to);setHistory(h=>[...h,event]);};
 const reset=()=>{setStep(0);setPoint('');setValidated(false);setClean(false);setHistory([]);setBackStack([]);};
 const service=p.backupMostCriticalSystem||p.criticalApp||'Sistema de trabalho';
 const workplace=p.companyName||'Empresa em levantamento';
 const button=(text:string,to:number,event:string,icon?:React.ReactNode)=><button className="sim-target" onClick={()=>advance(to,event)}>{icon}{text}<small>Clique para continuar</small></button>;
 let title='',explain='',content:React.ReactNode=null;
 if(module==='firewall'){
  title=variant==='traffic'?'Uma conexão que merece atenção':'Quando o acesso à operação para';
  const notes=variant==='traffic'?[
   'Comece pela rotina: o computador acessa um destino de trabalho permitido.',
   'A navegação legítima funciona. Agora represente um processo já comprometido tentando contato com um destino conhecido de comando e controle.',
   'Neste cenário, a política de bloqueio de C2 está ativa e a classificação do destino está disponível. Clique no firewall para aplicar a política.',
   'A conexão foi bloqueada. Isso não comprova que o computador está limpo. Abra o evento para entender o que a equipe precisa investigar.',
   'Origem, destino e motivo ajudam a priorizar a investigação. O registro depende de logging habilitado. A equipe precisa verificar o computador e o alcance.',
   'A equipe aciona a investigação do endpoint, registra o evento e comunica as ações. O firewall representa uma camada do processo.'
  ]:[
   'Uma rotina depende da internet e do perímetro. Clique no serviço para iniciar.',
   'O serviço está acessível. Simule a falha do firewall principal.',
   'O componente principal está indisponível. Uma arquitetura HA previamente configurada e testada pode permitir a continuidade.',
   'Neste exercício há um par HA operacional e dependências disponíveis. Acione a contingência.',
   'O caminho alternativo foi acionado. É necessário validar acesso, aplicações e sessões afetadas.',
   'O responsável confirma o retorno no exercício. O tempo real depende da arquitetura, do tipo de falha e dos testes.'
  ];explain=notes[step];
  content=variant==='traffic'?<>
   <div className="sim-address"><Globe size={16}/> {step===0?'Área de trabalho':step===1?'portal-trabalho.example':step===2?'Tentativa para 203.0.113.50:443':'Conexão analisada · exercício'}</div>
   <div className="sim-network-scene"><div className="sim-device"><Monitor size={48}/><b>PC administrativo</b><small>192.0.2.10 · fictício</small></div><span className="sim-connection">→</span><div className={'sim-device '+(step>=3?'sim-success':'')}><Shield size={52}/><b>{p.firewallModel||'Firewall'}</b><small>{step>=3?'Conexão bloqueada':'Política ilustrativa'}</small></div><span className="sim-connection">→</span><div className="sim-device"><Globe size={44}/><b>{step<2?'Internet':'Destino C2 conhecido'}</b></div></div>
   {step===0&&button('Abrir portal de trabalho',1,'09:00 · Navegação legítima iniciada',<Globe/>)}
   {step===1&&<><div className="sim-notice good">Portal de trabalho disponível</div>{button('Simular conexão suspeita do computador',2,'09:01 · Processo comprometido tenta conexão com destino C2',<Monitor/>)}</>}
   {step===2&&button('Aplicar política no firewall',3,'09:01 · Bloqueio pela política de destinos C2 conhecidos',<Shield/>)}
   {step===3&&<><div className="sim-notice bad"><Shield/> Conexão interrompida</div>{button('Abrir evento de segurança',4,'09:02 · Analista abre registro de conexão bloqueada',<File/>)}</>}
   {step>=4&&<div className="sim-event"><b>Evento simulado · filtro de comando e controle</b><dl><dt>Origem</dt><dd>PC administrativo · 192.0.2.10</dd><dt>Destino</dt><dd>203.0.113.50:443</dd><dt>Ação</dt><dd>Bloquear conexão</dd><dt>Motivo</dt><dd>Destino C2 conhecido na base do cenário</dd></dl><p>Aviso ilustrativo da apresentação. Não reproduz uma tela real de produto.</p></div>}
   {step===4&&button('Acionar investigação do computador',5,'09:03 · Investigação e comunicação acionadas',<Monitor/>)}
  </>:<>
   <div className="sim-address"><Globe size={16}/>{service} · rotina ilustrativa</div><div className="sim-network-scene"><div className="sim-device"><Monitor size={50}/><b>Usuário</b></div><span>→</span><div className={'sim-device '+(step>=2?'sim-failed':'')}><Shield size={50}/><b>Firewall principal</b><small>{step>=2?'Indisponível':'Operacional'}</small></div><div className={'sim-device '+(step>=4?'sim-success':'')}><Shield size={50}/><b>Firewall secundário</b><small>{step>=4?'Ativo no exercício':'Hipótese: HA preparado'}</small></div></div>
   {step===0&&button('Acessar serviço de trabalho',1,'Serviço acessível antes da falha',<Server/>)}
   {step===1&&button('Simular falha do equipamento principal',2,'Falha do firewall principal · cenário hipotético',<AlertTriangle/>)}
   {step===2&&button('Verificar arquitetura de contingência',3,'Par HA preparado e dependências disponíveis nesta hipótese',<Shield/>)}
   {step===3&&button('Acionar caminho de contingência',4,'Equipamento secundário assume o caminho de tráfego',<Shield/>)}
   {step===4&&button('Validar funcionamento da aplicação',5,'Validação funcional concluída no exercício',<CheckCircle2/>)}
  </>;
 }else if(module==='endpoint'){
  title='Um anexo, um processo, uma decisão';
  explain=[
   'Abra o webmail simulado. A mensagem usa um assunto de trabalho plausível, mas é inteiramente fictícia.',
   'A mensagem solicita a abertura de um documento. Baixar um arquivo e executar seu conteúdo são etapas diferentes.',
   'O arquivo foi baixado, sem execução. O nome apresentado no e-mail induz o usuário a acreditar que é um documento.',
   protectedBranch?'Um comportamento suspeito foi detectado na execução. Nesta hipótese, a solução possui política ativa capaz de bloquear o processo.':'Neste ramo hipotético, a ameaça não foi interrompida. A linha do tempo foi comprimida para mostrar a consequência.',
   protectedBranch?'O processo foi interrompido. A equipe verifica contexto, outros dispositivos e a necessidade de contenção.':'Os arquivos do cenário foram criptografados. Abra o aviso para entender o impacto sobre o trabalho.',
   protectedBranch?'O dispositivo foi isolado na hipótese de capacidade disponível e autorização prévia. O bloqueio, sozinho, não encerra a investigação.':'O aviso de resgate é fictício. A recuperação exige investigação, contenção e avaliação de cópias utilizáveis.',
   'A equipe registra ações, comunica o alcance conhecido e define validação e recuperação. Nenhuma tecnologia garante bloqueio de todos os ataques.'
  ][step];
  content=<><div className="sim-address"><Globe size={16}/>{step<2?'webmail.example · Caixa de entrada':'Estação de trabalho · exercício'}</div>
  {step===0&&button('Abrir e-mail: documento para conferência',1,'09:10 · Mensagem fictícia aberta no webmail',<Mail/>)}
  {step===1&&<div className="sim-mail"><small>De: financeiro@fornecedor.example</small><h3>Documento para conferência</h3><p>Olá, segue o documento referente à solicitação. Confira os dados antes da reunião.</p>{button('Baixar anexo: Documento.pdf.exe',2,'09:11 · Arquivo baixado, ainda não executado',<File/>)}</div>}
  {step===2&&<><div className="sim-files"><File size={44}/><b>Documento.pdf.exe</b><span>Arquivo executável · nome enganoso</span></div>{button('Abrir arquivo no cenário',3,'09:12 · Execução simulada do anexo',<File/>)}</>}
  {step===3&&<><div className={'sim-notice '+(protectedBranch?'good':'bad')}>{protectedBranch?<Shield/>:<AlertTriangle/>}{protectedBranch?'Comportamento suspeito detectado':'Atividade maliciosa em execução'}</div>{button(protectedBranch?'Ver bloqueio do processo':'Observar alteração dos arquivos',4,protectedBranch?'09:12 · Processo bloqueado pela política da hipótese':'09:13 · Arquivos fictícios afetados',protectedBranch?<Shield/>:<Folder/>)}</>}
  {step===4&&<><div className="sim-files">{['Contratos','Financeiro','Projetos'].map(n=><div key={n}>{protectedBranch?<File/>:<LockKeyhole/>}{n}{protectedBranch?'.xlsx':'.xlsx.bloqueado'}</div>)}</div>{button(protectedBranch?'Isolar estação com autorização':'Abrir aviso de resgate fictício',5,protectedBranch?'09:14 · Isolamento autorizado no exercício':'09:14 · Aviso fictício de resgate apresentado',protectedBranch?<Monitor/>:<LockKeyhole/>)}</>}
  {step===5&&<><div className={'sim-notice '+(protectedBranch?'good':'bad')}><h3>{protectedBranch?'Estação isolada para investigação':'Arquivos indisponíveis'}</h3><p>{protectedBranch?'Preservar contexto, avaliar alcance e orientar recuperação.':'SIMULAÇÃO DE RESGATE: seus arquivos foram bloqueados. A operação não consegue continuar normalmente.'}</p></div>{button('Revisar resposta e continuidade',6,'09:15 · Comunicação, investigação e recuperação coordenadas',<CheckCircle2/>)}</>}
  {step===6&&<div className="sim-notice good">Registrar evidências → investigar alcance → validar recuperação → comunicar próximos passos.</div>}
  <p className="v3-footnote">Antivírus também pode bloquear antes da execução. EDR, prevenção e isolamento variam por produto, licença, política e autorização. Esta comparação demonstra dois desfechos possíveis, sem prever o resultado do ambiente do cliente.</p></>;
 }else{
  title=backupMode==='service'?'Recuperar a operação, com validação':'Uma pasta excluída durante a rotina';
  explain=[
   backupMode==='service'?'Abra o serviço prioritário do cliente. Neste exercício, uma falha no servidor interrompe a aplicação.':'Uma pasta de trabalho será excluída acidentalmente no exercício.',
   'A indisponibilidade afeta o trabalho. Abra a console ilustrativa de recuperação.',
   'Escolha uma cópia utilizável. A mais recente pode estar incompleta. O horário escolhido determina a janela de dados que pode faltar.',
   'Antes de restaurar, confirme integridade da cópia e um destino disponível e adequado. Em um incidente, a condição de segurança exige investigação.',
   'A restauração terminou apenas na simulação. O responsável precisa validar os arquivos e o funcionamento da aplicação.',
   'Validação funcional concluída. Registre o ponto utilizado, a janela de dados a reconciliar e o tempo medido em um teste real.'
  ][step];
  content=<><div className="sim-address"><Database size={16}/>{backupMode==='service'?service:'Pasta de documentos'} · {workplace}</div>
  {step===0&&button(backupMode==='service'?'Abrir sistema e simular falha':'Simular exclusão da pasta',1,backupMode==='service'?'10:00 · Falha ilustrativa no servidor':'10:00 · Exclusão acidental de pasta',backupMode==='service'?<Server/>:<Folder/>)}
  {step===1&&<><div className="sim-notice bad">{backupMode==='service'?'Serviço indisponível. A operação aguarda.':'Pasta não encontrada. Arquivos indisponíveis.'}</div>{button('Abrir pontos de recuperação',2,'Console ilustrativa de recuperação aberta',<Database/>)}</>}
  {step===2&&<div className="sim-restore-points"><p>Evento às 10h de hoje · horários fictícios</p>{[['09h de hoje','1 hora','Falhou · cópia incompleta'],['08h de hoje','2 horas','Cópia disponível · validar integridade'],['18h de ontem','16 horas','Cópia disponível · validar integridade']].map(([time,gap,status],i)=><button key={time} disabled={i===0} onClick={()=>{setPoint(time+' · janela de '+gap);advance(3,'Ponto escolhido: '+time);}}><Database/><b>{time}</b><span>{status}</span><small>Janela possível: {gap}</small></button>)}</div>}
  {step===3&&<div className="sim-checklist"><h3>{point}</h3><label><input type="checkbox" checked={validated} onChange={e=>setValidated(e.target.checked)}/>Integridade da cópia validada nesta hipótese</label><label><input type="checkbox" checked={clean} onChange={e=>setClean(e.target.checked)}/>Destino disponível e adequado; dependências verificadas</label><button className="sim-target" disabled={!validated||!clean} onClick={()=>advance(4,'Restauração ilustrativa concluída no destino validado')}><Database/>Restaurar {backupMode==='service'?'serviço':'pasta'}<small>Tempo comprimido para demonstração</small></button></div>}
  {step===4&&<><div className="sim-notice good">Dados restaurados no exercício. Validação funcional pendente.</div>{button(backupMode==='service'?'Abrir aplicação e conferir os dados':'Abrir pasta e conferir os arquivos',5,'Responsável validou funcionamento e dados no exercício',<CheckCircle2/>)}</>}
  {step===5&&<div className="sim-event"><h3>Operação retomada no exercício</h3><p>Ponto utilizado: {point}.</p><p>A janela de dados precisa ser reconciliada. O tempo mostrado não representa RTO contratado ou comprovado.</p><p>Tolerâncias informadas: parada {p.backupMaxAcceptableDowntime||'a confirmar'}; perda {p.backupMaxAcceptableDataLoss||'a confirmar'}.</p></div>}
  <p className="v3-footnote">Restaurar uma pasta, uma máquina e uma aplicação exige procedimentos diferentes. O cenário de serviço pressupõe cópia do servidor e dependências conhecidas. Não representa restauração universal em um clique.</p></>;
 }
 return <section className="v3-stage guided-simulation"><span className="v3-kicker">LABORATÓRIO GUIADO · CENÁRIO FICTÍCIO</span><h2>{title}</h2><div className="sim-toolbar">
 {module==='firewall'&&<label>Cenário <select value={variant} onChange={e=>{setVariant(e.target.value);reset();}}><option value="traffic">Conexão com destino malicioso</option><option value="availability">Disponibilidade do firewall</option></select></label>}
 {module==='endpoint'&&<label>Desfecho <select value={protectedBranch?'protected':'impact'} onChange={e=>{setProtectedBranch(e.target.value==='protected');reset();}}><option value="impact">Hipótese: ataque não interrompido</option><option value="protected">Hipótese: intervenção da proteção</option></select></label>}
 {module==='backup'&&<label>Cenário <select value={backupMode} onChange={e=>{setBackupMode(e.target.value);reset();}}><option value="service">Parada do serviço</option><option value="file">Exclusão de pasta</option></select></label>}
 <button className="v3-text-btn" onClick={reset}><RotateCcw size={15}/>Reiniciar</button></div>
 <div className="sim-reality"><b>Informado pelo cliente:</b> {module==='firewall'?variant==='availability'?'HA: '+label('ha',f.ha):'Proteção de rede: '+label('firewall',f.firewall):module==='endpoint'?label('protection',f.protection)+' · resposta: '+label('response',f.response):'Backup: '+label('backup',f.backup)+' · recuperação testada: '+label('tested',f.tested)}. As hipóteses abaixo não alteram essas respostas.</div>
 <div className="sim-desktop" aria-label="Ambiente simulado"><div className="sim-window-bar"><span>● ● ●</span><b>{workplace}</b><small>SIMULAÇÃO</small></div><div className="sim-screen">{content}</div></div>
 <div className="sim-guide" aria-live="polite"><b>Etapa {step+1}</b><p>{explain}</p></div>
 <div className="v3-actions"><button className="v3-btn secondary" disabled={!backStack.length} onClick={()=>{setStep(backStack[backStack.length-1]);setBackStack(s=>s.slice(0,-1));setHistory(h=>h.slice(0,-1));}}>Voltar uma ação</button>{module==='endpoint'&&step>=5&&!protectedBranch&&<button className="v3-btn" onClick={()=>{setProtectedBranch(true);setStep(2);setHistory(['Retorno ao momento anterior à execução']);setBackStack([]);}}>Comparar com intervenção na execução</button>}</div>
 <details className="v3-references"><summary>Registro das ações do exercício</summary>{history.length?history.map((h,i)=><p key={i}>{h}</p>):<p>Execute a primeira ação no ambiente simulado.</p>}</details><References technical/>
 </section>;
}
