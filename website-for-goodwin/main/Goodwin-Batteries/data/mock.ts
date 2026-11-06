import { Product, Category, VehicleType, VehicleBrand, VehicleModel, VehicleVariant, Dealer, FuelType, VehicleYear, VehicleBatteryFitment } from "@/types";

export const categories: Category[] = [
  { id: "cat-1", name: "Passenger Vehicles", slug: "passenger-vehicles", description: "Reliable starting power for demanding journeys.", image: "/assets/categories/passenger-vehicles.jpg" },
  { id: "cat-2", name: "Two Wheelers", slug: "two-wheelers", description: "Quick starts and consistent performance for bikes and scooters.", image: "/assets/categories/two-wheelers.jpg" },
  { id: "cat-3", name: "Commercial Vehicles", slug: "commercial-vehicles", description: "Heavy-duty power for trucks and commercial transport.", image: "/assets/categories/commercial-heavy-duty.jpg" },
  { id: "cat-4", name: "Tractors", slug: "tractors", description: "Built for tough agricultural environments.", image: "/assets/categories/agricultural-tractors.jpg" },
  { id: "cat-5", name: "Three Wheelers", slug: "three-wheelers", description: "Dependable energy for continuous city driving.", image: "/assets/categories/three-wheelers.jpg" },
  { id: "cat-6", name: "Industrial & UPS", slug: "industrial", description: "High-capacity power for stationary and industrial use.", image: "/assets/categories/industrial.jpg" }
];

export const products: Product[] = [
  {
    id: "prod-1",
    name: "Goodwin ProStart 45",
    slug: "goodwin-prostart-45",
    series: "ProStart",
    category: "cat-1",
    voltage: "12V",
    ah: "45 Ah",
    cca: "380",
    warranty: "60 Months",
    application: ["Cars", "SUVs", "MUVs"],
    image: "/assets/products/mockup-xl25lc.png",
    description: "Premium maintenance-free battery designed for modern cars with high electrical loads.",
    features: ["Maintenance-free design", "High cranking power", "Vibration resistant", "Built for Indian conditions"],
    terminalLayout: "Standard",
    dimensions: "238 x 129 x 227 mm",
    weight: "12.5 kg"
  },
  {
    id: "prod-2",
    name: "Goodwin DuraMax 65",
    slug: "goodwin-duramax-65",
    series: "DuraMax",
    category: "cat-1",
    voltage: "12V",
    ah: "65 Ah",
    cca: "550",
    warranty: "48 Months",
    application: ["SUVs", "Commercial Vehicles"],
    image: "/assets/products/goodwin-12sv-xl2-5lc-side.png",
    description: "Heavy-duty battery built to withstand rough terrains and high vibrations.",
    features: ["Extra thick plates", "Heat resistant", "Longer life cycle"],
    terminalLayout: "Standard SUV",
    dimensions: "260 x 173 x 225 mm",
    weight: "16.2 kg"
  },
  {
    id: "prod-3",
    name: "Goodwin Rider 5Ah",
    slug: "goodwin-rider-5ah",
    series: "Rider",
    category: "cat-2",
    voltage: "12V",
    ah: "5 Ah",
    cca: "80",
    warranty: "48 Months",
    application: ["Motorcycles", "Scooters"],
    image: "/assets/products/goodwin-12vgw-tz4lb.png",
    description: "Reliable VRLA battery for quick starts in all weather conditions.",
    features: ["Spill-proof", "VRLA technology", "Quick recharge"],
    terminalLayout: "Standard Two-Wheeler",
    dimensions: "113 x 70 x 105 mm",
    weight: "1.8 kg"
  },
  {
    id: "prod-4",
    name: "Goodwin Haulage 150",
    slug: "goodwin-haulage-150",
    series: "Haulage",
    category: "cat-3",
    voltage: "12V",
    ah: "150 Ah",
    cca: "900",
    warranty: "36 Months",
    application: ["Heavy Trucks", "Buses"],
    image: "/assets/products/mockup-xl5lb.jpg",
    description: "Extreme heavy-duty battery built to withstand the rigorous demands of commercial transport.",
    features: ["Thick plate construction", "High reserve capacity", "Extreme vibration resistance"],
    terminalLayout: "Standard Commercial",
    dimensions: "510 x 220 x 230 mm",
    weight: "42.0 kg"
  }
];

