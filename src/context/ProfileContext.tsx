import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface InternetLink {
  provider: string;
  speed: string;
  increaseSpeed: boolean;
  increaseSpeedNote: string;
}

export interface Profile {
  // Step 1 - Identification
  companyName: string;
  companyLogo: string | null;
  sector: string;
  userCount: number;
  increaseUsers: boolean;
  userGrowthEstimate: string;
  deviceCount: number;
  increaseDevices: boolean;
  deviceGrowthEstimate: string;
  itTeamSize: number;
  networkUsage: string;
  contactName: string;
  contactRole: string;
  step1Notes: string;

  // Step 2 - Network & Connectivity
  internetLinks: InternetLink[];
  hasFirewall: boolean;
  firewallType: string;
  firewallTypeOther: string;
  firewallModel: string;
  activeLicense: boolean;
  idsIps: boolean;
  sslInspection: boolean;
  managedSwitch: boolean;
  switchBrand: string;
  switchModel: string;
  switchCount: number;
  hasVlan: boolean;
  vlanCount: number;
  vlanNames: string;
  hasAP: boolean;
  apBrand: string;
  apModel: string;
  apQuantity: number;
  loadBalancerOption: string;
  loadBalancerText: string;
  sdwanOption: string;
  sdwanText: string;
  voipOption: string;
  voipText: string;
  qosOption: string;
  qosText: string;
  usesVpn: boolean;
  vpnSiteToSite: number;
  vpnRemoteAccess: number;
  vpnMfa: boolean;
  vpnLogs: boolean;
  step2Notes: string;

  // Step 3 - Endpoint
  endpointsWindows: number;
  windowsVersion: string;
  endpointsMac: number;
  macVersion: string;
  hasWindowsServer: boolean;
  windowsServerCount: number;
  windowsServerVersion: string;
  hasLinuxServer: boolean;
  linuxServerCount: number;
  devicesOutOfDomain: boolean;
  outOfDomainCount: number;
  byod: boolean;
  protectionType: string;
  centralConsole: boolean;
  monitoring247: boolean;
  autoUpdate: boolean;
  step3Notes: string;

  // Step 4 - Backup
  hasBackup: boolean;
  backupType: string;
  backupMethod: string;
  backupSize: string;
  criticalApp: string;
  backupDatabase: string;
  regularRestoreTest: boolean;
  restorePeriodDays: string;
  rto: string;
  step4Notes: string;

  // Concierge Backup Fields
  // 01 - Dados do cliente
  backupPhone: string;
  backupEmail: string;
  backupDesiredDeadline: string;
  // 02 - Ambiente
  backupPhysicalServers: number;
  backupVirtualServers: number;
  backupVirtualizationPlatform: string;
  backupHasCloudServers: boolean;
  backupCloudServersCount: number;
  backupDesktopsNotebooksCount: number;
  backupHasNasStorage: string; // 'yes' | 'no' | 'not_informed'
  // 03 - Backup atual
  backupHasSolution: string; // 'yes' | 'no' | 'partial' | 'not_informed'
  backupSolutionName: string;
  backupStorageLocation: string[];
  backupCurrentFrequency: string;
  backupCurrentRetention: string;
  backupAreBackupsTested: string; // 'yes' | 'no' | 'not_informed'
  backupLastTestDate: string;
  // 04 - Dados
  backupTotalVolumeToProtect: string;
  backupMonthlyGrowth: string;
  backupDesiredRetention: string;
  backupDesiredStorageStrategy: string[];
  backupMainLinkSpeed: string;
  backupAvailableWindow: string;
  // 05 - Microsoft 365 e Google Workspace
  backupUsesM365: string; // 'yes' | 'no' | 'not_informed'
  backupM365UsersCount: number;
  backupM365ServicesToProtect: string[];
  backupUsesGoogleWorkspace: string; // 'yes' | 'no' | 'not_informed'
  backupGoogleWorkspaceUsersCount: number;
  backupGoogleWorkspaceServicesToProtect: string[];
  // 06 - Continuidade do negócio
  backupHasUnstoppableSystem: string; // 'yes' | 'no' | 'not_informed'
  backupMostCriticalSystem: string;
  backupImpactIfUnavailable: string;
  backupMostImpactedArea: string;
  backupMaxAcceptableDowntime: string;
  backupMaxAcceptableDataLoss: string;
  backupHadRelevantLossOrDowntime: string; // 'yes' | 'no' | 'not_informed'
  backupMainProjectMotivation: string;
  // 07 - Escopo de Proteção
  backupScopeFileServer: string; // 'yes' | 'no' | 'not_informed'
  backupScopeDatabase: string; // 'yes' | 'no' | 'not_informed'
  backupScopeErp: string; // 'yes' | 'no' | 'not_informed'
  backupScopeActiveDirectory: string; // 'yes' | 'no' | 'not_informed'
  backupScopeApplications: string; // 'yes' | 'no' | 'not_informed'
  backupScopeVirtualMachines: string; // 'yes' | 'no' | 'not_informed'
  backupScopeWindowsServers: string; // 'yes' | 'no' | 'not_informed'
  backupScopeLinuxServers: string; // 'yes' | 'no' | 'not_informed'

