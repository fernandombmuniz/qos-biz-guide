import { useProfile } from '@/context/ProfileContext';
import { TextField, NumberField, SelectField, ToggleField, TextAreaField } from '@/components/FormFields';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Step1Identification = () => {
  const { profile, updateProfile } = useProfile();

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => updateProfile({ companyLogo: ev.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Logo upload - prominent */}
      <div className="flex flex-col items-center gap-4 mb-4">
        {profile.companyLogo ? (
          <label className="cursor-pointer group">
            <img
              src={profile.companyLogo}
              alt="Logo da empresa"
              className="h-24 w-24 object-contain rounded-xl border-2 border-border group-hover:border-primary transition-colors"
            />
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        ) : (
          <label className="cursor-pointer h-24 w-24 rounded-xl border-2 border-dashed border-border hover:border-primary transition-colors flex items-center justify-center text-muted-foreground text-xs text-center p-2">
            Clique para enviar logo
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </label>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextField label="Nome da empresa" value={profile.companyName} onChange={(v) => updateProfile({ companyName: v })} placeholder="Ex: Empresa XYZ" />
        <TextField label="Setor" value={profile.sector} onChange={(v) => updateProfile({ sector: v })} placeholder="Ex: Tecnologia, Saúde, Varejo..." />
        <NumberField label="Número de usuários" value={profile.userCount} onChange={(v) => updateProfile({ userCount: v })} />
        <ToggleField label="Pretende aumentar usuários?" value={profile.increaseUsers} onChange={(v) => updateProfile({ increaseUsers: v })} />
        {profile.increaseUsers && (
          <div className="md:col-span-2 pl-4 border-l-2 border-primary/30">
            <TextField label="Estimativa de crescimento" value={profile.userGrowthEstimate} onChange={(v) => updateProfile({ userGrowthEstimate: v })} placeholder="Ex: +30 usuários nos próximos 6 meses" />
          </div>
        )}
        <NumberField label="Número de dispositivos" value={profile.deviceCount} onChange={(v) => updateProfile({ deviceCount: v })} />
        <ToggleField label="Pretende aumentar dispositivos?" value={profile.increaseDevices} onChange={(v) => updateProfile({ increaseDevices: v })} />
        <NumberField label="Pessoas no time de TI" value={profile.itTeamSize} onChange={(v) => updateProfile({ itTeamSize: v })} />
        <SelectField label="Perfil de uso da rede" value={profile.networkUsage} onChange={(v) => updateProfile({ networkUsage: v })} options={[
          { value: 'low', label: 'Baixo' }, { value: 'medium', label: 'Médio' }, { value: 'high', label: 'Alto' },
        ]} />
        <TextField label="Nome do contato principal" value={profile.contactName} onChange={(v) => updateProfile({ contactName: v })} />
        <TextField label="Cargo" value={profile.contactRole} onChange={(v) => updateProfile({ contactRole: v })} />
      </div>

      <TextAreaField label="Observações" value={profile.step1Notes} onChange={(v) => updateProfile({ step1Notes: v })} placeholder="Informações adicionais relevantes..." />
    </div>
  );
};

export default Step1Identification;
