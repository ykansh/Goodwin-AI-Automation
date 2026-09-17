import * as XLSX from 'xlsx';

export interface EntityFieldDef {
  key: string;
  label: string;
  required?: boolean;
  type?: 'string' | 'number';
}

export interface EntitySchema {
  entityKey: string;
  title: string;
  fields: EntityFieldDef[];
  sampleData: Record<string, any>[];
}

export const ENTITY_SCHEMAS: Record<string, EntitySchema> = {
  customers: {
    entityKey: 'customers',
    title: 'Customers & Dealers',
    fields: [
      { key: 'name', label: 'Name', required: true, type: 'string' },
      { key: 'contact', label: 'Contact', required: true, type: 'string' },
      { key: 'email', label: 'Email', required: false, type: 'string' },
      { key: 'gstin', label: 'GSTIN', required: false, type: 'string' },
      { key: 'type', label: 'Type (dealer/distributor/retailer/oem)', required: false, type: 'string' },
      { key: 'credit_limit', label: 'Credit Limit', required: false, type: 'number' },
      { key: 'address', label: 'Address', required: false, type: 'string' },
      { key: 'salesperson', label: 'Salesperson', required: false, type: 'string' },
    ],
    sampleData: [
      {
        'Name': 'Royal Battery House',
        'Contact': '9876543210',
        'Email': 'royal@battery.com',
        'GSTIN': '07AAAAA0000A1Z5',
        'Type (dealer/distributor/retailer/oem)': 'dealer',
        'Credit Limit': 500000,
        'Address': 'Shop 4, Auto Market, Delhi',
        'Salesperson': 'Rahul Sharma',
      },
      {
        'Name': 'Apex Power Solutions',
        'Contact': '9811223344',
        'Email': 'apex@powersolutions.in',
        'GSTIN': '06BBBBB2222B1Z3',
        'Type (dealer/distributor/retailer/oem)': 'distributor',
        'Credit Limit': 1000000,
        'Address': 'Industrial Area, Gurugram',
        'Salesperson': 'Ankit Verma',
      },
    ],
  },

  suppliers: {
    entityKey: 'suppliers',
    title: 'Suppliers & Vendors',
    fields: [
      { key: 'name', label: 'Name', required: true, type: 'string' },
      { key: 'contact', label: 'Contact', required: true, type: 'string' },
      { key: 'email', label: 'Email', required: false, type: 'string' },
      { key: 'gstin', label: 'GSTIN', required: false, type: 'string' },
      { key: 'type', label: 'Type (Manufacturer/Importer/Distributor)', required: false, type: 'string' },
      { key: 'address', label: 'Address', required: false, type: 'string' },
    ],
    sampleData: [
      {
        'Name': 'Apex Lead & Alloys Ltd',
        'Contact': '9812345678',
        'Email': 'sales@apexalloys.com',
        'GSTIN': '08BBBBB1111B1Z2',
        'Type (Manufacturer/Importer/Distributor)': 'Manufacturer',
        'Address': 'Sector 4, Bhiwadi, Rajasthan',
      },
      {
        'Name': 'National Acid & Separators Co.',
        'Contact': '9822334455',
        'Email': 'info@nationalacid.com',
        'GSTIN': '27CCCCC3333C1Z8',
        'Type (Manufacturer/Importer/Distributor)': 'Distributor',
        'Address': 'MIDC Taloja, Navi Mumbai',
      },
    ],
  },

  products: {
    entityKey: 'products',
    title: 'Products & Inventory',
    fields: [
      { key: 'name', label: 'Product Name', required: true, type: 'string' },
      { key: 'battery_model', label: 'Battery Model', required: true, type: 'string' },
      { key: 'voltage', label: 'Voltage', required: true, type: 'string' },
      { key: 'ah', label: 'Ah (Capacity)', required: true, type: 'string' },
      { key: 'sku', label: 'SKU Code', required: true, type: 'string' },
      { key: 'hsn', label: 'HSN Code', required: false, type: 'string' },
      { key: 'category', label: 'Category', required: false, type: 'string' },
      { key: 'technology', label: 'Technology', required: false, type: 'string' },
      { key: 'purchase_price', label: 'Purchase Price', required: false, type: 'number' },
      { key: 'selling_price', label: 'Selling Price', required: false, type: 'number' },
      { key: 'stock', label: 'Current Stock', required: false, type: 'number' },
      { key: 'stable_stock', label: 'Stable Stock', required: false, type: 'number' },
    ],
    sampleData: [
      {
        'Product Name': 'Goodwin Endura N150',
        'Battery Model': 'GW-N150',
        'Voltage': '12V',
        'Ah (Capacity)': '150Ah',
        'SKU Code': 'GW-N150-TUB',
        'HSN Code': '8507',
        'Category': 'Tubular',
        'Technology': 'Flooded (Lead-Acid)',
        'Purchase Price': 8500,
        'Selling Price': 11500,
        'Current Stock': 40,
        'Stable Stock': 25,
      },
      {
        'Product Name': 'Goodwin Rider 14Ah',
        'Battery Model': 'GW-14AH',
        'Voltage': '12V',
        'Ah (Capacity)': '14Ah',
        'SKU Code': 'GW-14AH-MTR',
        'HSN Code': '8507',
        'Category': 'Automotive',
        'Technology': 'VRLA / AGM',
        'Purchase Price': 1200,
        'Selling Price': 1750,
        'Current Stock': 100,
        'Stable Stock': 50,
      },
    ],
  },

  warranties: {
    entityKey: 'warranties',
    title: 'Battery Warranties',
    fields: [
      { key: 'serial_number', label: 'Serial Number', required: true, type: 'string' },
      { key: 'battery_model', label: 'Battery Model', required: true, type: 'string' },
      { key: 'product_name', label: 'Product Name', required: true, type: 'string' },
      { key: 'customer_name', label: 'Customer Name', required: true, type: 'string' },
      { key: 'purchase_date', label: 'Purchase Date (YYYY-MM-DD)', required: true, type: 'string' },
      { key: 'warranty_expiry', label: 'Warranty Expiry (YYYY-MM-DD)', required: false, type: 'string' },
      { key: 'status', label: 'Status (active/claimed/expired)', required: false, type: 'string' },
      { key: 'notes', label: 'Notes', required: false, type: 'string' },
    ],
    sampleData: [
      {
        'Serial Number': 'GW-SN-2026-9001',
        'Battery Model': 'GW-N150',
        'Product Name': 'Goodwin Endura N150',
        'Customer Name': 'Royal Battery House',
        'Purchase Date (YYYY-MM-DD)': '2026-03-10',
        'Warranty Expiry (YYYY-MM-DD)': '2029-03-10',
        'Status (active/claimed/expired)': 'active',
        'Notes': '36 months manufacturer warranty',
      },
    ],
  },
};

