import VehicleFinder from "@/components/vehicle-finder/VehicleFinder";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find the Right Battery for Your Vehicle | Goodwin Batteries",
  description: "Find the right Goodwin battery for your motorcycle or scooter. Select your vehicle brand, model, variant and year to find a compatible Goodwin battery.",
};

export default function FindYourBatteryPage() {
  return (
    <div className="flex flex-col w-full min-h-screen pt-20 bg-white">
      <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 border-b border-slate-200 relative overflow-hidden">
        <div className="container relative z-10 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 mb-6 uppercase tracking-tight">
            FIND YOUR <span className="text-[#00843D]">BATTERY</span>
          </h1>
          <p className="text-slate-600 text-lg">
            Use our intelligent battery finder to discover the perfect power solution for your specific vehicle and requirements.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-slate-50/60 flex-1">
        <div className="container max-w-5xl">
          <VehicleFinder />
        </div>
      </section>
    </div>
  );
}
