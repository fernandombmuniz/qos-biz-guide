/**
 * Exportação independente do diálogo de impressão do navegador.
 * Cada página do relatório é renderizada em proporção A4 paisagem e adicionada
 * a um PDF com dimensões fixas, evitando Carta/retrato e cabeçalhos automáticos.
 */
import html2pdf from 'html2pdf.js';
import { jsPDF } from 'jspdf';

const PAGE_WIDTH_PX = 1122;
const PAGE_HEIGHT_PX = 794;

export async function exportLuminaPDF(companyName: string): Promise<void> {
  const host = document.querySelector<HTMLElement>('[data-lumina-report]');
  if (!host) throw new Error('O relatório precisa estar aberto para gerar o PDF.');

  const originalPages = Array.from(host.querySelectorAll<HTMLElement>('.lumina-page'));
  if (!originalPages.length) throw new Error('Nenhuma página foi encontrada.');

  // A4 paisagem, com dimensões explícitas e sem interferência da impressora.
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4', compress: true });
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const stage = document.createElement('div');
  stage.setAttribute('aria-hidden', 'true');
  stage.style.cssText = [
    'position:fixed',
    'left:0',
    'top:0',
    `width:${PAGE_WIDTH_PX}px`,
    'height:auto',
    'display:block',
    'z-index:-9999',
    'pointer-events:none',
    'overflow:visible',
  ].join(';');
  const report = document.createElement('div');
  report.className = 'lumina-report lumina-report-export';
  report.style.cssText = `display:block;width:${PAGE_WIDTH_PX}px;max-width:none;margin:0;padding:0;gap:0;`;
  stage.appendChild(report);
  document.body.appendChild(stage);

  try {
    await document.fonts.ready;
    for (let i = 0; i < originalPages.length; i += 1) {
      const source = originalPages[i];
      const page = source.cloneNode(true) as HTMLElement;
      page.classList.add('lumina-export-page');
      page.style.cssText = [
        `width:${PAGE_WIDTH_PX}px`,
        `min-width:${PAGE_WIDTH_PX}px`,
        `max-width:${PAGE_WIDTH_PX}px`,
        `height:${PAGE_HEIGHT_PX}px`,
        `min-height:${PAGE_HEIGHT_PX}px`,
        `max-height:${PAGE_HEIGHT_PX}px`,
        'aspect-ratio:auto',
        'margin:0',
        'border-radius:0',
        'box-shadow:none',
        'overflow:hidden',
      ].join(';');
      report.replaceChildren(page);

      // Aguarda o clone montar layout e carregar eventuais logos/data URLs.
      const images = Array.from(page.querySelectorAll<HTMLImageElement>('img'));
      await Promise.all(images.map(async img => {
        if (!img.complete) {
          await new Promise<void>(resolve => {
            img.addEventListener('load', () => resolve(), { once: true });
            img.addEventListener('error', () => resolve(), { once: true });
          });
        }
        // html2canvas deve capturar apenas depois da decodificação dos fundos e logos.
        if (img.naturalWidth > 0 && img.decode) await img.decode().catch(() => undefined);
      }));
      // Dois frames estabilizam fontes, SVGs e a disposição de cada página.
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      // Capturamos o contêiner report (e não a página isolada): o html2pdf
      // clona a raiz capturada; sem .lumina-report como ancestral, os estilos
      // tipográficos e as cores dos painéis não são aplicados no clone.
      // O html2pdf já é dependência do app. Usamos somente o canvas; a paginação
      // e a orientação são gerenciadas pelo jsPDF, uma página por seção.
      const worker = html2pdf()
        .set({
          margin: 0,
          jsPDF: { unit: 'px', format: [PAGE_WIDTH_PX, PAGE_HEIGHT_PX], orientation: 'landscape' },
          html2canvas: {
            scale: 2,
            backgroundColor: '#07192b',
            useCORS: true,
            logging: false,
            scrollX: 0,
            scrollY: 0,
            windowWidth: PAGE_WIDTH_PX,
            width: PAGE_WIDTH_PX,
            height: PAGE_HEIGHT_PX,
          },
        })
        .from(report)
        .toCanvas();
      const canvas = (await worker.get('canvas')) as HTMLCanvasElement;
      if (!canvas || canvas.width < 100) throw new Error(`Falha ao renderizar a página ${i + 1}.`);
      if (i > 0) pdf.addPage('a4', 'landscape');
      const img = canvas.toDataURL('image/jpeg', 0.93);
      pdf.addImage(img, 'JPEG', 0, 0, pdfWidth, pdfHeight, `pagina-${i + 1}`, 'FAST');
      // Liberar os canvases grandes é importante em reuniões longas.
      canvas.width = 0;
      canvas.height = 0;
    }
  } finally {
    stage.remove();
  }

  const safeName = (companyName || 'cliente')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 70).toLowerCase();
  pdf.save(`Lumina_Relatorio_Executivo_${safeName || 'cliente'}.pdf`);
}
