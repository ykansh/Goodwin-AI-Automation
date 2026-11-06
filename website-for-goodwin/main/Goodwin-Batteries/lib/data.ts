import { supabase } from "./supabase";
import { Product, Category, VehicleType, VehicleBrand, VehicleModel, VehicleVariant, Dealer } from "@/types";
import { unstable_cache } from "next/cache";
import goodwinProducts from "@/data/goodwinProducts.json";
import goodwinCategories from "@/data/goodwinCategories.json";
import { getProductPricing } from "./pricing";
import { getProductWarrantyInfo } from "./product-specs";

// ==========================================
// GLOBAL SETTINGS
// ==========================================
export const getGlobalSettings = unstable_cache(
  async () => {
    const { data, error } = await supabase.from("global_settings").select("*").single();
    if (error) {
      console.error("Error fetching global settings:", error);
      return null;
    }
    return data;
  },
  ['global-settings'],
  { revalidate: 3600, tags: ['global-settings'] }
);

// ==========================================
// PRODUCTS & CATEGORIES (Local Static JSON Strategy)
// ==========================================
export const getCategories = async (): Promise<Category[]> => {
  return goodwinCategories as Category[];
};

export const getProducts = async (): Promise<Product[]> => {
  // Start with catalog from local static JSON
  const catalogMap = new Map<string, any>();
  (goodwinProducts as any[]).forEach(item => catalogMap.set(item.id, item));

  // Merge live dynamic products from Supabase database if available
  try {
    const { data: dbProducts } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbProducts && dbProducts.length > 0) {
      dbProducts.forEach(dbItem => {
        const existing = catalogMap.get(dbItem.id);
        if (existing) {
          // Overlay admin edits
          catalogMap.set(dbItem.id, {
            ...existing,
            name: dbItem.name || existing.name,
            warranty: dbItem.warranty || existing.warranty,
            is_published: dbItem.is_published !== undefined ? dbItem.is_published : existing.is_published,
            is_featured: dbItem.is_featured !== undefined ? dbItem.is_featured : existing.is_featured,
            description: dbItem.description || existing.description,
          });
        } else if (dbItem.is_published !== false) {
          // Admin added a new product
          catalogMap.set(dbItem.id, {
            id: dbItem.id,
            name: dbItem.name,
            slug: dbItem.slug || dbItem.id,
            series: dbItem.series || "Goodwin SMF",
            category: dbItem.category_id || "cat-vrla",
            voltage: dbItem.voltage || "12V",
            ah: dbItem.ah || "35Ah",
            cca: dbItem.cca || "N/A",
            warranty: dbItem.warranty || "36 Months",
            warranty_options: dbItem.warranty_options || [dbItem.warranty || "36 Months"],
            is_featured: !!dbItem.is_featured,
            is_published: dbItem.is_published !== false,
            application: Array.isArray(dbItem.application) ? dbItem.application.flat() : ["Automotive"],
            image: dbItem.image || "/assets/products/placeholder-battery.png",
            gallery: [],
            videos: [],
            description: dbItem.description || "High-performance Goodwin battery.",
            features: Array.isArray(dbItem.features) ? dbItem.features : ["Zero Maintenance", "High Cranking Power"],
            technology: "SMF / Maintenance Free",
            terminalLayout: dbItem.terminal_layout || "Standard",
            dimensions: dbItem.dimensions || "238 x 129 x 227 mm",
            weight: dbItem.weight || "12 kg",
          });
        }
      });
    }
  } catch (err) {
    console.warn("Notice: Live Supabase products sync fallback to static JSON:", err);
  }

  // Return typed products from the unified catalog with e-commerce pricing & verified warranty
  return Array.from(catalogMap.values()).map(row => {
    const pricing = getProductPricing({
      id: row.id,
      ah: row.ah,
      voltage: row.voltage,
      category: row.category,
      mrp: row.mrp,
      price: row.price,
    });
    const warrantyInfo = getProductWarrantyInfo(row);

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      series: row.series,
      category: row.category,
      categories: Array.isArray(row.categories) && row.categories.length > 0 ? row.categories : [row.category],
      voltage: row.voltage,
      ah: row.ah,
      cca: row.cca,
      warranty: warrantyInfo.displayLabel,
      warranty_options: warrantyInfo.options,
      warranty_months: warrantyInfo.totalMonths,
      free_replacement_months: warrantyInfo.freeReplacementMonths,
      pro_rata_months: warrantyInfo.proRataMonths,
      warranty_breakdown: warrantyInfo.breakdownLabel,
      is_featured: row.is_featured,
      is_published: row.is_published,
      application: row.application || [],
      image: row.image,
      gallery: row.gallery || [],
      videos: row.videos || [],
      description: row.description,
      features: row.features || [],
      technology: row.technology,
      terminalLayout: row.terminalLayout,
      dimensions: row.dimensions,
      weight: row.weight,
      mrp: pricing.mrp,
      price: pricing.price,
      in_stock: pricing.inStock,
    };
  }) as Product[];
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  const products = await getProducts();
  const product = products.find(p => p.slug === slug);
  return product || null;
};