export const vehicleTypes: VehicleType[] = [
  { id: "vt-1", name: "Passenger Cars", slug: "passenger-cars", display_order: 1, active: true },
  { id: "vt-2", name: "Two Wheelers", slug: "two-wheelers", display_order: 2, active: true },
  { id: "vt-3", name: "Commercial", slug: "commercial", display_order: 3, active: true },
  { id: "vt-4", name: "Tractors", slug: "tractors", display_order: 4, active: true },
];

export const vehicleBrands: VehicleBrand[] = [
  { id: "m-1", name: "Maruti Suzuki", slug: "maruti-suzuki", vehicle_type_id: "vt-1", display_order: 1, active: true, verified: true },
  { id: "m-2", name: "Hyundai", slug: "hyundai", vehicle_type_id: "vt-1", display_order: 2, active: true, verified: true },
  { id: "m-3", name: "Mahindra", slug: "mahindra", vehicle_type_id: "vt-1", display_order: 3, active: true, verified: true },
  { id: "m-4", name: "Honda", slug: "honda", vehicle_type_id: "vt-2", display_order: 4, active: true, verified: true },
  { id: "m-5", name: "Bajaj", slug: "bajaj", vehicle_type_id: "vt-2", display_order: 5, active: true, verified: true },
  { id: "m-6", name: "Tata Motors", slug: "tata-motors", vehicle_type_id: "vt-3", display_order: 6, active: true, verified: true },
];

export const vehicleModels: VehicleModel[] = [
  { id: "vm-1", name: "Swift", slug: "swift", brand_id: "m-1", display_order: 1, active: true, verified: true },
  { id: "vm-2", name: "Creta", slug: "creta", brand_id: "m-2", display_order: 2, active: true, verified: true },
  { id: "vm-3", name: "Activa", slug: "activa", brand_id: "m-4", display_order: 3, active: true, verified: true },
  { id: "vm-4", name: "Signa", slug: "signa", brand_id: "m-6", display_order: 4, active: true, verified: true },
  { id: "vm-5", name: "Scorpio", slug: "scorpio", brand_id: "m-3", display_order: 5, active: true, verified: true },
];

export const vehicleVariants: VehicleVariant[] = [];
export const fuelTypes: FuelType[] = [];
export const vehicleYears: VehicleYear[] = [];
export const vehicleBatteryFitments: VehicleBatteryFitment[] = [];

export const dealers: Dealer[] = [
  {
    id: "d-1",
    name: "Sharma Battery Point",
    address: "12/4, Main Ring Road, Pitampura",
    city: "New Delhi",
    state: "Delhi",
    pincode: "110034",
    phone: "9811234567",
    openingHours: "Mon - Sat: 9AM - 8PM",
    latitude: 28.7032,
    longitude: 77.1473
  },
  {
    id: "d-2",
    name: "Power Tech Auto",
    address: "Shop 5, Auto Market, Sector 14",
    city: "Gurugram",
    state: "Haryana",
    pincode: "122001",
    phone: "9876543210",
    openingHours: "Mon - Sun: 10AM - 7PM",
    latitude: 28.4595,
    longitude: 77.0266
  },
  {
    id: "d-3",
    name: "Rao Battery Agency",
    address: "Main Bazar, Near Bus Stand",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302001",
    phone: "8899776655",
    openingHours: "Mon - Sat: 9:30AM - 7:30PM",
    latitude: 26.9124,
    longitude: 75.7873
  }
];
