import { Link, useLocation } from 'react-router-dom';
import { Shield, Monitor, Database, FileDown, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfile } from '@/context/ProfileContext';
import { generatePDF } from '@/utils/pdfExport';
import logoConcierge from '@/assets/logo-concierge.jpg';

const Navbar = () => {
  const location = useLocation();
  const { profile, resetProfile } = useProfile();

  if (!profile.onboardingComplete) return null;

  const navItems = [
    { path: '/hub', label: 'Hub', icon: Shield },
    { path: '/onboarding', label: 'Onboarding', icon: Shield },
    { path: '/firewall', label: 'Firewall', icon: Shield },
    { path: '/endpoint', label: 'Endpoint', icon: Monitor },
    { path: '/backup', label: 'Backup', icon: Database },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/hub" className="flex items-center gap-3">
            <img src={logoConcierge} alt="Concierge" className="h-8 object-contain" />
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon size={16} />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => generatePDF(profile)}
              className="text-sm"
            >
              <FileDown size={16} className="mr-1" />
              Exportar PDF
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                resetProfile();
                window.location.href = '/';
              }}
              className="text-muted-foreground"
            >
              <RotateCcw size={16} />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
