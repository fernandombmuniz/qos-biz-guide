import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  CircleHelp,
  Database,
  Eye,
  Gauge,
  HardDrive,
  KeyRound,
  Laptop,
  LockKeyhole,
  Monitor,
  Network,
  Router,
  Server,
  Shield,
  ShieldCheck,
  TriangleAlert,
  UsersRound,
  Wifi,
} from 'lucide-react';
import type { Profile } from '../context/ProfileContext';
import type { Facts, Module } from './model';
import {FirewallExecutive} from './FirewallExecutive';
import FirewallFinancial from './FirewallFinancial';
import FirewallRiskStory from './FirewallRiskStory';
import FirewallAttackLab from './FirewallAttackLab';
import ServicePresentation from './ServicePresentation';
import {assessFirewall} from './firewallAssessment';
import FirewallTopologyV381 from './FirewallTopologyV381';

type Props = {
  module: Module;
  chapter: number;
  profile: Profile;
  facts: Facts;
  findings: any[];
  updateFact: (key: string, value: string) => void;
  money: (value: number) => string;
};

type DiagramNode = {
  id: string;
  label: string;
  value: string;
  detail: string;
  status: 'good' | 'attention' | 'unknown';
  why: string;
  validate: string[];
};

const n = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

const display = (value: unknown, fallback = 'A confirmar') => {
  const str = String(value ?? '').trim();
  return str || fallback;
};

const statusLabel = (status: DiagramNode['status']) => status === 'good' ? 'Estruturado' : status === 'attention' ? 'Atenção' : 'A validar';


function scoreFor(module: Module, facts: Facts) {
  const points: Array<[boolean, number]> = module === 'firewall'
    ? [
        [facts.firewall === 'ngfw', 18],
        [facts.ips === 'yes', 15],
        [facts.segmentation === 'yes', 15],
        [facts.mfa === 'yes', 14],
        [facts.ha === 'yes', 14],
        [facts.inspection === 'yes', 12],
        [facts.networkOps === 'managed' || facts.networkOps === 'monitored', 12],
      ]
    : module === 'endpoint'
      ? [
          [facts.protection === 'edr', 24],
          [facts.console === 'yes', 16],
          [facts.endpointOps === 'managed' || facts.endpointOps === 'monitored', 18],
          [facts.response === 'yes', 18],
          [facts.patch === 'yes', 12],
          [facts.admin === 'controlled', 12],
        ]
      : [
          [facts.backup === 'yes', 20],
          [facts.tested === 'yes', 24],
          [facts.isolated === 'yes', 18],
          [facts.backupOps === 'yes', 18],
          [facts.recoveryPlan === 'yes', 20],
        ];
  return Math.max(8, Math.min(100, points.reduce((sum, [ok, value]) => sum + (ok ? value : 0), 0)));
}

function postureLabel(score: number) {
  if (score < 35) return 'Base frágil';
  if (score < 55) return 'Em evolução';
  if (score < 75) return 'Estrutura parcial';
  return 'Mais estruturado';
}

function firewallNodes(profile: Profile, facts: Facts): DiagramNode[] {
  const links = ((profile as any).internetLinks || []).filter((item: any) => item?.provider || item?.speed);
  const vlanCount = n((profile as any).vlanCount);
  const aps = n((profile as any).apQuantity);
  const ssl = n((facts as any).sslUsers);
  const ipsec = n((facts as any).ipsecTunnels);
  return [
    {
      id: 'internet',
      label: 'Internet',
      value: links.length ? `${links.length} link${links.length > 1 ? 's' : ''}` : 'Links a confirmar',
      detail: links.map((item: any) => `${display(item.provider, 'Operadora')} ${display(item.speed, '')}`.trim()).join(' + ') || 'Velocidade e redundância ainda não confirmadas.',
      status: links.length > 1 ? 'good' : links.length === 1 ? 'attention' : 'unknown',
      why: links.length > 1 ? 'Há mais de um caminho de conectividade informado.' : 'A conectividade pode depender de um único link ou ainda precisa ser confirmada.',
      validate: ['Capacidade agregada', 'Failover', 'SLA dos links'],
    },
    {
      id: 'perimeter',
      label: 'Perímetro atual',
      value: display((profile as any).firewallModel, 'Firewall a confirmar'),
      detail: facts.ha === 'yes' ? 'Alta disponibilidade informada.' : facts.haNeed === 'yes' ? 'Alta disponibilidade ainda precisa ser avaliada.' : 'Redundância não confirmada.',
      status: facts.firewall === 'ngfw' ? (facts.ha === 'no' ? 'attention' : 'good') : ['isp','router','none'].includes(facts.firewall||'') ? 'attention' : 'unknown',
      why: facts.firewall === 'ngfw' ? 'A borda foi informada como NGFW.' : 'O equipamento atual merece avaliação de recursos, políticas e suporte.',
      validate: ['Throughput real', 'Licenciamento', 'Ciclo de vida', 'IPS e políticas', 'HA'],
    },
    {
      id: 'segmentation',
      label: 'Rede interna',
      value: vlanCount ? `${vlanCount} VLANs` : 'VLANs a confirmar',
      detail: display((profile as any).vlanNames, 'Redes e segmentos ainda não mapeados.'),
      status: facts.segmentation === 'yes' ? 'good' : facts.segmentation === 'no' ? 'attention' : 'unknown',
      why: facts.segmentation === 'yes' ? 'Há segmentação informada, o que ajuda a separar funções e reduzir propagação.' : 'Pouca segmentação pode deixar áreas diferentes da operação próximas demais entre si.',
      validate: ['Separação entre usuários e servidores', 'Rede de visitantes', 'Câmeras e IoT', 'Políticas entre VLANs'],
    },
    {
      id: 'remote',
      label: 'Acesso remoto',
      value: (facts.hasClientVpn === 'yes' || facts.vpn === 'yes') && facts.sslUsers !== undefined ? `${ssl} SSL VPN` : 'A confirmar',
      detail: (facts.hasSiteVpn === 'yes' || facts.vpn === 'yes') && facts.ipsecTunnels !== undefined ? `${ipsec} túneis IPsec informados.` : 'VPN entre unidades a confirmar.',
      status: facts.vpn === 'yes' && facts.mfa === 'yes' ? 'good' : facts.vpn === 'yes' && facts.mfa !== 'yes' ? 'attention' : 'unknown',
      why: ssl || ipsec ? 'O acesso remoto já faz parte da operação e precisa ser tratado como caminho relevante para dentro do ambiente.' : 'O volume e o modelo de acesso remoto ainda precisam ser confirmados.',
      validate: ['MFA', 'Perfis de acesso', 'Usuários simultâneos', 'Origem dos acessos'],
    },
    {
      id: 'wifi',
      label: 'Wi-Fi e borda local',
      value: aps ? `${aps} APs` : 'Quantidade de APs a confirmar',
      detail: `${n((profile as any).switchCount)} switches informados.`,
      status: aps ? 'good' : 'unknown',
      why: 'A camada de acesso também influencia segmentação, visibilidade e continuidade da rede.',
      validate: ['Gestão centralizada', 'SSID corporativo e visitante', 'VLANs', 'Cobertura'],
    },
  ];
}

