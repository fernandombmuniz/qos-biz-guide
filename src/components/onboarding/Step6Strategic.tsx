import { useProfile } from '@/context/ProfileContext';
import { TextAreaField } from '@/components/FormFields';

const Step6Strategic = () => {
  const { profile, updateProfile } = useProfile();

  return (
    <div className="space-y-5">
      <TextAreaField label="Principal preocupação atual" value={profile.mainConcern} onChange={(v) => updateProfile({ mainConcern: v })} placeholder="Ex: Vulnerabilidade a ransomware, compliance, crescimento..." />
      <TextAreaField label="O que motivou esta conversa?" value={profile.conversationMotivation} onChange={(v) => updateProfile({ conversationMotivation: v })} placeholder="Ex: Incidente recente, auditoria, necessidade de expansão..." />
      <TextAreaField label="Pressão regulatória (LGPD, auditoria, etc.)" value={profile.regulatoryPressure} onChange={(v) => updateProfile({ regulatoryPressure: v })} placeholder="Ex: Adequação LGPD, auditoria ISO 27001..." />
      <TextAreaField label="Horizonte de crescimento" value={profile.growthHorizon} onChange={(v) => updateProfile({ growthHorizon: v })} placeholder="Ex: Expansão para 3 filiais em 12 meses..." />
      <TextAreaField label="Comentários livres" value={profile.freeComments} onChange={(v) => updateProfile({ freeComments: v })} placeholder="Qualquer informação adicional relevante..." rows={4} />
      <TextAreaField label="Observações Técnicas" value={profile.step6Notes} onChange={(v) => updateProfile({ step6Notes: v })} placeholder="Notas técnicas para dimensionamento..." />
    </div>
  );
};

export default Step6Strategic;