/**
 * Export data array to .xlsx file
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  fileName: string,
  sheetName = 'Sheet1'
) {
  if (!data || data.length === 0) {
    throw new Error('No data available to export');
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  const cleanName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, cleanName);
}

/**
 * Export data array to .csv file
 */
export function exportToCsv<T extends Record<string, any>>(
  data: T[],
  fileName: string
) {
  if (!data || data.length === 0) {
    throw new Error('No data available to export');
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);

  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName.endsWith('.csv') ? fileName : `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download a blank sample Excel template pre-formatted with expected columns and example rows
 */
export function downloadSampleTemplate(entityKey: string) {
  const schema = ENTITY_SCHEMAS[entityKey];
  if (!schema) {
    throw new Error(`Unknown entity schema: ${entityKey}`);
  }

  exportToExcel(schema.sampleData, `${schema.entityKey}_sample_template.xlsx`, 'Template');
}

/**
 * Read uploaded .xlsx or .csv file and return array of objects
 */
export async function parseExcelFile(file: File): Promise<Record<string, any>[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return [];
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
    raw: false, // Convert dates and numbers to strings for predictable normalization
  });

  return rawRows;
}

/**
 * Normalize and map uploaded row headers to entity model keys
 */
export function normalizeExcelRows(
  rows: Record<string, any>[],
  schema: EntitySchema
): {
  validRows: Record<string, any>[];
  invalidRows: { row: Record<string, any>; errors: string[] }[];
} {
  const validRows: Record<string, any>[] = [];
  const invalidRows: { row: Record<string, any>; errors: string[] }[] = [];

  rows.forEach((rawRow) => {
    const normalized: Record<string, any> = {};
    const errors: string[] = [];

    // Helper: find value matching key or label case-insensitively
    const findRawVal = (field: EntityFieldDef) => {
      const fieldKeyLower = field.key.toLowerCase().replace(/[^a-z0-9]/g, '');
      const fieldLabelLower = field.label.toLowerCase().replace(/[^a-z0-9]/g, '');

      for (const [key, val] of Object.entries(rawRow)) {
        const cleanedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (cleanedKey === fieldKeyLower || cleanedKey === fieldLabelLower || cleanedKey.startsWith(fieldKeyLower)) {
          return val;
        }
      }
      return undefined;
    };

    schema.fields.forEach((field) => {
      const rawVal = findRawVal(field);

      if (field.required) {
        if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
          errors.push(`Missing required field: "${field.label}"`);
        }
      }

      if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
        if (field.type === 'number') {
          const num = Number(String(rawVal).replace(/[^0-9.-]/g, ''));
          normalized[field.key] = isNaN(num) ? 0 : num;
        } else {
          normalized[field.key] = String(rawVal).trim();
        }
      } else {
        normalized[field.key] = field.type === 'number' ? 0 : '';
      }
    });

    if (errors.length > 0) {
      invalidRows.push({ row: rawRow, errors });
    } else {
      validRows.push(normalized);
    }
  });

  return { validRows, invalidRows };
}
