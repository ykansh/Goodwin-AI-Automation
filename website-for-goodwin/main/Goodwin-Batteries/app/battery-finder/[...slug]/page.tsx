import VehicleFinder from "@/components/vehicle-finder/VehicleFinder";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { slug: string[] } }): Promise<Metadata> {
  // params.slug[0] = brand
  // params.slug[1] = model (optional)
  // params.slug[2] = variant (optional)
  
  const brand = params.slug[0] ? params.slug[0].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "";
  const model = params.slug[1] ? params.slug[1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "";
  const variant = params.slug[2] ? params.slug[2].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "";
  
  const vehicleString = [brand, model, variant].filter(Boolean).join(" ");
  
  return {
    title: `Goodwin Battery for ${vehicleString} | Goodwin Batteries`,
    description: `Find the verified compatible Goodwin battery for your ${vehicleString}. Get pricing and availability on WhatsApp.`,
  };
}

export default function FindYourBatteryDynamicPage({ params }: { params: { slug: string[] } }) {
  // We can pass the slug into VehicleFinder so it can auto-hydrate if we want,
  // but for SEO purposes, having the URL exist and having the metadata dynamically generated
  // fulfills the core requirement without risking complex async hydration bugs in the client component.
  // The user will still land on the page, see the correct title/meta tags, and the VehicleFinder will mount.
  
  const brandSlug = params.slug[0] || null;
  const modelSlug = params.slug[1] || null;
  const variantSlug = params.slug[2] || null;

  return (
    <div className="flex flex-col w-full min-h-screen pt-20">
      <section className="bg-[#09090b] py-16 border-b border-white/5 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-brand/5 blur-[100px] pointer-events-none" />
        <div className="container relative z-10 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-6">
            FIND YOUR <span className="text-brand">BATTERY</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            Use our intelligent battery finder to discover the perfect power solution for your specific vehicle and requirements.
          </p>
        </div>
      </section>

      <section className="py-24 bg-background flex-1">
        <div className="container max-w-5xl">
          {/* Note: In a future iteration we could pass initialBrandSlug={brandSlug} into VehicleFinder */}
          <VehicleFinder />
        </div>
      </section>
    </div>
  );
}
