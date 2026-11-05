import './FirewallNetworkMap.css';
import { Globe2, KeyRound, Layers3, Network, RadioTower, Router, Shield, Wifi } from 'lucide-react';
import type { Profile } from '../context/ProfileContext';
import type { Facts } from './model';

type NodeView = {
  id: string;
  label: string;
  value: string;
  detail: string;
  status: 'good' | 'attention' | 'unknown';
};

type Props = {
  nodes: NodeView[];
  selectedId: string;
  onSelect: (id: string) => void;
  profile: Profile;
  facts: Facts;
};

const known = (input: unknown) => String(input ?? '').trim();
const amount = (input: unknown) => {
  const value = Number(input);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
};

function MiniApCluster({ total }: { total: number }) {
  if (!total) return <span className="fnm-empty-unit">APs a confirmar</span>;
  const visible = Math.min(total, 12);
  return <div className="fnm-ap-cluster" aria-label={`${total} pontos de acesso informados`}>
    {Array.from({ length: visible }, (_, i) => <span className="fnm-ap-dot" key={i} title={`AP ${String(i + 1).padStart(2, '0')} (representação ilustrativa)`}><Wifi size={15} strokeWidth={2} /><small>{String(i + 1).padStart(2, '0')}</small></span>)}
    {total > visible && <span className="fnm-extra">+{total - visible}</span>}
  </div>;
}

function MiniSwitchCluster({ total }: { total: number }) {
  if (!total) return <span className="fnm-empty-unit">Switches a confirmar</span>;
  const visible = Math.min(total, 3);
  return <div className="fnm-switch-cluster" aria-label={`${total} switches informados`}>
    {Array.from({ length: visible }, (_, i) => <span className="fnm-switch-unit" key={i} title={`Switch ${i + 1} (representação ilustrativa)`}>
      <span className="fnm-switch-ports">{Array.from({ length: 8 }, (_, port) => <i key={port} />)}</span>
      <small>SW {String(i + 1).padStart(2, '0')}</small>
    </span>)}
    {total > visible && <span className="fnm-extra">+{total - visible}</span>}
  </div>;
}

