import { useProfile } from '@/context/ProfileContext';
import { TextField, NumberField, SelectField, ToggleField } from '@/components/FormFields';
import { Label } from '@/components/ui/label';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h3 className="text-sm font-bold text-primary uppercase tracking-wider mt-8 mb-4 border-b border-border/40 pb-2">
    {children}
  </h3>
);

interface CheckboxGroupProps {
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
}

const CheckboxGroup = ({ label, options, selectedValues = [], onChange }: CheckboxGroupProps) => {
  const handleToggle = (opt: string) => {
    let newValues = [...selectedValues];
    const isNoneOrUninformed = opt === 'Não informado' || opt === 'Ainda não definida' || opt === 'Ainda não definido';
    const isAll = opt === 'Todos';

    if (isNoneOrUninformed || isAll) {
      // If we select a reset option, clear everything else and select only this one
      newValues = [opt];
    } else {
      // If selecting a standard option, remove any reset options first
      newValues = newValues.filter(
        (v) => v !== 'Não informado' && v !== 'Ainda não definida' && v !== 'Ainda não definido' && v !== 'Todos'
      );
      if (newValues.includes(opt)) {
        newValues = newValues.filter((v) => v !== opt);
      } else {
        newValues.push(opt);
      }
    }
    onChange(newValues);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
        {options.map((opt) => {
          const isSelected = selectedValues.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => handleToggle(opt)}
              className={`flex items-center gap-3 p-3 rounded-lg border text-left text-sm transition-all ${
                isSelected
                  ? 'bg-primary/10 border-primary text-foreground'
                  : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              }`}
            >
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                  isSelected ? 'border-primary bg-primary text-primary-foreground' : 'border-muted-foreground'
                }`}
              >
                {isSelected && (
                  <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20">
                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                  </svg>
                )}
              </div>
              <span>{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Step4Backup = () => {
  const { profile, updateProfile } = useProfile();

  const triStateOptions = [
    { value: 'yes', label: 'Sim' },
    { value: 'no', label: 'Não' },
    { value: 'not_informed', label: 'Não informado' },
  ];

  const handleHasCloudServersChange = (value: boolean) => {
    updateProfile({
      backupHasCloudServers: value,
      ...(value ? {} : { backupCloudServersCount: 0 }),
    });
  };

  const handleSolutionChange = (value: string) => {
    updateProfile({
      backupHasSolution: value,
      ...(value === 'yes' || value === 'partial'
        ? {}
        : {
            backupSolutionName: '',
            backupStorageLocation: [],
            backupCurrentFrequency: '',
            backupCurrentRetention: '',
            backupAreBackupsTested: 'not_informed',
            backupLastTestDate: '',
          }),
    });
  };

  const handleAreBackupsTestedChange = (value: string) => {
    updateProfile({
      backupAreBackupsTested: value,
      ...(value === 'yes' ? {} : { backupLastTestDate: '' }),
    });
  };

  const handleUsesM365Change = (value: string) => {
    updateProfile({
      backupUsesM365: value,
      ...(value === 'yes' ? {} : { backupM365UsersCount: 0, backupM365ServicesToProtect: [] }),
    });
  };

  const handleUsesGoogleWorkspaceChange = (value: string) => {
    updateProfile({
      backupUsesGoogleWorkspace: value,
      ...(value === 'yes' ? {} : { backupGoogleWorkspaceUsersCount: 0, backupGoogleWorkspaceServicesToProtect: [] }),
    });
  };

  const handleHasUnstoppableSystemChange = (value: string) => {
    updateProfile({
      backupHasUnstoppableSystem: value,
      ...(value === 'yes' ? {} : { backupMostCriticalSystem: '' }),
    });
  };

  return (
    <div className="space-y-6">


      {/* 01 | AMBIENTE */}
      <SectionTitle>01 | Ambiente</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <NumberField
          label="Quantidade de servidores físicos"
          value={profile.backupPhysicalServers}
          onChange={(v) => updateProfile({ backupPhysicalServers: Math.max(0, v) })}
          min={0}
        />
        <NumberField
          label="Quantidade de servidores virtuais"
          value={profile.backupVirtualServers}
          onChange={(v) => updateProfile({ backupVirtualServers: Math.max(0, v) })}
          min={0}
        />
        <TextField
          label="Plataforma de virtualização"
          value={profile.backupVirtualizationPlatform}
          onChange={(v) => updateProfile({ backupVirtualizationPlatform: v })}
          placeholder="Ex: VMware, Hyper-V, Proxmox..."
        />
        <div className="flex flex-col justify-end">
          <ToggleField
            label="Possui servidores em nuvem?"
            value={profile.backupHasCloudServers}
            onChange={handleHasCloudServersChange}
          />
        </div>
        {profile.backupHasCloudServers && (
          <div className="md:col-span-2 pl-4 border-l-2 border-primary/30">
            <NumberField
              label="Quantidade de servidores em nuvem"
              value={profile.backupCloudServersCount}
              onChange={(v) => updateProfile({ backupCloudServersCount: Math.max(0, v) })}
              min={0}
            />
          </div>
        )}
        <NumberField
          label="Quantidade de desktops ou notebooks que precisam de backup"
          value={profile.backupDesktopsNotebooksCount}
          onChange={(v) => updateProfile({ backupDesktopsNotebooksCount: Math.max(0, v) })}
          min={0}
        />
        <SelectField
          label="Possui NAS ou Storage?"
          value={profile.backupHasNasStorage}
          onChange={(v) => updateProfile({ backupHasNasStorage: v })}
          options={triStateOptions}
        />
      </div>

      {/* 03 | BACKUP ATUAL */}
      <SectionTitle>03 | Backup Atual</SectionTitle>
      <div className="space-y-5">
        <SelectField
          label="Possui solução de backup?"
          value={profile.backupHasSolution}
          onChange={handleSolutionChange}
          options={[
            { value: 'yes', label: 'Sim' },
            { value: 'no', label: 'Não' },
            { value: 'partial', label: 'Parcialmente' },
            { value: 'not_informed', label: 'Não informado' },
          ]}
        />
        {(profile.backupHasSolution === 'yes' || profile.backupHasSolution === 'partial') && (
          <div className="space-y-5 pl-4 border-l-2 border-primary/30">
            <TextField
              label="Qual solução utiliza atualmente?"
              value={profile.backupSolutionName}
              onChange={(v) => updateProfile({ backupSolutionName: v })}
              placeholder="Ex: Veeam, Acronis, backup do Windows..."
            />
            <CheckboxGroup
              label="Onde o backup é armazenado?"
              options={[
                'Mesmo servidor ou equipamento protegido',
                'Disco externo',
                'NAS ou Storage local',
                'Servidor de backup dedicado',
                'Fita',
                'Datacenter secundário',
                'Nuvem',
                'Outro',
                'Não informado',
              ]}
              selectedValues={profile.backupStorageLocation || []}
              onChange={(v) => updateProfile({ backupStorageLocation: v })}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <TextField
                label="Frequência atual"
                value={profile.backupCurrentFrequency}
                onChange={(v) => updateProfile({ backupCurrentFrequency: v })}
                placeholder="Ex: Diário, Semanal"
              />
              <TextField
                label="Retenção atual"
                value={profile.backupCurrentRetention}
                onChange={(v) => updateProfile({ backupCurrentRetention: v })}
                placeholder="Ex: 30 dias, 1 ano"
              />
            </div>
            <SelectField
              label="Os backups são testados?"
              value={profile.backupAreBackupsTested}
              onChange={handleAreBackupsTestedChange}
              options={triStateOptions}
            />
            {profile.backupAreBackupsTested === 'yes' && (
              <div className="pl-4 border-l-2 border-primary/30">
                <TextField
                  label="Quando ocorreu o último teste bem-sucedido?"
                  value={profile.backupLastTestDate}
                  onChange={(v) => updateProfile({ backupLastTestDate: v })}
                  placeholder="Ex: Mês passado, Janeiro/2026..."
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 04 | DADOS */}
      <SectionTitle>04 | Dados</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <TextField
          label="Volume total aproximado a proteger"
          value={profile.backupTotalVolumeToProtect}
          onChange={(v) => updateProfile({ backupTotalVolumeToProtect: v })}
          placeholder="Ex: 5 TB, 500 GB"
        />
        <TextField
          label="Crescimento mensal aproximado"
          value={profile.backupMonthlyGrowth}
          onChange={(v) => updateProfile({ backupMonthlyGrowth: v })}
          placeholder="Ex: 10%, 100 GB"
        />
        <TextField
          label="Retenção desejada"
          value={profile.backupDesiredRetention}
          onChange={(v) => updateProfile({ backupDesiredRetention: v })}
          placeholder="Ex: 30 dias, 7 anos (compliance)"
        />
        <div className="md:col-span-2">
          <CheckboxGroup
            label="Estratégia de armazenamento desejada"
            options={[
              'Backup local',
              'Backup em nuvem',
              'Estratégia híbrida',
              'Cópia offline',
              'Cópia imutável',
              'Ainda não definida',
              'Não informado',
            ]}
            selectedValues={profile.backupDesiredStorageStrategy || []}
            onChange={(v) => updateProfile({ backupDesiredStorageStrategy: v })}
          />
        </div>
        <TextField
          label="Velocidade do link principal"
          value={profile.backupMainLinkSpeed}
          onChange={(v) => updateProfile({ backupMainLinkSpeed: v })}
          placeholder="Ex: 200 Mbps"
        />
        <TextField
          label="Janela disponível para backup"
          value={profile.backupAvailableWindow}
          onChange={(v) => updateProfile({ backupAvailableWindow: v })}
          placeholder="Ex: 22h às 06h"
        />
      </div>

      {/* 05 | MICROSOFT 365 E GOOGLE WORKSPACE */}
      <SectionTitle>05 | Microsoft 365 & Google Workspace</SectionTitle>
      <div className="space-y-5">
        <SelectField
          label="Utiliza Microsoft 365?"
          value={profile.backupUsesM365}
          onChange={handleUsesM365Change}
          options={triStateOptions}
        />
        {profile.backupUsesM365 === 'yes' && (
          <div className="space-y-5 pl-4 border-l-2 border-primary/30">
            <NumberField
              label="Quantidade de usuários Microsoft 365"
              value={profile.backupM365UsersCount}
              onChange={(v) => updateProfile({ backupM365UsersCount: Math.max(0, v) })}
              min={0}
            />
            <CheckboxGroup
              label="Serviços Microsoft 365 a proteger"
              options={['Exchange Online', 'OneDrive', 'SharePoint', 'Teams', 'Todos', 'Ainda não definido']}
              selectedValues={profile.backupM365ServicesToProtect || []}
              onChange={(v) => updateProfile({ backupM365ServicesToProtect: v })}
            />
          </div>
        )}

        <SelectField
          label="Utiliza Google Workspace?"
          value={profile.backupUsesGoogleWorkspace}
          onChange={handleUsesGoogleWorkspaceChange}
          options={triStateOptions}
        />
        {profile.backupUsesGoogleWorkspace === 'yes' && (
          <div className="space-y-5 pl-4 border-l-2 border-primary/30">
            <NumberField
              label="Quantidade de usuários Google Workspace"
              value={profile.backupGoogleWorkspaceUsersCount}
              onChange={(v) => updateProfile({ backupGoogleWorkspaceUsersCount: Math.max(0, v) })}
              min={0}
            />
            <CheckboxGroup
              label="Serviços Google Workspace a proteger"
              options={['Gmail', 'Google Drive', 'Shared Drives', 'Calendar', 'Todos', 'Ainda não definido']}
              selectedValues={profile.backupGoogleWorkspaceServicesToProtect || []}
              onChange={(v) => updateProfile({ backupGoogleWorkspaceServicesToProtect: v })}
            />
          </div>
        )}
      </div>

      {/* 06 | CONTINUIDADE DO NEGÓCIO */}
      <SectionTitle>06 | Continuidade do Negócio</SectionTitle>
      <div className="space-y-5">
        <SelectField
          label="Existe algum servidor ou sistema que não pode parar?"
          value={profile.backupHasUnstoppableSystem}
          onChange={handleHasUnstoppableSystemChange}
          options={triStateOptions}
        />
        {profile.backupHasUnstoppableSystem === 'yes' && (
          <div className="pl-4 border-l-2 border-primary/30">
            <TextField
              label="Qual sistema ou aplicação é mais crítico?"
              value={profile.backupMostCriticalSystem}
              onChange={(v) => updateProfile({ backupMostCriticalSystem: v })}
              placeholder="Ex: ERP, CRM, Banco de Dados do E-commerce..."
            />
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <TextField
            label="Impacto caso fique indisponível"
            value={profile.backupImpactIfUnavailable}
            onChange={(v) => updateProfile({ backupImpactIfUnavailable: v })}
            placeholder="Ex: R$ 50k/hora de prejuízo, interrupção de vendas..."
          />
          <TextField
            label="Área mais impactada"
            value={profile.backupMostImpactedArea}
            onChange={(v) => updateProfile({ backupMostImpactedArea: v })}
            placeholder="Ex: Operações, Comercial, Faturamento..."
          />
        </div>
        <div>
          <TextField
            label="Tempo máximo aceitável de indisponibilidade"
            value={profile.backupMaxAcceptableDowntime}
            onChange={(v) => updateProfile({ backupMaxAcceptableDowntime: v })}
            placeholder="Ex: 4 horas, 1 dia"
          />
          <p className="text-xs text-muted-foreground mt-1.5 ml-1">
            Por quanto tempo a empresa consegue permanecer sem o sistema ou dado crítico?
          </p>
        </div>
        <div>
          <TextField
            label="Quantidade de dados aceitável perder"
            value={profile.backupMaxAcceptableDataLoss}
            onChange={(v) => updateProfile({ backupMaxAcceptableDataLoss: v })}
            placeholder="Ex: 1 hora, 1 dia"
          />
          <p className="text-xs text-muted-foreground mt-1.5 ml-1">
            Quanto tempo de informações recentes a empresa aceitaria perder após um incidente?
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <SelectField
            label="Já houve perda de dados ou indisponibilidade relevante?"
            value={profile.backupHadRelevantLossOrDowntime}
            onChange={(v) => updateProfile({ backupHadRelevantLossOrDowntime: v })}
            options={triStateOptions}
          />
          <TextField
            label="Principal motivação do projeto"
            value={profile.backupMainProjectMotivation}
            onChange={(v) => updateProfile({ backupMainProjectMotivation: v })}
            placeholder="Ex: Ransomware no setor, compliance..."
          />
        </div>
      </div>

      {/* 07 | ESCOPO DE PROTEÇÃO */}
      <SectionTitle>07 | Escopo de Proteção</SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        <SelectField
          label="Servidor de arquivos"
          value={profile.backupScopeFileServer}
          onChange={(v) => updateProfile({ backupScopeFileServer: v })}
          options={triStateOptions}
        />
        <SelectField
          label="Banco de dados"
          value={profile.backupScopeDatabase}
          onChange={(v) => updateProfile({ backupScopeDatabase: v })}
          options={triStateOptions}
        />
        <SelectField
          label="ERP ou sistema de gestão"
          value={profile.backupScopeErp}
          onChange={(v) => updateProfile({ backupScopeErp: v })}
          options={triStateOptions}
        />
        <SelectField
          label="Active Directory"
          value={profile.backupScopeActiveDirectory}
          onChange={(v) => updateProfile({ backupScopeActiveDirectory: v })}
          options={triStateOptions}
        />
        <SelectField
          label="Aplicações"
          value={profile.backupScopeApplications}
          onChange={(v) => updateProfile({ backupScopeApplications: v })}
          options={triStateOptions}
        />
        <SelectField
          label="Máquinas virtuais"
          value={profile.backupScopeVirtualMachines}
          onChange={(v) => updateProfile({ backupScopeVirtualMachines: v })}
          options={triStateOptions}
        />
        <SelectField
          label="Servidores Windows"
          value={profile.backupScopeWindowsServers}
          onChange={(v) => updateProfile({ backupScopeWindowsServers: v })}
          options={triStateOptions}
        />
        <SelectField
          label="Servidores Linux"
          value={profile.backupScopeLinuxServers}
          onChange={(v) => updateProfile({ backupScopeLinuxServers: v })}
          options={triStateOptions}
        />
      </div>
    </div>
  );
};

export default Step4Backup;
