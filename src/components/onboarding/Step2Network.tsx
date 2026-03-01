import { useProfile } from '@/context/ProfileContext';
import { TextField, NumberField, SelectField, ToggleField, TextAreaField, TriStateField } from '@/components/FormFields';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-bold text-primary uppercase tracking-wider mt-6 mb-3 border-b border-border/40 pb-2">{children}</h3>
);

const Step2Network = () => {
  const { profile, updateProfile } = useProfile();

  const addLink = () => {
    updateProfile({ internetLinks: [...profile.internetLinks, { provider: '', speed: '', increaseSpeed: false, increaseSpeedNote: '' }] });
  };
  const removeLink = (i: number) => {
    const links = profile.internetLinks.filter((_, idx) => idx !== i);
    updateProfile({ internetLinks: links.length ? links : [{ provider: '', speed: '', increaseSpeed: false, increaseSpeedNote: '' }] });
  };
  const updateLink = (i: number, field: string, value: any) => {
    const links = [...profile.internetLinks];
    links[i] = { ...links[i], [field]: value };
    updateProfile({ internetLinks: links });
  };

  return (
    <div className="space-y-4">
      {/* Links */}
      <SectionTitle>Links de Internet</SectionTitle>
      {profile.internetLinks.map((link, i) => (
        <div key={i} className="glass-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-primary">Link {i + 1}</span>
            {profile.internetLinks.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => removeLink(i)} className="text-destructive"><Trash2 size={16} /></Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField label="Provedor" value={link.provider} onChange={(v) => updateLink(i, 'provider', v)} />
            <TextField label="Velocidade" value={link.speed} onChange={(v) => updateLink(i, 'speed', v)} placeholder="Ex: 500 Mbps" />
          </div>
          <ToggleField label="Pretende aumentar velocidade?" value={link.increaseSpeed} onChange={(v) => updateLink(i, 'increaseSpeed', v)} />
          {link.increaseSpeed && (
            <div className="pl-4 border-l-2 border-primary/30">
              <TextField label="Descreva" value={link.increaseSpeedNote} onChange={(v) => updateLink(i, 'increaseSpeedNote', v)} placeholder="Ex: Upgrade para 1 Gbps" />
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" onClick={addLink} className="w-full border-dashed">
        <Plus size={16} className="mr-2" /> Adicionar link
      </Button>

      {/* Firewall */}
      <SectionTitle>Firewall</SectionTitle>
      <ToggleField label="Possui firewall?" value={profile.hasFirewall} onChange={(v) => updateProfile({ hasFirewall: v })} />
      {profile.hasFirewall && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/30">
          <SelectField label="Tipo" value={profile.firewallType} onChange={(v) => updateProfile({ firewallType: v })} options={[
            { value: 'ngfw', label: 'NGFW' }, { value: 'utm', label: 'UTM' }, { value: 'traditional', label: 'Tradicional' },
            { value: 'mikrotik', label: 'Mikrotik' }, { value: 'pfsense', label: 'pfSense' }, { value: 'other', label: 'Outro' },
          ]} />
          {profile.firewallType === 'other' && (
            <TextField label="Especifique" value={profile.firewallTypeOther} onChange={(v) => updateProfile({ firewallTypeOther: v })} />
          )}
          <TextField label="Modelo" value={profile.firewallModel} onChange={(v) => updateProfile({ firewallModel: v })} />
          <ToggleField label="Licença ativa?" value={profile.activeLicense} onChange={(v) => updateProfile({ activeLicense: v })} />
          <ToggleField label="IDS/IPS ativo?" value={profile.idsIps} onChange={(v) => updateProfile({ idsIps: v })} />
          <ToggleField label="Inspeção SSL?" value={profile.sslInspection} onChange={(v) => updateProfile({ sslInspection: v })} />
        </div>
      )}

      {/* Switch */}
      <SectionTitle>Switch</SectionTitle>
      <ToggleField label="Possui switch gerenciável?" value={profile.managedSwitch} onChange={(v) => updateProfile({ managedSwitch: v })} />
      {profile.managedSwitch && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4 border-l-2 border-primary/30">
          <TextField label="Marca" value={profile.switchBrand} onChange={(v) => updateProfile({ switchBrand: v })} />
          <TextField label="Modelo" value={profile.switchModel} onChange={(v) => updateProfile({ switchModel: v })} />
          <NumberField label="Quantidade" value={profile.switchCount} onChange={(v) => updateProfile({ switchCount: v })} />
        </div>
      )}

      {/* VLAN */}
      <SectionTitle>VLAN</SectionTitle>
      <ToggleField label="Possui VLAN?" value={profile.hasVlan} onChange={(v) => updateProfile({ hasVlan: v })} />
      {profile.hasVlan && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/30">
          <NumberField label="Quantidade" value={profile.vlanCount} onChange={(v) => updateProfile({ vlanCount: v })} />
          <TextField label="Nome das VLANs" value={profile.vlanNames} onChange={(v) => updateProfile({ vlanNames: v })} placeholder="Ex: Corporativa, Visitantes, IoT" />
        </div>
      )}

      {/* AP */}
      <SectionTitle>Access Point (AP)</SectionTitle>
      <ToggleField label="Possui AP?" value={profile.hasAP} onChange={(v) => updateProfile({ hasAP: v })} />
      {profile.hasAP && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4 border-l-2 border-primary/30">
          <TextField label="Marca" value={profile.apBrand} onChange={(v) => updateProfile({ apBrand: v })} />
          <TextField label="Modelo" value={profile.apModel} onChange={(v) => updateProfile({ apModel: v })} />
          <NumberField label="Quantidade" value={profile.apQuantity} onChange={(v) => updateProfile({ apQuantity: v })} />
        </div>
      )}

      {/* Arquitetura Adicional */}
      <SectionTitle>Arquitetura Adicional</SectionTitle>
      <div className="space-y-4">
        <TriStateField label="Load Balancer" value={profile.loadBalancerOption} onChange={(v) => updateProfile({ loadBalancerOption: v })} onTextChange={(v) => updateProfile({ loadBalancerText: v })} textValue={profile.loadBalancerText} />
        <TriStateField label="SD-WAN" value={profile.sdwanOption} onChange={(v) => updateProfile({ sdwanOption: v })} onTextChange={(v) => updateProfile({ sdwanText: v })} textValue={profile.sdwanText} />
        <TriStateField label="VoIP" value={profile.voipOption} onChange={(v) => updateProfile({ voipOption: v })} onTextChange={(v) => updateProfile({ voipText: v })} textValue={profile.voipText} />
        <TriStateField label="QoS" value={profile.qosOption} onChange={(v) => updateProfile({ qosOption: v })} onTextChange={(v) => updateProfile({ qosText: v })} textValue={profile.qosText} />
      </div>

      {/* VPN */}
      <SectionTitle>VPN</SectionTitle>
      <ToggleField label="Utiliza VPN?" value={profile.usesVpn} onChange={(v) => updateProfile({ usesVpn: v })} />
      {profile.usesVpn && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/30">
          <NumberField label="VPN site-to-site (quantidade)" value={profile.vpnSiteToSite} onChange={(v) => updateProfile({ vpnSiteToSite: v })} />
          <NumberField label="VPN acesso remoto (quantidade)" value={profile.vpnRemoteAccess} onChange={(v) => updateProfile({ vpnRemoteAccess: v })} />
          <ToggleField label="MFA obrigatório?" value={profile.vpnMfa} onChange={(v) => updateProfile({ vpnMfa: v })} />
          <ToggleField label="Logs monitorados?" value={profile.vpnLogs} onChange={(v) => updateProfile({ vpnLogs: v })} />
        </div>
      )}

      <TextAreaField label="Observações" value={profile.step2Notes} onChange={(v) => updateProfile({ step2Notes: v })} placeholder="Informações adicionais sobre a infraestrutura..." />
    </div>
  );
};

export default Step2Network;
