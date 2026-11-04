import {useEffect, useState} from 'react';
import {
  ArrowLeft, ArrowRight, Check, ExternalLink, FileText, Headphones,
  LockKeyhole, Mail, Monitor, Phone, Users,
} from 'lucide-react';
import type {Profile} from '../context/ProfileContext';
import shieldArt from './assets/escudo-onboarding.png';
import './onboarding-presentation.css';

type Service = 'firewall'|'endpoint'|'backup'|'mindset';
type Sla = 'ouro'|'prata'|'bronze';
export type OnboardingConfig = {service:Service; sla:Sla; equipment:string};
type Props = {profile:Profile; config:OnboardingConfig; setConfig:(key:keyof OnboardingConfig,value:string)=>void; presenting:boolean; onStart:()=>void; onExit:()=>void};
const topics=['Boas-vindas','Resumo do contrato','Como abrir um chamado','Canais de atendimento','SLA de atendimento','Definições importantes','Informações de cadastro','Conte com a Concierge'];
const titles:Record<Service,string>={firewall:'Concierge Firewall',endpoint:'Concierge Endpoint',backup:'Concierge Backup',mindset:'Concierge Mindset'};
const slaData:Record<Sla,{s1:[string,string,string];s2:[string,string];s3:[string,string];}>={
 ouro:{s1:['Incidentes: 2h','Solicitações: 6h','8h às 18h'],s2:['Incidentes: 4h','Solicitações: 6h'],s3:['Capitais e RM: 8h','Interior: 6h']},
 prata:{s1:['Incidentes: 4h','Solicitações: 8h','8h às 18h'],s2:['Incidentes: 8h','Solicitações: 8h'],s3:['Capitais e RM: 16h','Interior: 8h']},
 bronze:{s1:['Incidentes: 8h','Solicitações: 16h','8h às 18h'],s2:['Incidentes: 16h','Solicitações: 16h'],s3:['Capitais e RM: 24h','Interior: 16h']},
};
const channels=[
 {name:'Portal do cliente',value:'qostecnologia.desk.ms',href:'https://qostecnologia.desk.ms',description:'Canal preferencial para abrir e acompanhar chamados a qualquer hora.'},
 {name:'WhatsApp',value:'(81) 3194-2020',href:'https://wa.me/558131942020',description:'Dúvidas gerais, de segunda a sexta, das 8h às 18h.'},
 {name:'E-mail',value:'suporte@qostecnologia.com.br',href:'mailto:suporte@qostecnologia.com.br',description:'Abertura e acompanhamento de chamados.'},
 {name:'Telefone',value:'(81) 3194-2020',href:'tel:+558131942020',description:'Dúvidas gerais, de segunda a sexta, das 8h às 18h.'},
 {name:'Plantão crítico',value:'(81) 3194-2029',href:'tel:+558131942029',description:'Atendimento emergencial 24x7 para casos críticos.'},
];
const supportIcon=(i:number)=>i===0?<Monitor size={23}/>:i===1?<Phone size={23}/>:i===2?<Mail size={23}/>:i===3?<Phone size={23}/>:<Headphones size={23}/>;

