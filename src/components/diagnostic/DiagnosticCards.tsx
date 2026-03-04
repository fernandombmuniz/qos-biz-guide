import { motion } from 'framer-motion';
import {
    ChevronDown, CheckCircle2
} from 'lucide-react';
import {
    Collapsible, CollapsibleTrigger, CollapsibleContent,
} from '@/components/ui/collapsible';

interface RiskItem {
    id: string;
    label: string;
    points: number;
    description: string;
}

interface ExposureInfo {
    label: string;
    color: string;
    textColor: string;
    gradientClass: string;
}

interface DiagnosticCardsProps {
    title: string;
    subtitle: string;
    score: number;
    maxScore: number;
    exposure: ExposureInfo;
    displayScore: number;
    risks: RiskItem[];
    emptyMessage?: string;
}

const getExposureLevelItem = (points: number, maxPoints: number) => {
    const ratio = points / maxPoints;
    if (ratio <= 0.25) return { textColor: 'text-emerald-500', gradientClass: 'bg-gradient-to-r from-emerald-400 to-emerald-500' };
    if (ratio <= 0.50) return { textColor: 'text-yellow-500', gradientClass: 'bg-gradient-to-r from-yellow-400 to-yellow-500' };
    if (ratio <= 0.75) return { textColor: 'text-orange-500', gradientClass: 'bg-gradient-to-r from-orange-400 to-orange-500' };
    return { textColor: 'text-red-500', gradientClass: 'bg-gradient-to-r from-red-500 to-red-600' };
};

const DiagnosticCards = ({
    title,
    subtitle,
    score,
    maxScore,
    exposure,
    displayScore,
    risks,
    emptyMessage = "Nenhum risco crítico detectado."
}: DiagnosticCardsProps) => {
    return (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <Collapsible>
                <div className="glass-card p-6">
                    <CollapsibleTrigger className="w-full text-left group">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <p className="text-lg font-bold text-foreground">{title}</p>
                                <p className="text-base text-muted-foreground mt-1 pr-6">{subtitle}</p>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className={`text-3xl md:text-5xl font-extrabold ${exposure.textColor}`}>{displayScore}</p>
                                        <p className={`text-base md:text-lg font-bold ${exposure.textColor} mt-1`}>{exposure.label}</p>
                                    </div>
                                    <ChevronDown size={28} className="text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                </div>
                            </div>
                        </div>
                        <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                            <motion.div
                                className={`h-full rounded-full ${exposure.gradientClass}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((score / maxScore) * 100, 100)}%` }}
                                transition={{ duration: 1.2, ease: 'easeOut' }}
                            />
                        </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                        <div className="mt-8 pt-6 border-t border-border/40">
                            <h4 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
                                Fatores Técnicos de Risco
                            </h4>

                            {risks.length === 0 ? (
                                <div className="glass-card p-6 text-center">
                                    <CheckCircle2 className="mx-auto text-success mb-3" size={40} />
                                    <p className="text-lg text-foreground font-medium">{emptyMessage}</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {risks.map((risk, i) => {
                                        const descParts = risk.description.split('\n\nFonte:');
                                        const localExposure = getExposureLevelItem(risk.points, 30); // Using 30 as ref point for max individual risk

                                        return (
                                            <motion.div
                                                key={risk.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <Collapsible>
                                                    <div className="glass-card p-5 bg-secondary/20">
                                                        <CollapsibleTrigger className="w-full text-left group">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className="font-bold text-foreground text-lg">{risk.label}</h4>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`text-base font-bold ${localExposure.textColor}`}>+{risk.points} pts</span>
                                                                    <ChevronDown size={20} className="text-muted-foreground transition-transform duration-300 group-data-[state=open]:rotate-180" />
                                                                </div>
                                                            </div>
                                                            <div className="w-full bg-secondary rounded-full h-2.5 overflow-hidden">
                                                                <motion.div
                                                                    className={`h-full rounded-full ${localExposure.gradientClass}`}
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${Math.min((risk.points / 30) * 100, 100)}%` }}
                                                                    transition={{ duration: 1.2, ease: 'easeOut', delay: i * 0.15 }}
                                                                />
                                                            </div>
                                                        </CollapsibleTrigger>

                                                        <CollapsibleContent>
                                                            <div className="mt-5 pt-4 border-t border-border/30">
                                                                <p className="text-base text-foreground/90 mb-4" style={{ lineHeight: '1.6' }}>
                                                                    {descParts[0]}
                                                                </p>
                                                                {descParts[1] && (
                                                                    <div className="bg-secondary/40 p-3 rounded-lg border border-border/50">
                                                                        <p className="text-sm text-muted-foreground">
                                                                            <span className="font-semibold text-foreground mr-1">Fonte:</span>
                                                                            {descParts[1]}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </CollapsibleContent>
                                                    </div>
                                                </Collapsible>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </CollapsibleContent>
                </div>
            </Collapsible>
        </motion.div>
    );
};

export default DiagnosticCards;