function endpointNodes(profile: Profile, facts: Facts): DiagramNode[] {
  const windows = n((profile as any).endpointsWindows);
  const servers = n((profile as any).windowsServerCount) + n((profile as any).linuxServerCount);
  const unmanaged = n((profile as any).outOfDomainCount);
  return [
    { id: 'windows', label: 'Windows', value: String(windows || 'A confirmar'), detail: display((profile as any).windowsVersion, 'Versões a confirmar'), status: windows ? 'good' : 'unknown', why: 'A maior parte do parque costuma concentrar a rotina operacional e a superfície de exposição.', validate: ['Versões', 'Cobertura do agente', 'Atualizações'] },
    { id: 'servers', label: 'Servidores', value: String(servers || 'A confirmar'), detail: 'Windows e Linux considerados no escopo.', status: servers ? 'good' : 'unknown', why: 'Servidores tendem a concentrar serviços críticos e exigem visibilidade compatível.', validate: ['Cobertura', 'Políticas', 'Isolamento', 'Telemetria'] },
    { id: 'coverage', label: 'Cobertura', value: display((facts as any).coverage), detail: display((facts as any).endpointVendor, 'Solução atual a confirmar'), status: facts.console === 'yes' ? 'good' : facts.console === 'no' ? 'attention' : 'unknown', why: 'Sem visão consolidada, a equipe pode descobrir lacunas apenas quando um incidente já está em andamento.', validate: ['Agentes ativos', 'Máquinas sem proteção', 'Console', 'Saúde dos sensores'] },
    { id: 'unmanaged', label: 'Fora do domínio', value: String(unmanaged || 0), detail: display((facts as any).byod, 'Política BYOD a confirmar'), status: unmanaged > 0 ? 'attention' : 'good', why: unmanaged > 0 ? 'Dispositivos fora da gestão podem criar pontos cegos de cobertura e resposta.' : 'Não foram informados dispositivos fora da gestão.', validate: ['BYOD', 'Acesso a dados', 'Políticas', 'MFA'] },
    { id: 'response', label: 'Resposta', value: facts.response === 'yes' ? 'Definida' : facts.response === 'no' ? 'Não definida' : 'A confirmar', detail: 'Capacidade de agir quando um comportamento suspeito aparece.', status: facts.response === 'yes' ? 'good' : facts.response === 'no' ? 'attention' : 'unknown', why: 'Detectar sem capacidade clara de resposta prolonga o tempo entre o sinal e a contenção.', validate: ['Isolamento', 'Escalonamento', 'Responsável', 'Cobertura fora do horário'] },
  ];
}

function backupNodes(profile: Profile, facts: Facts): DiagramNode[] {
  return [
    { id: 'critical', label: 'Serviço prioritário', value: display((profile as any).backupMostCriticalSystem), detail: `Volume informado: ${display((profile as any).backupTotalVolumeToProtect)}`, status: (profile as any).backupMostCriticalSystem ? 'good' : 'unknown', why: 'Saber o que precisa voltar primeiro evita que a recuperação comece sem prioridade de negócio.', validate: ['Dependências', 'Ordem de retorno', 'Responsável'] },
    { id: 'retention', label: 'Retenção', value: display((profile as any).backupDesiredRetention), detail: `Frequência: ${display((profile as any).backupCurrentFrequency)}`, status: facts.backup === 'yes' ? 'good' : facts.backup === 'no' ? 'attention' : 'unknown', why: 'Retenção e frequência determinam o quanto a empresa consegue voltar no tempo após um problema.', validate: ['Política', 'Janela de cópia', 'Crescimento'] },
    { id: 'restore', label: 'Restore', value: facts.tested === 'yes' ? 'Testado' : facts.tested === 'no' ? 'Sem teste confirmado' : 'A confirmar', detail: display((facts as any).lastTest, 'Último teste não informado'), status: facts.tested === 'yes' ? 'good' : facts.tested === 'no' ? 'attention' : 'unknown', why: 'Backup sem restauração testada deixa uma pergunta importante para o momento da crise: será que volta?', validate: ['Último teste', 'Tempo real', 'Integridade', 'Documentação'] },
    { id: 'rto', label: 'Tempo de retorno', value: display((profile as any).backupMaxAcceptableDowntime), detail: `Perda tolerável: ${display((profile as any).backupMaxAcceptableDataLoss)}`, status: (profile as any).backupMaxAcceptableDowntime ? 'good' : 'unknown', why: 'O tempo tolerável de parada ajuda a transformar backup em requisito de continuidade.', validate: ['RTO', 'RPO', 'Sistemas prioritários'] },
    { id: 'isolation', label: 'Isolamento', value: facts.isolated === 'yes' ? 'Informado' : facts.isolated === 'no' ? 'Não informado' : 'A confirmar', detail: 'Separação das cópias em relação ao ambiente de produção.', status: facts.isolated === 'yes' ? 'good' : facts.isolated === 'no' ? 'attention' : 'unknown', why: 'Cópias muito próximas do ambiente de produção podem ficar expostas ao mesmo incidente.', validate: ['Imutabilidade', 'Offsite', 'Credenciais', 'MFA'] },
  ];
}

