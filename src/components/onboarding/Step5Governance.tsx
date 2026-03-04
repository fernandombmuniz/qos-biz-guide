import { useProfile } from '@/context/ProfileContext';
import { ToggleField, TextAreaField, SelectField } from '@/components/FormFields';

const Step5Governance = () => {
  const { profile, updateProfile } = useProfile();

  return (
    <div className="space-y-5">
      <ToggleField label="Já sofreu tentativa de ransomware?" value={profile.ransomwareAttempt} onChange={(v) => updateProfile({ ransomwareAttempt: v })} />
      <ToggleField label="Conta comprometida?" value={profile.compromisedAccount} onChange={(v) => updateProfile({ compromisedAccount: v })} />
      <ToggleField label="Política formal de segurança?" value={profile.securityPolicy} onChange={(v) => updateProfile({ securityPolicy: v })} />
      <ToggleField label="Plano de resposta a incidentes?" value={profile.incidentResponsePlan} onChange={(v) => updateProfile({ incidentResponsePlan: v })} />

      <ToggleField label="Monitoramento SOC 24/7?" value={profile.socMonitoring} onChange={(v) => updateProfile({ socMonitoring: v })} />
      <SelectField label="Nível de Maturidade Operacional" value={profile.operationalMaturity} onChange={(v) => updateProfile({ operationalMaturity: v })} options={[
        { value: 'initial', label: 'Inicial (Reativo)' },
        { value: 'defined', label: 'Definido (Processos básicos)' },
        { value: 'managed', label: 'Gerenciado (Monitoramento ativo)' },
        { value: 'optimized', label: 'Otimizado (Sustentável)' },
      ]} />

      <TextAreaField label="Observações" value={profile.step5Notes} onChange={(v) => updateProfile({ step5Notes: v })} placeholder="Detalhes sobre incidentes ou governança..." />
    </div>
  );
};

export default Step5Governance;
