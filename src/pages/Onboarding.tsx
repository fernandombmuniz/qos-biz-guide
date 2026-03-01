import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/context/ProfileContext';
import { motion, AnimatePresence } from 'framer-motion';
import { TextField, NumberField, SelectField, ToggleField } from '@/components/FormFields';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Shield, ChevronRight, ChevronLeft } from 'lucide-react';
import logoConcierge from '@/assets/logo-concierge.jpg';

const TOTAL_STEPS = 7;

const stepTitles = [
  { title: 'Identificação & Capacidade Atual', subtitle: 'Levantamento inicial para dimensionamento técnico.' },
  { title: 'Links de Internet', subtitle: 'Mapeamento de conectividade.' },
  { title: 'Infraestrutura de Rede & Firewall', subtitle: 'Arquitetura de perímetro e segmentação.' },
  { title: 'Conectividade & VPN', subtitle: 'Acesso remoto e túneis.' },
  { title: 'Endpoint & Dispositivos', subtitle: 'Proteção das estações e servidores.' },
  { title: 'Backup & Continuidade', subtitle: 'Estratégia de recuperação.' },
  { title: 'Governança & Histórico', subtitle: 'Indicadores de maturidade.' },
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();

  const progress = (step / TOTAL_STEPS) * 100;

  const nextStep = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else {
      updateProfile({ onboardingComplete: true });
      navigate('/hub');
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => updateProfile({ companyLogo: ev.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  const addInternetLink = () => {
    updateProfile({
      internetLinks: [...profile.internetLinks, { provider: '', speed: '', increaseSpeed: false }],
    });
  };

  const removeInternetLink = (index: number) => {
    const links = profile.internetLinks.filter((_, i) => i !== index);
    updateProfile({ internetLinks: links.length ? links : [{ provider: '', speed: '', increaseSpeed: false }] });
  };

  const updateLink = (index: number, field: string, value: any) => {
    const links = [...profile.internetLinks];
    links[index] = { ...links[index], [field]: value };
    updateProfile({ internetLinks: links });
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextField label="Nome da empresa" value={profile.companyName} onChange={(v) => updateProfile({ companyName: v })} placeholder="Ex: Empresa XYZ" />
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">Logo da empresa</Label>
              <Input type="file" accept="image/*" onChange={handleLogoUpload} className="bg-secondary border-border text-foreground file:text-primary file:font-medium" />
            </div>
            <SelectField label="Setor" value={profile.sector} onChange={(v) => updateProfile({ sector: v })} options={[
              { value: 'tecnologia', label: 'Tecnologia' }, { value: 'financeiro', label: 'Financeiro' },
              { value: 'saude', label: 'Saúde' }, { value: 'industria', label: 'Indústria' },
              { value: 'varejo', label: 'Varejo' }, { value: 'educacao', label: 'Educação' },
              { value: 'governo', label: 'Governo' }, { value: 'servicos', label: 'Serviços' },
              { value: 'outro', label: 'Outro' },
            ]} />
            <NumberField label="Número de usuários" value={profile.userCount} onChange={(v) => updateProfile({ userCount: v })} />
            <ToggleField label="Pretende aumentar usuários?" value={profile.increaseUsers} onChange={(v) => updateProfile({ increaseUsers: v })} />
            <NumberField label="Número de dispositivos" value={profile.deviceCount} onChange={(v) => updateProfile({ deviceCount: v })} />
            <ToggleField label="Pretende aumentar dispositivos?" value={profile.increaseDevices} onChange={(v) => updateProfile({ increaseDevices: v })} />
            <NumberField label="Pessoas no time de TI" value={profile.itTeamSize} onChange={(v) => updateProfile({ itTeamSize: v })} />
            <SelectField label="Perfil de uso da rede" value={profile.networkUsage} onChange={(v) => updateProfile({ networkUsage: v })} options={[
              { value: 'low', label: 'Baixo' }, { value: 'medium', label: 'Médio' }, { value: 'high', label: 'Alto' },
            ]} />
            <TextField label="Nome do contato principal" value={profile.contactName} onChange={(v) => updateProfile({ contactName: v })} />
            <TextField label="Cargo" value={profile.contactRole} onChange={(v) => updateProfile({ contactRole: v })} />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {profile.internetLinks.map((link, i) => (
              <div key={i} className="glass-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-primary">Link {i + 1}</span>
                  {profile.internetLinks.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeInternetLink(i)} className="text-destructive">
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField label="Provedor" value={link.provider} onChange={(v) => updateLink(i, 'provider', v)} />
                  <TextField label="Velocidade" value={link.speed} onChange={(v) => updateLink(i, 'speed', v)} placeholder="Ex: 500 Mbps" />
                </div>
                <ToggleField label="Pretende aumentar velocidade?" value={link.increaseSpeed} onChange={(v) => updateLink(i, 'increaseSpeed', v)} />
              </div>
            ))}
            <Button variant="outline" onClick={addInternetLink} className="w-full border-dashed">
              <Plus size={16} className="mr-2" /> Adicionar link
            </Button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <ToggleField label="Possui firewall?" value={profile.hasFirewall} onChange={(v) => updateProfile({ hasFirewall: v })} />
            {profile.hasFirewall && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-4 border-l-2 border-primary/30">
                <SelectField label="Tipo" value={profile.firewallType} onChange={(v) => updateProfile({ firewallType: v })} options={[
                  { value: 'ngfw', label: 'NGFW' }, { value: 'utm', label: 'UTM' }, { value: 'traditional', label: 'Tradicional' },
                  { value: 'mikrotik', label: 'Mikrotik' }, { value: 'pfsense', label: 'pfSense' }, { value: 'other', label: 'Outro' },
                ]} />
                <TextField label="Modelo" value={profile.firewallModel} onChange={(v) => updateProfile({ firewallModel: v })} />
                <ToggleField label="Licença ativa?" value={profile.activeLicense} onChange={(v) => updateProfile({ activeLicense: v })} />
                <ToggleField label="IDS/IPS ativo?" value={profile.idsIps} onChange={(v) => updateProfile({ idsIps: v })} />
                <ToggleField label="Inspeção SSL?" value={profile.sslInspection} onChange={(v) => updateProfile({ sslInspection: v })} />
              </div>
            )}
            <ToggleField label="Switch gerenciável?" value={profile.managedSwitch} onChange={(v) => updateProfile({ managedSwitch: v })} />
            {profile.managedSwitch && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-4 border-l-2 border-primary/30">
                <NumberField label="Quantidade de switches" value={profile.switchCount} onChange={(v) => updateProfile({ switchCount: v })} />
                <NumberField label="VLANs" value={profile.vlanCount} onChange={(v) => updateProfile({ vlanCount: v })} />
              </div>
            )}
            <SelectField label="Wi-Fi: VLAN real ou apenas SSID?" value={profile.wifiSegmentation} onChange={(v) => updateProfile({ wifiSegmentation: v })} options={[
              { value: 'vlan', label: 'VLAN real' }, { value: 'ssid', label: 'Apenas SSID' },
            ]} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ToggleField label="Load Balancer?" value={profile.hasLoadBalancer} onChange={(v) => updateProfile({ hasLoadBalancer: v })} />
              <ToggleField label="SD-WAN?" value={profile.hasSdwan} onChange={(v) => updateProfile({ hasSdwan: v })} />
              <ToggleField label="VoIP?" value={profile.usesVoip} onChange={(v) => updateProfile({ usesVoip: v })} />
              <ToggleField label="Precisa de QoS?" value={profile.needsQos} onChange={(v) => updateProfile({ needsQos: v })} />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-5">
            <ToggleField label="Utiliza VPN?" value={profile.usesVpn} onChange={(v) => updateProfile({ usesVpn: v })} />
            {profile.usesVpn && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-4 border-l-2 border-primary/30">
                <NumberField label="VPN site-to-site (quantidade)" value={profile.vpnSiteToSite} onChange={(v) => updateProfile({ vpnSiteToSite: v })} />
                <NumberField label="VPN acesso remoto (quantidade)" value={profile.vpnRemoteAccess} onChange={(v) => updateProfile({ vpnRemoteAccess: v })} />
                <ToggleField label="MFA obrigatório?" value={profile.vpnMfa} onChange={(v) => updateProfile({ vpnMfa: v })} />
                <ToggleField label="Logs monitorados?" value={profile.vpnLogs} onChange={(v) => updateProfile({ vpnLogs: v })} />
                <ToggleField label="Limite de tentativas?" value={profile.vpnRetryLimit} onChange={(v) => updateProfile({ vpnRetryLimit: v })} />
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <NumberField label="Endpoints Windows" value={profile.endpointsWindows} onChange={(v) => updateProfile({ endpointsWindows: v })} />
              <NumberField label="Endpoints Mac" value={profile.endpointsMac} onChange={(v) => updateProfile({ endpointsMac: v })} />
              <ToggleField label="Servidor Windows?" value={profile.hasWindowsServer} onChange={(v) => updateProfile({ hasWindowsServer: v })} />
              <ToggleField label="Servidor Linux?" value={profile.hasLinuxServer} onChange={(v) => updateProfile({ hasLinuxServer: v })} />
              <ToggleField label="Dispositivos fora do domínio?" value={profile.devicesOutOfDomain} onChange={(v) => updateProfile({ devicesOutOfDomain: v })} />
              <ToggleField label="BYOD?" value={profile.byod} onChange={(v) => updateProfile({ byod: v })} />
            </div>
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
          </div>
        );

      case 6:
        return (
          <div className="space-y-5">
            <ToggleField label="Possui backup?" value={profile.hasBackup} onChange={(v) => updateProfile({ hasBackup: v })} />
            {profile.hasBackup && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pl-4 border-l-2 border-primary/30">
                <SelectField label="Tipo de backup" value={profile.backupType} onChange={(v) => updateProfile({ backupType: v })} options={[
                  { value: 'local', label: 'Local' }, { value: 'cloud', label: 'Nuvem' }, { value: 'hybrid', label: 'Híbrido' },
                ]} />
                <ToggleField label="Imutável?" value={profile.immutableBackup} onChange={(v) => updateProfile({ immutableBackup: v })} />
                <ToggleField label="Teste de restore regular?" value={profile.regularRestoreTest} onChange={(v) => updateProfile({ regularRestoreTest: v })} />
                <TextField label="RTO (tempo máximo tolerável)" value={profile.rto} onChange={(v) => updateProfile({ rto: v })} placeholder="Ex: 4 horas" />
              </div>
            )}
          </div>
        );

      case 7:
        return (
          <div className="space-y-5">
            <ToggleField label="Já sofreu tentativa de ransomware?" value={profile.ransomwareAttempt} onChange={(v) => updateProfile({ ransomwareAttempt: v })} />
            <ToggleField label="Conta comprometida?" value={profile.compromisedAccount} onChange={(v) => updateProfile({ compromisedAccount: v })} />
            <ToggleField label="Política formal de segurança?" value={profile.securityPolicy} onChange={(v) => updateProfile({ securityPolicy: v })} />
            <ToggleField label="Plano de resposta a incidentes?" value={profile.incidentResponsePlan} onChange={(v) => updateProfile({ incidentResponsePlan: v })} />
          </div>
        );

      default:
        return null;
    }
  };

  const info = stepTitles[step - 1];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-center mb-8">
          <img src={logoConcierge} alt="Concierge" className="h-10 object-contain" />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Etapa {step} de {TOTAL_STEPS}</span>
            <span className="text-sm text-primary font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-card p-6 md:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground mb-1">{info.title}</h2>
                <p className="text-sm text-muted-foreground">{info.subtitle}</p>
              </div>
              {renderStepContent()}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={prevStep} disabled={step === 1} className="gap-2">
            <ChevronLeft size={16} /> Voltar
          </Button>
          <Button onClick={nextStep} className="gap-2 gradient-primary text-primary-foreground hover:opacity-90">
            {step === TOTAL_STEPS ? 'Concluir' : 'Próximo'} <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
