# Atualização V3.1.0 · apresentação consultiva

Esta atualização incremental inclui preparação e apresentação separadas, percurso por cliente,
cinco blocos de perguntas de firewall, indicador com cobertura, referências e implicações
contextuais de proteção de dados, além de simulações guiadas de Firewall, Endpoint e Backup.

## Como começar
1. Prepare a reunião, informe o cliente e o objetivo.
2. Revise os temas propostos. Selecione e ordene Firewall, Endpoint e Backup.
3. Escolha os blocos opcionais. Simulação vem habilitada; atuação e investimento ficam opcionais.
4. Preencha os controles conhecidos. Ausência de resposta permanece “A confirmar”.
5. Abra o painel do apresentador antes de compartilhar a janela principal, se quiser usar notas.
6. Clique em Iniciar apresentação. A abertura mostra cliente, objetivo e uma agenda curta.
7. Use Continuar ou as setas do teclado. “Conduzir conversa” permite aprofundar ou trocar de tema.
8. Nos achados, “Confirmar ou atualizar” registra uma resposta sem sair da apresentação.
9. Em “Na prática”, clique nos elementos de ação do ambiente simulado.
10. Registre os encaminhamentos de cada tema e conclua a reunião. A síntese contempla os temas selecionados.

## Simulações incluídas
- Firewall: navegação permitida, comunicação de C2 conhecida, bloqueio, evento e investigação.
  Alternativa: falha do firewall principal e contingência HA hipotética.
- Endpoint: webmail, anexo, download, execução, alteração dos arquivos e aviso de resgate fictício.
  Compare com um ramo de bloqueio de processo, isolamento autorizado e investigação.
- Backup: parada de serviço ou exclusão de pasta; escolha de ponto, integridade, destino,
  restauração e validação funcional. A cópia falha não pode ser escolhida.
- Os cenários não executam malware, tráfego ou restauração real. Não acessam os arquivos do computador.
  Tempos comprimidos e hipóteses não alteram o diagnóstico. Os eventos são fictícios.

## Indicador Concierge, metodologia 1.0
Todos os critérios têm peso igual. Nota = controles informados como existentes / critérios
com resposta conclusiva × 100. “A confirmar” reduz a cobertura; “Não se aplica” é excluído.
A nota fica “Em levantamento” com menos de 60% de cobertura.
O limiar é uma escolha editorial interna, não um padrão normativo. Não mede chance de incidente,
eficácia comprovada, adequação LGPD ou certificação. Um controle informado exige evidências.
A ficha técnica complementar foi preservada. Os controles que orientam achados e nota ficam
na preparação; dados antigos não são convertidos automaticamente em conclusões.

## Compatibilidade e atualização
Compatível com V3.0.0 e com o patch 01. Mescle o conteúdo do ZIP na raiz do projeto,
onde está package.json. Substitua arquivos quando solicitado; não apague src ou dist.
Os bundles antigos podem permanecer: o novo dist/index.html aponta para os novos arquivos.
Não há novas dependências. O dist está pronto para usar com os iniciadores existentes.
Sessões JSON versão 3 e dados locais são mantidos no mesmo navegador e endereço.
Exporte a sessão antes de mover o projeto, trocar de navegador ou alterar a porta.

## Fontes
Links oficiais ficam dentro dos achados e das simulações. Consulta em 29/10/2026:
LGPD art.46, guia ANPD, CERT.br (ransomware), SonicWall (Botnet Filter),
Veeam (verificação de recuperação). As interpretações do aplicativo são próprias.
Referências exigem conexão para abrir; a apresentação e os exercícios funcionam localmente.

## Verificação
Testes automatizados abrangem o diagnóstico, cobertura da nota, roteamento,
ocultação de controles internos e progressão das simulações. Compilação e TypeScript verificados.
Interface conferida no navegador de teste. O teste em Teams, execução no Windows do usuário
e impressão/PDF no computador final ainda dependem da validação interna.

---

## Documentação original V3.0 (histórico)
As descrições de navegação e simulação abaixo são históricas; a V3.1 descrita acima prevalece.

# Concierge Interactive Experience V3.0

Primeira versão funcional para avaliação interna. Não publicada.

## Testar rapidamente no Windows

1. Extraia todo o ZIP para uma pasta nova. Mantenha sua V2 separada.
2. Com Node.js LTS instalado (20 ou superior), abra INICIAR_WINDOWS.bat.
3. Mantenha o terminal aberto. O aplicativo fica em http://localhost:4173.
4. Se o navegador abrir antes de o servidor iniciar, atualize a página.
5. Clique em "Carregar exemplo fictício" para explorar os módulos ou prepare seu próprio cliente.

A pasta dist já contém a versão compilada. Não precisa instalar dependências para essa primeira visualização. Não abra dist/index.html diretamente: use o iniciador ou `node serve.mjs`.

## macOS / Linux

Na pasta extraída, execute `node serve.mjs` (ou `sh INICIAR_MAC_LINUX.sh`) e abra http://localhost:4173.