  // Step 5 - Governance
  ransomwareAttempt: boolean;
  compromisedAccount: boolean;
  securityPolicy: boolean;
  incidentResponsePlan: boolean;
  step5Notes: string;

  // Step 6 - Strategic Context
  mainConcern: string;
  conversationMotivation: string;
  regulatoryPressure: string;
  growthHorizon: string;
  freeComments: string;
  webFiltering: boolean;
  appControl: boolean;
  trafficVisibility: boolean;
  socMonitoring: boolean;
  operationalMaturity: string;
  step6Notes: string;

  // Meta
  onboardingComplete: boolean;
}

const defaultProfile: Profile = {
  companyName: '',
  companyLogo: null,
  sector: '',
  userCount: 0,
  increaseUsers: false,
  userGrowthEstimate: '',
  deviceCount: 0,
  increaseDevices: false,
  deviceGrowthEstimate: '',
  itTeamSize: 0,
  networkUsage: 'medium',
  contactName: '',
  contactRole: '',
  step1Notes: '',

  internetLinks: [{ provider: '', speed: '', increaseSpeed: false, increaseSpeedNote: '' }],
  hasFirewall: false,
  firewallType: '',
  firewallTypeOther: '',
  firewallModel: '',
  activeLicense: false,
  idsIps: false,
  sslInspection: false,
  managedSwitch: false,
  switchBrand: '',
  switchModel: '',
  switchCount: 0,
  hasVlan: false,
  vlanCount: 0,
  vlanNames: '',
  hasAP: false,
  apBrand: '',
  apModel: '',
  apQuantity: 0,
  loadBalancerOption: 'no',
  loadBalancerText: '',
  sdwanOption: 'no',
  sdwanText: '',
  voipOption: 'no',
  voipText: '',
  qosOption: 'no',
  qosText: '',
  usesVpn: false,
  vpnSiteToSite: 0,
  vpnRemoteAccess: 0,
  vpnMfa: false,
  vpnLogs: false,
  step2Notes: '',

  endpointsWindows: 0,
  windowsVersion: '',
  endpointsMac: 0,
  macVersion: '',
  hasWindowsServer: false,
  windowsServerCount: 0,
  windowsServerVersion: '',
  hasLinuxServer: false,
  linuxServerCount: 0,
  devicesOutOfDomain: false,
  outOfDomainCount: 0,
  byod: false,
  protectionType: 'none',
  centralConsole: false,
  monitoring247: false,
  autoUpdate: false,
  step3Notes: '',

  hasBackup: false,
  backupType: 'local',
  backupMethod: '',
  backupSize: '',
  criticalApp: '',
  backupDatabase: '',
  regularRestoreTest: false,
  restorePeriodDays: '',
  rto: '',
  step4Notes: '',

  backupPhone: '',
  backupEmail: '',
  backupDesiredDeadline: '',
  backupPhysicalServers: 0,
  backupVirtualServers: 0,
  backupVirtualizationPlatform: '',
  backupHasCloudServers: false,
  backupCloudServersCount: 0,
  backupDesktopsNotebooksCount: 0,
  backupHasNasStorage: 'not_informed',
  backupHasSolution: 'not_informed',
  backupSolutionName: '',
  backupStorageLocation: [],
  backupCurrentFrequency: '',
  backupCurrentRetention: '',
  backupAreBackupsTested: 'not_informed',
  backupLastTestDate: '',
  backupTotalVolumeToProtect: '',
  backupMonthlyGrowth: '',
  backupDesiredRetention: '',
  backupDesiredStorageStrategy: [],
  backupMainLinkSpeed: '',
  backupAvailableWindow: '',
  backupUsesM365: 'not_informed',
  backupM365UsersCount: 0,
  backupM365ServicesToProtect: [],
  backupUsesGoogleWorkspace: 'not_informed',
  backupGoogleWorkspaceUsersCount: 0,
  backupGoogleWorkspaceServicesToProtect: [],
  backupHasUnstoppableSystem: 'not_informed',
  backupMostCriticalSystem: '',
  backupImpactIfUnavailable: '',
  backupMostImpactedArea: '',
  backupMaxAcceptableDowntime: '',
  backupMaxAcceptableDataLoss: '',
  backupHadRelevantLossOrDowntime: 'not_informed',
  backupMainProjectMotivation: '',
  backupScopeFileServer: 'not_informed',
  backupScopeDatabase: 'not_informed',
  backupScopeErp: 'not_informed',
  backupScopeActiveDirectory: 'not_informed',
  backupScopeApplications: 'not_informed',
  backupScopeVirtualMachines: 'not_informed',
  backupScopeWindowsServers: 'not_informed',
  backupScopeLinuxServers: 'not_informed',

  ransomwareAttempt: false,
  compromisedAccount: false,
  securityPolicy: false,
  incidentResponsePlan: false,
  step5Notes: '',

  mainConcern: '',
  conversationMotivation: '',
  regulatoryPressure: '',
  growthHorizon: '',
  freeComments: '',
  webFiltering: false,
  appControl: false,
  trafficVisibility: false,
  socMonitoring: false,
  operationalMaturity: '',
  step6Notes: '',

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
