import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

export function calculateGST(
  amount: number,
  taxRate: number,
  isInterState: boolean
) {
  const taxAmount = (amount * taxRate) / 100;
  if (isInterState) {
    return {
      cgst: 0,
      sgst: 0,
      igst: taxAmount,
      totalTax: taxAmount,
    };
  } else {
    const halfTax = taxAmount / 2;
    return {
      cgst: halfTax,
      sgst: halfTax,
      igst: 0,
      totalTax: taxAmount,
    };
  }
}
