import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { 
  Compass, Eye, Target, ShieldCheck, Zap, 
  Recycle, Users, HeartHandshake, Award, CheckCircle2, ArrowRight 
} from "lucide-react";

export const metadata: Metadata = {
  title: "Our Vision, Mission & Core Values | Goodwin Batteries",
  description: "Learn about Goodwin Batteries' vision for powering India's mobility and energy future with extreme reliability, sustainable closed-loop recycling, and partner empowerment.",
};

export default function VisionPage() {
  const coreValues = [
    {
      icon: <Zap size={28} className="text-[#00843D]" />,
      title: "Zero-Compromise Metallurgy",
      desc: "We exclusively formulate using 99.99% virgin refined lead, reinforced with calcium-tin-silver micro-alloys. We refuse low-grade recycled lead scrap in prime plate grids."
    },
    {
      icon: <ShieldCheck size={28} className="text-amber-600" />,
      title: "Built for Indian Extremes",
      desc: "Our cells are specifically engineered to withstand 55°C under-hood summer heat, heavy monsoon moisture, and punishing 30G road vibrations across rough rural and highway terrains."
    },
    {
      icon: <Users size={28} className="text-[#00843D]" />,
      title: "Dealer Empowerment & Trust",
      desc: "We treat our 500+ authorized retail partners as our co-founders. We guarantee prompt, paperless digital warranty settlements, fair margins, and strict territory protection."
    },
    {
      icon: <Recycle size={28} className="text-emerald-600" />,
      title: "Closed-Loop Eco Circularity",
      desc: "We are deeply committed to 100% responsible lead take-back. Every scrap battery collected is channeled into authorized eco-smelters to protect India's soil and water tables."
    },
    {
      icon: <HeartHandshake size={28} className="text-blue-600" />,
      title: "Customer-First Guarantee",
      desc: "From instant QR code e-warranty registration to nationwide service honors, we guarantee that no customer or driver is ever left stranded without power."
    }
  ];

  const roadmap = [
    {
      year: "2024",
      badge: "Network Milestone",
      title: "500+ Touchpoints & Digital Warranty Launch",
      desc: "Established a dedicated dealer network across North and Central India. Launched end-to-end QR code paperless e-warranty registration."
    },
    {
      year: "2025",
      badge: "Capacity Expansion",
      title: "Robotic Assembly & High-Rate Testing Labs",
      desc: "Upgraded our manufacturing line to automated continuous plate pasting and tri-axial 30G vibration dynos for zero defect output."
    },
    {
      year: "2026",
      badge: "Current Milestone",
      title: "Heavy E-Rickshaw & Next-Gen Solar Launch",
      desc: "Rolling out specialized high-density commercial E-Rickshaw batteries and high-cycle tall tubular solar batteries for distributed rooftop energy."
    },
    {
      year: "2027 – 2028",
      badge: "Future Frontier",
      title: "Smart IoT Battery Monitoring & LFP Lithium",
      desc: "Deploying integrated Bluetooth Smart BMS diagnostics for predictive maintenance, along with high-safety Lithium Iron Phosphate packs."
    },
    {
      year: "2030",
      badge: "The Grand Vision",
      title: "5 Million Active Vehicles & Zero-Carbon Plant",
      desc: "Powering over 5,000,000 active Indian vehicles and homes while achieving 100% carbon-neutral plant operations and closed-loop recyclability."
    }
  ];

  return (
    <main className="min-h-screen pt-16 bg-white text-slate-900">
      {/* 1. Hero Section */}
      <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 md:py-24 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="container relative z-10 max-w-5xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 mb-6 shadow-sm">
            <Compass size={14} className="text-[#00843D]" />
            <span className="text-[#00843D] text-xs font-black tracking-widest uppercase">
              Corporate Philosophy & Purpose
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-heading font-black text-slate-900 mb-6 uppercase tracking-tight leading-[1.08]">
            POWERING PROGRESS, <br />
            <span className="text-[#00843D]">SUSTAINING TRUST.</span>
          </h1>

          <p className="text-slate-600 text-lg md:text-xl leading-relaxed max-w-3xl mb-10">
            At Goodwin Batteries, our purpose extends beyond chemistry and lead grids. We engineer the unwavering reliability that starts your morning commute, powers rural harvests, keeps life-saving hospital equipment running, and safeguards home comfort during summer blackouts.
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-bold text-slate-700">
            <div className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#00843D]" />
              <span>99.8% First-Start Reliability Benchmark</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#00843D]" />
              <span>100% Green Lead Circularity</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#00843D]" />
              <span>Pan-India Paperless E-Warranty</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Dual Pillar: Vision & Mission Cards */}
      <section className="py-20 bg-white">
        <div className="container max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Vision Card */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50/30 border-2 border-emerald-200 shadow-lg relative overflow-hidden group">
              <div className="w-16 h-16 rounded-2xl bg-[#00843D] text-white flex items-center justify-center mb-6 shadow-md">
                <Eye size={32} />
              </div>
              <span className="text-[#00843D] font-black uppercase tracking-widest text-xs block mb-3">
                Our Vision
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 mb-4 uppercase">
                India&apos;s Most Trusted Everyday Power Choice
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                To be recognized as India&apos;s foremost energy storage brand by engineering batteries that outlast tropical climates, elevate commercial vehicle productivity, and make zero-emission, clean power accessible across every corner of the nation.
              </p>
            </div>

            {/* Mission Card */}
            <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-amber-50 via-white to-amber-50/30 border-2 border-amber-200 shadow-lg relative overflow-hidden group">
              <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center mb-6 shadow-md">
                <Target size={32} />
              </div>
              <span className="text-amber-700 font-black uppercase tracking-widest text-xs block mb-3">
                Our Mission
              </span>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 mb-4 uppercase">
                Engineered Excellence for Moving India
              </h2>
              <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                To continuously advance electrochemical metallurgy, empower over 10,000 dealer entrepreneurs with digital tools and transparent margins, eliminate paper warranty hassles, and strictly uphold circular closed-loop recycling for a greener planet.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Five Core Values */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="container max-w-5xl">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#00843D] font-black uppercase tracking-widest text-xs block mb-2">
              Our Compass
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-slate-900 uppercase">
              THE 5 PILLARS OF GOODWIN
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              The non-negotiable principles guiding our metallurgy, dealer relationships, and customer care every single day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreValues.map((val, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 hover:border-[#00843D] transition-all hover:shadow-xl hover:-translate-y-1 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-5">
                    {val.icon}
                  </div>
                  <h3 className="text-lg font-heading font-bold text-slate-900 mb-3">
                    {val.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {val.desc}
                  </p>
                </div>
              </div>
            ))}

            {/* Quality Pledge Card */}
            <div className="bg-[#00843D] text-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-lg">
              <div>
                <Award size={32} className="text-amber-300 mb-4" />
                <h3 className="text-lg font-heading font-bold text-white mb-2">
                  The Goodwin Quality Pledge
                </h3>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  Every battery leaving our plant has passed 100% automated pressure testing, optical lead purity verification, and open-circuit voltage calibration.
                </p>
              </div>
              <div className="pt-4 mt-4 border-t border-white/20 text-xs font-bold text-amber-200">
                100% Factory Certified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Strategic Roadmap to 2030 */}
      <section className="py-20 bg-white">
        <div className="container max-w-4xl">
          <div className="text-center mb-16">
            <span className="text-[#00843D] font-black uppercase tracking-widest text-xs block mb-2">
              Strategic Trajectory
            </span>
            <h2 className="text-3xl sm:text-4xl font-heading font-black text-slate-900 uppercase">
              ROADMAP TO VISION 2030
            </h2>
            <p className="text-slate-600 text-sm mt-3">
              How we are methodically scaling manufacturing capabilities, dealer touchpoints, and green technologies.
            </p>
          </div>

          <div className="relative border-l-2 border-emerald-200 ml-4 sm:ml-8 space-y-10 pl-6 sm:pl-10">
            {roadmap.map((step, idx) => (
              <div key={idx} className="relative group">
                {/* Node dot */}
                <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-5 h-5 rounded-full bg-[#00843D] border-4 border-white shadow-md group-hover:scale-125 transition-transform" />

                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-[#00843D] hover:bg-white transition-all shadow-xs hover:shadow-md">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <span className="text-lg font-black text-[#00843D] font-heading">{step.year}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-[#00843D]">
                      {step.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Call to Action */}
      <section className="py-16 bg-slate-50 border-t border-slate-200 text-center">
        <div className="container max-w-3xl">
          <h3 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 uppercase mb-3">
            JOIN US ON THIS JOURNEY
          </h3>
          <p className="text-slate-600 text-sm max-w-xl mx-auto mb-6">
            Whether you are an automobile dealership, commercial fleet manager, or solar installer, partner with Goodwin Batteries to power sustainable growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/dealer-distributor"
              className="bg-[#00843D] hover:bg-[#006830] text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Become a Dealer Partner
            </Link>
            <Link 
              href="/gallery"
              className="bg-white hover:bg-slate-100 text-slate-800 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-slate-300 shadow-xs"
            >
              Tour Our Manufacturing Gallery
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
