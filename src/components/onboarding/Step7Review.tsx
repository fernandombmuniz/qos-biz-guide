import { useProfile } from '@/context/ProfileContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { useBackupScore } from '@/hooks/useBackupScore';

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
      <span className="text-foreground font-medium text-right ml-4">{display}</span>
    </div>
  );
};

const Step7Review = () => {
  const { profile } = useProfile();
  const { backupScoreData } = useBackupScore();

  const completionItems = [
    { label: 'Empresa', ok: !!profile.companyName },
    { label: 'Links de internet', ok: profile.internetLinks.some(l => !!l.provider) },
    { label: 'Endpoints', ok: profile.endpointsWindows > 0 || profile.endpointsMac > 0 },
    { label: 'Backup', ok: !!profile.backupHasSolution && profile.backupHasSolution !== 'not_informed' },
    { label: 'Governança', ok: true },
    { label: 'Contexto estratégico', ok: !!profile.mainConcern || !!profile.conversationMotivation },
  ];

  // Ativos protegidos sum
  const totalAtivos = (profile.backupPhysicalServers || 0) + 
                      (profile.backupVirtualServers || 0) + 
                      (profile.backupHasCloudServers ? (profile.backupCloudServersCount || 0) : 0) + 
                      (profile.backupDesktopsNotebooksCount || 0);
  const ativosDetail = `${totalAtivos} ativos (Físicos: ${profile.backupPhysicalServers || 0}, Virtuais: ${profile.backupVirtualServers || 0}, Nuvem: ${profile.backupHasCloudServers ? (profile.backupCloudServersCount || 0) : '0'}, Desktops: ${profile.backupDesktopsNotebooksCount || 0})`;

  // Criticidade
  let criticidade = 'Não informado';
  if (profile.backupHasUnstoppableSystem === 'yes') {
    criticidade = profile.backupMostCriticalSystem || 'Sim (Sem aplicação especificada)';
  } else if (profile.backupHasUnstoppableSystem === 'no') {
    criticidade = 'Sem sistemas críticos';
  }

  // Backup atual
  let backupAtual = 'Não informado';
  if (profile.backupHasSolution === 'yes' || profile.backupHasSolution === 'partial') {
    const sol = profile.backupSolutionName || 'Não informada';
    const loc = (profile.backupStorageLocation && profile.backupStorageLocation.length > 0) 
      ? profile.backupStorageLocation.join(', ') 
      : 'Não informado';
    const prefix = profile.backupHasSolution === 'yes' ? 'Sim' : 'Parcialmente';
    backupAtual = `${prefix} (Solução: ${sol}, Armazenamento: ${loc})`;
  } else if (profile.backupHasSolution === 'no') {
    backupAtual = 'Não possui solução';
  }

  // Testes de restauração
  let testesDeRestauracao = 'Não informado';
  if (profile.backupAreBackupsTested === 'yes') {
    testesDeRestauracao = `Sim${profile.backupLastTestDate ? ` (Último teste: ${profile.backupLastTestDate})` : ''}`;
  } else if (profile.backupAreBackupsTested === 'no') {
    testesDeRestauracao = 'Não';
  }

  // Microsoft 365
  let microsoft365 = 'Não informado';
  if (profile.backupUsesM365 === 'yes') {
    const svcs = (profile.backupM365ServicesToProtect && profile.backupM365ServicesToProtect.length > 0)
      ? profile.backupM365ServicesToProtect.join(', ')
      : 'Não informados';
    microsoft365 = `Sim (${profile.backupM365UsersCount || 0} usuários, Serviços: ${svcs})`;
  } else if (profile.backupUsesM365 === 'no') {
    microsoft365 = 'Não';
  }

  // Google Workspace
  let googleWorkspace = 'Não informado';
  if (profile.backupUsesGoogleWorkspace === 'yes') {
    const svcs = (profile.backupGoogleWorkspaceServicesToProtect && profile.backupGoogleWorkspaceServicesToProtect.length > 0)
      ? profile.backupGoogleWorkspaceServicesToProtect.join(', ')
      : 'Não informados';
    googleWorkspace = `Sim (${profile.backupGoogleWorkspaceUsersCount || 0} usuários, Serviços: ${svcs})`;
  } else if (profile.backupUsesGoogleWorkspace === 'no') {
    googleWorkspace = 'Não';
  }

  // Tempo de parada
  const tempoDeParada = profile.backupMaxAcceptableDowntime || 'Não informado';

  // Perda de dados
  const perdaDeDados = profile.backupMaxAcceptableDataLoss || 'Não informado';

  // Nível de atenção
  const getAttentionLevel = (score: number) => {
    if (score < 40) return 'Crítico (Score < 40)';
    if (score < 55) return 'Elevado (Score 40-54)';
    if (score < 70) return 'Atenção (Score 55-69)';
    if (score < 85) return 'Controlado (Score 70-84)';
    return 'Resiliente (Score 85-100)';
  };
  const attentionLevel = getAttentionLevel(backupScoreData.score);

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

      <Section title="Concierge Backup">
        <Line label="Ativos protegidos" value={ativosDetail} />
        <Line label="Criticidade" value={criticidade} />
        <Line label="Tempo de parada" value={tempoDeParada} />
        <Line label="Perda de dados" value={perdaDeDados} />
        <Line label="Backup atual" value={backupAtual} />
        <Line label="Testes de restauração" value={testesDeRestauracao} />
        <Line label="Microsoft 365" value={microsoft365} />
        <Line label="Google Workspace" value={googleWorkspace} />
        <Line label="Nível de atenção" value={attentionLevel} />
      </Section>

      <Section title="Governança">
        <Line label="Tentativa de ransomware" value={profile.ransomwareAttempt} />
        <Line label="Conta compromised" value={profile.compromisedAccount} />
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