function nodesFor(module: Module, profile: Profile, facts: Facts) {
  if (module === 'firewall') return firewallNodes(profile, facts);
  if (module === 'endpoint') return endpointNodes(profile, facts);
  return backupNodes(profile, facts);
}

function dashboardTitle(module: Module) {
  if (module === 'firewall') return 'Visão executiva da rede, borda e acessos.';
  if (module === 'endpoint') return 'Visão executiva do parque, cobertura e resposta.';
  return 'Visão executiva de dados, recuperação e continuidade.';
}

function dashboardSubtitle(module: Module) {
  if (module === 'firewall') return 'Uma leitura rápida do que existe hoje, o que sustenta a operação e o que merece ser aprofundado.';
  if (module === 'endpoint') return 'Uma leitura rápida do parque informado, da cobertura atual e dos pontos que podem virar perda de visibilidade.';
  return 'Uma leitura rápida do que está protegido, do que precisa voltar primeiro e da confiança atual na recuperação.';
}

function riskFlow(module: Module, profile: Profile, facts: Facts) {
  if (module === 'firewall') return [
    ['Internet', 'Tráfego e acessos chegam ao ambiente'],
    [display((profile as any).firewallModel, 'Perímetro'), facts.ips === 'yes' ? 'IPS informado' : 'Políticas e prevenção a confirmar'],
    ['VPN e acesso remoto', facts.mfa === 'yes' ? 'MFA informado' : 'Autenticação merece revisão'],
    ['Rede interna', facts.segmentation === 'yes' ? 'Segmentação informada' : 'Propagação pode ser mais fácil'],
    ['Operação', facts.availability || 'Sistemas e equipes dependem dessa cadeia'],
  ];
  if (module === 'endpoint') return [
    ['Usuário', 'E-mail, navegador, arquivos e credenciais'],
    ['Dispositivo', facts.protection === 'edr' ? 'EDR informado' : 'Proteção precisa ser aprofundada'],
    ['Detecção', facts.console === 'yes' ? 'Console informado' : 'Visibilidade central a confirmar'],
    ['Resposta', facts.response === 'yes' ? 'Resposta definida' : 'Ação pode depender de improviso'],
    ['Operação', 'Produtividade, dados e sistemas podem ser afetados'],
  ];
  return [
    ['Produção', 'Dados e sistemas mudam todos os dias'],
    ['Cópia', facts.backup === 'yes' ? 'Backup informado' : 'Cobertura precisa ser confirmada'],
    ['Proteção da cópia', facts.isolated === 'yes' ? 'Isolamento informado' : 'Isolamento a revisar'],
    ['Restauração', facts.tested === 'yes' ? 'Teste informado' : 'Recuperação ainda não comprovada'],
    ['Operação', 'A empresa precisa voltar dentro do tempo que suporta'],
  ];
}

function conciergeLayers(module: Module) {
  if (module === 'firewall') return [
    ['Proteção da borda', 'Políticas, inspeção, VPN e segmentação dentro do escopo contratado.'],
    ['Acompanhamento', 'Leitura de eventos e sinais relevantes para reduzir pontos cegos.'],
    ['Operação', 'Apoio a ajustes, incidentes e evolução do ambiente conforme autorização.'],
    ['Gestão', 'Mais contexto para decidir o que revisar primeiro e como acompanhar o ambiente.'],
  ];
  if (module === 'endpoint') return [
    ['Prevenção', 'Políticas e proteção do parque dentro do escopo contratado.'],
    ['Visibilidade', 'Telemetria e contexto para entender comportamentos e cobertura.'],
    ['Investigação', 'Análise para reduzir o tempo entre alerta e entendimento.'],
    ['Resposta', 'Ações e escalonamento conforme capacidade, processo e autorização.'],
  ];
  return [
    ['Cobertura', 'Acompanhamento do que está protegido e do que ficou fora.'],
    ['Rotina', 'Leitura de tarefas, falhas, retenção e crescimento.'],
    ['Recuperação', 'Preparação para restaurar o que importa dentro da prioridade do negócio.'],
    ['Gestão', 'Mais clareza sobre continuidade, testes e pontos pendentes.'],
  ];
}

function nextStepTitle(module: Module) {
  if (module === 'firewall') return 'O que precisamos confirmar para fechar o cenário de Firewall.';
  if (module === 'endpoint') return 'O que precisamos confirmar para fechar o cenário de Endpoint.';
  return 'O que precisamos confirmar para fechar o cenário de Backup.';
}


