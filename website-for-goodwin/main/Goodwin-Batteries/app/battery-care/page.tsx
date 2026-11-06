import { BatteryCharging, AlertTriangle, PenTool, BatteryWarning } from "lucide-react";

export default function BatteryCarePage() {
  const tips = [
    { icon: <PenTool size={32} />, title: "Regular Cleaning", desc: "Keep the battery terminals clean and free from corrosion. A mixture of baking soda and water can safely neutralise battery acid corrosion." },
    { icon: <BatteryCharging size={32} />, title: "Check Charge Levels", desc: "Ensure your battery remains fully charged, especially if you don't drive frequently. Use a trickle charger for vehicles stored for long periods." },
    { icon: <AlertTriangle size={32} />, title: "Secure Installation", desc: "Vibration can severely damage battery plates. Ensure your battery is properly secured in its tray to minimize movement." },
    { icon: <BatteryWarning size={32} />, title: "Turn Off Electronics", desc: "Don't leave lights, radio, or air conditioning on when the engine is switched off to prevent deep discharge." }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen pt-20">
      <section className="bg-gradient-to-b from-slate-50 to-white py-20 border-b border-slate-200 relative overflow-hidden">
        <div className="container relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-black text-slate-900 mb-6">
            BATTERY <span className="text-[#00843D]">CARE</span>
          </h1>
          <p className="text-slate-600 text-lg md:text-xl leading-relaxed">
            Get the most out of your Goodwin battery with these expert maintenance tips and guidelines.
          </p>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tips.map((tip, index) => (
              <div key={index} className="bg-surface border border-border p-8 rounded-2xl flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-xl transition-shadow">
                <div className="bg-brand/10 w-16 h-16 rounded-xl flex items-center justify-center text-brand shrink-0">
                  {tip.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-3">{tip.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-surface border border-brand/30 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-4">Warning Signs of a Failing Battery</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">Don't wait until you're stranded. Look out for these common indicators that your battery needs replacement.</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-background border border-border p-6 rounded-xl text-center">
                <span className="text-brand font-bold uppercase tracking-wider text-sm block mb-2">01</span>
                <h4 className="font-bold text-foreground mb-2">Slow Engine Crank</h4>
                <p className="text-xs text-muted-foreground">The engine is sluggish and takes longer than normal to start.</p>
              </div>
              <div className="bg-background border border-border p-6 rounded-xl text-center">
                <span className="text-brand font-bold uppercase tracking-wider text-sm block mb-2">02</span>
                <h4 className="font-bold text-foreground mb-2">Check Engine Light</h4>
                <p className="text-xs text-muted-foreground">The check engine or battery indicator light comes on.</p>
              </div>
              <div className="bg-background border border-border p-6 rounded-xl text-center">
                <span className="text-brand font-bold uppercase tracking-wider text-sm block mb-2">03</span>
                <h4 className="font-bold text-foreground mb-2">Swollen Case</h4>
                <p className="text-xs text-muted-foreground">The battery casing appears swollen or bloated due to heat.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
