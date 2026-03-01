import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface InternetLink {
  provider: string;
  speed: string;
  increaseSpeed: boolean;
}

export interface Profile {
  companyName: string;
  companyLogo: string | null;
  sector: string;
  userCount: number;
  increaseUsers: boolean;
  deviceCount: number;
  increaseDevices: boolean;
  itTeamSize: number;
  networkUsage: string;
  contactName: string;
  contactRole: string;
  internetLinks: InternetLink[];
  hasFirewall: boolean;
  firewallType: string;
  firewallModel: string;
  activeLicense: boolean;
  idsIps: boolean;
  sslInspection: boolean;
  managedSwitch: boolean;
  switchCount: number;
  vlanCount: number;
  wifiSegmentation: string;
  hasLoadBalancer: boolean;
  hasSdwan: boolean;
  usesVoip: boolean;
  needsQos: boolean;
  usesVpn: boolean;
  vpnSiteToSite: number;
  vpnRemoteAccess: number;
  vpnMfa: boolean;
  vpnLogs: boolean;
  vpnRetryLimit: boolean;
  endpointsWindows: number;
  endpointsMac: number;
  hasWindowsServer: boolean;
  hasLinuxServer: boolean;
  devicesOutOfDomain: boolean;
  byod: boolean;
  protectionType: string;
  centralConsole: boolean;
  monitoring247: boolean;
  autoUpdate: boolean;
  hasBackup: boolean;
  backupType: string;
  immutableBackup: boolean;
  regularRestoreTest: boolean;
  rto: string;
  ransomwareAttempt: boolean;
  compromisedAccount: boolean;
  securityPolicy: boolean;
  incidentResponsePlan: boolean;
  onboardingComplete: boolean;
}

const defaultProfile: Profile = {
  companyName: '',
  companyLogo: null,
  sector: '',
  userCount: 0,
  increaseUsers: false,
  deviceCount: 0,
  increaseDevices: false,
  itTeamSize: 0,
  networkUsage: 'medium',
  contactName: '',
  contactRole: '',
  internetLinks: [{ provider: '', speed: '', increaseSpeed: false }],
  hasFirewall: false,
  firewallType: '',
  firewallModel: '',
  activeLicense: false,
  idsIps: false,
  sslInspection: false,
  managedSwitch: false,
  switchCount: 0,
  vlanCount: 0,
  wifiSegmentation: 'ssid',
  hasLoadBalancer: false,
  hasSdwan: false,
  usesVoip: false,
  needsQos: false,
  usesVpn: false,
  vpnSiteToSite: 0,
  vpnRemoteAccess: 0,
  vpnMfa: false,
  vpnLogs: false,
  vpnRetryLimit: false,
  endpointsWindows: 0,
  endpointsMac: 0,
  hasWindowsServer: false,
  hasLinuxServer: false,
  devicesOutOfDomain: false,
  byod: false,
  protectionType: 'none',
  centralConsole: false,
  monitoring247: false,
  autoUpdate: false,
  hasBackup: false,
  backupType: 'local',
  immutableBackup: false,
  regularRestoreTest: false,
  rto: '',
  ransomwareAttempt: false,
  compromisedAccount: false,
  securityPolicy: false,
  incidentResponsePlan: false,
  onboardingComplete: false,
};

interface ProfileContextType {
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => void;
  resetProfile: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfile] = useState<Profile>(defaultProfile);

  const updateProfile = (updates: Partial<Profile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  const resetProfile = () => setProfile(defaultProfile);

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, resetProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
};