function executiveMetrics(module: Module, profile: Profile, facts: Facts) {
  if (module === 'firewall') {
    const links = (((profile as any).internetLinks) || []).filter((item: any) => item?.provider || item?.speed).length;
    return [
      ['Usuários', String(n((profile as any).userCount) || 'A confirmar')],
      ['Links', links ? String(links) : 'A confirmar'],
      ['VLANs', String(n((profile as any).vlanCount) || 'A confirmar')],
      ['SSL VPN', String(n((facts as any).sslUsers) || 0)],
    ];
  }
  if (module === 'endpoint') {
    return [
      ['Dispositivos', String(n((profile as any).deviceCount) || 'A confirmar')],
      ['Windows', String(n((profile as any).endpointsWindows) || 0)],
      ['Servidores', String(n((profile as any).windowsServerCount) + n((profile as any).linuxServerCount) || 0)],
      ['Fora da gestão', String(n((profile as any).outOfDomainCount) || 0)],
    ];
  }
  return [
    ['Volume', display((profile as any).backupTotalVolumeToProtect)],
    ['VMs', String(n((profile as any).backupVirtualServers) || 0)],
    ['Retenção', display((profile as any).backupDesiredRetention)],
    ['M365', String(n((profile as any).backupM365UsersCount) || 0)],
  ];
}

function executiveFocus(module: Module, profile: Profile, facts: Facts, nodes: DiagramNode[]) {
  if (module === 'firewall') {
    return [
      {
        title: 'Disponibilidade',
        value: facts.ha === 'yes' ? 'Mais protegida' : facts.haNeed === 'yes' ? 'Merece avaliação' : 'Ponto sensível',
        body: facts.ha === 'yes' ? 'Há redundância informada na borda.' : 'A conectividade e a borda ainda podem depender de um único ponto de falha.',
      },
      {
        title: 'Acesso remoto',
        value: `${n((facts as any).sslUsers) || 0} SSL VPN`,
        body: facts.mfa === 'yes' ? 'O ambiente já informou MFA.' : 'O volume de acesso remoto merece revisão de autenticação e perfis.',
      },
      {
        title: 'Controle e visibilidade',
        value: facts.inspection === 'yes' ? 'Mais consistente' : facts.inspection === 'partial' ? 'Parcial' : 'A confirmar',
        body: facts.inspection === 'yes' ? 'Há inspeção informada e base melhor para análise.' : 'Inspeção, logs e rotina operacional ainda pedem validação.',
      },
    ];
  }
  if (module === 'endpoint') {
    return [
      { title: 'Cobertura', value: display((facts as any).coverage), body: 'Entender quem está protegido e quem está fora é o primeiro passo para reduzir ponto cego.' },
      { title: 'Visibilidade', value: facts.console === 'yes' ? 'Console informado' : 'A confirmar', body: 'Sem visão central, cobertura e investigação ficam mais lentas.' },
      { title: 'Resposta', value: facts.response === 'yes' ? 'Definida' : 'A revisar', body: 'O valor da detecção depende da capacidade de agir quando algo acontece.' },
    ];
  }
  return [
    { title: 'Serviço prioritário', value: display((profile as any).backupMostCriticalSystem), body: 'A ordem de recuperação precisa partir do que sustenta a operação.' },
    { title: 'Confiança no restore', value: facts.tested === 'yes' ? 'Testado' : 'Sem teste claro', body: 'Backup sem restore validado deixa uma dúvida exatamente quando a empresa precisa voltar.' },
    { title: 'Continuidade', value: display((profile as any).backupMaxAcceptableDowntime), body: 'Parada tolerável e perda aceitável ajudam a transformar backup em continuidade.' },
  ];
}

function storyOpening(module: Module, profile: Profile, facts: Facts) {
  if (module === 'firewall') {
    const company = profile.companyName || 'A empresa';
    return `${company} depende da rede, da borda e dos acessos para manter a operação. Esta leitura resume o que já está claro, o que ainda precisa ser confirmado e onde a conversa merece mais atenção.`;
  }
  if (module === 'endpoint') return 'Este resumo mostra o tamanho do parque, a cobertura atual e os pontos que podem virar perda de visibilidade ou demora de resposta.';
  return 'Este resumo mostra o que está protegido, o que precisa voltar primeiro e o quanto a recuperação já parece preparada para uma interrupção.';
}

function impactModel(module: Module, profile: Profile, facts: Facts) {
  const criticality = String((facts as any).criticalityLevel || (module === 'backup' ? 'critical' : 'high'));
  const downtime = String((facts as any).downtimeProfile || (criticality === 'critical' ? 'lt1' : criticality === 'high' ? '1to4' : '4to8'));
  const peopleBase = module === 'endpoint' ? n((profile as any).deviceCount) : module === 'backup' ? Math.max(n((profile as any).backupM365UsersCount), n((profile as any).backupVirtualServers) * 5) : Math.max(n((profile as any).userCount), n((facts as any).sslUsers));
  const basePerHour = Math.max(1200, peopleBase * (module === 'backup' ? 140 : module === 'endpoint' ? 95 : 110));
  const criticalityFactor = criticality === 'critical' ? 1.45 : criticality === 'high' ? 1.15 : 0.85;
  const downtimeHours = downtime === 'lt1' ? 1 : downtime === '1to4' ? 3 : downtime === '4to8' ? 6 : 10;
  const exposureFactor = module === 'firewall' && facts.ha !== 'yes' ? 1.18 : module === 'endpoint' && facts.response !== 'yes' ? 1.15 : module === 'backup' && facts.tested !== 'yes' ? 1.2 : 1;
  const estimatedHour = Math.round(basePerHour * criticalityFactor * exposureFactor);
  const scenarioCost = estimatedHour * downtimeHours;
  const levelLabel = criticality === 'critical' ? 'Crítica' : criticality === 'high' ? 'Alta' : 'Moderada';
  const toleranceLabel = downtime === 'lt1' ? 'até 1 hora' : downtime === '1to4' ? '1 a 4 horas' : downtime === '4to8' ? '4 a 8 horas' : 'mais de 8 horas';
  const risks = module === 'firewall'
    ? ['indisponibilidade de internet e sistemas', 'pressão sobre acessos remotos e produtividade', 'mais esforço da equipe para diagnosticar e contornar o problema']
    : module === 'endpoint'
      ? ['perda de produtividade e investigação manual', 'tempo maior entre o alerta e a ação', 'mais exposição em dispositivos fora da gestão']
      : ['parada prolongada em serviços prioritários', 'retrabalho na recuperação', 'mais incerteza sobre o que realmente volta e em quanto tempo'];
  return { levelLabel, toleranceLabel, estimatedHour, scenarioCost, downtimeHours, risks };
}


