// Goodwin Batteries Official GST & Invoice Configuration
// Source: Government of India Form GST REG-06 Registration Certificate
// Trade Name: GOODWIN BATTERIES
// Legal Name: AMAN RAJARWAL (Proprietor)
// Registration Number (GSTIN): 23EAZPR0166R1ZN

export const GOODWIN_GST_DETAILS = {
  tradeName: "GOODWIN BATTERIES",
  legalName: "AMAN RAJARWAL",
  designation: "Proprietor",
  gstin: "23EAZPR0166R1ZN",
  pan: "EAZPR0166R",
  hsn: "8507", // Electric accumulators, including separators therefor, whether or not rectangular
  constitution: "Proprietorship",
  state: "Madhya Pradesh",
  stateCode: "23",
  addressLine1: "Shop No. 202, Second Floor, Samiksh Landmark",
  addressLine2: "Tejpur Gadbadi, AB Road",
  city: "Indore",
  district: "Indore",
  pincode: "452012",
  fullAddress: "Shop No. 202, Second Floor, Samiksh Landmark, Tejpur Gadbadi, AB Road, Indore, Madhya Pradesh - 452012",
  contactPhone: "+91 96677 24411",
  contactEmail: "customercare@goodwinbatteries.in",
  portalName: "Goodwin Direct OEM Store",
};

/**
 * Calculates GST components for HSN 8507 (28% standard rate for lead-acid batteries).
 * If destination state is Madhya Pradesh (MP / 23) -> CGST 14% + SGST 14%
 * Otherwise -> IGST 28%
 */
export function calculateGSTBreakdown(totalAmount: number, destinationState: string = "Madhya Pradesh") {
  const isIntraState = 
    destinationState.toLowerCase().includes("madhya") || 
    destinationState.toLowerCase().includes("mp") || 
    destinationState.toLowerCase().includes("indore") ||
    destinationState.trim() === "23";

  // Reverse calculate taxable value from gross (Total = Taxable * 1.28)
  const taxableValue = Math.round((totalAmount / 1.28) * 100) / 100;
  const totalTax = Math.round((totalAmount - taxableValue) * 100) / 100;

  if (isIntraState) {
    const cgst = Math.round((totalTax / 2) * 100) / 100;
    const sgst = Math.round((totalTax - cgst) * 100) / 100;
    return {
      taxableValue,
      totalTax,
      cgstRate: 14,
      cgst,
      sgstRate: 14,
      sgst,
      igstRate: 0,
      igst: 0,
      isIntraState: true,
    };
  } else {
    return {
      taxableValue,
      totalTax,
      cgstRate: 0,
      cgst: 0,
      sgstRate: 0,
      sgst: 0,
      igstRate: 28,
      igst: totalTax,
      isIntraState: false,
    };
  }
}

/**
 * Converts Indian currency numbers to words (e.g. 2199 -> "Rupees Two Thousand One Hundred Ninety Nine Only")
 */
export function numberToIndianWords(num: number): string {
  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
    "Seventeen", "Eighteen", "Nineteen",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function convertTwoDigits(n: number): string {
    if (n < 20) return a[n];
    return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
  }

  function convertThreeDigits(n: number): string {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let res = "";
    if (hundred > 0) res += a[hundred] + " Hundred";
    if (rest > 0) res += (res ? " " : "") + convertTwoDigits(rest);
    return res;
  }

  if (num === 0) return "Rupees Zero Only";

  const integerPart = Math.floor(Math.abs(num));
  const crore = Math.floor(integerPart / 10000000);
  const lakh = Math.floor((integerPart % 10000000) / 100000);
  const thousand = Math.floor((integerPart % 100000) / 1000);
  const remainder = integerPart % 1000;

  let words = "";
  if (crore > 0) words += convertTwoDigits(crore) + " Crore ";
  if (lakh > 0) words += convertTwoDigits(lakh) + " Lakh ";
  if (thousand > 0) words += convertTwoDigits(thousand) + " Thousand ";
  if (remainder > 0) words += convertThreeDigits(remainder) + " ";

  return `Rupees ${words.trim()} Only`;
}
