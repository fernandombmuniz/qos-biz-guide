import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/context/ProfileContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Database,
  Play,
  RotateCcw,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Shield,
  Clock,
  HardDrive,
  CloudOff,
  AlertTriangle,
  Info,
} from 'lucide-react';

/* ─── helpers ─── */
const hasPartialBackupData = (profile: ReturnType<typeof useProfile>['profile']) => {
  return (
    profile.backupHasSolution !== 'not_informed' ||
    profile.backupPhysicalServers > 0 ||
    profile.backupVirtualServers > 0 ||
    profile.backupDesktopsNotebooksCount > 0 ||
    !!profile.backupMaxAcceptableDowntime ||
    !!profile.backupMostCriticalSystem
  );
};

/* ─── stat card ─── */
const StatCard = ({
  icon: Icon,
  label,
  value,
  delay = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="glass-card p-5 flex flex-col gap-2"
  >
    <Icon size={20} className="text-primary" />
    <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-bold text-foreground">{value}</p>
  </motion.div>
);

/* ─── empty state ─── */
const EmptyState = ({ onStart }: { onStart: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="glass-card p-12 text-center max-w-lg mx-auto"
  >
    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
      <Database size={32} className="text-primary" />
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum diagnóstico realizado</h3>
    <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
      Inicie o levantamento guiado para mapear a estratégia atual de backup e identificar oportunidades de melhoria.
    </p>
    <Button onClick={onStart} className="gap-2 gradient-primary text-primary-foreground hover:opacity-90">
      <Play size={16} /> Iniciar Diagnóstico
    </Button>
  </motion.div>
);

/* ─── result placeholder ─── */
const ResultPlaceholder = ({ onNew }: { onNew: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="space-y-6"
  >
    <div className="glass-card p-8 flex flex-col items-center text-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <CheckCircle2 size={32} className="text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Levantamento concluído</h3>
        <p className="text-sm text-muted-foreground">
          As informações foram registradas com sucesso.
        </p>
      </div>
    </div>

    <div className="glass-card p-8 flex flex-col items-center text-center gap-3 border border-dashed border-border/60">
      <Info size={24} className="text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">Diagnóstico em preparação</p>
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
        A análise detalhada com score, fatores de risco, recomendações e simulações será disponibilizada
        na próxima versão do módulo.
      </p>
    </div>

    <div className="flex justify-center">
      <Button
        variant="outline"
        size="sm"
        onClick={onNew}
        className="gap-2 text-muted-foreground"
      >
        <RotateCcw size={14} /> Iniciar novo diagnóstico
      </Button>
    </div>
  </motion.div>
);

/* ─── main component ─── */
const BackupPage = () => {
  const { profile, resetProfile } = useProfile();
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isComplete = profile.onboardingComplete;
  const isPartial = !isComplete && hasPartialBackupData(profile);

  const handleStart = () => navigate('/onboarding');

  const handleContinue = () => navigate('/onboarding');

  const handleNewDiagnosis = () => {
    resetProfile();
    navigate('/onboarding');
    setConfirmOpen(false);
  };

  // Derive quick stats from profile when complete
  const totalAssets =
    profile.backupPhysicalServers +
    profile.backupVirtualServers +
    (profile.backupHasCloudServers ? profile.backupCloudServersCount : 0) +
    profile.backupDesktopsNotebooksCount;

  const hasSolution =
    profile.backupHasSolution === 'yes' || profile.backupHasSolution === 'partial';

  const tested =
    profile.backupAreBackupsTested === 'yes'
      ? 'Sim'
      : profile.backupAreBackupsTested === 'no'
      ? 'Não'
      : '—';

  return (
    <div className="min-h-screen bg-transparent pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Database size={26} className="text-primary" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Concierge Backup
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed text-sm md:text-base">
            O Concierge Backup avalia rapidamente a estratégia de proteção e recuperação dos dados
            da organização, identificando oportunidades de melhoria e apoiando decisões relacionadas
            à continuidade do negócio.
          </p>
        </motion.div>

        {/* ── Action buttons (partial state) ── */}
        <AnimatePresence>
          {isPartial && !isComplete && (
            <motion.div
              key="partial-actions"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle size={20} className="text-yellow-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Diagnóstico em andamento</p>
                  <p className="text-xs text-muted-foreground">Retome de onde parou para concluir o levantamento.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmOpen(true)}
                  className="gap-2 text-muted-foreground"
                >
                  <RotateCcw size={14} /> Reiniciar
                </Button>
                <Button
                  onClick={handleContinue}
                  size="sm"
                  className="gap-2 gradient-primary text-primary-foreground hover:opacity-90"
                >
                  <ArrowRight size={14} /> Continuar Diagnóstico
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Stats row (shown when complete) ── */}
        {isComplete && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={HardDrive} label="Ativos mapeados" value={totalAssets > 0 ? String(totalAssets) : '—'} delay={0.15} />
            <StatCard
              icon={Shield}
              label="Backup atual"
              value={hasSolution ? (profile.backupHasSolution === 'partial' ? 'Parcial' : 'Ativo') : 'Não'}
              delay={0.2}
            />
            <StatCard icon={CheckCircle2} label="Testes realizados" value={tested} delay={0.25} />
            <StatCard
              icon={Clock}
              label="Tolerância à parada"
              value={profile.backupMaxAcceptableDowntime || '—'}
              delay={0.3}
            />
          </div>
        )}

        {/* ── Content area ── */}
        {isComplete ? (
          <ResultPlaceholder onNew={() => setConfirmOpen(true)} />
        ) : !isPartial ? (
          <EmptyState onStart={handleStart} />
        ) : null}

        {/* ── Feature list (always visible when not complete) ── */}
        {!isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {[
              {
                icon: ClipboardList,
                title: 'Levantamento guiado',
                desc: 'Perguntas objetivas conduzidas em 5 a 8 minutos pelo executivo.',
              },
              {
                icon: CloudOff,
                title: 'Mapeamento de riscos',
                desc: 'Identificação de lacunas na estratégia atual de backup e recuperação.',
              },
              {
                icon: CheckCircle2,
                title: 'Próximas etapas',
                desc: 'Score, recomendações e simulações serão disponibilizados em breve.',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card p-5 space-y-2">
                <Icon size={20} className="text-primary" />
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Confirm dialog ── */}
        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Iniciar novo diagnóstico?</DialogTitle>
              <DialogDescription>
                Deseja iniciar um novo diagnóstico? O diagnóstico anterior permanecerá salvo no histórico.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleNewDiagnosis}
                className="gap-2 gradient-primary text-primary-foreground hover:opacity-90"
              >
                <Play size={14} /> Iniciar novo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
};

export default BackupPage;
