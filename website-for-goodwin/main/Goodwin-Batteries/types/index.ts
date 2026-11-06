export interface Product {
  id: string;
  name: string;
  slug: string;
  series: string;
  youtube_url?: string;
  category: string;
  categories?: string[];
  voltage: string;
  ah: string;
  cca: string;
  warranty: string;
  warranty_options?: string[];
  warranty_months?: number;
  free_replacement_months?: number;
  pro_rata_months?: number;
  warranty_breakdown?: string;
  is_featured?: boolean;
  is_published?: boolean;
  application: string[];
  image: string;
  gallery?: string[];
  videos?: string[];
  description: string;
  features: string[];
  technology?: string;
  terminalLayout: string;
  dimensions: string;
  weight: string;
  datasheet?: string;
  mrp?: number;
  price?: number;
  in_stock?: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  image: string;
  series?: string;
  ah?: string;
  voltage?: string;
  warranty?: string;
  mrp: number;
  price: number;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  vehicleDetails?: string;
  deliverySlot: string;
  paymentMethod: "online" | "upi" | "cod";
  paymentStatus: "Pending" | "Paid";
  transactionId?: string;
  status: "Confirmed" | "Packed" | "Out for Delivery" | "Delivered & Installed" | "Cancelled";
  items: OrderItem[];
  totalMrp: number;
  discount: number;
  deliveryFee: number;
  totalAmount: number;
  createdAt: string;
  // Goodwin Seller Hub Dispatch & Technician fields
  packedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  technicianName?: string;
  technicianPhone?: string;
  technicianVehicle?: string;
  installedSerialNumber?: string;
  invoiceNumber?: string;
  trackingNumber?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  aliases?: string[];
  status?: "active" | "upcoming";
  statusLabel?: string;
  capacityRange?: string;
  warrantyRange?: string;
  description: string;
  longDescription?: string;
  highlights?: string[];
  upcomingNote?: string;
  image: string;
}

export interface VehicleType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  active: boolean;
}

export interface VehicleBrand {
  id: string;
  vehicle_type_id: string;
  name: string;
  slug: string;
  display_order: number;
  active: boolean;
  source_name?: string;
  source_url?: string;
  source_type?: string;
  verified: boolean;
}

export interface VehicleModel {
  id: string;
  brand_id: string;
  name: string;
  slug: string;
  display_order: number;
  active: boolean;
  source_name?: string;
  source_url?: string;
  source_type?: string;
  verified: boolean;
}

export interface VehicleVariant {
  id: string;
  model_id: string;
  name: string;
  slug: string;
  display_order: number;
  active: boolean;
  source_name?: string;
  source_url?: string;
  source_type?: string;
  verified: boolean;
}

export interface FuelType {
  id: string;
  name: string;
  active: boolean;
}

export interface VehicleYear {
  id: string;
  vehicle_variant_id: string;
  year_start: number;
  year_end?: number;
  active: boolean;
  source_name?: string;
  source_url?: string;
  verified: boolean;
}

export interface VehicleBatteryFitment {
  id: string;
  vehicle_type_id: string;
  brand_id: string;
  model_id: string;
  variant_id: string;
  fuel_type_id: string;
  year_start?: number;
  year_end?: number;
  goodwin_product_id: string;
  source_brand?: string;
  source_product_reference?: string;
  source_url?: string;
  source_type?: string;
  fitment_status: string;
  confidence: string;
  admin_verified: boolean;
  public_visible: boolean;
  notes?: string;
}

export interface BatteryFinderLead {
  id: string;
  enquiry_id: string;
  vehicle_type?: string;
  brand?: string;
  model?: string;
  variant?: string;
  fuel?: string;
  year?: string;
  recommended_product_id?: string;
  customer_name?: string;
  phone?: string;
  email?: string;
  source?: string;
  created_at: string;
}

export interface Dealer {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  whatsapp?: string;
  openingHours: string;
  latitude?: number;
  longitude?: number;
}
