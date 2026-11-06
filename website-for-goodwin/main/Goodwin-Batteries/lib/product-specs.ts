import goodwinProductsData from "@/data/goodwinProducts.json";
import goodwinCategoriesData from "@/data/goodwinCategories.json";
import { Product, Category } from "@/types";
import { getProductPricing } from "./pricing";

export interface VerifiedWarrantyInfo {
  totalMonths: number;
  freeReplacementMonths: number;
  proRataMonths: number;
  displayLabel: string;
  shortLabel: string;
  breakdownLabel: string;
  options: string[];
}

export interface CatalogWarrantyStats {
  totalProducts: number;
  minWarrantyMonths: number;
  maxWarrantyMonths: number;
  maxWarrantyLabel: string;
  maxWarrantyShort: string;
  twoWheelerWarrantyRange: string;
  inverterWarrantyRange: string;
  vrlaWarrantyRange: string;
  lithiumWarrantyRange: string;
  agricultureWarrantyRange: string;
}

export const VERIFIED_CATEGORIES: Category[] = goodwinCategoriesData as Category[];
export const VERIFIED_PRODUCTS: Product[] = goodwinProductsData as unknown as Product[];

// Lookup map by product ID and slug for O(1) verified spec & warranty retrieval
const VERIFIED_PRODUCT_MAP = new Map<string, Product>();
VERIFIED_PRODUCTS.forEach((p) => {
  VERIFIED_PRODUCT_MAP.set(p.id, p);
  VERIFIED_PRODUCT_MAP.set(p.slug, p);
});

const UPCOMING_ONLY_SLUGS = new Set([
  "cat-automotive",
  "automotive",
  "passenger-vehicles",
  "car",
  "cars",
  "four-wheeler",
  "cat-commercial",
  "commercial",
  "commercial-vehicles",
  "trucks",
  "heavy-duty",
  "fleet",
  "tractors",
  "tractor",
  "agricultural-tractors",
  "cat-e-rickshaw",
  "e-rickshaw",
  "ev-rickshaw",
  "three-wheelers",
]);

/**
 * Checks whether a slug or category ID belongs to an upcoming-only category
 * (Car, Commercial, Tractor, E-Rickshaw) that is kept exclusively on /upcoming-products.
 */
export function isUpcomingOnlyCategory(slugOrId?: string | null): boolean {
  if (!slugOrId) return false;
  return UPCOMING_ONLY_SLUGS.has(slugOrId.trim().toLowerCase());
}

/**
 * Resolves a category by ID, canonical slug, or legacy alias
 * (e.g. "two-wheelers" -> "cat-two-wheeler", "inverter-batteries" -> "cat-inverter").
 */
export function resolveCategory(
  slugOrId?: string | null,
  categories: Category[] = VERIFIED_CATEGORIES
): Category | null {
  if (!slugOrId || slugOrId === "All" || slugOrId === "all") return null;
  const normalized = slugOrId.trim().toLowerCase();

  return (
    categories.find(
      (c) =>
        c.id.toLowerCase() === normalized ||
        c.slug.toLowerCase() === normalized ||
        (c.aliases && c.aliases.some((alias) => alias.toLowerCase() === normalized))
    ) || null
  );
}

/**
 * Checks whether a product belongs to the specified category (supports primary + multi-category mapping).
 */
export function productMatchesCategory(
  product: Partial<Product>,
  categoryIdOrSlug?: string | null,
  categories: Category[] = VERIFIED_CATEGORIES
): boolean {
  if (!categoryIdOrSlug || categoryIdOrSlug === "All" || categoryIdOrSlug === "all") {
    return true;
  }

  const targetCat = resolveCategory(categoryIdOrSlug, categories);
  const targetId = targetCat ? targetCat.id : categoryIdOrSlug;

  // Check canonical verified product first in case runtime object omitted `categories`
  const verified =
    (product.id && VERIFIED_PRODUCT_MAP.get(product.id)) ||
    (product.slug && VERIFIED_PRODUCT_MAP.get(product.slug));

  const categoryList = new Set<string>();
  if (product.category) categoryList.add(product.category);
  if (Array.isArray(product.categories)) {
    product.categories.forEach((c) => categoryList.add(c));
  }
  if (verified) {
    if (verified.category) categoryList.add(verified.category);
    if (Array.isArray(verified.categories)) {
      verified.categories.forEach((c) => categoryList.add(c));
    }
  }

  return categoryList.has(targetId);
}

