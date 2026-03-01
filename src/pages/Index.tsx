import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/context/ProfileContext';

const Index = () => {
  const { profile } = useProfile();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile.onboardingComplete) {
      navigate('/hub');
    } else {
      navigate('/onboarding');
    }
  }, [profile.onboardingComplete, navigate]);

  return null;
};

export default Index;
