import { useProfile } from '@/context/ProfileContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <h3 className="text-sm font-bold text-primary uppercase tracking-wider">{title}</h3>
    <div className="glass-card p-4 space-y-1">{children}</div>
  </div>
);

const Line = ({ label, value }: { label: string; value: string | number | boolean | undefined }) => {
  if (value === undefined || value === '' || value === 0) return null;
  const display = typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : String(value);
  return (
    <div className="flex justify-between text-sm py-0.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground font-medium">{display}</span>
    </div>
  );
};

const Step7Review = () => {
  const { profile } = useProfile();

  const completionItems = [
    { label: 'Empresa', ok: !!profile.companyName },
    { label: 'Links de internet', ok: profile.internetLinks.some(l => !!l.provider) },
    { label: 'Endpoints', ok: profile.endpointsWindows > 0 || profile.endpointsMac > 0 },
    { label: 'Backup', ok: profile.hasBackup !== undefined },
    { label: 'Governança', ok: true },
    { label: 'Contexto estratégico', ok: !!profile.mainConcern || !!profile.conversationMotivation },
  ];

  return (
    <div className="space-y-6">
      {/* Completion indicators */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-bold text-foreground mb-3">Resumo de preenchimento</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {completionItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-sm">
              {item.ok ? (
                <CheckCircle2 size={14} className="text-success shrink-0" />
              ) : (
                <AlertCircle size={14} className="text-muted-foreground shrink-0" />
              )}
              <span className={item.ok ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <Section title="Identificação">
        <Line label="Empresa" value={profile.companyName} />
        <Line label="Setor" value={profile.sector} />
        <Line label="Contato" value={`${profile.contactName} — ${profile.contactRole}`} />
        <Line label="Usuários" value={profile.userCount} />
        <Line label="Dispositivos" value={profile.deviceCount} />
        <Line label="Time de TI" value={profile.itTeamSize} />
      </Section>

      <Section title="Rede & Conectividade">
        {profile.internetLinks.map((link, i) => (
          <Line key={i} label={`Link ${i + 1}`} value={`${link.provider || '—'} • ${link.speed || '—'}`} />
        ))}
        <Line label="Firewall" value={profile.hasFirewall ? `${profile.firewallType} — ${profile.firewallModel}` : 'Não'} />
        <Line label="Switch gerenciável" value={profile.managedSwitch ? `${profile.switchBrand} ${profile.switchModel} (${profile.switchCount})` : 'Não'} />
        <Line label="VLAN" value={profile.hasVlan ? `${profile.vlanCount} — ${profile.vlanNames}` : 'Não'} />
        <Line label="AP" value={profile.hasAP ? `${profile.apBrand} ${profile.apModel} (${profile.apQuantity})` : 'Não'} />
        <Line label="VPN" value={profile.usesVpn} />
      </Section>

      <Section title="Endpoint">
        <Line label="Windows" value={profile.endpointsWindows > 0 ? `${profile.endpointsWindows} (${profile.windowsVersion})` : undefined} />
        <Line label="Mac" value={profile.endpointsMac > 0 ? `${profile.endpointsMac} (${profile.macVersion})` : undefined} />
        <Line label="Proteção atual" value={profile.protectionType === 'edr' ? 'EDR' : profile.protectionType === 'signature' ? 'Antivírus' : 'Nenhum'} />
        <Line label="BYOD" value={profile.byod} />
      </Section>

      <Section title="Backup">
        <Line label="Possui backup" value={profile.hasBackup} />
        {profile.hasBackup && (
          <>
            <Line label="Tipo" value={profile.backupType} />
            <Line label="Método" value={profile.backupMethod} />
            <Line label="Tamanho" value={profile.backupSize} />
            <Line label="RTO" value={profile.rto} />
          </>
        )}
      </Section>

      <Section title="Governança">
        <Line label="Tentativa de ransomware" value={profile.ransomwareAttempt} />
        <Line label="Conta comprometida" value={profile.compromisedAccount} />
        <Line label="Política de segurança" value={profile.securityPolicy} />
        <Line label="Plano de resposta" value={profile.incidentResponsePlan} />
      </Section>

      {(profile.mainConcern || profile.conversationMotivation) && (
        <Section title="Contexto Estratégico">
          <Line label="Principal preocupação" value={profile.mainConcern} />
          <Line label="Motivação" value={profile.conversationMotivation} />
          <Line label="Pressão regulatória" value={profile.regulatoryPressure} />
          <Line label="Horizonte de crescimento" value={profile.growthHorizon} />
        </Section>
      )}
    </div>
  );
};

export default Step7Review;