/**
 * Returns all published products matching a category ID, slug, or alias.
 */
export function getCategoryProducts(
  categoryIdOrSlug: string,
  products: Product[] = VERIFIED_PRODUCTS,
  categories: Category[] = VERIFIED_CATEGORIES
): Product[] {
  return products.filter(
    (p) => p.is_published !== false && productMatchesCategory(p, categoryIdOrSlug, categories)
  );
}

/**
 * Single verified source of truth for any product's warranty coverage.
 * Always prioritizes the verified specification database.
 */
export function getProductWarrantyInfo(product: Partial<Product>): VerifiedWarrantyInfo {
  const verified =
    (product.id && VERIFIED_PRODUCT_MAP.get(product.id)) ||
    (product.slug && VERIFIED_PRODUCT_MAP.get(product.slug));

  const rawWarranty = verified?.warranty || product.warranty || "12 Months";
  const totalMonths =
    verified?.warranty_months ||
    product.warranty_months ||
    parseInt(rawWarranty.replace(/\D/g, ""), 10) ||
    12;

  let freeReplacementMonths =
    verified?.free_replacement_months ?? product.free_replacement_months ?? totalMonths;
  let proRataMonths = verified?.pro_rata_months ?? product.pro_rata_months ?? 0;

  if (totalMonths === 72 && freeReplacementMonths === 72 && proRataMonths === 0) {
    freeReplacementMonths = 36;
    proRataMonths = 36;
  } else if (totalMonths === 48 && freeReplacementMonths === 48 && proRataMonths === 0) {
    freeReplacementMonths = 24;
    proRataMonths = 24;
  }

  const displayLabel = `${totalMonths} Months`;
  const shortLabel = `${totalMonths}M`;
  const breakdownLabel =
    verified?.warranty_breakdown ||
    product.warranty_breakdown ||
    (proRataMonths > 0
      ? `${totalMonths} Months (${freeReplacementMonths}M Free Replacement + ${proRataMonths}M Pro-Rata)`
      : `${totalMonths} Months Free Replacement`);

  const options =
    verified?.warranty_options && verified.warranty_options.length > 0
      ? verified.warranty_options
      : product.warranty_options && product.warranty_options.length > 0
      ? product.warranty_options
      : [displayLabel];

  return {
    totalMonths,
    freeReplacementMonths,
    proRataMonths,
    displayLabel,
    shortLabel,
    breakdownLabel,
    options,
  };
}

/**
 * Computes global and per-category warranty statistics directly from the verified product database.
 * Eliminates hardcoded "60M" / "60 Months" discrepancies across the website.
 */
export function getCatalogWarrantyStats(
  products: Product[] = VERIFIED_PRODUCTS
): CatalogWarrantyStats {
  const published = products.filter((p) => p.is_published !== false);
  const allMonths = published.map((p) => getProductWarrantyInfo(p).totalMonths);

  const minWarrantyMonths = allMonths.length > 0 ? Math.min(...allMonths) : 6;
  const maxWarrantyMonths = allMonths.length > 0 ? Math.max(...allMonths) : 72;

  const getRangeForCategory = (catId: string): string => {
    const catProducts = getCategoryProducts(catId, published);
    if (catProducts.length === 0) return "Upcoming";
    const months = catProducts.map((p) => getProductWarrantyInfo(p).totalMonths);
    const min = Math.min(...months);
    const max = Math.max(...months);
    return min === max ? `${max} Months` : `${min} to ${max} Months`;
  };

  return {
    totalProducts: published.length,
    minWarrantyMonths,
    maxWarrantyMonths,
    maxWarrantyLabel: `${maxWarrantyMonths} Months`,
    maxWarrantyShort: `${maxWarrantyMonths}M`,
    twoWheelerWarrantyRange: getRangeForCategory("cat-two-wheeler"),
    inverterWarrantyRange: getRangeForCategory("cat-inverter"),
    vrlaWarrantyRange: getRangeForCategory("cat-vrla"),
    lithiumWarrantyRange: getRangeForCategory("cat-lithium"),
    agricultureWarrantyRange: getRangeForCategory("cat-agriculture"),
  };
}

