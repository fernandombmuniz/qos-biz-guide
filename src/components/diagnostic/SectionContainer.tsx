import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionContainerProps {
    title: string;
    icon?: LucideIcon;
    iconColor?: string;
    children: ReactNode;
    className?: string;
    titleSize?: 'text-xl' | 'text-2xl';
}

const SectionContainer = ({
    title,
    icon: Icon,
    iconColor = "text-primary",
    children,
    className = "",
    titleSize = "text-2xl"
}: SectionContainerProps) => {
    return (
        <section className={className}>
            <h2 className={`${titleSize} font-bold text-foreground mb-6 flex items-center gap-2`}>
                {Icon && <Icon className={iconColor} size={titleSize === 'text-2xl' ? 24 : 20} />}
                {title}
            </h2>
            {children}
        </section>
    );
};

export default SectionContainer;
