import { MockInvoice, MockItem, MockParty } from './mockData';

/**
 * Trigger direct file download in the browser
 */
export function downloadFile(filename: string, content: string, mimeType = 'text/csv;charset=utf-8;') {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape CSV cell value
 */
function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * ── EXPORT INVOICES TO CSV ──────────────────────────────────────────────────
 */
export function exportInvoicesToCSV(invoices: MockInvoice[], companyName = 'Goodwin Batteries') {
  const headers = [
    'Invoice Number',
    'Voucher Type',
    'Date',
    'Order Number',
    'Order Date',
    'Customer Name',
    'Phone',
    'Customer GSTIN',
    'Billing Name',
    'Billing Address',
    'Shipping Address',
    'Transport Address',
    'Transport Contact',
    'Transport GSTIN',
    'Place of Supply',
    'Place of Delivery',
    'Reference Name',
    'Pvt Marka',
    'Subtotal (Taxable)',
    'Tax Amount',
    'CGST',
    'SGST',
    'IGST',
    'Grand Total',
    'Paid Amount',
    'Balance Amount',
    'Payment Status',
    'Payment Mode',
    'Items Summary',
  ];

  const rows = invoices.map((inv) => {
    const itemsSummary = inv.items
      .map((i) => `${i.name} (x${i.quantity})`)
      .join('; ');

    return [
      escapeCsv(inv.invoiceNumber),
      escapeCsv(inv.invoiceType),
      escapeCsv(inv.invoiceDate),
      escapeCsv(inv.orderNumber || ''),
      escapeCsv(inv.orderDate || ''),
      escapeCsv(inv.partyName),
      escapeCsv(inv.partyPhone),
      escapeCsv(inv.partyGstin || ''),
      escapeCsv(inv.billingName || ''),
      escapeCsv(inv.billingAddress || ''),
      escapeCsv(inv.shippingAddress || ''),
      escapeCsv(inv.transportAddress || ''),
      escapeCsv(inv.transportContactNumber || ''),
      escapeCsv(inv.transportGstin || ''),
      escapeCsv(inv.placeOfSupply || inv.partyStateCode),
      escapeCsv(inv.placeOfDelivery || ''),
      escapeCsv(inv.referenceName || ''),
      escapeCsv(inv.pvtMarka || ''),
      escapeCsv(inv.subtotal),
      escapeCsv(inv.taxTotal),
      escapeCsv(inv.cgstTotal),
      escapeCsv(inv.sgstTotal),
      escapeCsv(inv.igstTotal),
      escapeCsv(inv.totalAmount),
      escapeCsv(inv.paidAmount),
      escapeCsv(inv.balanceAmount),
      escapeCsv(inv.paymentStatus),
      escapeCsv(inv.paymentMode || ''),
      escapeCsv(itemsSummary),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const safeName = String(companyName || 'Goodwin_Batteries').replace(/\s+/g, '_');
  const filename = `${safeName}_Invoices_${dateStr}.csv`;
  downloadFile(filename, csvContent);
  return csvContent;
}

/**
 * ── EXPORT ITEMS (INVENTORY) TO CSV ─────────────────────────────────────────
 */
export function exportItemsToCSV(items: MockItem[], companyName = 'Goodwin Batteries'): string {
  const headers = [
    'SKU',
    'Item Name',
    'Category',
    'HSN Code',
    'Unit',
    'Purchase Price',
    'Selling Price',
    'MRP',
    'Current Stock',
    'Min Stock Alert',
    'Tax Rate (%)',
    'Warehouse Rack',
    'Warranty',
    'Description',
  ];

  const rows = items.map((item) => [
    escapeCsv(item.sku),
    escapeCsv(item.name),
    escapeCsv(item.category),
    escapeCsv(item.hsnCode),
    escapeCsv(item.unit || 'PCS'),
    escapeCsv(item.purchasePrice),
    escapeCsv(item.salesPrice),
    escapeCsv(item.mrp),
    escapeCsv(item.stock),
    escapeCsv(item.minStockAlert),
    escapeCsv(item.taxRate),
    escapeCsv(item.godown || 'Main Warehouse'),
    escapeCsv(item.warranty || '18 Months'),
    escapeCsv(item.description || ''),
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const safeName = String(companyName || 'Goodwin_Batteries').replace(/\s+/g, '_');
  const filename = `${safeName}_Inventory_${dateStr}.csv`;
  downloadFile(filename, csvContent);
  return csvContent;
}

/**
 * ── EXPORT PARTIES (CUSTOMERS & DEALERS) TO CSV ──────────────────────────────
 */
export function exportPartiesToCSV(parties: MockParty[], companyName = 'Goodwin Batteries'): string {
  const headers = [
    'Party Name',
    'Party Type',
    'Phone',
    'Email',
    'GSTIN',
    'State',
    'State Code',
    'Address',
    'Credit Limit',
    'Outstanding Balance',
  ];

  const rows = parties.map((party) => [
    escapeCsv(party.name),
    escapeCsv(party.type),
    escapeCsv(party.phone),
    escapeCsv(party.email || ''),
    escapeCsv(party.gstin || ''),
    escapeCsv(party.state),
    escapeCsv(party.stateCode),
    escapeCsv(party.address || ''),
    escapeCsv(party.creditLimit),
    escapeCsv(party.currentBalance),
  ].join(','));

  const csvContent = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  const safeName = String(companyName || 'Goodwin_Batteries').replace(/\s+/g, '_');
  const filename = `${safeName}_Parties_${dateStr}.csv`;
  downloadFile(filename, csvContent);
  return csvContent;
}

/**
 * ── DOWNLOAD SAMPLE TEMPLATES ──────────────────────────────────────────────
 */
export function downloadSampleItemsTemplate(): string {
  const sample = [
    'SKU,Item Name,Category,HSN Code,Unit,Purchase Price,Selling Price,MRP,Current Stock,Min Stock Alert,Tax Rate (%),Warehouse Rack,Warranty,Description',
    'GW-BT-150,Goodwin Tubular Gold 150Ah,Tubular Inverter,8507,PCS,7500,11500,13500,25,5,28,Main Warehouse,36 Months,Tall Tubular Inverter Battery 150Ah',
    'GW-CAR-45,Goodwin Automotive Red 45Ah,Automotive,8507,PCS,3200,4800,5600,40,8,28,Counter Rack 2,18 Months,Maintenance Free Car Battery 45Ah',
    'GW-SOL-100,Goodwin Solar C10 100Ah,Solar,8507,PCS,6800,9900,11900,15,4,28,Warehouse B,60 Months,Solar Deep Cycle Tubular 100Ah',
  ].join('\r\n');

  downloadFile('goodwin_sample_items_template.csv', sample);
  return sample;
}

export function downloadSamplePartiesTemplate(): string {
  const sample = [
    'Party Name,Party Type,Phone,Email,GSTIN,State,State Code,Address,Credit Limit,Outstanding Balance',
    'Sharma Battery House,CUSTOMER,+91 98260 12345,sharma@example.com,23AABCS1234F1Z1,Madhya Pradesh,23,Shop 12 M.G. Road Indore,250000,15000',
    'National Auto Spares,CUSTOMER,+91 98930 54321,national@example.com,23AABCN5678F1Z4,Madhya Pradesh,23,Transport Nagar Indore,500000,45000',
    'Om Sai Electricals,CUSTOMER,+91 94250 99887,omsai@example.com,23AABCO9012F1Z9,Madhya Pradesh,23,Khandwa Road Indore,100000,0',
  ].join('\r\n');

  downloadFile('goodwin_sample_customers_template.csv', sample);
  return sample;
}

/**
 * ── PARSE CSV CONTENT SAFELY ───────────────────────────────────────────────
 */
export function parseCSVText(text: string): string[][] {
  const lines: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuote = false;

  const cleanText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < cleanText.length; i++) {
    const char = cleanText[i];
    const nextChar = cleanText[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if (char === '\n' && !insideQuote) {
      currentRow.push(currentField.trim());
      if (currentRow.some((field) => field.length > 0)) {
        lines.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((field) => field.length > 0)) {
      lines.push(currentRow);
    }
  }

  return lines;
}

/**
 * ── PARSE & VALIDATE IMPORTED ITEMS ────────────────────────────────────────
 */
export function parseImportedItems(csvText: string): {
  items: Omit<MockItem, 'id'>[];
  errors: string[];
} {
  const rows = parseCSVText(csvText);
  if (rows.length < 2) {
    return { items: [], errors: ['CSV file is empty or missing data rows.'] };
  }

  const rawHeaders = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const dataRows = rows.slice(1);
  const items: Omit<MockItem, 'id'>[] = [];
  const errors: string[] = [];

  // Find column indices with flexible matching
  const findCol = (candidates: string[]) =>
    rawHeaders.findIndex((h) => candidates.some((c) => h.includes(c)));

  const nameIdx = findCol(['name', 'itemname', 'model', 'title']);
  const skuIdx = findCol(['sku', 'code', 'barcode']);
  const catIdx = findCol(['category', 'type']);
  const hsnIdx = findCol(['hsn', 'hsncode']);
  const unitIdx = findCol(['unit']);
  const buyPriceIdx = findCol(['purchase', 'cost', 'buy']);
  const sellPriceIdx = findCol(['selling', 'sales', 'price', 'rate']);
  const mrpIdx = findCol(['mrp']);
  const stockIdx = findCol(['stock', 'quantity', 'qty']);
  const minStockIdx = findCol(['min', 'alert', 'safety']);
  const taxIdx = findCol(['tax', 'gst']);
  const godownIdx = findCol(['godown', 'warehouse', 'rack', 'location']);
  const warrantyIdx = findCol(['warranty']);
  const descIdx = findCol(['desc', 'description']);

  if (nameIdx === -1 && sellPriceIdx === -1) {
    return {
      items: [],
      errors: ['Required columns "Item Name" or "Selling Price" could not be found.'],
    };
  }

  dataRows.forEach((row, index) => {
    const lineNum = index + 2;
    const name = nameIdx !== -1 ? row[nameIdx] : '';
    if (!name || name.trim().length === 0) {
      errors.push(`Row ${lineNum}: Skipped due to missing Item Name.`);
      return;
    }

    const sellingPrice = sellPriceIdx !== -1 ? parseFloat(row[sellPriceIdx]) || 0 : 0;
    const purchasePrice = buyPriceIdx !== -1 ? parseFloat(row[buyPriceIdx]) || 0 : 0;
    const mrp = mrpIdx !== -1 ? parseFloat(row[mrpIdx]) || Math.round(sellingPrice * 1.15) : Math.round(sellingPrice * 1.15);
    const stock = stockIdx !== -1 ? parseFloat(row[stockIdx]) || 0 : 0;
    const minStock = minStockIdx !== -1 ? parseInt(row[minStockIdx]) || 5 : 5;
    const taxRate = taxIdx !== -1 ? parseFloat(row[taxIdx]) || 28 : 28;
    const sku = skuIdx !== -1 && row[skuIdx] ? row[skuIdx] : `GW-${Date.now().toString().slice(-4)}-${index}`;

    items.push({
      name: name.trim(),
      sku: sku.trim(),
      barcode: sku.trim(),
      category: (catIdx !== -1 && row[catIdx]) ? row[catIdx].trim() : 'Automotive',
      hsnCode: (hsnIdx !== -1 && row[hsnIdx]) ? row[hsnIdx].trim() : '8507',
      unit: (unitIdx !== -1 && row[unitIdx]) ? row[unitIdx].trim() : 'PCS',
      purchasePrice,
      salesPrice: sellingPrice,
      mrp,
      stock,
      minStockAlert: minStock,
      taxRate,
      godown: (godownIdx !== -1 && row[godownIdx]) ? row[godownIdx].trim() : 'Main Warehouse',
      warranty: (warrantyIdx !== -1 && row[warrantyIdx]) ? row[warrantyIdx].trim() : '18 Months',
      description: (descIdx !== -1 && row[descIdx]) ? row[descIdx].trim() : '',
      showInStore: true,
      isFeatured: stock > 0,
    });
  });

  return { items, errors };
}

/**
 * ── PARSE & VALIDATE IMPORTED PARTIES ──────────────────────────────────────
 */
export function parseImportedParties(csvText: string): {
  parties: Omit<MockParty, 'id'>[];
  errors: string[];
} {
  const rows = parseCSVText(csvText);
  if (rows.length < 2) {
    return { parties: [], errors: ['CSV file is empty or missing data rows.'] };
  }

  const rawHeaders = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const dataRows = rows.slice(1);
  const parties: Omit<MockParty, 'id'>[] = [];
  const errors: string[] = [];

  const findCol = (candidates: string[]) =>
    rawHeaders.findIndex((h) => candidates.some((c) => h.includes(c)));

  const nameIdx = findCol(['name', 'party', 'customer', 'client']);
  const typeIdx = findCol(['type']);
  const phoneIdx = findCol(['phone', 'contact', 'mobile']);
  const emailIdx = findCol(['email', 'mail']);
  const gstinIdx = findCol(['gstin', 'gst']);
  const stateIdx = findCol(['state']);
  const stateCodeIdx = findCol(['code', 'statecode']);
  const addrIdx = findCol(['address', 'city']);
  const creditIdx = findCol(['credit', 'limit']);
  const balanceIdx = findCol(['balance', 'outstanding', 'dues']);

  if (nameIdx === -1) {
    return {
      parties: [],
      errors: ['Required column "Party Name" could not be found.'],
    };
  }

  dataRows.forEach((row, index) => {
    const lineNum = index + 2;
    const name = row[nameIdx];
    if (!name || name.trim().length === 0) {
      errors.push(`Row ${lineNum}: Skipped due to missing Party Name.`);
      return;
    }

    const gstin = (gstinIdx !== -1 && row[gstinIdx]) ? row[gstinIdx].trim().toUpperCase() : '';
    let stateCode = '23';
    if (stateCodeIdx !== -1 && row[stateCodeIdx]) {
      stateCode = row[stateCodeIdx].trim();
    } else if (gstin.length >= 2 && !isNaN(Number(gstin.slice(0, 2)))) {
      stateCode = gstin.slice(0, 2);
    }

    parties.push({
      name: name.trim(),
      type: (typeIdx !== -1 && row[typeIdx]?.toUpperCase().includes('SUPPLIER')) ? 'SUPPLIER' : 'CUSTOMER',
      phone: (phoneIdx !== -1 && row[phoneIdx]) ? row[phoneIdx].trim() : '+91 96855 79269',
      email: (emailIdx !== -1 && row[emailIdx]) ? row[emailIdx].trim() : '',
      gstin,
      state: (stateIdx !== -1 && row[stateIdx]) ? row[stateIdx].trim() : 'Madhya Pradesh',
      stateCode,
      address: (addrIdx !== -1 && row[addrIdx]) ? row[addrIdx].trim() : 'Indore, MP',
      creditLimit: creditIdx !== -1 ? parseFloat(row[creditIdx]) || 200000 : 200000,
      currentBalance: balanceIdx !== -1 ? parseFloat(row[balanceIdx]) || 0 : 0,
    });
  });

  return { parties, errors };
}
