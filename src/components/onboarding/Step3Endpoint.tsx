import { useProfile } from '@/context/ProfileContext';
import { TextField, NumberField, SelectField, ToggleField, TextAreaField } from '@/components/FormFields';

const Step3Endpoint = () => {
  const { profile, updateProfile } = useProfile();

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <NumberField label="Endpoints Windows (quantidade)" value={profile.endpointsWindows} onChange={(v) => updateProfile({ endpointsWindows: v })} />
        <TextField label="Versão Windows" value={profile.windowsVersion} onChange={(v) => updateProfile({ windowsVersion: v })} placeholder="Ex: Windows 11, Windows 10" />
        <NumberField label="Endpoints Mac (quantidade)" value={profile.endpointsMac} onChange={(v) => updateProfile({ endpointsMac: v })} />
        <TextField label="Versão macOS" value={profile.macVersion} onChange={(v) => updateProfile({ macVersion: v })} placeholder="Ex: Sonoma, Ventura" />
      </div>

      <ToggleField label="Servidor Windows?" value={profile.hasWindowsServer} onChange={(v) => updateProfile({ hasWindowsServer: v })} />
      {profile.hasWindowsServer && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-primary/30">
          <NumberField label="Quantidade" value={profile.windowsServerCount} onChange={(v) => updateProfile({ windowsServerCount: v })} />
          <TextField label="Versão" value={profile.windowsServerVersion} onChange={(v) => updateProfile({ windowsServerVersion: v })} placeholder="Ex: Server 2022" />
        </div>
      )}

      <ToggleField label="Servidor Linux?" value={profile.hasLinuxServer} onChange={(v) => updateProfile({ hasLinuxServer: v })} />
      {profile.hasLinuxServer && (
        <div className="pl-4 border-l-2 border-primary/30">
          <NumberField label="Quantidade" value={profile.linuxServerCount} onChange={(v) => updateProfile({ linuxServerCount: v })} />
        </div>
      )}

      <ToggleField label="Dispositivos fora do domínio?" value={profile.devicesOutOfDomain} onChange={(v) => updateProfile({ devicesOutOfDomain: v })} />
      {profile.devicesOutOfDomain && (
        <div className="pl-4 border-l-2 border-primary/30">
          <NumberField label="Quantos?" value={profile.outOfDomainCount} onChange={(v) => updateProfile({ outOfDomainCount: v })} />
        </div>
      )}

      <ToggleField label="BYOD?" value={profile.byod} onChange={(v) => updateProfile({ byod: v })} />

      <SelectField label="Tipo de proteção atual" value={profile.protectionType} onChange={(v) => updateProfile({ protectionType: v })} options={[
        { value: 'signature', label: 'Antivírus por assinatura' }, { value: 'edr', label: 'EDR' }, { value: 'none', label: 'Nenhum' },
      ]} />

      {profile.protectionType !== 'edr' && (
        <div className="grid grid-cols-1 gap-4 pl-4 border-l-2 border-primary/30">
          <ToggleField label="Console centralizada?" value={profile.centralConsole} onChange={(v) => updateProfile({ centralConsole: v })} />
          <ToggleField label="Monitoramento 24/7?" value={profile.monitoring247} onChange={(v) => updateProfile({ monitoring247: v })} />
          <ToggleField label="Atualização automática?" value={profile.autoUpdate} onChange={(v) => updateProfile({ autoUpdate: v })} />
        </div>
      )}

      <TextAreaField label="Observações" value={profile.step3Notes} onChange={(v) => updateProfile({ step3Notes: v })} placeholder="Informações adicionais sobre endpoints..." />
    </div>
  );
};

export default Step3Endpoint;