export default function FirewallNetworkMap({ nodes, selectedId, onSelect, profile, facts }: Props) {
  const links = profile.internetLinks.filter(link => known(link.provider) || known(link.speed));
  const apCount = amount(profile.apQuantity);
  const switchCount = amount(profile.switchCount);
  const vlanCount = amount(profile.vlanCount);
  const sslCount = amount(facts.sslUsers);
  const ipsecCount = amount(facts.ipsecTunnels);
  const sslKnown = known(facts.sslUsers) !== '' || profile.vpnRemoteAccess > 0;
  const ipsecKnown = known(facts.ipsecTunnels) !== '' || profile.vpnSiteToSite > 0;
  const device = known(profile.firewallModel) || known(profile.firewallTypeOther) || known(profile.firewallType) || 'Equipamento a confirmar';
  const brandSwitch = [known(profile.switchBrand), known(profile.switchModel)].filter(Boolean).join(' · ');
  const brandAp = [known(profile.apBrand), known(profile.apModel)].filter(Boolean).join(' · ');
  const selectedClass = (id: string) => selectedId === id ? ' is-active' : '';
  const select = (id: string) => () => onSelect(id);

  return <div className="fnm-map" aria-label="Representação lógica do ambiente de rede informado pelo cliente">
    <div className="fnm-titlebar">
      <span><Network size={16} /> VISÃO LÓGICA DA REDE</span>
      <small>Informações declaradas pelo cliente</small>
    </div>

    <button type="button" className={`fnm-zone fnm-internet${selectedClass(nodes[0].id)}`} onClick={select(nodes[0].id)} aria-pressed={selectedId === nodes[0].id}>
      <div className="fnm-zone-heading"><span className="fnm-icon"><Globe2 size={21}/></span><div><small>CONECTIVIDADE EXTERNA</small><strong>{nodes[0].value}</strong></div></div>
      <div className="fnm-providers">
        {links.length ? links.map((link, i) => <span className="fnm-provider" key={i}><b>{known(link.provider) || `Link ${i + 1}`}</b><small>{known(link.speed) || 'Velocidade a confirmar'}</small></span>) : <span className="fnm-placeholder">Operadoras e velocidades a confirmar</span>}
      </div>
    </button>
    <div className="fnm-trunk" aria-hidden="true"><i/></div>

    <div className="fnm-perimeter-row">
      <button type="button" className={`fnm-zone fnm-perimeter${selectedClass(nodes[1].id)}`} onClick={select(nodes[1].id)} aria-pressed={selectedId === nodes[1].id}>
        <div className="fnm-zone-heading"><span className="fnm-icon"><Shield size={22}/></span><div><small>BORDA / ROTEAMENTO / SEGURANÇA</small><strong>{device}</strong></div></div>
        <div className="fnm-appliance" aria-hidden="true"><span className="fnm-appliance-led"/><span className="fnm-appliance-ports">{Array.from({ length: 7 }, (_, i) => <i key={i}/>)}</span><span className="fnm-appliance-led fnm-appliance-led-last"/></div>
        <span className="fnm-card-caption">{nodes[1].detail}</span>
      </button>
      <button type="button" className={`fnm-zone fnm-vpn${selectedClass(nodes[3].id)}`} onClick={select(nodes[3].id)} aria-pressed={selectedId === nodes[3].id}>
        <div className="fnm-zone-heading"><span className="fnm-icon"><KeyRound size={20}/></span><div><small>ACESSO REMOTO</small><strong>VPN</strong></div></div>
        <div className="fnm-vpn-counters"><span><b>{sslKnown ? String(sslCount || profile.vpnRemoteAccess || 0) : '?'}</b><small>SSL VPN</small></span><span><b>{ipsecKnown ? String(ipsecCount || profile.vpnSiteToSite || 0) : '?'}</b><small>IPsec</small></span></div>
        <span className="fnm-card-caption">Conexões remotas representadas logicamente</span>
      </button>
    </div>

    <div className="fnm-trunk" aria-hidden="true"><i/></div>
    <div className="fnm-zone fnm-distribution">
      <div className="fnm-zone-heading"><span className="fnm-icon"><Router size={21}/></span><div><small>DISTRIBUIÇÃO / ACESSO</small><strong>{switchCount ? `${switchCount} switch${switchCount === 1 ? '' : 'es'}` : 'Switches a confirmar'}</strong></div></div>
      <MiniSwitchCluster total={switchCount}/>
      <span className="fnm-card-caption">{brandSwitch || (profile.managedSwitch ? 'Switch gerenciável informado' : 'Modelo e gestão a confirmar')}</span>
    </div>
    <div className="fnm-fork" aria-hidden="true"><i/></div>

    <div className="fnm-access-grid">
      <button type="button" className={`fnm-zone fnm-segments${selectedClass(nodes[2].id)}`} onClick={select(nodes[2].id)} aria-pressed={selectedId === nodes[2].id}>
        <div className="fnm-zone-heading"><span className="fnm-icon"><Layers3 size={20}/></span><div><small>SEGMENTAÇÃO LÓGICA</small><strong>{nodes[2].value}</strong></div></div>
        <div className="fnm-segment-dots">{vlanCount ? Array.from({length:Math.min(vlanCount,7)},(_,i)=><i key={i} title={`Segmento ${i+1} (identificação ilustrativa)`}/>) : <span className="fnm-placeholder">Segmentos a confirmar</span>}{vlanCount>7&&<span className="fnm-extra">+{vlanCount-7}</span>}</div>
        <span className="fnm-card-caption">{known(profile.vlanNames) || 'Nomes e políticas das redes a validar'}</span>
      </button>
      <button type="button" className={`fnm-zone fnm-wireless${selectedClass(nodes[4].id)}`} onClick={select(nodes[4].id)} aria-pressed={selectedId === nodes[4].id}>
        <div className="fnm-zone-heading"><span className="fnm-icon"><RadioTower size={20}/></span><div><small>ACESSO SEM FIO</small><strong>{nodes[4].value}</strong></div></div>
        <MiniApCluster total={apCount}/>
        <span className="fnm-card-caption">{brandAp || 'Marca, modelo e distribuição física a validar'}</span>
      </button>
    </div>

    <div className="fnm-legend"><span><i className="fnm-legend-line"/> Sequência lógica ilustrativa</span><span><i className="fnm-legend-dash"/> Acesso remoto</span><span>Sem descoberta automática, IPs ou cabeamento confirmado</span></div>
  </div>;
}
