import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, CheckCircle2, XCircle } from 'lucide-react';

interface SimulationContainerProps {
    title: string;
    attacks: { id: string; label: string }[];
    currentAttack: string;
    onAttackChange: (id: string) => void;
    mode: 'without' | 'with';
    onModeChange: (mode: 'without' | 'with') => void;
    running: boolean;
    step: number;
    onRun: () => void;
    steps: string[];
}

const SimulationContainer = ({
    title,
    attacks,
    currentAttack,
    onAttackChange,
    mode,
    onModeChange,
    running,
    step,
    onRun,
    steps
}: SimulationContainerProps) => {
    return (
        <SectionContainer title={title}>
            <div className="glass-card p-8">
                <div className="flex flex-wrap gap-3 mb-6">
                    {attacks.map((a) => (
                        <Button
                            key={a.id}
                            variant={currentAttack === a.id ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => onAttackChange(a.id)}
                            className={currentAttack === a.id ? 'gradient-primary text-primary-foreground' : ''}
                        >
                            {a.label}
                        </Button>
                    ))}
                </div>
                <div className="flex gap-3 mb-6">
                    <Button
                        variant={mode === 'without' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onModeChange('without')}
                        className={mode === 'without' ? 'gradient-danger text-danger-foreground' : ''}
                    >
                        <XCircle size={14} className="mr-1" /> Sem Proteção
                    </Button>
                    <Button
                        variant={mode === 'with' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => onModeChange('with')}
                        className={mode === 'with' ? 'gradient-success text-success-foreground' : ''}
                    >
                        <CheckCircle2 size={14} className="mr-1" /> Com Proteção
                    </Button>
                    <Button variant="outline" size="sm" onClick={onRun} className="ml-auto" disabled={running}>
                        <Play size={14} className="mr-1" /> Executar
                    </Button>
                </div>

                <div className="space-y-3">
                    {steps.map((s, i) => {
                        const isActive = running && i < step;
                        const isCurrent = running && i === step - 1;
                        const isLast = i === steps.length - 1;
                        const isSuccess = mode === 'with' && isLast;
                        const isDanger = mode === 'without' && isLast;

                        return (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0.3 }}
                                animate={{ opacity: isActive ? 1 : 0.3 }}
                                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${isCurrent ? (isSuccess ? 'bg-success/10 border border-success/30' : isDanger ? 'bg-danger/10 border border-danger/30' : 'bg-primary/10 border border-primary/30') : 'bg-secondary/30'}`}
                            >
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${isActive ? (isSuccess ? 'gradient-success' : isDanger ? 'gradient-danger' : 'gradient-primary') : 'bg-secondary'} text-primary-foreground`}>
                                    {i + 1}
                                </div>
                                <span className={`text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>{s}</span>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </SectionContainer>
    );
};

// Internal Import for SectionContainer since it's in the same folder during creation but will be used from the registry
import SectionContainer from './SectionContainer';

export default SimulationContainer;
