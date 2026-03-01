import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/context/ProfileContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import logoConcierge from '@/assets/logo-concierge.jpg';

import Step1Identification from '@/components/onboarding/Step1Identification';
import Step2Network from '@/components/onboarding/Step2Network';
import Step3Endpoint from '@/components/onboarding/Step3Endpoint';
import Step4Backup from '@/components/onboarding/Step4Backup';
import Step5Governance from '@/components/onboarding/Step5Governance';
import Step6Strategic from '@/components/onboarding/Step6Strategic';
import Step7Review from '@/components/onboarding/Step7Review';

const TOTAL_STEPS = 7;

const stepTitles = [
  { title: 'Identificação & Capacidade Atual', subtitle: 'Levantamento inicial para dimensionamento de capacidade e contexto operacional.' },
  { title: 'Infraestrutura de Rede & Conectividade', subtitle: 'Mapeamento de conectividade, perímetro e controle de tráfego.' },
  { title: 'Endpoint & Dispositivos', subtitle: 'Mapeamento de estações, servidores e modelo atual de proteção.' },
  { title: 'Backup & Continuidade', subtitle: 'Avaliação da estratégia de recuperação e tolerância a indisponibilidade.' },
  { title: 'Governança & Histórico', subtitle: 'Indicadores de maturidade e histórico de incidentes.' },
  { title: 'Contexto Estratégico', subtitle: 'Objetivo e motivação da iniciativa.' },
  { title: 'Revisão Final', subtitle: 'Consolidação das informações captadas.' },
];

const stepComponents = [
  Step1Identification,
  Step2Network,
  Step3Endpoint,
  Step4Backup,
  Step5Governance,
  Step6Strategic,
  Step7Review,
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const { profile, updateProfile } = useProfile();
  const navigate = useNavigate();
  const isEditing = profile.onboardingComplete;

  const progress = (step / TOTAL_STEPS) * 100;

  const nextStep = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
    else {
      if (!isEditing) updateProfile({ onboardingComplete: true });
      navigate('/hub');
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const StepComponent = stepComponents[step - 1];
  const info = stepTitles[step - 1];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <img src={logoConcierge} alt="Concierge" className="h-12 object-contain mb-3" />
          <h1 className="text-lg font-bold text-foreground tracking-wide">Concierge Interactive Experience</h1>
        </div>

        {/* Progress */}
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
              <StepComponent />
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-6">
          <Button variant="outline" onClick={prevStep} disabled={step === 1} className="gap-2">
            <ChevronLeft size={16} /> Voltar
          </Button>
          <Button onClick={nextStep} className="gap-2 gradient-primary text-primary-foreground hover:opacity-90">
            {step === TOTAL_STEPS ? (isEditing ? 'Salvar e Voltar' : 'Concluir') : 'Próximo'} <ChevronRight size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