O servidor atende apenas a máquina local (127.0.0.1). Se a porta estiver ocupada, encerre a outra instância ou use a variável PORT. Não altere o endereço para expor em rede sem definir o controle de acesso apropriado.

## Desenvolver e recompilar

Node.js 20+ e npm:

```sh
npm ci
npm run dev
```

O endereço de desenvolvimento aparece no terminal. Depois das alterações:

```sh
npm run typecheck
npm test
npm run build
npm start
```

Não execute duas instâncias do servidor de prévia na mesma porta.

## O que está implementado

- Identidade baseada nos componentes do Security Assessment: CyberBackdrop, Plus Jakarta Sans, marca Concierge, ciano e superfícies azuis. Fontes incluídas localmente com licença.
- Hub, preparação da conversa, panorama, Firewall, Endpoint e Backup.
- Seis capítulos em cada módulo: ambiente, achados, simulação, atuação, impacto e próximos passos.
- Conclusões geradas por respostas explícitas, com estado informado, atenção ou a confirmar.
- Percurso de Firewall para disponibilidade/HA ou acesso/tráfego, conforme contexto.
- Simulação de Endpoint com etapas de investigação e resposta.
- Simulação de Backup com etapas de recuperação e exercício de janelas de cópia/retorno.
- Revelação gradual de achados; avanço manual, reprodução, pausa e reinício dos cenários.
- Calculadora de indisponibilidade com premissas editáveis; investimento opcional em 12 meses.
- Painel do apresentador em janela separada, com notas e controle de próximo/anterior. Permita o popup. No Teams, compartilhe só a janela principal.
- Rascunho local, sessões salvas por cliente, exportação/importação JSON, logo do cliente e resumo imprimível.
- Ficha técnica completa com as sete etapas do levantamento anterior.
- Exemplo fictício para teste, sem dados reais de clientes.

## Dados e uso

Os dados ficam no armazenamento do navegador e não são enviados a backend ou e-mail. O ícone de salvar cria/atualiza uma sessão no histórico local (até 30 sessões). O rascunho é guardado automaticamente. Faça exportação JSON para backup, transferência entre máquinas ou preservação fora desse navegador.

Exportação JSON inclui os dados e as notas internas, inclusive as premissas financeiras preenchidas. Ela serve à retomada interna, não à devolutiva para o cliente. A saída "Relatório" não inclui notas do apresentador nem a calculadora financeira. Nessa tela, use "Imprimir / salvar PDF" e escolha "Salvar como PDF" no navegador.

Os campos de controles em "Preparar conversa" orientam os achados da V3. A ficha técnica preserva campos de aprofundamento da V2; os interruptores antigos não substituem as confirmações explícitas da V3. Quantidades e dados de infraestrutura compartilhados são reaproveitados. Essa separação está visível na interface para evitar inferir ausência de controle a partir de um valor inicial.

As caixas de seleção da simulação são hipóteses de discussão e não alteram o diagnóstico. O progresso da simulação e os controles deslizantes de recuperação são temporários. As premissas financeiras ficam no rascunho e na sessão JSON, mas não no relatório.

## Escopo desta primeira versão

A apresentação adaptativa está operacional. Ainda é uma V3 inicial para testar roteiro, conteúdo, densidade e interatividade com Fernando. Não é uma versão homologada para implantação em produção.

O código das páginas, hooks e utilitários da V2 foi mantido em src/pages, src/hooks e src/utils para evolução e rastreabilidade. O aplicativo usa a nova experiência de src/v3; os diagnósticos e as recomendações automáticas de equipamentos da V2 não são executados por essa experiência. O dimensionamento por modelo permanece sujeito a revisão dos critérios, catálogo e validação técnica. A V3 registra os requisitos técnicos e as pendências sem emitir uma recomendação de fabricante não validada.

A devolutiva é uma síntese imprimível, não uma reprodução do PDF 16:9 do Assessment. Não há integração automática com o aplicativo Security Assessment ou Omie. As informações podem ser exportadas para uso interno. Não há promessa de proteção total, score probabilístico ou projeção fixa de maturidade.

## Validado nesta entrega

- TypeScript sem erros.
- Build de produção concluído.
- Testes do projeto, incluindo regras de resposta desconhecida, não aplicável, módulos isolados, MFA/VPN, necessidade de HA, priorização e EDR sem operação.
- Navegação visual no navegador: abertura, contexto de Firewall, cenário conforme disponibilidade, achado de Endpoint e recuperação de Backup.

O teste no computador de Fernando e em uma chamada real do Teams continua necessário para avaliar legibilidade, popup do apresentador, impressão e preferências de condução.

## Arquivos principais

- src/v3/V3App.tsx: experiência de apresentação e coleta.
- src/v3/model.ts: perguntas, regras e cenários.
- src/v3/v3.css: composição visual e impressão.
- src/v3/AssessmentVisual.tsx: componentes visuais reaproveitados do Assessment.
- src/context/ProfileContext.tsx: dados compartilhados e rascunho.
- serve.mjs: servidor local da versão compilada.
- dist/: build pronto para teste.

O pacote não inclui node_modules, histórico Git ou credenciais. As dependências são reproduzíveis pelo package-lock.json.
