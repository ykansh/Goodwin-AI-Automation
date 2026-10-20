import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface GeneratePdfOptions {
  elementId?: string;
  filename?: string;
}

/**
 * Captures an HTML element and compiles it into an A4 PDF Blob & File.
 */
export async function generateInvoicePdfBlob(
  elementId: string = 'printable-invoice',
  filename: string = 'invoice'
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
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.98);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = 210; // A4 width in mm
  const pdfHeight = 297; // A4 height in mm
  const imgHeight = (canvas.height * pdfWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  // First page
  pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
  heightLeft -= pdfHeight;

  // Subsequent pages if invoice overflows single page
  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight, undefined, 'FAST');
    heightLeft -= pdfHeight;
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
  filename: string = 'invoice'
): Promise<void> {
  const { blob, file } = await generateInvoicePdfBlob(elementId, filename);
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
}: ShareInvoiceOptions): Promise<{ sharedVia: 'native-share' | 'whatsapp-with-download' }> {
  const filename = `${invoiceNumber}.pdf`;
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(totalAmount);

  // Generate the PDF
  const { file, blob } = await generateInvoicePdfBlob(elementId, filename);

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
