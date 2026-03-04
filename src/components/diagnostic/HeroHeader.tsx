import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import shieldConciergeLogo from '@/assets/shieldconcierge.png';

interface HeroHeaderProps {
    title: string;
    titleAccent?: string;
    subtitle: string;
    companyName?: string;
    companyLogo?: string;
    contactName?: string;
    contactRole?: string;
    icon?: LucideIcon;
}

const HeroHeader = ({
    title,
    titleAccent,
    subtitle,
    companyName = '',
    companyLogo,
    contactName = '',
    contactRole = '',
    icon: Icon
}: HeroHeaderProps) => {
    return (
        <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative"
        >
            <div className="glass-card p-8 md:p-10 border-border/40 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-3 mb-1">
                            <div className="bg-primary/10 p-2 rounded-xl border border-primary/20 backdrop-blur-sm">
                                <img src={shieldConciergeLogo} alt="Shield" className="h-8 w-8 object-contain" />
                            </div>
                            <h1 className="text-3xl md:text-5xl font-extrabold text-foreground tracking-tight">
                                {title} <span className="text-primary/90 font-bold">{titleAccent}</span>
                            </h1>
                        </div>
                        <h2 className="text-lg md:text-xl font-medium text-muted-foreground tracking-widest uppercase">
                            {subtitle}
                        </h2>
                    </div>

                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 py-4 border-y border-border/30 w-full max-w-2xl text-sm font-medium">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary/60" />
                            <span className="text-muted-foreground">Ambiente:</span>
                            <span className="text-foreground">{companyName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary/60" />
                            <span className="text-muted-foreground">Contato:</span>
                            <span className="text-foreground">{contactName}</span>
                            {contactRole && <span className="text-muted-foreground/60">— {contactRole}</span>}
                        </div>
                    </div>

                    <div className="pt-2">
                        {companyLogo ? (
                            <div className="relative group">
                                <div className="absolute -inset-4 bg-primary/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 shadow-xl overflow-hidden">
                                    <img
                                        src={companyLogo}
                                        alt="Client Logo"
                                        className="h-16 md:h-20 object-contain brightness-110 contrast-125"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="bg-secondary/30 p-4 rounded-2xl border border-border/50 text-muted-foreground text-xs uppercase tracking-widest font-bold">
                                Logo Institucional
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.section>
    );
};

export default HeroHeader;
