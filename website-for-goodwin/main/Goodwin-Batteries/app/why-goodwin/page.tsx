import { ShieldCheck, Zap, Activity, Users, Settings, Wrench } from "lucide-react";

export default function WhyGoodwinPage() {
  const reasons = [
    { icon: <ShieldCheck size={32} />, title: "RELIABLE POWER", desc: "Built to deliver dependable performance when it matters most, ensuring you never get stranded." },
    { icon: <Activity size={32} />, title: "BUILT FOR INDIAN CONDITIONS", desc: "Designed around demanding road, weather, and usage conditions specific to the subcontinent." },
    { icon: <Zap size={32} />, title: "LONG-LASTING PERFORMANCE", desc: "Focused on consistent and dependable battery performance over an extended lifespan." },
    { icon: <Settings size={32} />, title: "QUALITY FOCUSED", desc: "Every product represents Goodwin's uncompromising commitment to manufacturing quality and safety." },
    { icon: <Users size={32} />, title: "CUSTOMER FIRST", desc: "Our support continues well beyond the sale with an extensive network and responsive customer service." },
    { icon: <Wrench size={32} />, title: "EVOLVING TECHNOLOGY", desc: "Continuously improving battery and energy solutions through research and development." }
  ];

  return (
    <div className="flex flex-col w-full min-h-screen pt-20">
      <section className="bg-surface py-20 border-b border-border relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-brand/10 blur-[100px] pointer-events-none" />
        <div className="container relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold text-foreground mb-6">
              WHY <span className="text-brand">GOODWIN?</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
              Here&apos;s why thousands of customers, drivers, and commercial fleet owners across India choose Goodwin Batteries as their trusted power partner to keep moving forward with complete confidence.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reasons.map((reason, index) => (
              <div key={index} className="bg-surface border border-border p-8 rounded-2xl hover:border-brand/50 transition-colors group hover:-translate-y-1 duration-300 shadow-sm hover:shadow-xl">
                <div className="text-brand mb-6 bg-brand/10 w-16 h-16 rounded-xl flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors">
                  {reason.icon}
                </div>
                <h3 className="text-xl font-heading font-bold text-foreground mb-4">{reason.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {reason.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="py-24 bg-surface text-center">
        <div className="container max-w-4xl">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-foreground mb-6">Experience the Goodwin Difference</h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Upgrade your vehicle's power source today and experience unparalleled reliability on every journey.
          </p>
          <a href="/battery-finder" className="inline-block bg-brand text-white px-10 py-4 rounded font-bold uppercase tracking-wider hover:bg-brand-dark transition-all shadow-xl">
            Find Your Battery
          </a>
        </div>
      </section>
    </div>
  );
}