type FirewallModelSpec = { vendor: 'SonicWall' | 'Fortinet'; model: string; users: number; tp: number };
const FIREWALL_CATALOG: FirewallModelSpec[] = [
  { vendor: 'SonicWall', model: 'TZ80', users: 75, tp: 0.75 },
  { vendor: 'SonicWall', model: 'TZ280', users: 100, tp: 1.0 },
  { vendor: 'SonicWall', model: 'TZ370', users: 100, tp: 1.0 },
  { vendor: 'SonicWall', model: 'TZ380', users: 150, tp: 1.5 },
  { vendor: 'SonicWall', model: 'TZ470', users: 150, tp: 1.5 },
  { vendor: 'SonicWall', model: 'TZ480', users: 200, tp: 2.0 },
  { vendor: 'SonicWall', model: 'TZ570', users: 200, tp: 2.0 },
  { vendor: 'SonicWall', model: 'TZ580', users: 220, tp: 2.2 },
  { vendor: 'SonicWall', model: 'TZ670', users: 250, tp: 2.5 },
  { vendor: 'SonicWall', model: 'TZ680', users: 250, tp: 2.5 },
  { vendor: 'SonicWall', model: 'NSA 2700', users: 500, tp: 3.0 },
  { vendor: 'SonicWall', model: 'NSA 2800', users: 600, tp: 6.0 },
  { vendor: 'SonicWall', model: 'NSA 3700', users: 550, tp: 3.5 },
  { vendor: 'SonicWall', model: 'NSA 3800', users: 800, tp: 6.0 },
  { vendor: 'Fortinet', model: '40F', users: 60, tp: 0.6 },
  { vendor: 'Fortinet', model: '50G', users: 120, tp: 1.1 },
  { vendor: 'Fortinet', model: '90G', users: 200, tp: 2.2 },
  { vendor: 'Fortinet', model: '120G', users: 250, tp: 2.8 },
  { vendor: 'Fortinet', model: '200F', users: 300, tp: 3.0 },
  { vendor: 'Fortinet', model: '200G', users: 500, tp: 6.0 },
  { vendor: 'Fortinet', model: '600F', users: 700, tp: 10.5 },
];

function parseSpeedToGbps(raw: unknown) {
  const text = String(raw ?? '').trim().toLowerCase().replace(',', '.');
  if (!text) return 0;
  const value = Number(text.match(/\d+(?:\.\d+)?/)?.[0] || 0);
  if (!value) return 0;
  if (text.includes('gb')) return value;
  if (text.includes('mb')) return value / 1000;
  if (text.includes('kb')) return value / 1000000;
  return value > 100 ? value / 1000 : value;
}

