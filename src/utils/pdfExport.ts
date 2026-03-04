import jsPDF from 'jspdf';
import type { Profile } from '@/context/ProfileContext';

export const generatePDF = (profile: Profile) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  let y = 20;

  // Paleta de Cores
  const COLORS = {
    DEEP_BLUE: [11, 18, 32],
    HIGHLIGHT_BLUE: [29, 78, 216],
    LIGHT_BLUE: [59, 130, 246],
    CARD_BG: [255, 255, 255],
    BG_LIGHT: [248, 250, 252],
    TEXT_MAIN: [11, 18, 32],
    TEXT_SECONDARY: [71, 85, 105],
    RISK: {
      CRITICAL: [220, 38, 38],
      HIGH: [234, 88, 12],
      MODERATE: [234, 179, 8],
      LOW: [22, 163, 74]
    }
  };

  const formatValue = (val: any) => {
    if (val === undefined || val === null || val === '' || val === 0 || val === false) return 'Não preenchido';
    if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
    return String(val);
  };

  const addHeaderFooter = () => {
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 2; i <= totalPages; i++) {
      doc.setPage(i);
      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Concierge Security Assessment • Grupo QOS • Página ${i - 1} de ${totalPages - 1}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
  };

  // --- CAPA ---
  doc.setFillColor(COLORS.DEEP_BLUE[0], COLORS.DEEP_BLUE[1], COLORS.DEEP_BLUE[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Decorative element
  doc.setFillColor(COLORS.HIGHLIGHT_BLUE[0], COLORS.HIGHLIGHT_BLUE[1], COLORS.HIGHLIGHT_BLUE[2]);
  doc.rect(0, 0, pageWidth, 5, 'F');

  let coverY = 80;
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('Concierge Firewall', pageWidth / 2, coverY, { align: 'center' });
  coverY += 12;
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text('Diagnóstico de Segurança', pageWidth / 2, coverY, { align: 'center' });

  coverY = 160;
  doc.setFontSize(12);
  doc.text('CLIENTE', pageWidth / 2, coverY, { align: 'center' });
  coverY += 8;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(profile.companyName || 'Empresa não identificada', pageWidth / 2, coverY, { align: 'center' });

  coverY += 25;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Contato Técnico: ${profile.contactName || 'Não preenchido'}`, pageWidth / 2, coverY, { align: 'center' });
  coverY += 6;
  doc.text(`Data do Diagnóstico: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, coverY, { align: 'center' });

  // --- NOVA PÁGINA (CONTEÚDO) ---
  doc.addPage();
  y = 25;

  const addSectionTitle = (text: string) => {
    if (y > pageHeight - 40) { doc.addPage(); y = 25; }
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.HIGHLIGHT_BLUE[0], COLORS.HIGHLIGHT_BLUE[1], COLORS.HIGHLIGHT_BLUE[2]);
    doc.text(text, margin, y);
    y += 8;
  };

  const drawCard = (title: string, fields: { label: string, value: any }[]) => {
    const cardPadding = 8;
    const rowHeight = 7;
    const cardHeight = (fields.length * rowHeight) + 15;

    if (y > pageHeight - cardHeight - 20) { doc.addPage(); y = 25; }

    // Card Shadow/Border
    doc.setDrawColor(230, 235, 241);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin - 2, y, pageWidth - (margin * 2) + 4, cardHeight, 2, 2, 'FD');

    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.DEEP_BLUE[0], COLORS.DEEP_BLUE[1], COLORS.DEEP_BLUE[2]);
    doc.text(title, margin + 2, y);
    y += 2;
    doc.setDrawColor(COLORS.HIGHLIGHT_BLUE[0], COLORS.HIGHLIGHT_BLUE[1], COLORS.HIGHLIGHT_BLUE[2]);
    doc.setLineWidth(0.5);
    doc.line(margin + 2, y, margin + 20, y);
    y += 6;

    fields.forEach(f => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(COLORS.TEXT_SECONDARY[0], COLORS.TEXT_SECONDARY[1], COLORS.TEXT_SECONDARY[2]);
      doc.text(f.label, margin + 2, y);

      const val = formatValue(f.value);
      doc.setFont('helvetica', 'bold');
      if (val === 'Não preenchido') {
        doc.setTextColor(180, 180, 180);
      } else {
        doc.setTextColor(COLORS.TEXT_MAIN[0], COLORS.TEXT_MAIN[1], COLORS.TEXT_MAIN[2]);
      }
      doc.text(val, margin + 80, y);
      y += rowHeight;
    });

    y += 10;
  };

  const drawScoreBar = (label: string, score: number) => {
    if (y > pageHeight - 30) { doc.addPage(); y = 25; }

    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.TEXT_MAIN[0], COLORS.TEXT_MAIN[1], COLORS.TEXT_MAIN[2]);
    doc.text(label, margin, y);
    doc.text(`${score}%`, pageWidth - margin, y, { align: 'right' });
    y += 4;

    // Background bar
    doc.setFillColor(240, 240, 240);
    doc.roundedRect(margin, y, pageWidth - (margin * 2), 4, 2, 2, 'F');

    // Foreground bar
    let color = COLORS.RISK.LOW;
    if (score >= 75) color = COLORS.RISK.CRITICAL;
    else if (score >= 50) color = COLORS.RISK.HIGH;
    else if (score >= 25) color = COLORS.RISK.MODERATE;

    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, y, (pageWidth - (margin * 2)) * (score / 100), 4, 2, 2, 'F');
    y += 12;
  };

  // 1. Resumo Executivo
  addSectionTitle('Resumo Executivo');
  const risks = detectAllRisks(profile);
  const riskScore = risks.reduce((sum, r) => sum + (r.severity / risks.length || 0), 0);
  drawScoreBar('Score Geral de Exposição', Math.round(riskScore));

  // 2. Diagnóstico Técnico (Onboarding)
  addSectionTitle('Dados Técnicos do Onboarding');

  drawCard('Identificação & Capacidade', [
    { label: 'Empresa', value: profile.companyName },
    { label: 'Usuários', value: profile.userCount },
    { label: 'Dispositivos', value: profile.deviceCount },
    { label: 'Crescimento', value: profile.userGrowthEstimate },
    { label: 'Perfil de uso', value: profile.networkUsage },
    { label: 'Observações', value: profile.step1Notes },
  ]);

  drawCard('Infraestrutura & Rede', [
    { label: 'Links de Internet', value: profile.internetLinks.length },
    { label: 'Banda Agregada', value: profile.internetLinks.reduce((acc, l) => acc + (parseInt(l.speed) || 0), 0) + ' Mbps' },
    { label: 'VLANs', value: profile.vlanCount },
    { label: 'VPNs Ativas', value: profile.vpnSiteToSite + profile.vpnRemoteAccess },
    { label: 'Wi-Fi (AP)', value: profile.apQuantity },
    { label: 'Observações', value: profile.step2Notes },
  ]);

  drawCard('Segurança Perimetral', [
    { label: 'Firewall', value: profile.hasFirewall },
    { label: 'Modelo', value: profile.firewallModel },
    { label: 'Licença', value: profile.activeLicense ? 'Ativa' : 'Expirada' },
    { label: 'IPS/IDS', value: profile.idsIps },
    { label: 'Inspeção SSL', value: profile.sslInspection },
    { label: 'Filtragem Web', value: profile.webFiltering },
    { label: 'Observações', value: profile.step5Notes },
  ]);

  drawCard('Operação & Monitoramento', [
    { label: 'SOC 24/7', value: profile.socMonitoring },
    { label: 'Resposta a Incidentes', value: profile.incidentResponsePlan },
    { label: 'Políticas', value: profile.securityPolicy },
    { label: 'Maturidade', value: profile.operationalMaturity },
    { label: 'Observações', value: profile.step6Notes },
  ]);

  // 3. Riscos Identificados
  addSectionTitle('Riscos Identificados');
  risks.forEach(r => {
    drawScoreBar(r.title, r.severity);
  });

  addHeaderFooter();
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
