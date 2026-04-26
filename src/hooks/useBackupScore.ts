import { useMemo } from 'react';
import { useProfile } from '@/context/ProfileContext';

export const useBackupScore = () => {
  const { profile } = useProfile();

  // Relevance logic
  // Backup is relevant if there are:
  // hasBackup, backupMethod, rto, dados críticos
  const isRelevant = profile.hasBackup || profile.backupType !== 'none' || profile.criticalApp !== '';

  const backupScoreData = useMemo(() => {
    let score = 0; // Posture score (0-100, 100 is best)
    
    if (profile.hasBackup) {
      score += 30;
      
      // backupType: local, cloud, hibrido
      if (profile.backupType === 'cloud') score += 10;
      if (profile.backupType === 'hibrido') score += 20;
      
      if (profile.regularRestoreTest) score += 25;
      
      // RTO analysis
      if (profile.rto) {
        if (profile.rto.includes('horas') || profile.rto.includes('minutos')) {
          score += 25;
        } else if (profile.rto.includes('dias')) {
          score += 10;
        } else {
          score += 5; // Semanimas/meses
        }
      }
    }
    
    return {
      score: Math.min(100, score),
      insufficientData: !profile.hasBackup && profile.backupType === '' && profile.rto === ''
    };
  }, [profile]);

  return {
    isRelevant,
    backupScoreData
  };
};
