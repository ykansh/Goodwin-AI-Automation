import { Product } from "@/types";

export interface PricingInfo {
  mrp: number;
  price: number;
  discountPercent: number;
  inStock: boolean;
}

// Master product pricing lookup (INR)
const PRODUCT_PRICING_MAP: Record<string, { mrp: number; price: number }> = {
  // Two-Wheeler Batteries
  "prod-tz4lb": { mrp: 1450, price: 1149 },
  "prod-tz4lb-12m": { mrp: 1250, price: 999 },
  "prod-tz4lb-18m": { mrp: 1350, price: 1049 },
  "prod-xl5lb": { mrp: 1750, price: 1399 },
  "prod-xl5lb-12m": { mrp: 1550, price: 1249 },
  "prod-xl5lb-18m": { mrp: 1650, price: 1299 },
  "prod-xl25lc": { mrp: 1099, price: 849 },
  "prod-xl25lc-12m": { mrp: 999, price: 799 },
  "prod-xl25lc-18m": { mrp: 1050, price: 829 },
  "prod-tz5lb": { mrp: 1699, price: 1349 },
  "prod-tz5lb-12m": { mrp: 1499, price: 1199 },
  "prod-tz5lb-18m": { mrp: 1599, price: 1249 },

  // VRLA / SMF / UPS / Agro Batteries
  "prod-4smf5": { mrp: 899, price: 699 },
  "prod-4v7ah": { mrp: 850, price: 649 },
  "prod-6v5ah": { mrp: 899, price: 699 },
  "prod-gold-series-6v-4-2ah": { mrp: 799, price: 599 },
  "prod-gold-series-6v-4-5ah": { mrp: 849, price: 649 },
  "prod-12smf8": { mrp: 1550, price: 1199 },
  "prod-gold-series-12v-7-2ah": { mrp: 1450, price: 1120 },
  "prod-gold-series-12v-9ah": { mrp: 1750, price: 1350 },
  "prod-gold-series-12v-12ah": { mrp: 2350, price: 1850 },
  "prod-gold-series-12v-15ah": { mrp: 2800, price: 2200 },
  "prod-gold-series-12v-17ah": { mrp: 3200, price: 2550 },
  "prod-vrla-agro14": { mrp: 2600, price: 2050 },
  "prod-gold-14ah": { mrp: 2650, price: 2100 },

  // Lithium Solutions
  "prod-li-agro14": { mrp: 3800, price: 2999 },
  "prod-li-ups8": { mrp: 2900, price: 2299 },

  // Inverter Tall Tubular
  "prod-inverter-tubular": { mrp: 16500, price: 12999 },
  "prod-inverter-tubular-200ah": { mrp: 19800, price: 15499 },
  "prod-inverter-tubular-250ah": { mrp: 24000, price: 18999 },
};

export function getProductPricing(product: Partial<Product>): PricingInfo {
  if (product.mrp && product.price) {
    const discountPercent = Math.round(((product.mrp - product.price) / product.mrp) * 100);
    return {
      mrp: product.mrp,
      price: product.price,
      discountPercent,
      inStock: product.in_stock !== false,
    };
  }

  // Lookup in map
  if (product.id && PRODUCT_PRICING_MAP[product.id]) {
    const mapped = PRODUCT_PRICING_MAP[product.id];
    const discountPercent = Math.round(((mapped.mrp - mapped.price) / mapped.mrp) * 100);
    return {
      mrp: mapped.mrp,
      price: mapped.price,
      discountPercent,
      inStock: true,
    };
  }

  // Fallback based on Ah rating
  let mrp = 1499;
  let price = 1149;

  const ahVal = parseFloat((product.ah || "").replace(/[^\d.]/g, "")) || 5;
  if (ahVal >= 100) {
    mrp = Math.round(ahVal * 95);
    price = Math.round(ahVal * 75);
  } else if (ahVal >= 12) {
    mrp = Math.round(ahVal * 190);
    price = Math.round(ahVal * 150);
  } else if (ahVal <= 3) {
    mrp = 1099;
    price = 849;
  }

  const discountPercent = Math.round(((mrp - price) / mrp) * 100);
  return {
    mrp,
    price,
    discountPercent,
    inStock: true,
  };
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}
