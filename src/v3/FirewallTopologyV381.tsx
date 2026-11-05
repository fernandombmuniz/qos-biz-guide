import {useCallback, useEffect, useRef, useState} from 'react';
import {Building2, Cable, Database, Globe2, KeyRound, Laptop, Monitor, Network, RadioTower, Shield, Wifi} from 'lucide-react';
import type {Profile} from '../context/ProfileContext';
import type {Facts} from './model';
import './firewall-topology-v381.css';

type DiagramNode={id:string;label:string;value:string;detail:string;status:'good'|'attention'|'unknown';why:string;validate:string[]};
type Props={profile:Profile;facts:Facts;nodes:DiagramNode[];selectedId:string;setSelectedId:(id:string)=>void};
type CablePath={key:string;path:string;dashed?:boolean;from?:{x:number;y:number};to?:{x:number;y:number}};
const number=(value:unknown)=>{const n=Number(value);return Number.isFinite(n)&&n>0?Math.floor(n):0;};
const value=(v:unknown,fall='A confirmar')=>String(v??'').trim()||fall;

export default function FirewallTopologyV381({profile,facts,nodes,selectedId,setSelectedId}:Props){
  const links=((profile as any).internetLinks||[]).filter((x:any)=>x?.provider||x?.speed) as Array<{provider?:string;speed?:string}>;
  const switches=number((profile as any).switchCount);
  const aps=number((profile as any).apQuantity);
  const vlans=number((profile as any).vlanCount);
  const ssl=number((facts as any).sslUsers);
  const ipsec=number((facts as any).ipsecTunnels);
  const vlanNames=String((profile as any).vlanNames||'').split(',').map(x=>x.trim()).filter(Boolean);
  const vlanPreview=(vlanNames.length?vlanNames:Array.from({length:Math.min(vlans,5)},(_,i)=>`VLAN ${i+1}`)).slice(0,6);
  const apsVisible=Array.from({length:Math.min(aps,8)},(_,i)=>i+1);
  const hasLinkData=links.length>0;
  const hasSwitchData=switches>0;
  const hasApData=aps>0;
  const hasVlanData=vlans>0||vlanNames.length>0;
  const vpnClientKnown=(facts.hasClientVpn==='yes'||facts.vpn==='yes')&&facts.sslUsers!==undefined&&String(facts.sslUsers).trim()!=='';
  const vpnSiteKnown=(facts.hasSiteVpn==='yes'||facts.vpn==='yes')&&facts.ipsecTunnels!==undefined&&String(facts.ipsecTunnels).trim()!=='';
  const perimeter=value((profile as any).firewallModel,'Equipamento a confirmar');
  const container=useRef<HTMLDivElement>(null);
  const linkRefs=useRef<Array<HTMLButtonElement|null>>([]);
  const edgeRef=useRef<HTMLButtonElement>(null);
  const edgeHardwareRef=useRef<HTMLDivElement>(null);
  const vpnRef=useRef<HTMLButtonElement>(null);
  const switchRef=useRef<HTMLButtonElement>(null);
  const switchHardwareRef=useRef<HTMLDivElement>(null);
  const vlanRef=useRef<HTMLButtonElement>(null);
  const vlanChipsRef=useRef<HTMLDivElement>(null);
  const apRef=useRef<HTMLButtonElement>(null);
  const apListRef=useRef<HTMLDivElement>(null);
  const [paths,setPaths]=useState<CablePath[]>([]);
  const [size,setSize]=useState({w:0,h:0});

  const measure=useCallback(()=>{
    const root=container.current;
    if(!root)return;
    const host=root.getBoundingClientRect();
    const box=(el:HTMLElement|null)=>{
      if(!el)return null;
      const r=el.getBoundingClientRect();
      return {l:r.left-host.left,r:r.right-host.left,t:r.top-host.top,b:r.bottom-host.top,cx:r.left-host.left+r.width/2,cy:r.top-host.top+r.height/2};
    };
    const renderedLinks=linkRefs.current.slice(0,Math.max(links.length,1)).map(box).filter((v):v is NonNullable<typeof v>=>v!==null);
    const edge=box(edgeHardwareRef.current),vpn=box(vpnRef.current),sw=box(switchHardwareRef.current),vlan=box(vlanChipsRef.current),ap=box(apListRef.current);
    const chip=box(vlanChipsRef.current?.querySelector<HTMLElement>('span')||null);
    const apIcons=Array.from(apListRef.current?.querySelectorAll<HTMLElement>('.netv381-ap > i')||[]).map(box).filter((v):v is NonNullable<typeof v>=>v!==null);
    const apTarget=box(apListRef.current?.querySelector<HTMLElement>('.netv381-placeholder')||null);
    setSize({w:Math.ceil(host.width),h:Math.ceil(host.height)});
    if(!renderedLinks.length||!edge||!vpn||!sw||!vlan||!ap)return;
    const route=(a:{x:number;y:number},b:{x:number;y:number},offset=0)=>{
      const mid=a.y+(b.y-a.y)*.5+offset;
      return `M ${a.x} ${a.y} L ${a.x} ${mid} L ${b.x} ${mid} L ${b.x} ${b.y}`;
    };
    const result:CablePath[]=(hasLinkData?renderedLinks:[]).map((link,index)=>{
      const source={x:link.cx,y:link.b};
      if(index===1){
        // The 5G link enters the top-right of the visible chassis, not its side.
        // Its approach stays to the right of the perimeter label.
        const target={x:edge.r-24,y:edge.t};
        const turnY=Math.max(source.y+14,target.y-17);
        const path=`M ${source.x} ${source.y} L ${source.x} ${turnY} L ${target.x} ${turnY} L ${target.x} ${target.y}`;
        return {key:`internet-${index}`,path,from:source,to:target};
      }
      const target={x:edge.l,y:edge.cy};
      const outerX=edge.l-16-index*8;
      const bridgeY=source.y+Math.max(12,Math.min(24,(edge.cy-source.y)*.28));
      const path=`M ${source.x} ${source.y} L ${source.x} ${bridgeY} L ${outerX} ${bridgeY} L ${outerX} ${target.y} L ${target.x} ${target.y}`;
      return {key:`internet-${index}`,path,from:source,to:target};
    });
    // Connections terminate at equipment and visible access icons, never the
    // invisible layout boundaries that remain after card backgrounds are removed.
    result.push({key:'distribution',path:route({x:edge.cx,y:edge.b},{x:sw.cx,y:sw.t}),from:{x:edge.cx,y:edge.b},to:{x:sw.cx,y:sw.t}});
    if(chip){
      const start={x:sw.cx-42,y:sw.b};
      const target={x:chip.l,y:chip.cy};
      const outsideX=chip.l-16;
      const transferY=Math.min(start.y+20,chip.t-48);
      result.push({key:'vlan',path:`M ${start.x} ${start.y} L ${start.x} ${transferY} L ${outsideX} ${transferY} L ${outsideX} ${target.y} L ${target.x} ${target.y}`,from:start,to:target});
    }
    if(apIcons.length){
      const first=apIcons[0],last=apIcons[apIcons.length-1];
      const start={x:sw.cx+42,y:sw.b};
      const busY=first.t-13;
      const transferY=Math.min(start.y+20,busY-12);
      const outsideX=Math.min(host.width-5,Math.max(last.r+15,start.x+10));
      result.push({key:'access',path:`M ${start.x} ${start.y} L ${start.x} ${transferY} L ${outsideX} ${transferY} L ${outsideX} ${busY} L ${first.cx} ${busY} L ${first.cx} ${first.t}`,from:start,to:{x:first.cx,y:first.t}});
      apIcons.slice(1).forEach((unit,index)=>{
        result.push({key:`access-ap-${index+2}`,path:`M ${unit.cx} ${busY} L ${unit.cx} ${unit.t}`,to:{x:unit.cx,y:unit.t}});
      });
    }else if(apTarget){
      const start={x:sw.cx+42,y:sw.b},target={x:apTarget.r,y:apTarget.cy};
      const outsideX=Math.min(host.width-6,apTarget.r+16);
      const turnY=Math.min(start.y+20,apTarget.t-30);
      result.push({key:'access',path:`M ${start.x} ${start.y} L ${start.x} ${turnY} L ${outsideX} ${turnY} L ${outsideX} ${target.y} L ${target.x} ${target.y}`,from:start,to:target});
    }
    const vpnEdge=box(edgeRef.current);
    if(vpnEdge&&vpn.l>vpnEdge.r){
      const mid=(vpnEdge.r+vpn.l)/2;
      result.push({key:'vpn',dashed:true,path:`M ${edge.r} ${edge.cy} L ${mid} ${edge.cy} L ${mid} ${vpn.cy} L ${vpn.l} ${vpn.cy}`});
    }
    setPaths(result);
  },[hasLinkData]);

  useEffect(()=>{
    let frame=0;
    const refresh=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);};
    const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(refresh):null;
    [container,edgeRef,edgeHardwareRef,vpnRef,switchRef,switchHardwareRef,vlanRef,vlanChipsRef,apRef,apListRef].forEach(ref=>{if(ref.current)observer?.observe(ref.current);});
    linkRefs.current.forEach(el=>{if(el)observer?.observe(el);});
    window.addEventListener('resize',refresh);
    refresh();
    return()=>{cancelAnimationFrame(frame);observer?.disconnect();window.removeEventListener('resize',refresh);};
  },[measure,links.length,aps,vlans,switches,profile.internetLinks]);

  const select=(i:number)=>setSelectedId(nodes[i].id);
  return <div className="netv381" ref={container}>
    <div className="netv381-heading"><span><Network size={17}/> VISÃO LÓGICA DA REDE</span><small>Informações declaradas pelo cliente</small></div>
    <svg className="netv381-wires" viewBox={`0 0 ${Math.max(1,size.w)} ${Math.max(1,size.h)}`} aria-hidden="true">
      {paths.map(c=><g key={c.key}><path className={`netv381-cable ${c.dashed?'dashed':''}`} d={c.path}/><path className={`netv381-pulse ${c.dashed?'dashed':''}`} d={c.path}/>{c.from&&<circle className="netv381-terminal" cx={c.from.x} cy={c.from.y} r={4}/>} {c.to&&<circle className="netv381-terminal" cx={c.to.x} cy={c.to.y} r={4}/>}<circle className={`netv381-packet ${c.dashed?'dashed':''}`} r={c.key.startsWith('internet')?4:3}><animateMotion dur={c.key.startsWith('internet')?'2.5s':'3.1s'} repeatCount="indefinite" path={c.path}/></circle></g>)}
    </svg>

    <div className="netv381-internet">
      <div className="netv381-internet-head">
        <div className="netv381-label"><Globe2 size={16}/><span>Conectividade externa</span></div>
      </div>
      <div className="netv381-links">{(links.length?links:[{provider:'Link a confirmar',speed:'Velocidade a confirmar'}]).map((item,i)=><button ref={el=>{linkRefs.current[i]=el;}} key={i} className={`netv381-link ${selectedId===nodes[0].id?'chosen':''}`} type="button" onClick={()=>select(0)}><span className="netv381-link-icon">{/5g|móvel|movel|mobile/i.test(`${item.provider||''} ${item.speed||''}`)?<RadioTower size={22}/>:<Globe2 size={22}/>}</span><b>{value(item.provider,'Operadora')}</b><small>{value(item.speed,'Velocidade a confirmar')}</small><span className="netv381-link-port" aria-hidden="true"/><i/></button>)}</div>
    </div>

    <button ref={edgeRef} type="button" className={`netv381-device netv381-edge ${selectedId===nodes[1].id?'chosen':''}`} onClick={()=>select(1)}>
      <div className="netv381-label"><Shield size={17}/><span>Borda e segurança</span></div>
      <strong>{perimeter}</strong>
      <div ref={edgeHardwareRef} className="netv381-appliance"><div className="netv381-device-leds"><i/><i/><i/></div><div className="netv381-device-ports">{Array.from({length:8},(_,i)=><i key={i}/>)}</div><span>EDGE</span></div>
      <small>{nodes[1].detail}</small>
    </button>

    <button ref={vpnRef} type="button" className={`netv381-vpn ${selectedId===nodes[3].id?'chosen':''}`} onClick={()=>select(3)}>
      <div className="netv381-label"><KeyRound size={17}/><span>Acesso remoto</span></div>
      <strong>VPN</strong>
      <div className="netv381-vpn-flow"><div className="netv381-vpn-clients"><Laptop size={20}/><Monitor size={20}/><Laptop size={20}/></div><span><i/><i/><i/></span><Shield size={18}/><span><i/><i/><i/></span><div className="netv381-vpn-target"><Building2 size={20}/><Monitor size={18}/></div></div>
      <div className="netv381-vpn-count"><span><b>{vpnClientKnown?ssl:'Pendente'}</b><small>SSL VPN</small></span><span><b>{vpnSiteKnown?ipsec:'Pendente'}</b><small>IPsec</small></span></div>
      <small>{vpnClientKnown||vpnSiteKnown?'Acesso lógico ilustrativo, sem confirmar caminhos físicos':'Volumes de VPN ainda não informados'}</small>
    </button>

    <button ref={switchRef} type="button" className={`netv381-device netv381-switch ${selectedId===nodes[4].id?'chosen':''}`} onClick={()=>select(4)}>
      <div className="netv381-label"><Cable size={17}/><span>Distribuição / acesso</span></div>
      <strong>{hasSwitchData?`${switches} switch${switches>1?'es':''}`:'Switches: não informado'}</strong>
      <div ref={switchHardwareRef} className={`netv381-switch-hardware ${!hasSwitchData?'netv381-hardware-unknown':''}`}><div className="netv381-switch-ports">{Array.from({length:12},(_,i)=><i key={i}/>)}</div><div className="netv381-switch-footer"><span>{hasSwitchData?'SW 01 · desenho ilustrativo':'Equipamento ilustrativo'}</span><span>{switches>1?`+${switches-1} informados`:hasSwitchData?'Modelo a confirmar':'Quantidade pendente'}</span></div></div>
    </button>

    <button ref={vlanRef} type="button" className={`netv381-leaf netv381-vlan ${selectedId===nodes[2].id?'chosen':''}`} onClick={()=>select(2)}>
      <div className="netv381-label"><Database size={17}/><span>01 · Segmentação</span></div><strong>{nodes[2].value}</strong>
      <div ref={vlanChipsRef} className={`netv381-chips ${!hasVlanData?'netv381-unknown-zone':''}`}>{vlanPreview.length?vlanPreview.map((name,i)=><span key={i}>{name}</span>):<span className="netv381-placeholder">Quantidade não informada</span>}{Math.max(vlans,vlanNames.length)>6&&<span>+{Math.max(vlans,vlanNames.length)-6}</span>}</div>
      <small>{hasVlanData?'Redes declaradas, sem inferir caminhos físicos':'Segmentação ainda não levantada'}</small>
    </button>

    <button ref={apRef} type="button" className={`netv381-leaf netv381-wireless ${selectedId===nodes[4].id?'chosen':''}`} onClick={()=>select(4)}>
      <div className="netv381-label"><Wifi size={17}/><span>02 · Acesso sem fio</span></div><strong>{nodes[4].value}</strong>
      <div ref={apListRef} className={`netv381-aps ${!hasApData?'netv381-unknown-zone':''}`}>{apsVisible.length?apsVisible.map(i=><span className="netv381-ap" key={i}><i><Wifi size={20}/></i><small>AP {String(i).padStart(2,'0')}</small></span>):<span className="netv381-placeholder"><Wifi size={19}/> Quantidade não informada</span>}{aps>8&&<span className="netv381-ap more">+{aps-8}</span>}</div>
      <small>{hasApData?'Distribuição física a validar':'APs ainda não levantados'}</small>
    </button>

    <div className="netv381-note"><span><i/> Fluxo lógico ilustrativo</span><span>Conexões pontilhadas representam VPN</span><span>Sem IPs, descoberta ou cabeamento confirmado</span></div>
  </div>;
}
