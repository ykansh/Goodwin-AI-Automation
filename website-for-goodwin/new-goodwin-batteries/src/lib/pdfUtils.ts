import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratePdfOptions {
  elementId?: string;
  filename?: string;
  marginSideMm?: number;
  marginTopMm?: number;
  marginBottomMm?: number;
}

/**
 * Captures an HTML element and compiles it into an A4 PDF Blob & File
 * with natural blank borders (margins) on the sides, top, and bottom.
 */
export async function generateInvoicePdfBlob(
  elementId: string = 'printable-invoice',
  filename: string = 'invoice',
  options?: Partial<GeneratePdfOptions>
): Promise<{ blob: Blob; file: File }> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Invoice element with id "${elementId}" not found in DOM.`);
  }

  // Render element to high-res canvas (scale: 2 for sharp 300dpi-equivalent print output)
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    windowWidth: 1024,
    onclone: (clonedDoc) => {
      const clonedEl = clonedDoc.getElementById(elementId);
      if (clonedEl) {
        // Strip drop shadows so edges stay clean and sharp without blurry shadow artifacts
        clonedEl.style.boxShadow = 'none';
      }
    },
  });

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = 210; // A4 width in mm
  const pdfHeight = 297; // A4 height in mm

  // Check if printing thermal receipt (narrow POS layout) or standard A4 invoice
  const isThermalReceipt = element.offsetWidth < 500;

  // Natural blank borders (margins) on sides and top/bottom
  // Standard A4 invoice: 12mm blank borders on sides (~0.47 in), 10mm top & bottom
  const marginX = options?.marginSideMm ?? (isThermalReceipt ? (pdfWidth - 80) / 2 : 12);
  const marginY = options?.marginTopMm ?? 10;
  const marginBottom = options?.marginBottomMm ?? 10;

  const contentWidth = isThermalReceipt ? 80 : pdfWidth - marginX * 2;
  const contentHeight = pdfHeight - marginY - marginBottom;

  // Calculate full scaled height in mm
  const totalImgHeightMm = (canvas.height * contentWidth) / canvas.width;

  if (totalImgHeightMm <= contentHeight) {
    // Single page invoice - render directly with natural blank borders
    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    pdf.addImage(
      imgData,
      'JPEG',
      marginX,
      marginY,
      contentWidth,
      totalImgHeightMm,
      undefined,
      'FAST'
    );
  } else {
    // Multi-page invoice - slice canvas cleanly page-by-page preserving margins
    const pxPerMm = canvas.width / contentWidth;
    const pagePxHeight = contentHeight * pxPerMm;

    let sourceY = 0;
    let pageIndex = 0;

    while (sourceY < canvas.height) {
      const chunkPxHeight = Math.min(pagePxHeight, canvas.height - sourceY);

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = canvas.width;
      pageCanvas.height = chunkPxHeight;
      const ctx = pageCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          chunkPxHeight,
          0,
          0,
          canvas.width,
          chunkPxHeight
        );
      }

      const chunkMmHeight = (chunkPxHeight * contentWidth) / canvas.width;
      const chunkData = pageCanvas.toDataURL('image/jpeg', 0.98);

      if (pageIndex > 0) {
        pdf.addPage();
      }

      pdf.addImage(
        chunkData,
        'JPEG',
        marginX,
        marginY,
        contentWidth,
        chunkMmHeight,
        undefined,
        'FAST'
      );

      sourceY += chunkPxHeight;
      pageIndex++;
    }
  }

  const cleanFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
  const blob = pdf.output('blob');
  const file = new File([blob], cleanFilename, { type: 'application/pdf' });

  return { blob, file };
}

/**
 * Directly downloads the rendered invoice as a PDF file to the user's computer.
 */
export async function downloadInvoicePdf(
  elementId: string = 'printable-invoice',
  filename: string = 'invoice',
  options?: Partial<GeneratePdfOptions>
): Promise<void> {
  const { blob, file } = await generateInvoicePdfBlob(elementId, filename, options);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ShareInvoiceOptions {
  elementId?: string;
  invoiceNumber: string;
  partyName: string;
  partyPhone: string;
  totalAmount: number;
  businessName?: string;
  upiId?: string;
  marginSideMm?: number;
}

/**
 * Shares invoice via Web Share API with attached PDF file.
 * If file sharing is not supported by the client browser (e.g. desktop WhatsApp Web),
 * it downloads the PDF automatically and opens WhatsApp with the customer's phone number and message.
 */
export async function shareInvoicePdfWithWhatsApp({
  elementId = 'printable-invoice',
  invoiceNumber,
  partyName,
  partyPhone,
  totalAmount,
  businessName = 'Goodwin Batteries Pvt. Ltd.',
  upiId = 'goodwin@okaxis',
  marginSideMm,
}: ShareInvoiceOptions): Promise<{ sharedVia: 'native-share' | 'whatsapp-with-download' }> {
  const filename = `${invoiceNumber}.pdf`;
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(totalAmount);

  // Generate the PDF with natural blank borders
  const { file, blob } = await generateInvoicePdfBlob(elementId, filename, {
    marginSideMm,
  });

  const shareText = `Dear ${partyName},\n\nPlease find attached your invoice *${invoiceNumber}* for *${formattedAmount}* from ${businessName}.\n\nPay via UPI: ${upiId}\n\nThank you for choosing Goodwin Batteries!`;

  // 1. Check if the device / browser supports navigator.canShare with files (Mobile devices, iOS Safari, macOS Safari, Android Chrome)
  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `Invoice ${invoiceNumber}`,
        text: shareText,
        files: [file],
      });
      return { sharedVia: 'native-share' };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User cancelled share dialog
        return { sharedVia: 'native-share' };
      }
      console.warn('Native share failed, falling back to download + WhatsApp:', err);
    }
  }

  // 2. Desktop WhatsApp / WhatsApp Web fallback:
  // Browsers cannot programmatically inject files into external third-party web apps (wa.me) due to browser sandbox security.
  // So we automatically download the PDF directly onto the user's computer/phone AND open WhatsApp with the personalized message.
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  const cleanPhone = partyPhone.replace(/\D/g, '');
  const waText = `${shareText}\n\n📎 (Official PDF invoice has been downloaded as "${filename}". Please attach it in this chat.)`;
  const waUrl = `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(waText)}`;
  window.open(waUrl, '_blank');

  return { sharedVia: 'whatsapp-with-download' };
}