function firewallSizing(profile: Profile, facts: Facts) {
  const useProfile = String((facts as any).networkUseProfile || 'medium');
  const useConfig = useProfile === 'low'
    ? { userFactor: 0.82, bandwidthFactor: 0.28, label: 'baixo' }
    : useProfile === 'high'
      ? { userFactor: 1.15, bandwidthFactor: 0.62, label: 'alto' }
      : { userFactor: 1, bandwidthFactor: 0.45, label: 'médio' };
  const links = (((profile as any).internetLinks) || []).filter((item: any) => item?.provider || item?.speed);
  const totalLinkGbps = links.reduce((sum: number, item: any) => sum + parseSpeedToGbps(item?.speed), 0);
  const measuredPeakGbps = n((facts as any).peakTrafficMbps) / 1000;
  const baseThroughput = measuredPeakGbps > 0 ? measuredPeakGbps : totalLinkGbps * useConfig.bandwidthFactor;
  const vlanCount = n((profile as any).vlanCount);
  const sslUsers = n((facts as any).sslUsers);
  const ipsecTunnels = n((facts as any).ipsecTunnels);
  const users = n((profile as any).userCount);
  const complexity = [
    facts.segmentation === 'yes' || facts.segmentation === 'partial',
    facts.vpn === 'yes',
    vlanCount >= 5,
    sslUsers >= 20 || ipsecTunnels >= 4,
    String((facts as any).published || '').trim().length > 0,
    n((profile as any).apQuantity) >= 10,
  ].filter(Boolean).length;
  const adjustedUsers = Math.max(1, users * useConfig.userFactor * (1 + complexity * 0.025));
  const adjustedThroughput = Math.max(0.2, baseThroughput * (1 + complexity * 0.045));
  const marginBias = facts.haNeed === 'yes' || String((facts as any).growth || '').trim() ? 1.08 : 1;
  const evaluate = (vendor: 'SonicWall' | 'Fortinet') => FIREWALL_CATALOG.filter(item => item.vendor === vendor).map(item => {
    const userLoad = adjustedUsers / item.users;
    const throughputLoad = adjustedThroughput * marginBias / item.tp;
    const load = Math.max(userLoad, throughputLoad);
    const score = Math.abs(0.92 - load);
    return { ...item, userLoad, throughputLoad, load, score };
  });
  const choose = (vendor: 'SonicWall' | 'Fortinet') => {
    const ranked = evaluate(vendor).sort((a, b) => a.load - b.load || a.score - b.score || a.users - b.users);
    const fit = ranked.find(item => item.load <= 1.02) || ranked[0];
    const betterMargin = ranked.find(item => item.users >= fit.users && item.tp >= fit.tp && item.model !== fit.model && item.load <= 0.82) || ranked.find(item => item.model !== fit.model && item.users > fit.users);
    return { primary: fit, secondary: betterMargin || null };
  };
  const sonicwall = choose('SonicWall');
  const fortinet = choose('Fortinet');
  const reasons = [
    `${users || 'Usuários'} usuários informados`,
    `${links.length || 0} link${links.length === 1 ? '' : 's'} e ${totalLinkGbps ? totalLinkGbps.toFixed(totalLinkGbps >= 10 ? 0 : 1) : '0'} Gbps contratados`,
    `perfil de uso ${useConfig.label}`,
    vlanCount ? `${vlanCount} VLANs informadas` : 'segmentação ainda em validação',
    sslUsers || ipsecTunnels ? `${sslUsers} SSL VPN e ${ipsecTunnels} túneis IPsec` : 'VPN discreta ou a confirmar',
  ];
  return { useLabel: useConfig.label, totalLinkGbps, measuredPeakGbps, estimatedThroughputGbps: adjustedThroughput, adjustedUsers, sonicwall, fortinet, reasons };
}
function FinancialImpact({ module, profile, facts, impact, updateFact, money }: { module: Module; profile: Profile; facts: Facts; impact: ReturnType<typeof impactModel>; updateFact: (key: string, value: string) => void; money: (value: number) => string }) {
  const criticality = String((facts as any).criticalityLevel || 'high');
  const monthly = Math.max(0, Number((facts as any).internalMonthly || 0));
  const setup = Math.max(0, Number((facts as any).internalSetup || 0));
  const firstYear = setup + monthly * 12;
  return (
    <div className="product-impact-shell auto-impact">
      <div className="product-impact-copy">
        <span className="v3-kicker">IMPACTO POTENCIAL</span>
        <h2>O que esse cenário pode representar para o negócio e como comparar com o investimento previsto?</h2>
        <p>Leitura consultiva baseada no ambiente informado. O objetivo é tangibilizar impacto e comparar com a faixa de investimento discutida, sem prometer que um incidente será evitado.</p>
      </div>
      <div className="product-impact-summary-grid">
        <article><span>Criticidade informada</span><strong>{impact.levelLabel}</strong><p>Nível usado para orientar a leitura do cenário.</p></article>
        <article><span>Tolerância à parada</span><strong>{impact.toleranceLabel}</strong><p>Tempo que a operação tende a suportar antes de sentir mais pressão.</p></article>
        <article><span>Exposição estimada por hora</span><strong>{money(impact.estimatedHour)}</strong><p>Estimativa consultiva para tangibilizar indisponibilidade.</p></article>
        <article className="highlight"><span>Cenário de referência</span><strong>{money(impact.scenarioCost)}</strong><p>Leitura do impacto de {impact.downtimeHours} horas em um cenário relevante.</p></article>
      </div>
      <div className="product-impact-story">
        <article>
          <span>Por que este valor importa</span>
          <h3>{profile.companyName || 'A empresa'} depende deste ambiente para continuar operando.</h3>
          <p>{module === 'firewall' ? 'Quando a borda ou os acessos falham, o cliente sente isso como parada de internet, lentidão, dificuldade de acesso remoto e pressão direta sobre a equipe.' : module === 'endpoint' ? 'Quando endpoints ficam expostos ou sem resposta clara, o impacto aparece como perda de produtividade, investigação manual e mais tempo até a contenção.' : 'Quando backup e recuperação não estão claros, o impacto aparece como incerteza, retrabalho e mais tempo para voltar ao que é crítico.'}</p>
        </article>
        <article>
          <span>Principais consequências possíveis</span>
          <ul>{impact.risks.map(item => <li key={item}>{item}</li>)}</ul>
        </article>
      </div>
      <div className="product-investment-grid">
        <label><span>Mensalidade prevista</span><input type="number" min="0" value={String((facts as any).internalMonthly || '')} onChange={e => updateFact('internalMonthly', e.target.value)} placeholder="A informar" /></label>
        <label><span>Implantação prevista</span><input type="number" min="0" value={String((facts as any).internalSetup || '')} onChange={e => updateFact('internalSetup', e.target.value)} placeholder="A informar" /></label>
        <article className="investment-summary"><span>Investimento no primeiro ano</span><strong>{monthly || setup ? money(firstYear) : 'A informar'}</strong><p>Implantação + 12 mensalidades. Simulação para apoio à conversa comercial.</p></article>
      </div>
      <div className="product-impact-footnote comparison-mode">
        <label>
          <span>Se quiser, ajuste a criticidade para esta conversa</span>
          <select value={criticality} onChange={e => updateFact('criticalityLevel', e.target.value)}>
            <option value="moderate">Moderada</option>
            <option value="high">Alta</option>
            <option value="critical">Crítica</option>
          </select>
        </label>
        <p>{monthly || setup ? `Comparação visual: cenário de referência em ${money(impact.scenarioCost)} versus investimento previsto no primeiro ano em ${money(firstYear)}.` : 'Preencha mensalidade e implantação se fizer sentido para comparar o cenário de referência com o investimento previsto.'}</p>
      </div>
    </div>
  );
}

