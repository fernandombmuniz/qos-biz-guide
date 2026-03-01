import jsPDF from 'jspdf';
import type { Profile } from '@/context/ProfileContext';

export const generatePDF = (profile: Profile) => {
  const doc = new jsPDF();
  let y = 20;
  const margin = 20;
  const pageWidth = doc.internal.pageSize.width;

  const addTitle = (text: string) => {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin, y);
    y += 10;
  };

  const addSubtitle = (text: string) => {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(text, margin, y);
    y += 7;
  };

  const addLine = (label: string, value: string) => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${label}: ${value}`, margin, y);
    y += 6;
  };

  const addSeparator = () => {
    y += 3;
    doc.setDrawColor(200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  // Header
  addTitle('Relatório Técnico — Concierge Segurança Digital');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Grupo QOS Tecnologia • ISO 27001 • SOC 24/7 • NIST Oriented', margin, y);
  y += 5;
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, y);
  y += 10;
  addSeparator();

  // Company Info
  addSubtitle('Identificação');
  addLine('Empresa', profile.companyName || 'N/A');
  addLine('Setor', profile.sector || 'N/A');
  addLine('Contato', `${profile.contactName} — ${profile.contactRole}`);
  addLine('Usuários', String(profile.userCount));
  addLine('Dispositivos', String(profile.deviceCount));
  addLine('Time de TI', String(profile.itTeamSize));
  addLine('Perfil de uso', profile.networkUsage);
  if (profile.step1Notes) addLine('Observações', profile.step1Notes);
  addSeparator();

  // Internet
  addSubtitle('Links de Internet');
  profile.internetLinks.forEach((link, i) => {
    addLine(`Link ${i + 1}`, `${link.provider} — ${link.speed}`);
  });
  addSeparator();

  // Infra
  addSubtitle('Infraestrutura');
  addLine('Firewall', profile.hasFirewall ? `Sim (${profile.firewallType === 'other' ? profile.firewallTypeOther : profile.firewallType} — ${profile.firewallModel})` : 'Não');
  if (profile.hasFirewall) {
    addLine('Licença ativa', profile.activeLicense ? 'Sim' : 'Não');
    addLine('IDS/IPS', profile.idsIps ? 'Sim' : 'Não');
    addLine('Inspeção SSL', profile.sslInspection ? 'Sim' : 'Não');
  }
  addLine('Switch gerenciável', profile.managedSwitch ? `Sim — ${profile.switchBrand} ${profile.switchModel} (${profile.switchCount})` : 'Não');
  addLine('VLAN', profile.hasVlan ? `${profile.vlanCount} — ${profile.vlanNames}` : 'Não');
  addLine('AP', profile.hasAP ? `${profile.apBrand} ${profile.apModel} (${profile.apQuantity})` : 'Não');
  addLine('Load Balancer', profile.loadBalancerOption === 'yes' ? 'Sim' : profile.loadBalancerOption === 'other' ? profile.loadBalancerText : 'Não');
  addLine('SD-WAN', profile.sdwanOption === 'yes' ? 'Sim' : profile.sdwanOption === 'other' ? profile.sdwanText : 'Não');
  addLine('VoIP', profile.voipOption === 'yes' ? 'Sim' : profile.voipOption === 'other' ? profile.voipText : 'Não');
  addLine('QoS', profile.qosOption === 'yes' ? 'Sim' : profile.qosOption === 'other' ? profile.qosText : 'Não');
  addSeparator();

  // VPN
  addSubtitle('VPN');
  addLine('Utiliza VPN', profile.usesVpn ? 'Sim' : 'Não');
  if (profile.usesVpn) {
    addLine('Site-to-site', String(profile.vpnSiteToSite));
    addLine('Acesso remoto', String(profile.vpnRemoteAccess));
    addLine('MFA', profile.vpnMfa ? 'Sim' : 'Não');
    addLine('Logs monitorados', profile.vpnLogs ? 'Sim' : 'Não');
  }
  addSeparator();

  // Endpoints
  addSubtitle('Endpoint & Dispositivos');
  addLine('Windows', `${profile.endpointsWindows} (${profile.windowsVersion || 'N/A'})`);
  addLine('Mac', `${profile.endpointsMac} (${profile.macVersion || 'N/A'})`);
  addLine('Servidor Windows', profile.hasWindowsServer ? `Sim (${profile.windowsServerCount} — ${profile.windowsServerVersion})` : 'Não');
  addLine('Servidor Linux', profile.hasLinuxServer ? `Sim (${profile.linuxServerCount})` : 'Não');
  addLine('BYOD', profile.byod ? 'Sim' : 'Não');
  addLine('Proteção atual', profile.protectionType);
  addSeparator();

  // Backup
  addSubtitle('Backup');
  addLine('Possui backup', profile.hasBackup ? 'Sim' : 'Não');
  if (profile.hasBackup) {
    addLine('Tipo', profile.backupType);
    addLine('Método', profile.backupMethod || 'N/A');
    addLine('Tamanho', profile.backupSize || 'N/A');
    addLine('Teste de restore', profile.regularRestoreTest ? `Sim (${profile.restorePeriodDays} dias)` : 'Não');
    addLine('RTO', profile.rto || 'N/A');
  }
  addSeparator();

  // Risks
  addSubtitle('Riscos Identificados');
  const risks = detectAllRisks(profile);
  risks.forEach((r) => {
    addLine(r.title, `Severidade: ${r.severity}%`);
  });

  // Governance
  if (y > 250) { doc.addPage(); y = 20; }
  addSeparator();
  addSubtitle('Governança');
  addLine('Tentativa ransomware', profile.ransomwareAttempt ? 'Sim' : 'Não');
  addLine('Conta comprometida', profile.compromisedAccount ? 'Sim' : 'Não');
  addLine('Política de segurança', profile.securityPolicy ? 'Sim' : 'Não');
  addLine('Plano de resposta', profile.incidentResponsePlan ? 'Sim' : 'Não');

  // Strategic context
  if (profile.mainConcern || profile.conversationMotivation) {
    addSeparator();
    addSubtitle('Contexto Estratégico');
    if (profile.mainConcern) addLine('Principal preocupação', profile.mainConcern);
    if (profile.conversationMotivation) addLine('Motivação', profile.conversationMotivation);
    if (profile.regulatoryPressure) addLine('Pressão regulatória', profile.regulatoryPressure);
    if (profile.growthHorizon) addLine('Horizonte de crescimento', profile.growthHorizon);
  }

  doc.save(`relatorio-tecnico-${profile.companyName || 'empresa'}.pdf`);
};

interface Risk {
  title: string;
  severity: number;
  description: string;
  category: 'firewall' | 'endpoint' | 'backup';
}

export const detectAllRisks = (profile: Profile): Risk[] => {
  const risks: Risk[] = [];

  if (!profile.hasFirewall) risks.push({ title: 'Firewall Inexistente', severity: 95, description: 'A ausência de firewall expõe toda a rede a ameaças externas.', category: 'firewall' });
  if (!profile.idsIps) risks.push({ title: 'Sem IDS/IPS', severity: 80, description: 'Sem detecção de intrusão, ataques passam despercebidos.', category: 'firewall' });
  if (profile.usesVpn && !profile.vpnMfa) risks.push({ title: 'VPN sem MFA', severity: 85, description: 'Acesso VPN sem autenticação multifator é alvo fácil.', category: 'firewall' });
  if (!profile.sslInspection) risks.push({ title: 'Sem Inspeção SSL', severity: 70, description: 'Tráfego criptografado pode esconder ameaças.', category: 'firewall' });
  if (!profile.hasVlan) risks.push({ title: 'Sem segmentação VLAN', severity: 65, description: 'Rede sem segmentação permite movimentação lateral livre.', category: 'firewall' });
  if (profile.voipOption === 'yes' && profile.qosOption !== 'yes') risks.push({ title: 'VoIP sem QoS', severity: 60, description: 'Sem QoS, comunicações VoIP podem ser comprometidas.', category: 'firewall' });
  if (profile.usesVpn && !profile.vpnLogs) risks.push({ title: 'VPN sem monitoramento de logs', severity: 72, description: 'Sem logs, não é possível detectar acessos indevidos.', category: 'firewall' });
  if (!profile.activeLicense && profile.hasFirewall) risks.push({ title: 'Licença do Firewall expirada', severity: 78, description: 'Assinaturas de proteção desatualizadas.', category: 'firewall' });

  if (profile.protectionType === 'signature' || profile.protectionType === 'none') {
    risks.push({ title: 'Ransomware Moderno', severity: 90, description: 'Antivírus por assinatura não detecta ransomware de dia zero.', category: 'endpoint' });
    risks.push({ title: 'Fileless Attack', severity: 85, description: 'Ataques sem arquivo evadem proteção tradicional.', category: 'endpoint' });
    risks.push({ title: 'Credential Dumping', severity: 80, description: 'Roubo de credenciais é invisível sem EDR.', category: 'endpoint' });
    risks.push({ title: 'Movimento Lateral', severity: 88, description: 'Propagação interna sem detecção comportamental.', category: 'endpoint' });
  }
  if (profile.protectionType === 'none') risks.push({ title: 'Sem Proteção Endpoint', severity: 95, description: 'Endpoints completamente desprotegidos.', category: 'endpoint' });
  if (profile.byod) risks.push({ title: 'BYOD sem controle', severity: 70, description: 'Dispositivos pessoais acessam rede corporativa.', category: 'endpoint' });
  if (profile.devicesOutOfDomain) risks.push({ title: 'Dispositivos fora do domínio', severity: 68, description: 'Sem gestão centralizada de políticas.', category: 'endpoint' });

  if (!profile.hasBackup) risks.push({ title: 'Sem Backup', severity: 95, description: 'Sem backup, perda de dados é irreversível.', category: 'backup' });
  if (profile.hasBackup && !profile.regularRestoreTest) risks.push({ title: 'Sem teste de restore', severity: 75, description: 'Backup pode estar corrompido sem validação.', category: 'backup' });

  return risks;
};
