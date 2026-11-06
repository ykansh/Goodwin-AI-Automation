import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Settings, Truck, Zap, Activity, BatteryCharging, CheckCircle2, Phone } from "lucide-react";
import QuickEnquiryForm from "@/components/forms/QuickEnquiryForm";

const SERVICES = [
  {
    slug: "battery-replacement",
    title: "Expert Battery Replacement",
    icon: BatteryCharging,
    description: "Professional removal of your old battery and installation of a new, high-performance Goodwin battery.",
    details: [
      "Safe disposal of old batteries",
      "Terminal cleaning and anti-corrosion treatment",
      "Alternator and starter check included",
      "Available for all vehicle types"
    ]
  },
  {
    slug: "emergency-battery-service",
    title: "24/7 Emergency Battery Service",
    icon: Zap,
    description: "Stranded? Our rapid response team will reach you quickly to get your vehicle back on the road.",
    details: [
      "Under 60-minute response time in city limits",
      "On-the-spot diagnostics",
      "Jump start or complete replacement options",
      "Transparent pricing with no hidden fees"
    ]
  },
  {
    slug: "doorstep-battery-delivery",
    title: "Doorstep Battery Delivery",
    icon: Truck,
    description: "Order your battery online or via WhatsApp and we will deliver it right to your doorstep safely.",
    details: [
      "Free delivery within service zones",
      "Factory-sealed authentic packaging (Fitment is customer responsibility)",
      "Convenient delivery slot booking",
      "Prepaid online or verified invoice"
    ]
  },
  {
    slug: "jump-start",
    title: "Professional Jump Start",
    icon: Zap,
    description: "Dead battery? We provide safe, surge-protected jump starts to protect your vehicle's sensitive electronics.",
    details: [
      "Surge-protected equipment",
      "Battery health check included",
      "Guidance on battery lifespan",
      "Quick response time"
    ]
  },
  {
    slug: "battery-testing",
    title: "Advanced Battery Testing",
    icon: Activity,
    description: "Comprehensive health check of your battery and electrical system using advanced diagnostic tools.",
    details: [
      "Load testing and cranking amp measurement",
      "Alternator charging rate check",
      "Parasitic draw testing",
      "Detailed health report provided"
    ]
  }
];

export function generateStaticParams() {
  return SERVICES.map((service) => ({
    slug: service.slug,
  }));
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = SERVICES.find((s) => s.slug === slug);

  if (!service) {
    notFound();
  }

  const Icon = service.icon;

  return (
    <div className="flex flex-col w-full min-h-screen pt-20 bg-background">
      {/* Breadcrumbs */}
      <div className="bg-surface border-b border-border py-4">
        <div className="container flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Link href="/" className="hover:text-brand transition-colors">Home</Link>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-foreground">Services</span>
          <ChevronRight size={14} className="mx-2" />
          <span className="text-brand">{service.title}</span>
        </div>
      </div>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            
            {/* Service Details */}
            <div>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-brand/10 text-brand mb-6 border border-brand/20">
                <Icon size={32} />
              </div>
              <h1 className="text-4xl md:text-5xl font-heading font-bold text-foreground mb-6">
                {service.title}
              </h1>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                {service.description}
              </p>

              <div className="bg-surface border border-border rounded-xl p-8 mb-10">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                  <Settings className="text-brand" /> What's Included:
                </h3>
                <ul className="space-y-4">
                  {service.details.map((detail, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="text-brand shrink-0 mt-0.5" size={20} />
                      <span className="text-foreground font-medium">{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <a href={`https://wa.me/919667724411?text=${encodeURIComponent(`Hi Goodwin Batteries, I need assistance with: ${service.title}`)}`} target="_blank" rel="noopener noreferrer" className="flex-1 bg-brand text-white px-6 py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-brand-dark transition-all text-center shadow-lg shadow-brand/20 flex items-center justify-center gap-2">
                  <Phone size={18} /> Call Now
                </a>
                <Link href="/contact" className="flex-1 bg-background border border-border text-foreground px-6 py-4 rounded-xl font-bold uppercase tracking-wider hover:border-brand transition-all text-center">
                  Book Appointment
                </Link>
              </div>
            </div>

            {/* Quick Enquiry Form Sidebar */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 shadow-2xl sticky top-24">
              <h3 className="text-2xl font-bold text-white mb-2">Request this Service</h3>
              <p className="text-muted-foreground text-sm mb-6">Fill out the form below and our team will get back to you immediately.</p>
              <QuickEnquiryForm />
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