export const getApplications = unstable_cache(
  async () => {
    const { data, error } = await supabase.from("applications").select("*").eq("is_published", true).order("display_order", { ascending: true });
    if (error) {
      console.error("Error fetching applications:", error);
      return [];
    }
    
    // Map locally generated premium category images
    const localImageMap: Record<string, string> = {
      "Passenger Vehicles": "/assets/categories/passenger-vehicles.jpg",
      "Two Wheelers": "/assets/categories/two-wheelers.jpg",
      "Commercial Heavy Duty": "/assets/categories/commercial-heavy-duty.jpg",
      "Agricultural & Tractors": "/assets/categories/agricultural-tractors.jpg"
    };

    return (data || []).map((app: any) => ({
      ...app,
      image: localImageMap[app.name] || app.image
    }));
  },
  ['applications'],
  { revalidate: 3600, tags: ['applications'] }
);

// ==========================================
// BATTERY FINDER
// ==========================================
export async function getVehicleTypes(): Promise<VehicleType[]> {
  const { data, error } = await supabase.from("vehicle_types").select("*").order("display_order", { ascending: true });
  if (error) {
    console.error("Error fetching vehicle types:", error);
    return [];
  }
  return data || [];
}

export async function getVehicleBrands(): Promise<VehicleBrand[]> {
  const { data, error } = await supabase.from("manufacturers").select("*").order("display_order", { ascending: true });
  if (error) {
    console.error("Error fetching vehicle brands:", error);
    return [];
  }
  return data || [];
}

export async function getVehicleModels(): Promise<VehicleModel[]> {
  const { data, error } = await supabase.from("vehicle_models").select("*").order("display_order", { ascending: true });
  if (error) {
    console.error("Error fetching vehicle models:", error);
    return [];
  }
  return data || [];
}

export async function getVehicleVariants(): Promise<VehicleVariant[]> {
  const { data, error } = await supabase.from("vehicle_variants").select("*").order("display_order", { ascending: true });
  if (error) {
    console.error("Error fetching vehicle variants:", error);
    return [];
  }
  return data || [];
}

// ==========================================
// DEALERS
// ==========================================
export const getDealers = unstable_cache(
  async (): Promise<Dealer[]> => {
    const { data, error } = await supabase.from("dealers").select("*").eq("is_published", true);
    if (error) {
      console.error("Error fetching dealers:", error);
      return [];
    }
    return (data || []).map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      phone: row.phone,
      openingHours: row.opening_hours,
      latitude: row.latitude,
      longitude: row.longitude,
    }));
  },
  ['dealers'],
  { revalidate: 3600, tags: ['dealers'] }
);

// ==========================================
// FAQS
// ==========================================
export const getFAQs = unstable_cache(
  async () => {
    const { data, error } = await supabase.from("faqs").select("*").eq("is_published", true).order("display_order", { ascending: true });
    if (error) {
      console.error("Error fetching FAQs:", error);
      return [];
    }
    return data || [];
  },
  ['faqs'],
  { revalidate: 3600, tags: ['faqs'] }
);
