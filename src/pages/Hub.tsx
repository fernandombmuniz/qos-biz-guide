import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/context/ProfileContext';
import { motion } from 'framer-motion';
import { Shield, Monitor, Database, Award, Clock, Globe, ClipboardList } from 'lucide-react';
import logoConcierge from '@/assets/logo-concierge.jpg';

const Hub = () => {
  const { profile } = useProfile();
  const navigate = useNavigate();

  const modules = [
    { path: '/onboarding', label: 'Onboarding', icon: ClipboardList, description: 'Editar informações do levantamento técnico.' },
    { path: '/firewall', label: 'Concierge Firewall', icon: Shield, description: 'Proteção de perímetro, segmentação e conectividade segura.' },
    { path: '/endpoint', label: 'Concierge Endpoint', icon: Monitor, description: 'EDR avançado para estações, servidores e dispositivos.' },
    { path: '/backup', label: 'Concierge Backup', icon: Database, description: 'Estratégia de recuperação e continuidade de negócios.' },
  ];

  const badges = [
    { icon: Award, label: 'ISO 27001' },
    { icon: Clock, label: 'SOC 24/7' },
    { icon: Globe, label: 'NIST Oriented' },
    { icon: Shield, label: '23 anos' },
  ];

  return (
    <div className="min-h-screen bg-transparent pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-6 mb-8">
            {profile.companyLogo && (
              <img src={profile.companyLogo} alt="Logo cliente" className="h-14 object-contain rounded-lg" />
            )}
            <div className="w-px h-10 bg-border" />
            <img src={logoConcierge} alt="Concierge" className="h-14 object-contain" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Concierge Segurança Digital
          </h1>
          <p className="text-lg text-gradient font-semibold mb-2">Interactive Experience</p>
          {profile.companyName && (
            <p className="text-muted-foreground mb-4">Dimensionamento para <span className="text-foreground font-medium">{profile.companyName}</span></p>
          )}

          <div className="flex items-center justify-center gap-4 flex-wrap mt-6">
            {badges.map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
                <badge.icon size={14} className="text-primary" />
                {badge.label}
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">Grupo QOS Tecnologia</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((mod, i) => (
            <motion.button
              key={mod.path}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              onClick={() => navigate(mod.path)}
              className="glass-card p-8 text-left hover:border-primary/50 transition-all group cursor-pointer"
            >
              <mod.icon size={36} className="text-primary mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-foreground mb-2">{mod.label}</h3>
              <p className="text-sm text-muted-foreground">{mod.description}</p>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Hub;