/**
 * Returns a complete verified specification & warranty summary for a category.
 */
export function getCategorySpecSummary(
  categoryIdOrSlug: string,
  products: Product[] = VERIFIED_PRODUCTS,
  categories: Category[] = VERIFIED_CATEGORIES
) {
  const category = resolveCategory(categoryIdOrSlug, categories);
  const matchedProducts = getCategoryProducts(categoryIdOrSlug, products, categories);
  const months = matchedProducts.map((p) => getProductWarrantyInfo(p).totalMonths);

  const minWarranty = months.length > 0 ? Math.min(...months) : null;
  const maxWarranty = months.length > 0 ? Math.max(...months) : null;

  const warrantyRangeLabel =
    minWarranty && maxWarranty
      ? minWarranty === maxWarranty
        ? `${maxWarranty} Months`
        : `${minWarranty} to ${maxWarranty} Months`
      : category?.warrantyRange || "Upcoming";

  return {
    category,
    productCount: matchedProducts.length,
    isActive: (category?.status || "active") === "active" && matchedProducts.length > 0,
    status: category?.status || (matchedProducts.length > 0 ? "active" : "upcoming"),
    warrantyRangeLabel,
    maxWarrantyMonths: maxWarranty,
    capacityRangeLabel: category?.capacityRange || "Standard",
    products: matchedProducts,
  };
}

/**
 * Generates the official verified product & warranty feed for third-party listings,
 * advertisements, Google Merchant Center, and dealer portals.
 */
export function getVerifiedProductFeed(products: Product[] = VERIFIED_PRODUCTS) {
  const stats = getCatalogWarrantyStats(products);
  const items = products
    .filter((p) => p.is_published !== false)
    .map((p) => {
      const warranty = getProductWarrantyInfo(p);
      const pricing = getProductPricing(p);
      const primaryCategory = resolveCategory(p.category);
      const allCategories = (p.categories || [p.category])
        .map((cId) => resolveCategory(cId)?.name || cId)
        .filter(Boolean);

      return {
        id: p.id,
        sku: p.slug.toUpperCase(),
        name: p.name,
        slug: p.slug,
        url: `https://goodwinbatteries.in/products/${p.slug}`,
        series: p.series,
        primaryCategory: primaryCategory?.name || p.category,
        categories: allCategories,
        applications: p.application,
        specs: {
          voltage: p.voltage,
          capacityAh: p.ah,
          cca: p.cca,
          technology: p.technology,
          dimensions: p.dimensions,
          weight: p.weight,
          terminalLayout: p.terminalLayout,
        },
        warranty: {
          totalMonths: warranty.totalMonths,
          freeReplacementMonths: warranty.freeReplacementMonths,
          proRataMonths: warranty.proRataMonths,
          label: warranty.displayLabel,
          breakdown: warranty.breakdownLabel,
        },
        pricing: {
          currency: "INR",
          mrp: pricing.mrp,
          sellingPrice: pricing.price,
          discountPercent: pricing.discountPercent,
          inStock: pricing.inStock,
        },
        image: `https://goodwinbatteries.in${p.image}`,
      };
    });

  return {
    source: "Goodwin Batteries Official Verified Specification & Warranty Database",
    lastVerified: "2026-11-06",
    catalogSummary: stats,
    products: items,
  };
}