function FirewallProductStoryPresentation({ module, chapter, profile, facts, findings, updateFact, money }: Props) {
  const nodes = useMemo(() => nodesFor(module, profile, facts), [module, profile, facts]);
  const [selectedId, setSelectedId] = useState<string>(nodes[0]?.id || '');
  const selected = nodes.find(node => node.id === selectedId) || nodes[0];
  const score = scoreFor(module, facts);
  const topFindings = findings.slice(0, 4);
  const attentionCount = findings.filter(item => item.state === 'attention').length;
  const unknownCount = findings.filter(item => item.state === 'unknown').length;
  const knownCount = findings.filter(item => item.state === 'confirmed').length;

  if (chapter === 0) {
    const metrics = executiveMetrics(module, profile, facts);
    const focus = executiveFocus(module, profile, facts, nodes);
    if (module === 'firewall') return <FirewallExecutive profile={profile} facts={facts} findings={findings}/>;
    return (
      <section className="product-story-stage product-dashboard-stage refined">
        <div className="product-story-heading">
          <div>
            <span className="v3-kicker">RESUMO EXECUTIVO</span>
            <h2>{dashboardTitle(module)}</h2>
            <p>{storyOpening(module, profile, facts)}</p>
          </div>
          <div className="product-posture-card">
            <div className="product-gauge" style={{ '--gauge-score': score } as CSSProperties}>
              <div><strong>{score}</strong><span>/100</span></div>
            </div>
            <div><span>Índice indicativo</span><b>{postureLabel(score)}</b><small>Leitura consultiva baseada nas respostas informadas.</small></div>
          </div>
        </div>
        <div className="product-executive-metrics">
          {metrics.map(([labelText, value]) => <article key={labelText}><span>{labelText}</span><strong>{value}</strong></article>)}
        </div>
        <div className="product-executive-focus">
          {focus.map(item => <article key={item.title}><span>{item.title}</span><strong>{item.value}</strong><p>{item.body}</p></article>)}
        </div>
        <div className="product-dashboard-bottom compact">
          <article><span>Pontos de atenção</span><strong>{attentionCount}</strong><p>O que merece aprofundamento primeiro.</p></article>
          <article><span>Controles informados</span><strong>{knownCount}</strong><p>O que já existe segundo o cliente.</p></article>
          <article><span>A confirmar</span><strong>{unknownCount}</strong><p>O que ainda impede uma conclusão mais firme.</p></article>
          <article className="highlight"><span>Leitura da reunião</span><strong>{attentionCount ? 'Priorizar' : unknownCount ? 'Validar' : 'Evoluir'}</strong><p>{attentionCount ? 'Existem pontos que podem afetar operação, visibilidade ou resposta.' : unknownCount ? 'Ainda faltam confirmações antes de dimensionar com segurança.' : 'A base informada parece mais organizada. O foco passa a ser evolução.'}</p></article>
        </div>
      </section>
    );
  }

  if (chapter === 1) {
    return (
      <section className="product-story-stage">
        <div className="product-story-heading compact">
          <div><span className="v3-kicker">AMBIENTE DO CLIENTE</span><h2>Agora vamos entrar no desenho que sustenta essa operação.</h2><p>Clique nos elementos do ambiente para aprofundar o que foi informado e o que ainda vale validar.</p></div>
        </div>
        <div className="interactive-environment-shell">
          <div className={`interactive-diagram ${module} ${module==='firewall'?'netv381-host':''}`}>
            {module === 'firewall' && <FirewallTopologyV381 profile={profile} facts={facts} nodes={nodes} selectedId={selected?.id || nodes[0]?.id} setSelectedId={setSelectedId} />}
          </div>
          {selected && <aside className={`diagram-insight ${selected.status}`}>
            <div className="diagram-insight-head"><div><span>{selected.label}</span><h3>{selected.value}</h3></div><span className="diagram-status">{statusLabel(selected.status)}</span></div>
            <p>{selected.why}</p>
            <div className="diagram-detail-box"><span>O que foi informado</span><b>{selected.detail}</b></div>
            <div className="diagram-validate"><span>Vale validar</span>{selected.validate.map(item => <b key={item}>{item}</b>)}</div>
          </aside>}
        </div>
      </section>
    );
  }

  if (chapter === 2 && module === 'firewall') return <FirewallRiskStory profile={profile} facts={facts}/>;

  if (chapter === 2) {
    const flow = riskFlow(module, profile, facts);
    return (
      <section className="product-story-stage product-risk-stage">
        <div className="product-story-heading compact"><div><span className="v3-kicker">PONTOS DE ATENÇÃO</span><h2>Como um problema pode nascer, avançar e bater na operação.</h2><p>Use esta sequência como storytelling do ambiente: o problema começa em um ponto técnico, atravessa controles e aparece para o cliente como parada, lentidão, retrabalho ou pressão sobre a equipe.</p></div></div>
        <div className="risk-story-flow">
          {flow.map(([title, body], index) => (
            <div className="risk-flow-step" key={title}>
              <article className={index === flow.length - 1 ? 'business' : ''}><span>0{index + 1}</span><h3>{title}</h3><p>{body}</p>{index > 0 && index < flow.length - 1 && <i className="risk-pulse"/>}</article>
              {index < flow.length - 1 && <ArrowRight size={22}/>} 
            </div>
          ))}
        </div>
        <div className="risk-story-findings">
          {(topFindings.length ? topFindings : [{ state: 'unknown', title: 'Mais informações precisam ser confirmadas', meaning: 'Ainda faltam respostas para fechar a leitura do ambiente.' }]).map((item: any) => <article key={item.title} className={item.state}><div>{item.state === 'attention' ? <TriangleAlert size={18}/> : item.state === 'confirmed' ? <CheckCircle2 size={18}/> : <CircleHelp size={18}/>}<span>{item.state === 'attention' ? 'Ponto de atenção' : item.state === 'confirmed' ? 'Controle informado' : 'A confirmar'}</span></div><h3>{item.title}</h3><p>{item.meaning}</p></article>)}
        </div>
      </section>
    );
  }

  if (chapter === 3 && module === 'firewall') return <FirewallAttackLab profile={profile} facts={facts}/>;

  if (chapter === 3 && module !== 'firewall') {
    return (
      <section className="product-story-stage concierge-overlay-stage">
        <div className="product-story-heading compact"><div><span className="v3-kicker">COMO A CONCIERGE ENTRA</span><h2>A operação continua sendo do cliente. A Concierge entra como camada de proteção, visibilidade e apoio.</h2><p>O ambiente não muda de protagonista. A diferença é que ele passa a ter uma camada de acompanhamento e resposta ao redor.</p></div></div>
        <div className="concierge-environment-visual">
          <div className="client-core"><span>AMBIENTE DO CLIENTE</span><strong>{profile.companyName || 'Sua empresa'}</strong><p>{'Rede, acessos e serviços'}</p></div>
          <div className="concierge-orbit-ring">{conciergeLayers(module).map(([title, body], index) => <article key={title} className={`orbit-item orbit-${index + 1}`}><ShieldCheck size={19}/><h3>{title}</h3><p>{body}</p></article>)}</div>
          <div className="soc-core"><Eye size={20}/><span>SOC 24/7</span><small>Acompanhamento conforme o serviço contratado</small></div>
        </div>
      </section>
    );
  }

  if (module === 'firewall' && chapter === 4) {
    return <section className="product-story-stage concierge-overlay-stage"><div className="product-story-heading compact"><div><span className="v3-kicker">COMO A CONCIERGE ATUA</span><h2>Proteção e acompanhamento conectados à rotina.</h2><p>A empresa mantém suas prioridades e decisões. A Concierge cuida da operação de segurança prevista no serviço.</p></div></div><div className="concierge-environment-visual"><div className="client-core"><span>AMBIENTE DO CLIENTE</span><strong>{profile.companyName||'Sua empresa'}</strong><p>Rede, VPN, sistemas e usuários</p></div><div className="concierge-orbit-ring">{conciergeLayers('firewall').map(([title,body],index)=><article key={title} className={`orbit-item orbit-${index+1}`}><ShieldCheck size={19}/><h3>{title}</h3><p>{body}</p></article>)}</div><div className="soc-core"><Eye size={20}/><span>SOC 24/7</span><small>Acompanhamento conforme o escopo contratado</small></div></div></section>;
  }
  if (module === 'firewall' && chapter === 5) return <FirewallFinancial profile={profile} facts={facts} updateFact={updateFact} money={money}/>;
  if (module !== 'firewall' && chapter === 4) {
    const impact = impactModel(module, profile, facts);
    return <section className="product-story-stage"><FinancialImpact module={module} facts={facts} profile={profile} impact={impact} updateFact={updateFact} money={money}/></section>;
  }

  if (module === 'firewall' && chapter === 6) {
    const a=assessFirewall(profile,facts);const priorities=[...a.signals.filter(x=>x.state==='attention'),...a.signals.filter(x=>x.state==='unknown')].slice(0,3);
    return <section className="fw-conclusion"><span className="v3-kicker">FECHAMENTO DA ANÁLISE</span><h2>O que vale priorizar a partir desta conversa.</h2><p>O levantamento gerou uma visão do ambiente, destacou pontos de atenção e mostrou o que precisa ser validado antes de definir a solução.</p><div className="fw-conclusion-grid">{priorities.map((item,i)=><article key={item.id}><small>PRIORIDADE 0{i+1}</small><h3>{item.title}</h3><p>{item.action}</p><b>{item.state==='attention'?'Ponto de atenção':'A confirmar'}</b></article>)}</div><div className="fw-conclusion-bottom"><div><strong>Próxima etapa</strong><p>Validar as pendências técnicas e alinhar o dimensionamento e o escopo com a equipe responsável.</p></div><p>Os encaminhamentos podem ser registrados ao sair da apresentação, no espaço interno.</p></div></section>;
  }
  return (
    <section className="product-story-stage product-next-stage">
      <div className="product-story-heading compact"><div><span className="v3-kicker">PRÓXIMO PASSO</span><h2>{nextStepTitle(module)}</h2><p>Feche a reunião com um encaminhamento claro. Aqui, “quem conduz” significa quem ficou responsável por puxar a próxima ação combinada.</p></div></div>
      <div className="next-step-grid">
        <label><span>Próxima ação</span><textarea value={String((facts as any)['decision_' + module] || '')} onChange={e => updateFact('decision_' + module, e.target.value)} placeholder="Ex.: validar HA com pré-vendas e enviar dimensionamento."/></label>
        <label><span>Quem conduz a próxima etapa</span><input value={String((facts as any)['owner_' + module] || '')} onChange={e => updateFact('owner_' + module, e.target.value)} placeholder="Ex.: Fernando / Cliente / Pré-vendas"/></label>
        <label><span>Prazo combinado</span><input type="date" value={String((facts as any)['date_' + module] || '')} onChange={e => updateFact('date_' + module, e.target.value)}/></label>
        <article className="next-step-note"><CheckCircle2/><div><strong>O objetivo desta tela</strong><p>Sair da conversa sabendo o que será feito, por quem e até quando. Não é responsável técnico pelo ambiente nem responsável pela implantação.</p></div></article>
      </div>
    </section>
  );
}

function DiagramButton({ node, active, onClick, icon, featured = false }: { node: DiagramNode; active: boolean; onClick: () => void; icon: ReactNode; featured?: boolean }) {
  return <button type="button" className={`diagram-node-button ${node.status} ${active ? 'active' : ''} ${featured ? 'featured' : ''}`} onClick={onClick}><span className="node-icon">{icon}</span><small>{node.label}</small><strong>{node.value}</strong><p>{node.detail}</p><span className="node-status">{statusLabel(node.status)}</span></button>;
}

export default function ProductStoryPresentation(props:Props){
  if(props.module==='endpoint'||props.module==='backup')return <ServicePresentation service={props.module} chapter={props.chapter} profile={props.profile} facts={props.facts} updateFact={props.updateFact} money={props.money}/>;
  return <FirewallProductStoryPresentation {...props}/>;
}
