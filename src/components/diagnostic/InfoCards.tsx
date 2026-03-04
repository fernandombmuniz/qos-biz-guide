import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface InfoCardData {
    icon: LucideIcon;
    label: string;
    value: string | number;
}

interface InfoCardsProps {
    cards: InfoCardData[];
}

const InfoCards = ({ cards }: InfoCardsProps) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {cards.map((c) => (
                <motion.div
                    key={c.label}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-5 text-center"
                >
                    <c.icon className="mx-auto text-primary mb-3" size={28} />
                    <p className="text-3xl font-bold text-foreground">{c.value}</p>
                    <p className="text-sm text-muted-foreground mt-1">{c.label}</p>
                </motion.div>
            ))}
        </div>
    );
};

export default InfoCards;