export default function ConciergeOnboarding({profile,config,setConfig,presenting,onStart,onExit}:Props){
 const [slide,setSlide]=useState(0);
 useEffect(()=>{if(presenting)setSlide(0);},[presenting]);
 useEffect(()=>{
  if(!presenting)return;
  const handler=(e:KeyboardEvent)=>{
   if(['INPUT','TEXTAREA','SELECT'].includes((e.target as HTMLElement)?.tagName))return;
   if(e.key==='ArrowRight'){e.preventDefault();setSlide(v=>Math.min(7,v+1));}
   if(e.key==='ArrowLeft'){e.preventDefault();setSlide(v=>Math.max(0,v-1));}
   if(e.key==='Escape'){e.preventDefault();onExit();}
  };
  window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);
 },[presenting,onExit]);
 const name=profile.companyName||'Sua empresa';
 const mark=<div className="obd-client-mark">{profile.companyLogo?<img src={profile.companyLogo} alt={`Logo de ${name}`}/>:<strong>{name}</strong>}</div>;
 const equipment=config.equipment.trim()||'A confirmar';
 const service=titles[config.service];
 const plan=config.sla.toUpperCase();
 const sla=slaData[config.sla];
 const page=(i:number)=>{
  switch(i){
   case 0:return <div className="obd-cover"><img className="obd-art" src={shieldArt} alt=""/>{mark}<div className="obd-eyebrow">CONCIERGE SEGURANÇA DIGITAL</div><h1>Bem-vindo à<br/><em>Concierge<br/>Segurança Digital.</em></h1><p>Segurança e acompanhamento para a operação de {name}.</p><div className="obd-benefits"><span><Check size={18}/> Monitoramento especializado 24x7</span><span><Check size={18}/> Atendimento humanizado</span><span><Check size={18}/> Tecnologia de ponta</span><span><Check size={18}/> Proteção contínua</span></div><small>Empresa do Grupo QOS Tecnologia · concierge.seg.br</small></div>;
   case 1:return <><div className="obd-eyebrow">SEU CONTRATO</div><h1>Resumo do contrato</h1><p className="obd-lead">Informações do serviço firmado entre a Concierge Segurança Digital e {name}.</p><div className="obd-summary"><article><b>01</b><div><small>Solução contratada</small><strong>{service}</strong></div></article><article><b>02</b><div><small>Equipamento ou solução</small><strong>{equipment}</strong><span>Gerenciamento, monitoramento 24x7, suporte e relatórios conforme contrato.</span></div></article><article><b>03</b><div><small>Plano de atendimento</small><strong>SLA {plan}</strong></div></article></div></>;
   case 2:return <><div className="obd-eyebrow">ATENDIMENTO</div><h1>Como abrir um chamado</h1><p className="obd-lead">Quatro passos para solicitar atendimento e acompanhar o andamento.</p><div className="obd-grid two">{[
    ['01','Abra seu chamado','Entre em contato por um dos nossos canais oficiais.',name],
    ['02','Informe o problema','Descreva sua solicitação e o que está acontecendo no ambiente.',name],
    ['03','Nossa equipe analisa','A equipe avalia a demanda e inicia o tratamento especializado.','CONCIERGE'],
    ['04','Retorno conforme SLA','Você recebe o atendimento de acordo com o plano contratado.','CONCIERGE'],
   ].map(([n,t,d,owner])=><article className="obd-card obd-step" key={n}><b>{n}</b><h3>{t}</h3><p>{d}</p><small>{owner}</small></article>)}</div></>;
   case 3:return <><div className="obd-eyebrow">FALE COM A EQUIPE</div><h1>Canais de atendimento</h1><p className="obd-lead">Use os canais oficiais para abrir chamados ou falar com a equipe.</p><div className="obd-grid obd-channels">{channels.map((c,i)=><article key={c.name} className={`obd-card ${i===0?'obd-preferred':''}`}><div className="obd-channel-icon">{supportIcon(i)}</div><h3>{c.name}</h3><a href={c.href} target="_blank" rel="noreferrer">{c.value} <ExternalLink size={14}/></a><p>{c.description}</p></article>)}</div><div className="obd-note"><strong>Escalonamento operacional</strong> Távia Sirino, Gestão de Incidentes: tavia.Sirino@qostecnologia.com.br, (81) 98129-1263 | Josilene Soares, Gestão de Operações: Josilene@qostecnologia.com.br, (81) 98131-3680</div></>;
   case 4:return <><div className="obd-eyebrow">PRAZOS DO CONTRATO</div><h1>SLA de atendimento</h1><div className="obd-sla-top"><span className={`obd-sla-pill ${config.sla}`}>{plan}</span><strong>Atendimento inicial de solicitações e incidentes: 30 minutos</strong></div><div className="obd-grid three">{[{name:'Severidade 1',arr:sla.s1},{name:'Severidade 2',arr:[...sla.s2,'8h às 18h']},{name:'Severidade 3',arr:[...sla.s3,'8h às 18h']}].map(x=><article className="obd-card obd-sla-card" key={x.name}><small>Tempo de solução</small><h2>{x.name}</h2>{x.arr.map(v=><p key={v}>{v}</p>)}</article>)}</div><div className="obd-note">Horário de atendimento: incidentes 24x7 | Solicitações 9x5.</div><p className="obd-legal">Prazos reproduzidos do onboarding de referência. Confirme sua aplicação e condições no contrato vigente.</p></>;
   case 5:return <><div className="obd-eyebrow">ENTENDA A DEMANDA</div><h1>Definições importantes</h1><p className="obd-lead">Diferenciar incidente de solicitação ajuda a encaminhar a demanda corretamente.</p><div className="obd-grid two"><article className="obd-card obd-definition"><h2>Incidente</h2><p>Evento não planejado que degrada ou interrompe a operação ou afeta a segurança de um serviço.</p><h3>Exemplos</h3><ul><li>Queda de conexão causada por falha na borda.</li><li>Tráfego malicioso ou tentativa de invasão.</li><li>Bloqueio indevido de um serviço essencial.</li><li>Falha em atualização crítica de segurança.</li></ul></article><article className="obd-card obd-definition"><h2>Solicitação de serviço</h2><p>Demanda planejada ou mudança de configuração que não decorre de falha ou interrupção.</p><h3>Exemplos</h3><ul><li>Alteração de regra de acesso.</li><li>Criação ou ajuste de VPN.</li><li>Geração de relatórios de tráfego ou eventos.</li><li>Ajuste de política de filtragem.</li></ul></article></div><div className="obd-note">Atendimento de incidentes: 24x7 | Solicitações: 9x5.</div></>;
   case 6:return <><div className="obd-eyebrow">RESPONSÁVEIS E RELATÓRIOS</div><h1>Informações de cadastro</h1><p className="obd-lead">Para organizar os chamados e a comunicação operacional, precisamos indicar os contatos responsáveis.</p><div className="obd-grid two"><article className="obd-card obd-registration"><Users size={26}/><h2>Responsáveis por chamados</h2><p>Para cada pessoa autorizada a abrir e acompanhar chamados:</p><div className="obd-field-labels"><span>Nome completo</span><span>Telefone</span><span>E-mail</span></div><small>É importante que quem abre um chamado acompanhe a continuidade, evitando solicitações duplicadas.</small></article><article className="obd-card obd-registration"><FileText size={26}/><h2>Destinatários dos relatórios</h2><p>Indique as pessoas que deverão receber relatórios e comunicados:</p><div className="obd-field-labels"><span>Nome completo</span><span>Telefone</span><span>E-mail</span></div><small>Recomendamos mais de um destinatário para o recebimento dos relatórios.</small></article></div><div className="obd-note">O responsável pela empresa deve enviar esses dados por e-mail para o canal de atendimento informado.</div></>;
   default:return <div className="obd-cover obd-close"><img className="obd-art" src={shieldArt} alt=""/>{mark}<div className="obd-eyebrow">CONCIERGE SEGURANÇA DIGITAL</div><h1>Estamos prontos<br/>para proteger o que<br/><em>é mais importante<br/>para você.</em></h1><p>Conte com nossa equipe sempre que precisar.</p><strong>Obrigado pela confiança!</strong><small>Seja bem-vindo à Concierge Segurança Digital.</small></div>;
  }
 };
 return <div className={`obd-shell ${presenting?'obd-presenting':'obd-preparing'}`}>
  {!presenting&&<section className="obd-setup"><div className="obd-eyebrow">ANTES DE COMEÇAR</div><h1>Cada cliente.<br/><em>Uma apresentação própria.</em></h1><p>O nome e a logo de {name} já vêm do cadastro realizado no início da conversa.</p><div className="obd-setup-identity">{mark}<strong>{name}</strong><small>Para atualizar nome ou logo, volte a Preparar o cliente.</small></div><div className="obd-setup-fields"><label>Solução Concierge<select value={config.service} onChange={(e:{target:{value:string}})=>setConfig('service',e.target.value)}><option value="firewall">Firewall</option><option value="endpoint">Endpoint</option><option value="backup">Backup</option><option value="mindset">Mindset</option></select></label><label>SLA contratado<select value={config.sla} onChange={(e:{target:{value:string}})=>setConfig('sla',e.target.value)}><option value="ouro">Ouro</option><option value="prata">Prata</option><option value="bronze">Bronze</option></select></label><label className="obd-wide">Equipamento ou solução contratada<input maxLength={160} value={config.equipment} onChange={(e:{target:{value:string}})=>setConfig('equipment',e.target.value)} placeholder="Ex.: SonicWall TZ280 + APSS"/></label></div><div className="obd-contract-warning"><LockKeyhole size={20}/><p>Confira equipamento, nível de SLA e respectivos prazos no contrato vigente antes de compartilhar esta apresentação.</p></div><button type="button" className="obd-start" onClick={onStart}>Iniciar onboarding personalizado <ArrowRight size={18}/></button></section>}
  <section className="obd-deck" aria-label="Apresentação de onboarding"><div className="obd-stage-meta"><span>{topics[slide].toUpperCase()}</span><span>{presenting?'APRESENTAÇÃO':'PRÉVIA AO VIVO'} <strong>{String(slide+1).padStart(2,'0')} / 08</strong></span></div><article className="obd-slide">{page(slide)}</article><div className="obd-footer"><button type="button" aria-label="Slide anterior" onClick={()=>setSlide(v=>Math.max(0,v-1))} disabled={slide===0}><ArrowLeft size={21}/></button><nav aria-label="Capítulos do onboarding" className="obd-progress">{topics.map((t,i)=><button type="button" key={t} className={i===slide?'active':i<slide?'done':''} title={t} aria-label={t} aria-current={i===slide?'step':undefined} onClick={()=>setSlide(i)}/>)}</nav><button type="button" onClick={()=>slide===7?onExit():setSlide(v=>Math.min(7,v+1))}>{slide===7?'Concluir':'Próximo'} <ArrowRight size={19}/></button></div><p className="obd-hint">{presenting?'Use as setas do teclado para navegar. Esc retorna à preparação.':'Navegue pelos capítulos para conferir a prévia.'}</p></section>
  {presenting&&<div className="obd-print">{topics.map((_,i)=><section key={i} className="obd-print-page">{page(i)}</section>)}</div>}
 </div>;
}
