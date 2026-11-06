import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    if (process.env.NODE_ENV === 'production' && secret !== (process.env.ADMIN_SEED_SECRET || 'goodwin_seed_2026')) {
      return NextResponse.json({ error: 'Unauthorized to seed database in production' }, { status: 403 });
    }

    const supabase = await createClient();
    // 1. Categories
    const categories = [
      { id: 'cat-1', name: 'Passenger Vehicles', slug: 'passenger-vehicles', description: 'Reliable starting power for demanding journeys.', image: '/assets/products/placeholder-passenger.webp' },
      { id: 'cat-2', name: 'Two Wheelers', slug: 'two-wheelers', description: 'Quick starts and consistent performance for bikes and scooters.', image: '/assets/products/placeholder-bike.webp' },
      { id: 'cat-3', name: 'Commercial Vehicles', slug: 'commercial-vehicles', description: 'Heavy-duty power for trucks and commercial transport.', image: '/assets/products/placeholder-commercial.webp' },
      { id: 'cat-4', name: 'Tractors', slug: 'tractors', description: 'Built for tough agricultural environments.', image: '/assets/products/placeholder-tractor.webp' }
    ];
    await supabase.from("categories").upsert(categories, { onConflict: 'id' });

    // 2. Products
    const products = [
      { id: 'prod-1', name: 'Goodwin ProStart 45', slug: 'goodwin-prostart-45', series: 'ProStart', category_id: 'cat-1', voltage: '12V', ah: '45 Ah', cca: '380', warranty: '48 Months', image: '/assets/products/goodwin-12vgw-tz4lb.png', description: 'Premium automotive battery designed for modern passenger vehicles requiring reliable starts in any weather.', features: ['Maintenance-free design', 'High cranking power', 'Vibration resistant'], terminal_layout: 'Standard', dimensions: '238 x 129 x 227 mm', weight: '12.5 kg', is_published: true },
      { id: 'prod-2', name: 'Goodwin DuraMax 65', slug: 'goodwin-duramax-65', series: 'DuraMax', category_id: 'cat-1', voltage: '12V', ah: '65 Ah', cca: '550', warranty: '60 Months', image: '/assets/products/goodwin-12vgw-xl5lb.png', description: 'Maximum power for demanding vehicles loaded with electronics. Unmatched durability.', features: ['Advanced grid technology', 'Zero maintenance', 'High heat tolerance'], terminal_layout: 'Standard', dimensions: '260 x 173 x 225 mm', weight: '16.8 kg', is_published: true },
      { id: 'prod-3', name: 'Goodwin Rider 5Ah', slug: 'goodwin-rider-5ah', series: 'Rider', category_id: 'cat-2', voltage: '12V', ah: '5 Ah', cca: '80', warranty: '36 Months', image: '/assets/products/goodwin-4smf5-torch-4v-5ah.png', description: 'Compact, reliable power for two-wheelers ensuring quick starts every time.', features: ['Spill-proof', 'VRLA technology', 'Quick recharge'], terminal_layout: 'Standard Two-Wheeler', dimensions: '113 x 70 x 105 mm', weight: '1.8 kg', is_published: true },
      { id: 'prod-4', name: 'Goodwin Haulage 150', slug: 'goodwin-haulage-150', series: 'Haulage', category_id: 'cat-3', voltage: '12V', ah: '150 Ah', cca: '900', warranty: '36 Months', image: '/assets/products/goodwin-vrla-12v-14ah.png', description: 'Extreme heavy-duty battery built to withstand the rigorous demands of commercial transport.', features: ['Thick plate construction', 'High reserve capacity', 'Extreme vibration resistance'], terminal_layout: 'Standard Commercial', dimensions: '510 x 220 x 230 mm', weight: '42.0 kg', is_published: true }
    ];
    await supabase.from("products").upsert(products, { onConflict: 'id' });

    // 3. Vehicle Types
    const vehicleTypes = [
      { id: 'vt-1', name: 'Passenger Vehicle' },
      { id: 'vt-2', name: 'Two Wheeler' },
      { id: 'vt-3', name: 'Commercial Vehicle' },
      { id: 'vt-4', name: 'Tractor' }
    ];
    await supabase.from("vehicle_types").upsert(vehicleTypes, { onConflict: 'id' });

    // 4. Manufacturers
    const manufacturers = [
      { id: 'm-1', name: 'Maruti Suzuki', vehicle_type_id: 'vt-1' },
      { id: 'm-2', name: 'Hyundai', vehicle_type_id: 'vt-1' },
      { id: 'm-3', name: 'Mahindra', vehicle_type_id: 'vt-1' },
      { id: 'm-4', name: 'Honda', vehicle_type_id: 'vt-2' },
      { id: 'm-5', name: 'Bajaj', vehicle_type_id: 'vt-2' },
      { id: 'm-6', name: 'Tata Motors', vehicle_type_id: 'vt-3' }
    ];
    await supabase.from("manufacturers").upsert(manufacturers, { onConflict: 'id' });

    // 5. Vehicle Models
    const vehicleModels = [
      { id: 'vm-1', name: 'Swift', manufacturer_id: 'm-1' },
      { id: 'vm-2', name: 'Creta', manufacturer_id: 'm-2' },
      { id: 'vm-3', name: 'Activa', manufacturer_id: 'm-4' },
      { id: 'vm-4', name: 'Signa', manufacturer_id: 'm-6' }
    ];
    await supabase.from("vehicle_models").upsert(vehicleModels, { onConflict: 'id' });

    // 6. Vehicle Variants
    const variants = [
      { id: 'vv-1', name: 'Petrol 1.2L', model_id: 'vm-1', fuel_type: 'Petrol', year_range: '2015-2023', recommended_battery_id: 'prod-1' },
      { id: 'vv-2', name: 'Diesel 1.6L', model_id: 'vm-2', fuel_type: 'Diesel', year_range: '2018-2023', recommended_battery_id: 'prod-2' },
      { id: 'vv-3', name: '125cc', model_id: 'vm-3', fuel_type: 'Petrol', year_range: '2010-2023', recommended_battery_id: 'prod-3' }
    ];
    await supabase.from("vehicle_variants").upsert(variants, { onConflict: 'id' });

    // 7. Dealers
    const dealers = [
      { id: 'd-1', name: 'Auto Power Point', address: '123, Main Road, Auto Nagar', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', phone: '9876543210', opening_hours: 'Mon-Sat: 9:00 AM - 8:00 PM', latitude: 18.922, longitude: 72.834, is_published: true },
      { id: 'd-2', name: 'Reliable Battery Service', address: '45, Industrial Estate, Phase 1', city: 'Delhi', state: 'Delhi', pincode: '110020', phone: '9876543211', opening_hours: 'Mon-Sun: 10:00 AM - 7:00 PM', latitude: 28.535, longitude: 77.271, is_published: true }
    ];
    await supabase.from("dealers").upsert(dealers, { onConflict: 'id' });

    return NextResponse.json({ success: true, message: "Database seeded successfully!" });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
