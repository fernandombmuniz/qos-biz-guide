import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Info, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MethodologyModalProps {
    score?: number;
}

const MethodologyModal: React.FC<MethodologyModalProps> = ({ score = 0 }) => {
    const getLevel = (s: number) => {
        if (s <= 25) return 'Baixo';
        if (s <= 50) return 'Moderado';
        if (s <= 75) return 'Elevado';
        return 'Crítico';
    };

    const getProb = (s: number) => {
        if (s <= 25) return 10;
        if (s <= 50) return 15;
        if (s <= 75) return 25;
        return 30;
    };

    const level = getLevel(score);
    const prob = getProb(score);
    const impactPotencial = 300000 * (score / 135);
    const riskAnual = impactPotencial * (prob / 100);

    const SectionTitle = ({ children }: { children: React.ReactNode }) => (
        <span className="text-base font-bold text-foreground">{children}</span>
    );

    const SourceLink = ({ label, url }: { label: string; url: string }) => (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
        >
            {label} <ExternalLink size={10} />
        </a>
    );

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2 border-primary/20 hover:bg-primary/10">
                    <Info size={16} />
                    Como esse cálculo foi feito?
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl md:max-w-4xl max-h-[90vh] overflow-y-auto glass-card border-border/40 p-0 gap-0">
                <DialogHeader className="p-6 pb-2 border-b border-white/5">
                    <DialogTitle className="text-2xl font-bold">
                        Metodologia de Análise de Risco
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm mt-1">
                        Transparência sobre a metodologia, fontes e premissas usadas na estimativa de risco cibernético.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6">
                    <Accordion type="single" collapsible className="w-full space-y-2">

                        {/* SEÇÃO 1 */}
                        <AccordionItem value="section-1" className="border border-white/10 rounded-xl px-4 bg-white/5">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <SectionTitle>1. Avaliação dos controles de segurança</SectionTitle>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 space-y-4 text-sm text-foreground/80 leading-relaxed">
                                <p>
                                    O sistema analisa a presença ou ausência de controles fundamentais de segurança no ambiente. Esses controles são considerados essenciais para reduzir a superfície de ataque e são amplamente recomendados em frameworks internacionais de segurança.
                                </p>
                                <p>
                                    As referências utilizadas para definir quais controles devem ser avaliados incluem o <strong>CIS Critical Security Controls v8</strong> e o <strong>NIST Cybersecurity Framework</strong>. Esses frameworks são utilizados globalmente para orientar programas de segurança da informação, governança e gestão de riscos.
                                </p>
                                <div>
                                    <p className="font-bold text-foreground mb-2">Controles avaliados:</p>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                        <li className="flex items-center gap-2">• Firewall ativo</li>
                                        <li className="flex items-center gap-2">• Segmentação de rede</li>
                                        <li className="flex items-center gap-2">• VPN com autenticação multifator (MFA)</li>
                                        <li className="flex items-center gap-2">• Monitoramento de rede</li>
                                        <li className="flex items-center gap-2">• Registro e centralização de logs</li>
                                        <li className="flex items-center gap-2">• Sistema de detecção de intrusão (IPS)</li>
                                    </ul>
                                </div>
                                <p>
                                    Cada controle ausente aumenta o Score de Exposição, pois indica uma lacuna na postura de segurança do ambiente.
                                </p>
                                <div className="pt-2">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Fontes:</p>
                                    <SourceLink label="CIS Critical Security Controls v8" url="https://www.cisecurity.org/controls" />
                                    <SourceLink label="NIST Cybersecurity Framework" url="https://www.nist.gov/cyberframework" />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* SEÇÃO 2 */}
                        <AccordionItem value="section-2" className="border border-white/10 rounded-xl px-4 bg-white/5">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <SectionTitle>2. Como a pontuação foi definida</SectionTitle>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 space-y-4 text-sm text-foreground/80 leading-relaxed">
                                <p>
                                    Os frameworks de segurança indicam quais controles são críticos, mas não atribuem valores numéricos diretamente. Para transformar essa análise qualitativa em um score mensurável, o sistema utiliza um modelo de pontuação normalizado.
                                </p>
                                <p>
                                    A escala utilizada foi padronizada para <strong>100 pontos máximos</strong> de exposição. Isso significa que os pesos representam percentuais relativos dentro dessa escala.
                                </p>
                                <div className="rounded-lg border border-white/10 overflow-hidden">
                                    <Table>
                                        <TableHeader className="bg-white/5">
                                            <TableRow className="hover:bg-transparent border-white/10">
                                                <TableHead className="text-xs h-8">Controle</TableHead>
                                                <TableHead className="text-xs h-8">Importância</TableHead>
                                                <TableHead className="text-xs h-8 text-right">Peso</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {[
                                                { item: 'Firewall / tráfego', imp: 'Muito alto', p: '+30' },
                                                { item: 'Segmentação de rede', imp: 'Muito alto', p: '+25' },
                                                { item: 'IPS / intrusão', imp: 'Alto', p: '+20' },
                                                { item: 'Logs / centralização', imp: 'Médio', p: '+15' },
                                                { item: 'Monitoramento', imp: 'Médio', p: '+10' },
                                            ].map((row, i) => (
                                                <TableRow key={i} className="hover:bg-white/5 border-white/10">
                                                    <TableCell className="py-2 text-xs">{row.item}</TableCell>
                                                    <TableCell className="py-2 text-xs">{row.imp}</TableCell>
                                                    <TableCell className="py-2 text-xs text-right font-bold text-primary">{row.p}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <p className="text-xs italic">
                                    Exemplo: +30 representa aproximadamente 30% da exposição máxima associada à ausência de um controle crítico de proteção de rede.
                                </p>
                                <div className="pt-2">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Fontes:</p>
                                    <SourceLink label="CIS Critical Security Controls v8" url="https://www.cisecurity.org/controls" />
                                    <SourceLink label="NIST Cybersecurity Framework" url="https://www.nist.gov/cyberframework" />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* SEÇÃO 3 */}
                        <AccordionItem value="section-3" className="border border-white/10 rounded-xl px-4 bg-white/5">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <SectionTitle>3. Cálculo do Score de Exposição</SectionTitle>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 space-y-4 text-sm text-foreground/80 leading-relaxed">
                                <p>
                                    O Score de Exposição é obtido pela soma dos pesos associados aos controles ausentes no ambiente. Esse score representa o nível relativo de exposição do ambiente.
                                </p>
                                <div className="bg-black/20 p-4 rounded-lg font-mono text-xs space-y-1">
                                    <p className="text-muted-foreground mb-2">// Exemplo de cálculo:</p>
                                    <p>Segmentação de rede inexistente → +15</p>
                                    <p>VPN sem MFA → +15</p>
                                    <p>Operação apenas reativa → +10</p>
                                    <p className="border-t border-white/20 pt-1 mt-1 font-bold">Score total: 40</p>
                                </div>
                                <div>
                                    <p className="font-bold text-foreground mb-2">Classificação do modelo:</p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex justify-between p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"><span>0–25</span> <span>Baixo</span></div>
                                        <div className="flex justify-between p-2 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400"><span>26–50</span> <span>Moderado</span></div>
                                        <div className="flex justify-between p-2 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400"><span>51–75</span> <span>Elevado</span></div>
                                        <div className="flex justify-between p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400"><span>76+</span> <span>Crítico</span></div>
                                    </div>
                                </div>
                                <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                                    <p className="text-xs font-bold text-primary uppercase">No ambiente analisado:</p>
                                    <p className="text-base font-bold text-foreground mt-1">
                                        Score de exposição = {score} ({level})
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Fontes:</p>
                                    <SourceLink label="CIS Critical Security Controls v8" url="https://www.cisecurity.org/controls" />
                                    <SourceLink label="NIST Cybersecurity Framework" url="https://www.nist.gov/cyberframework" />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* SEÇÃO 4 */}
                        <AccordionItem value="section-4" className="border border-white/10 rounded-xl px-4 bg-white/5">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <SectionTitle>4. Estimativa de probabilidade de incidente</SectionTitle>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 space-y-4 text-sm text-foreground/80 leading-relaxed">
                                <p>
                                    A probabilidade anual de incidente é estimada com base no nível de exposição do ambiente. Ambientes com maior número de lacunas de segurança tendem a apresentar maior frequência de incidentes.
                                </p>
                                <div className="rounded-lg border border-white/10 overflow-hidden max-w-sm">
                                    <Table>
                                        <TableHeader className="bg-white/5">
                                            <TableRow className="hover:bg-transparent border-white/10">
                                                <TableHead className="text-xs h-8">Score de exposição</TableHead>
                                                <TableHead className="text-xs h-8 text-right">Probabilidade</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {[
                                                { s: '0–25', p: '10%' },
                                                { s: '26–50', p: '15%' },
                                                { s: '51–75', p: '25%' },
                                                { s: '76+', p: '30%' },
                                            ].map((row, i) => (
                                                <TableRow key={i} className={`hover:bg-white/5 border-white/10 ${score > 0 && ((row.s === '0–25' && score <= 25) || (row.s === '26–50' && score > 25 && score <= 50) || (row.s === '51–75' && score > 50 && score <= 75) || (row.s === '76+' && score > 75)) ? 'bg-primary/20' : ''}`}>
                                                    <TableCell className="py-2 text-xs">{row.s}</TableCell>
                                                    <TableCell className="py-2 text-xs text-right font-bold text-foreground">{row.p}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="bg-primary/10 p-3 rounded-lg border border-primary/20">
                                    <p className="text-xs font-bold text-primary uppercase">No ambiente analisado:</p>
                                    <p className="text-sm font-medium text-foreground mt-1">
                                        Como o ambiente possui Score {score}, foi aplicada probabilidade anual estimada de <strong>{prob}%</strong>.
                                    </p>
                                </div>
                                <div className="pt-2">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Fontes:</p>
                                    <SourceLink label="Sophos State of Ransomware Report" url="https://www.sophos.com/en-us/content/state-of-ransomware" />
                                    <SourceLink label="CrowdStrike Global Threat Report" url="https://www.crowdstrike.com/global-threat-report" />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* SEÇÃO 5 */}
                        <AccordionItem value="section-5" className="border border-white/10 rounded-xl px-4 bg-white/5">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <SectionTitle>5. Estimativa de impacto financeiro</SectionTitle>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 space-y-4 text-sm text-foreground/80 leading-relaxed">
                                <p>
                                    Para estimar o impacto financeiro potencial de incidentes cibernéticos, o sistema utiliza dados de estudos globais que analisam milhares de incidentes reais em empresas. Esses estudos mostram que incidentes podem gerar custos relacionados a:
                                </p>
                                <ul className="grid grid-cols-2 gap-y-1 text-xs text-foreground/70">
                                    <li>• Interrupção operacional</li>
                                    <li>• Resposta a incidentes</li>
                                    <li>• Restauração de sistemas</li>
                                    <li>• Recuperação de dados</li>
                                    <li>• Perda de produtividade</li>
                                    <li>• Impacto reputacional</li>
                                </ul>
                                <p>
                                    Para fins de simulação foi considerado um impacto estimado proporcional ao cenário analisado, utilizando como base a média de mercado consolidada.
                                </p>
                                <div className="pt-2">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Fontes:</p>
                                    <SourceLink label="IBM Cost of a Data Breach Report" url="https://www.ibm.com/reports/data-breach" />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* SEÇÃO 6 */}
                        <AccordionItem value="section-6" className="border border-white/10 rounded-xl px-4 bg-white/5">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <SectionTitle>6. Cálculo do risco financeiro anual</SectionTitle>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 space-y-4 text-sm text-foreground/80 leading-relaxed">
                                <p>
                                    O cálculo final utiliza um modelo simplificado de quantificação de risco baseado em impacto potencial e probabilidade estimada.
                                </p>
                                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 flex flex-col items-center text-center">
                                    <p className="text-xs uppercase font-bold text-primary mb-2">Fórmula utilizada</p>
                                    <p className="text-lg font-mono text-foreground font-bold">
                                        Risco esperado = Impacto potencial × Probabilidade anual
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <p className="text-xs text-muted-foreground uppercase mb-1">Impacto potencial estimado</p>
                                        <p className="text-xl font-bold text-foreground">
                                            R$ {Math.round(impactPotencial).toLocaleString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <p className="text-xs text-muted-foreground uppercase mb-1">Probabilidade anual</p>
                                        <p className="text-xl font-bold text-foreground">{prob}%</p>
                                    </div>
                                </div>

                                <div className="bg-primary/20 p-4 rounded-xl border border-primary/30 text-center">
                                    <p className="text-xs text-primary font-bold uppercase mb-1">Cálculo e Resultado</p>
                                    <p className="text-sm font-mono mb-2">
                                        {Math.round(impactPotencial).toLocaleString('pt-BR')} × {prob / 100}
                                    </p>
                                    <p className="text-2xl font-extrabold text-foreground">
                                        Risco financeiro anual = R$ {Math.round(riskAnual).toLocaleString('pt-BR')}
                                    </p>
                                </div>

                                <p className="text-xs text-muted-foreground italic">
                                    Esse valor representa a exposição financeira anual estimada considerando o nível atual de segurança do ambiente.
                                </p>

                                <div className="pt-4 border-t border-white/10">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Fontes combinadas:</p>
                                    <SourceLink label="IBM Cost of a Data Breach Report" url="https://www.ibm.com/reports/data-breach" />
                                    <SourceLink label="Sophos State of Ransomware Report" url="https://www.sophos.com/en-us/content/state-of-ransomware" />
                                    <SourceLink label="CrowdStrike Global Threat Report" url="https://www.crowdstrike.com/global-threat-report" />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MethodologyModal;
