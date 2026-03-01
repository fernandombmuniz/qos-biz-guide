import { useProfile } from '@/context/ProfileContext';
import { TextField, SelectField, ToggleField, TextAreaField } from '@/components/FormFields';

const Step4Backup = () => {
  const { profile, updateProfile } = useProfile();

  return (
    <div className="space-y-5">
      <ToggleField label="Possui backup?" value={profile.hasBackup} onChange={(v) => updateProfile({ hasBackup: v })} />
      {profile.hasBackup && (
        <div className="space-y-4 pl-4 border-l-2 border-primary/30">
          <SelectField label="Tipo de backup" value={profile.backupType} onChange={(v) => updateProfile({ backupType: v })} options={[
            { value: 'local', label: 'Local' }, { value: 'cloud', label: 'Nuvem' }, { value: 'hybrid', label: 'Híbrido' },
          ]} />
          <TextField label="Como é feito o backup?" value={profile.backupMethod} onChange={(v) => updateProfile({ backupMethod: v })} placeholder="Ex: Veeam, Acronis, rsync, manual..." />
          <TextField label="Tamanho aproximado do backup" value={profile.backupSize} onChange={(v) => updateProfile({ backupSize: v })} placeholder="Ex: 2 TB" />
          <TextField label="Aplicação crítica?" value={profile.criticalApp} onChange={(v) => updateProfile({ criticalApp: v })} placeholder="Ex: ERP, CRM, sistemas internos..." />
          <TextField label="Banco de dados?" value={profile.backupDatabase} onChange={(v) => updateProfile({ backupDatabase: v })} placeholder="Ex: SQL Server, PostgreSQL, Oracle..." />
          <ToggleField label="Teste de restore regular?" value={profile.regularRestoreTest} onChange={(v) => updateProfile({ regularRestoreTest: v })} />
          {profile.regularRestoreTest && (
            <div className="pl-4 border-l-2 border-primary/30">
              <TextField label="Periodicidade (em dias)" value={profile.restorePeriodDays} onChange={(v) => updateProfile({ restorePeriodDays: v })} placeholder="Ex: 30, 90" />
            </div>
          )}
          <TextField label="Tempo máximo tolerável de indisponibilidade (RTO)" value={profile.rto} onChange={(v) => updateProfile({ rto: v })} placeholder="Ex: 4 horas" />
        </div>
      )}

      <TextAreaField label="Informações adicionais" value={profile.step4Notes} onChange={(v) => updateProfile({ step4Notes: v })} placeholder="Observações sobre backup e continuidade..." />
    </div>
  );
};

export default Step4Backup;
