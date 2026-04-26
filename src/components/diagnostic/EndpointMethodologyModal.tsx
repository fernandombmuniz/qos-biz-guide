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

interface EndpointMethodologyModalProps {
    score?: number;
}

const EndpointMethodologyModal: React.FC<EndpointMethodologyModalProps> = ({ score = 0 }) => {
    const getLevel = (s: number) => {
        if (s >= 76) return 'Baixo';
        if (s >= 51) return 'Moderado';
        if (s >= 26) return 'Elevado';
        return 'Crítico';
    };

    const level = getLevel(score);

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
                        Metodologia de Análise de Risco Endpoint
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground text-sm mt-1">
                        Transparência sobre a metodologia, fontes e premissas usadas na estimativa de risco em endpoints.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6">
                    <Accordion type="single" collapsible className="w-full space-y-2">

                        {/* SEÇÃO 1 - Controles Avaliados */}
                        <AccordionItem value="section-1" className="border border-white/10 rounded-xl px-4 bg-white/5">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <SectionTitle>A. Como os controles foram avaliados</SectionTitle>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 space-y-4 text-sm text-foreground/80 leading-relaxed">
                                <p>
                                    O diagnóstico analisa a presença ou ausência de controles fundamentais para a proteção das estações de trabalho e servidores, utilizando referências globais de arquitetura de segurança.
                                </p>
                                <div>
                                    <p className="font-bold text-foreground mb-2">Principais controles analisados:</p>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                                        <li className="flex items-center gap-2">• Presença de EDR/XDR vs Antivírus Tradicional</li>
                                        <li className="flex items-center gap-2">• Políticas de BYOD e trabalho remoto</li>
                                        <li className="flex items-center gap-2">• Exposição de privilégios administrativos locais</li>
                                        <li className="flex items-center gap-2">• Adoção de MFA em acessos remotos</li>
                                        <li className="flex items-center gap-2">• Integração com Active Directory/Domínio</li>
                                        <li className="flex items-center gap-2">• Monitoramento comportamental 24/7 (SOC)</li>
                                    </ul>
                                </div>
                                <div className="pt-2">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Fontes de referência:</p>
                                    <SourceLink label="CIS Critical Security Controls v8 (Inventory & Threat Defense)" url="https://www.cisecurity.org/controls" />
                                    <SourceLink label="CISA Endpoint Security Best Practices" url="https://www.cisa.gov/topics/cybersecurity-best-practices" />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* SEÇÃO 2 - Score de Postura */}
                        <AccordionItem value="section-2" className="border border-white/10 rounded-xl px-4 bg-white/5">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <SectionTitle>B. Como o Score de Postura foi calculado</SectionTitle>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 space-y-4 text-sm text-foreground/80 leading-relaxed">
                                <p>
                                    O score final é a média dos três pilares fundamentais. Para cada controle, avaliamos três estados: <strong>Confirmado</strong> (pontuação máxima), <strong>Ausente</strong> (impacto negativo) e <strong>Não Informado</strong> (o controle é neutralizado e seu peso removido do divisor, garantindo um cálculo justo).
                                </p>
                                <div className="rounded-lg border border-white/10 overflow-hidden mb-4">
                                    <Table>
                                        <TableHeader className="bg-white/5">
                                            <TableRow className="hover:bg-transparent border-white/10">
                                                <TableHead className="text-xs h-8">Pilar</TableHead>
                                                <TableHead className="text-xs h-8">Controles e Pesos</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {[
                                                { item: '1. Proteção do Dispositivo', focus: 'EDR (40), Antivírus (25), AutoUpdate (20), Domínio (15)' },
                                                { item: '2. Exposição Humana', focus: 'MFA (40), Admin Local (25), Sem BYOD (20), Baixa Exp. Remota (15)' },
                                                { item: '3. Capacidade de Detecção', focus: 'Logs (40), Monit. Comportamental (35), Visibilidade (25)' },
                                            ].map((row, i) => (
                                                <TableRow key={i} className="hover:bg-white/5 border-white/10">
                                                    <TableCell className="py-2 text-xs font-bold text-foreground">{row.item}</TableCell>
                                                    <TableCell className="py-2 text-xs">{row.focus}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-xs mt-2">
                                    <div className="flex flex-col p-2 rounded bg-red-500/10 border border-red-500/20 text-red-400">
                                        <span className="font-bold">0–25</span> <span>Crítico</span>
                                    </div>
                                    <div className="flex flex-col p-2 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400">
                                        <span className="font-bold">26–50</span> <span>Elevado</span>
                                    </div>
                                    <div className="flex flex-col p-2 rounded bg-yellow-500/10 border border-yellow-500/20 text-yellow-400">
                                        <span className="font-bold">51–75</span> <span>Moderado</span>
                                    </div>
                                    <div className="flex flex-col p-2 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                        <span className="font-bold">76–100</span> <span>Baixo</span>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* SEÇÃO 3 - Probabilidade */}
                        <AccordionItem value="section-3" className="border border-white/10 rounded-xl px-4 bg-white/5">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <SectionTitle>C. Como a probabilidade de incidente foi estimada</SectionTitle>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 space-y-4 text-sm text-foreground/80 leading-relaxed">
                                <p>
                                    A probabilidade anual de um comprometimento bem-sucedido (ex: Ransomware ou Infiltração) é correlacionada à faixa de score do ambiente:
                                </p>
                                <ul className="list-disc pl-5 opacity-80 mb-2">
                                    <li><strong>Score 0–25:</strong> 35% de probabilidade anual.</li>
                                    <li><strong>Score 26–50:</strong> 25% de probabilidade anual.</li>
                                    <li><strong>Score 51–75:</strong> 15% de probabilidade anual.</li>
                                    <li><strong>Score 76–100:</strong> 8% de probabilidade anual.</li>
                                </ul>
                                <div className="pt-2">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Fontes e Tendências:</p>
                                    <SourceLink label="Microsoft Digital Defense Report 2024" url="https://www.microsoft.com/en-us/security/security-insider/microsoft-digital-defense-report-2024" />
                                    <SourceLink label="CrowdStrike 2025 Global Threat Report" url="https://www.crowdstrike.com/global-threat-report/" />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* SEÇÃO 4 - Impacto Financeiro */}
                        <AccordionItem value="section-4" className="border border-white/10 rounded-xl px-4 bg-white/5">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <SectionTitle>D. Como o impacto financeiro foi definido</SectionTitle>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 space-y-4 text-sm text-foreground/80 leading-relaxed">
                                <p>
                                    Calculamos o impacto multiplicando a quantidade de endpoints vulneráveis e usuários pelo custo base estimado do cenário.
                                </p>
                                <ul className="list-disc pl-5 opacity-80 mb-2">
                                    <li><strong>Ransomware:</strong> Custo base por ativo comprometido, focado no impacto de paralisação e recuperação.</li>
                                    <li><strong>Roubo de Credenciais e Exfiltração:</strong> Pondera o volume de usuários e a probabilidade de vazamento de dados confidenciais corporativos.</li>
                                </ul>
                                <p>
                                    O cálculo integra um fator de mitigação onde a presença de EDR absorve grande parte do choque, mas se apenas o antivírus tradicional estiver presente, o impacto real continua alto devido às ferramentas insuficientes contra malwares modernos (fileless).
                                </p>
                                <div className="pt-2">
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Fontes de custo de incidentes:</p>
                                    <SourceLink label="IBM X-Force Threat Intelligence Index 2025" url="https://www.ibm.com/reports/threat-intelligence" />
                                    <SourceLink label="Sophos State of Ransomware 2025" url="https://www.sophos.com/en-us/content/state-of-ransomware" />
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* SEÇÃO 5 - Risco Anual Estimado */}
                        <AccordionItem value="section-5" className="border border-white/10 rounded-xl px-4 bg-white/5">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <SectionTitle>E. Como o risco anual foi calculado</SectionTitle>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 space-y-4 text-sm text-foreground/80 leading-relaxed">
                                <p>
                                    Utilizamos a métrica de Expectativa de Perda Anual (ALE - Annualized Loss Expectancy).
                                </p>
                                <div className="bg-secondary/30 p-4 rounded-lg border border-border/50 text-center font-mono my-2 text-primary text-sm">
                                    Risco Anual = Impacto Financeiro × Probabilidade Anual Estimada
                                </div>
                                <p>
                                    Este valor demonstra a real "Exposição Financeira Estimada" para o cenário atual, definindo o orçamento prudente para mitigação do risco. Com a adoção dos serviços Concierge Endpoint (EDR gerenciado), mitigamos consideravelmente o Risco Anual, gerando a "Economia potencial estimada" demonstrada.
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        {/* SEÇÃO 6 - LGPD */}
                        <AccordionItem value="section-6" className="border border-white/10 rounded-xl px-4 bg-white/5">
                            <AccordionTrigger className="hover:no-underline py-4">
                                <SectionTitle>F. Como o Score LGPD foi correlacionado</SectionTitle>
                            </AccordionTrigger>
                            <AccordionContent className="pb-6 space-y-4 text-sm text-foreground/80 leading-relaxed">
                                <p>
                                    O score foca na correlação entre a infraestrutura de proteção ao usuário e as exigências diretas da Lei Geral de Proteção de Dados (LGPD).
                                </p>
                                <ul className="list-disc pl-5 opacity-80">
                                    <li><strong>Artigo 46:</strong> Sem EDR ou controle de acesso rígido (MFA, admin limitados), a organização falha na proteção base do usuário e do dado em máquina.</li>
                                    <li><strong>Artigo 48:</strong> A ausência de monitoramento centralizado (logs e SOC responsivo 24x7) inviabiliza a detecção ágil e notificação exigida frente a incidentes cibernéticos.</li>
                                    <li><strong>Artigo 50 e 52:</strong> Regula as boas práticas de governança sobre ativos cibernéticos e estipula punições financeiras derivadas do vazamento ou sequestro do dado no endpoint desprotegido.</li>
                                </ul>
                            </AccordionContent>
                        </AccordionItem>

                    </Accordion>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default EndpointMethodologyModal;
