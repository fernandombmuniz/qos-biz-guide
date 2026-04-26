import React from 'react';
import { 
  ShieldCheck, AlertTriangle, AlertCircle, 
  ServerCrash, Layers, ChevronRight, Target, Info
} from 'lucide-react';
import logoConcierge from '@/assets/logo-concierge.jpg';

interface AssessmentPDFTemplateProps {
  profile: any;
  overallScore: number;
  domainScores: { firewall: number | null, endpoint: number | null, backup: number | null };
  priority: { name: string, score: number }[];
  financialRisk: number;
  projectedAle: number;
  lgpdScore: number;
  annualCost: number;
  isValidRoi: boolean;
  roiPercentage: number;
  estimatedSavings: number;
  implCost: number | '';
  monthlyCost: number | '';
  date: string;
}

const StandardCard: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className = '' }) => (
  <div className={`p-5 bg-[#111827] rounded-xl border border-white/5 ${className}`}>
    {children}
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-2xl font-bold text-cyan-500 uppercase tracking-widest mb-6">
    {children}
  </h2>
);

const Header: React.FC<{ profile: any }> = ({ profile }) => (
  <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-8">
    <img src={logoConcierge} alt="Concierge" className="h-8 object-contain" />
    <div className="text-right">
      <p className="font-bold text-white text-sm">{profile.companyName || 'Empresa'}</p>
      <p className="text-xs text-gray-400 mt-1">{new Date().toLocaleDateString('pt-BR')}</p>
    </div>
  </div>
);

const Footer: React.FC<{ page: number }> = ({ page }) => (
  <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center text-xs text-gray-500">
    <span>Concierge Security Assessment</span>
    <span>Página {page}</span>
  </div>
);

