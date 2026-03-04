import { motion } from 'framer-motion';
import { Database, Construction } from 'lucide-react';

const BackupPage = () => {
  return (
    <div className="min-h-screen bg-transparent pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-24"
        >
          <Database className="mx-auto text-primary mb-4" size={48} />
          <h1 className="text-3xl font-bold text-foreground mb-3">Concierge Backup</h1>
          <p className="text-muted-foreground mb-8">Estratégia de recuperação e continuidade de negócios</p>

          <div className="glass-card p-12 max-w-lg mx-auto">
            <Construction className="mx-auto text-muted-foreground mb-4" size={48} />
            <h3 className="text-lg font-semibold text-foreground mb-2">Módulo em Desenvolvimento</h3>
            <p className="text-sm text-muted-foreground">
              Este módulo está preparado para expansão futura. Em breve, terá funcionalidades completas de
              dimensionamento de backup, análise de RPO/RTO, e simulações de recuperação de desastres.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BackupPage;
