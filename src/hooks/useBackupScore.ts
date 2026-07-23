import { useMemo } from 'react';
import { useProfile } from '@/context/ProfileContext';

export const useBackupScore = () => {
  const { profile } = useProfile();

  // Relevance logic
  // Backup is relevant if the onboarding backup question has been answered
  const isRelevant = !!profile.backupHasSolution && profile.backupHasSolution !== '';

  const backupScoreData = useMemo(() => {
    let score = 0; // Posture score (0-100, 100 is best)
    const hasBackup = profile.backupHasSolution === 'yes' || profile.backupHasSolution === 'partial';
    
    if (hasBackup) {
      score += 30;
      
      // Determine storage location posture (equivalent to old backupType)
      const hasCloud = profile.backupStorageLocation?.includes('Nuvem');
      const hasLocal = profile.backupStorageLocation?.some(opt => 
        ['Mesmo servidor ou equipamento protegido', 'Disco externo', 'NAS ou Storage local', 'Servidor de backup dedicado', 'Fita', 'Datacenter secundário'].includes(opt)
      );
      
      if (hasCloud && hasLocal) score += 20; // Hybrid
      else if (hasCloud) score += 10; // Cloud only
      
      // Tested
      if (profile.backupAreBackupsTested === 'yes') score += 25;
      
      // RTO analysis using backupMaxAcceptableDowntime
      if (profile.backupMaxAcceptableDowntime) {
        const downtime = profile.backupMaxAcceptableDowntime.toLowerCase();
        if (downtime.includes('horas') || downtime.includes('minutos')) {
          score += 25;
        } else if (downtime.includes('dias')) {
          score += 10;
        } else {
          score += 5; // Weeks/months
        }
      }
    }
    
    return {
      score: Math.min(100, score),
      insufficientData: !profile.backupHasSolution || profile.backupHasSolution === ''
    };
  }, [profile]);

  return {
    isRelevant,
    backupScoreData
  };
};