export const AssessmentPDFTemplate: React.FC<AssessmentPDFTemplateProps> = ({
  profile, overallScore, domainScores, priority, financialRisk, projectedAle,
  lgpdScore, annualCost, isValidRoi, roiPercentage, estimatedSavings, date
}) => {
  
  const topPriority = priority[0] || { name: 'Nenhuma', score: 0 };
  
  const getRiskLabel = (score: number) => {
    if (score < 40) return { label: 'CRÍTICO', color: 'text-red-500', bar: 'bg-red-500' };
    if (score < 70) return { label: 'ELEVADO', color: 'text-orange-500', bar: 'bg-orange-500' };
    if (score < 90) return { label: 'MODERADO', color: 'text-yellow-500', bar: 'bg-yellow-500' }; 
    return { label: 'SEGURO', color: 'text-emerald-500', bar: 'bg-emerald-500' };
  };

  const risk = getRiskLabel(overallScore);

  return (
    <div id="pdf-content-wrapper" className="absolute left-[-9999px] top-0 overflow-hidden bg-[#0B1220]">
      <style>{`
        #pdf-content {
          background-color: #0B1220 !important;
          color: #e5e7eb;
          font-family: sans-serif;
        }
        .pdf-page { 
          width: 794px; 
          min-height: 1120px; 
          padding: 60px; 
          background-color: #0B1220; 
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
          page-break-after: always;
        }
        .pdf-page:last-child {
          page-break-after: auto;
        }
      `}</style>
      
      <div id="pdf-content">
        
        {/* PAGE 1: CAPA */}
        <div className="pdf-page items-center justify-center text-center">
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 w-full">
            <img src={logoConcierge} alt="Concierge" className="h-16 object-contain mb-4" />
            
            {profile.companyLogo ? (
              <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <img src={profile.companyLogo} alt="Cliente" className="h-24 object-contain" />
              </div>
            ) : (
              <h1 className="text-4xl font-black text-white tracking-widest uppercase">
                {profile.companyName || 'NUTRIN GROUP'}
              </h1>
            )}

            <div className="space-y-4">
              <h2 className="text-6xl font-black text-cyan-500 tracking-tighter uppercase">Security Assessment</h2>
              <h3 className="text-xl text-gray-300 tracking-[0.3em] font-light">CONCIERGE EXPERIENCE</h3>
            </div>

            <div className="w-32 h-1 bg-cyan-500/30 rounded-full" />

            <div className="space-y-2">
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Diagnóstico de Risco Realizado para</p>
              <p className="text-2xl font-bold text-white">{profile.companyName || 'Nutrin Group'}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 w-full max-w-md pt-8 text-left border-t border-white/10">
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Contato</p>
                <p className="font-bold text-white">{profile.contactName || 'Responsável'}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-1">Data de Geração</p>
                <p className="font-bold text-white">{date}</p>
              </div>
            </div>
          </div>
        </div>

        {/* PAGE 2: RESUMO EXECUTIVO */}
        <div className="pdf-page">
          <Header profile={profile} />
          <SectionTitle>Resumo Executivo</SectionTitle>
          
          <div className="grid grid-cols-2 gap-6 mb-8">
            <StandardCard className="flex flex-col">
              <p className="text-xs uppercase text-gray-400 font-bold mb-4">Postura Geral de Segurança</p>
              <div className="flex flex-col gap-2">
                <p className={`text-6xl font-black leading-none ${risk.color}`}>{Math.round(overallScore)}%</p>
                <p className={`text-sm font-bold uppercase tracking-widest ${risk.color} opacity-80`}>
                  Exposição: {risk.label}
                </p>
              </div>
            </StandardCard>

            <StandardCard>
              <p className="text-xs uppercase text-gray-400 font-bold mb-4">Maior Risco Identificado</p>
              <p className="text-2xl font-black text-red-500 leading-tight mb-2">{topPriority.name}</p>
              <p className="text-xs font-bold text-red-500/80 uppercase">Ação Imediata Recomendada</p>
            </StandardCard>

            <StandardCard>
              <p className="text-xs uppercase text-gray-400 font-bold mb-4">Risco Financeiro Estimado (ALE)</p>
              <p className="text-3xl font-black text-orange-500 mb-2">R$ {financialRisk.toLocaleString('pt-BR')}</p>
              <p className="text-xs text-gray-400">Projeção anual de perda baseada em gaps de infraestrutura.</p>
            </StandardCard>

            <StandardCard>
              <p className="text-xs uppercase text-gray-400 font-bold mb-4">Conformidade Técnica LGPD</p>
              <p className="text-3xl font-black text-blue-500 mb-2">{Math.round(lgpdScore)}%</p>
              <p className="text-xs text-gray-400">Nível de prontidão em controles e registros de proteção.</p>
            </StandardCard>
          </div>

          <StandardCard className="bg-cyan-500/5 border-cyan-500/20">
            <h4 className="font-bold text-cyan-400 text-sm uppercase mb-2">Diretriz Transversal</h4>
            <p className="text-sm leading-relaxed text-gray-300">
              O ambiente da <strong>{profile.companyName}</strong> apresenta gaps em controles fundamentais. A prioridade estratégica é a mitigação do pilar <strong>{topPriority.name}</strong>, visando reduzir a superfície de ataque e o risco financeiro projetado. Recomenda-se a implementação imediata de monitoramento contínuo (SOC).
            </p>
          </StandardCard>
          <Footer page={2} />
        </div>

        {/* PAGE 3: MATURIDADE POR DOMÍNIO */}
        <div className="pdf-page">
          <Header profile={profile} />
          <SectionTitle>Maturidade por Domínio</SectionTitle>
          
          <div className="space-y-6">
            {[
              { name: 'Firewall / Proteção de Borda', score: domainScores.firewall, desc: 'Avalia a eficácia do perímetro em bloquear ameaças automatizadas, segmentar redes locais, assegurar VPNs e inspecionar o tráfego SSL.' },
              { name: 'Endpoint / Proteção de Máquinas', score: domainScores.endpoint, desc: 'Analisa o nível de proteção contínua nas estações de trabalho e servidores contra Ransomware, roubo de credenciais e movimentação lateral.' },
              { name: 'Backup / Continuidade Operacional', score: domainScores.backup, desc: 'Verifica as práticas de guarda, retenção e isolamento (imutabilidade) dos dados para rápida retomada de negócios após um incidente crítico.' }
            ].map((d, i) => {
              const r = getRiskLabel(d.score || 0);
              return (
                <StandardCard key={i}>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-white">{d.name}</h3>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${d.score === null ? 'bg-white/10 text-gray-400' : 'bg-white/5 ' + r.color}`}>
                      {d.score === null ? 'Pendente' : `${Math.round(d.score)}% (${r.label})`}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{d.desc}</p>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    {d.score !== null && (
                      <div className={`h-full ${r.bar}`} style={{ width: `${d.score}%` }} />
                    )}
                  </div>
                </StandardCard>
              );
            })}
          </div>
          <Footer page={3} />
        </div>

        {/* PAGE 4: ORIGEM DO SCORE */}
        <div className="pdf-page">
          <Header profile={profile} />
          <SectionTitle>Análise de Exposição</SectionTitle>
          
          <div className="space-y-8">
            <StandardCard>
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="text-yellow-500" />
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">Gaps Estratégicos Detectados</h3>
              </div>
              <p className="text-sm text-gray-400 mb-6">A pontuação consolidada de {Math.round(overallScore)}% reflete fragilidades estruturais que permitem a progressão de ataques:</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-lg border-l-2 border-orange-500/50">
                  <p className="font-bold text-sm text-white mb-2">Visibilidade Limitada</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Ausência de centralização de logs e alertas impede a detecção precoce de anomalias.</p>
                </div>
                <div className="p-4 bg-white/5 rounded-lg border-l-2 border-orange-500/50">
                  <p className="font-bold text-sm text-white mb-2">Controles Isolados</p>
                  <p className="text-xs text-gray-500 leading-relaxed">Ferramentas que não se comunicam criam pontos cegos entre rede e máquinas.</p>
                </div>
              </div>
            </StandardCard>

            <StandardCard>
              <div className="flex items-center gap-3 mb-4">
                <Target className="text-cyan-500" />
                <h3 className="font-bold text-white uppercase tracking-wider text-sm">Evolução de Ameaças</h3>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Táticas modernas de invasão operam de forma silenciosa e persistente. Sem uma arquitetura de monitoramento 24/7, a detecção de um incidente ocorre apenas após a manifestação do impacto (ex: criptografia de dados).
              </p>
            </StandardCard>
          </div>
          <Footer page={4} />
        </div>

        {/* PAGE 5: CENÁRIOS DE RISCO */}
        <div className="pdf-page">
          <Header profile={profile} />
          <SectionTitle>Cenários de Risco</SectionTitle>
          
          <div className="grid grid-cols-2 gap-6">
            {[
              {
                name: 'Comprometimento por Ransomware', 
                impact: 'Criptografia total de dados, interrupção de serviços e indisponibilidade operacional prolongada.',
                rec: 'Implementação de MDR e Backup Imutável.'
              },
              {
                name: 'Roubo de Credenciais Corporativas', 
                impact: 'Acesso não autorizado a sistemas críticos e contas em nuvem usando identidades legítimas.',
                rec: 'Adoção de MFA e Políticas de Contexto.'
              },
              {
                name: 'Invasão via Superfície Exposta', 
                impact: 'Exploração de vulnerabilidades em serviços publicados na internet ou VPNs desatualizadas.',
                rec: 'Hardening de Firewall e Inspeção SSL.'
              },
              {
                name: 'Exfiltração de Dados (Vazamento)', 
                impact: 'Fuga de informações sensíveis resultando em danos reputacionais e sanções regulatórias.',
                rec: 'Monitoramento de Redes e DLP.'
              }
            ].map((c, i) => (
              <StandardCard key={i} className="flex flex-col border-l-4 border-l-red-500/50">
                <div className="flex-1">
                  <AlertTriangle className="text-red-500 mb-4" size={20} />
                  <h3 className="font-bold text-white text-base mb-2">{c.name}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{c.impact}</p>
                </div>
                <div className="bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/20">
                  <p className="text-[10px] text-emerald-400 font-bold uppercase mb-1">Recomendação</p>
                  <p className="text-[10px] text-gray-300">{c.rec}</p>
                </div>
              </StandardCard>
            ))}
          </div>
          <Footer page={5} />
        </div>

        {/* PAGE 6: IMPACTO FINANCEIRO */}
        <div className="pdf-page">
          <Header profile={profile} />
          <SectionTitle>Impacto Financeiro Estimado</SectionTitle>
          
          <div className="space-y-8">
            <StandardCard>
              <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                A exposição financeira anual projeta o custo potencial de incidentes severos considerando a falta de governança atual:
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-2 border-l-4 border-red-500 pl-6 bg-red-500/5 p-4 rounded-r-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Exposição Máxima (ALE)</p>
                  <p className="text-4xl font-black text-red-500">R$ {financialRisk.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-gray-400">Risco financeiro sem mitigação técnica.</p>
                </div>
                <div className="space-y-2 border-l-4 border-emerald-500 pl-6 bg-emerald-500/5 p-4 rounded-r-xl">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Exposição Pós-Mitigação</p>
                  <p className="text-4xl font-black text-emerald-500">R$ {projectedAle.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-gray-400">Risco residual após investimentos planejados.</p>
                </div>
              </div>
            </StandardCard>

            <div className="grid grid-cols-2 gap-4">
              {[
                'Interrupção de faturamento por inatividade tecnológica.',
                'Custos extraordinários com resposta a incidentes/perícia.',
                'Impacto em multas regulatórias e perdas jurídicas.',
                'Desgaste reputacional e possível perda de contratos.'
              ].map((e, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-gray-400 bg-white/5 p-3 rounded-lg border border-white/5">
                  <ChevronRight size={14} className="text-cyan-500 shrink-0 mt-0.5" />
                  <span>{e}</span>
                </div>
              ))}
            </div>
          </div>
          <Footer page={6} />
        </div>

        {/* PAGE 7: LGPD */}
        <div className="pdf-page">
          <Header profile={profile} />
          <SectionTitle>Exposição Regulatória LGPD</SectionTitle>

          <div className="flex bg-blue-500/5 border border-blue-500/20 rounded-2xl p-8 mb-8 items-center justify-between">
            <div className="space-y-4 max-w-md">
              <p className="text-xs uppercase text-blue-400 font-black tracking-widest">Score de Conformidade Técnica</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                A conformidade técnica reflete a capacidade da infraestrutura em proteger dados pessoais e manter evidências de auditoria exigidas pela lei.
              </p>
            </div>
            <div className="flex items-center justify-center w-32 h-32 rounded-full border-[8px] border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.3)] bg-blue-500/5">
              <span className="text-4xl font-black text-blue-500">{Math.round(lgpdScore)}%</span>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { art: 'Segurança e Sigilo (Art. 46)', desc: 'Exige medidas de segurança aptas a proteger os dados de acessos não autorizados e situações acidentais ou ilícitas.'},
              { art: 'Reporte de Incidentes (Art. 48)', desc: 'Obrigatoriedade de notificar a autoridade nacional em tempo hábil. Sem logs e auditoria, o reporte torna-se impossível.'},
              { art: 'Sanções Aplicáveis (Art. 52)', desc: 'Multas de até 2% do faturamento (limitadas a R$ 50 mi), além do bloqueio e eliminação dos dados.'}
            ].map((a, i) => (
              <StandardCard key={i}>
                <p className="text-blue-400 font-bold text-sm uppercase tracking-widest mb-2">{a.art}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{a.desc}</p>
              </StandardCard>
            ))}
          </div>
          <Footer page={7} />
        </div>

        {/* PAGE 8: ROI */}
        <div className="pdf-page">
          <Header profile={profile} />
          <SectionTitle>Viabilidade & Retorno (ROI)</SectionTitle>

          <div className="space-y-8 flex-1">
            <StandardCard>
              <p className="text-sm text-gray-400 leading-relaxed mb-8">
                Este demonstrativo projeta o ganho operacional financeiro ao converter gastos imprevistos com incidentes em investimentos controlados de segurança ativa.
              </p>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Economia Anual Projetada</p>
                  <p className="text-3xl font-black text-white">R$ {estimatedSavings.toLocaleString('pt-BR')}</p>
                </div>
                <div className="bg-white/5 p-5 rounded-xl border border-white/10">
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">Simulação de Investimento</p>
                  {isValidRoi ? (
                    <p className="text-3xl font-black text-cyan-500 tracking-tighter">R$ {Math.round(annualCost).toLocaleString('pt-BR')} <span className="text-xs font-normal opacity-50">/ano</span></p>
                  ) : (
                    <p className="text-sm text-orange-500 font-bold uppercase py-2">Não Definida</p>
                  )}
                </div>
              </div>

              {isValidRoi ? (
                <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-8">
                  <div className="flex-1 pr-8 border-r border-emerald-500/20">
                    <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Retorno sobre o Investimento</p>
                    <p className="text-xs text-gray-400 leading-relaxed">O valor economizado mitiga amplamente o custo da solução, gerando retorno positivo imediato.</p>
                  </div>
                  <div className="pl-8 text-right flex flex-col items-center justify-center">
                    <p className="text-5xl font-black text-emerald-500">+{roiPercentage}%</p>
                  </div>
                </div>
              ) : (
                <div className="p-8 border border-white/10 rounded-2xl bg-white/5 text-center">
                   <p className="text-sm text-gray-400 font-medium italic">Insira os valores de implantação e mensalidade para calcular o ROI automático.</p>
                </div>
              )}
            </StandardCard>
          </div>
          <Footer page={8} />
        </div>

        {/* PAGE 9: INSTITUCIONAL */}
        <div className="pdf-page bg-[#0B1220]">
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 w-full">
            <img src={logoConcierge} alt="Concierge" className="h-16 object-contain opacity-90" />
            
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-black text-white tracking-widest uppercase">Concierge Segurança Digital</h2>
              <span className="inline-block px-4 py-1.5 border border-cyan-500/30 rounded-full text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] bg-cyan-500/5">
                Cyber Defense Powered by QOS Tecnologia
              </span>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed text-center max-w-2xl px-6">
              A Concierge combina tecnologia de ponta, processos certificados e monitoramento contínuo para transformar sua postura de segurança de reativa em proativa.
            </p>

            <div className="grid grid-cols-2 gap-4 w-full max-w-2xl">
              {[
                { title: 'SOC 24/7', desc: 'Monitoramento global e resposta em tempo real.' },
                { title: 'ISO 27001', desc: 'Operação certificada em padrões internacionais.' },
                { title: 'Grupo QOS', desc: 'Mais de 24 anos de experiência no mercado.' },
                { title: 'Cyber Experts', desc: 'Apoio especializado em detecção e contenção.' }
              ].map((item, i) => (
                <div key={i} className="p-5 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-cyan-500 font-black text-xs uppercase mb-1 tracking-widest">{item.title}</p>
                  <p className="text-[10px] text-gray-500 leading-tight uppercase font-bold">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="w-full bg-cyan-500/5 border border-cyan-500/20 p-6 rounded-2xl text-center max-w-2xl border-l-4 border-l-cyan-500">
               <p className="text-xs text-gray-300 font-medium italic">Este assessment é a base estratégica para proteger o futuro da sua organização.</p>
            </div>
          </div>
          <Footer page={9} />
        </div>

      </div>
    </div>
  );
};
