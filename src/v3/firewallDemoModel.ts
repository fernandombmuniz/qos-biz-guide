/**
 * Educational-only scenarios. No real requests, credential collection or downloads.
 * Blocked result assumes a specific policy has been configured for the demo.
 */
export type DemoScenario = 'phishing' | 'download' | 'c2';
export type DemoMode = 'concierge' | 'baseline';
export type DemoStage = 0 | 1 | 2 | 3 | 4;

export function demoOutcome(scenario: DemoScenario, mode: DemoMode) {
  const blocked = mode === 'concierge';
  const descriptions: Record<DemoScenario, { blocked: string; allowed: string; reasonBlocked: string; reasonAllowed: string }> = {
    phishing: {
      blocked: 'Página suspeita bloqueada pela política',
      allowed: 'Página falsa exibida na simulação',
      reasonBlocked: 'O domínio identificado como malicioso foi bloqueado antes da abertura da página de login.',
      reasonAllowed: 'Sem a regra de filtragem da demonstração, a página falsa pôde carregar. Nenhuma senha foi enviada.',
    },
    download: {
      blocked: 'Download interrompido na borda',
      allowed: 'Download ilustrativo concluído',
      reasonBlocked: 'A política da demonstração bloqueou o destino ou a transferência antes da entrega do arquivo.',
      reasonAllowed: 'A transferência fictícia terminou porque a regra de bloqueio não estava presente. Nada foi baixado de verdade.',
    },
    c2: {
      blocked: 'Conexão de saída suspeita interrompida',
      allowed: 'Conexão de saída permitida na simulação',
      reasonBlocked: 'Uma regra demonstrativa de reputação de destino impediu a comunicação com um endereço conhecido como malicioso.',
      reasonAllowed: 'Sem a regra demonstrativa, a tentativa de conexão saiu do dispositivo. Nenhum tráfego real ocorreu.',
    },
  };
  const description = descriptions[scenario];
  return {
    blocked,
    state: blocked ? 'blocked' : 'allowed',
    headline: blocked ? description.blocked : description.allowed,
    reason: blocked ? description.reasonBlocked : description.reasonAllowed,
    log: blocked ? 'Evento ilustrativo registrado para triagem do SOC.' : 'Nenhum bloqueio foi produzido nesta demonstração.',
  } as const;
}

export function nextDemoStage(stage: DemoStage): DemoStage {
  return Math.min(stage + 1, 4) as DemoStage;
}

export const DEMO_DELAYS_MS: Partial<Record<DemoStage, number>> = { 1: 850, 2: 1050, 3: 1250 };
