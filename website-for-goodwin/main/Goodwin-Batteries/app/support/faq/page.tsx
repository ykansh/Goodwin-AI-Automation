"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, HelpCircle, Search } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { GOODWIN_CONFIG } from "@/config/goodwin";

const faqs = [
  {
    category: "General & Purchasing",
    items: [
      {
        q: "Where can I buy Goodwin Batteries?",
        a: "Goodwin Batteries are available through our extensive network of authorized dealers across India. You can use the 'Dealer Locator' on our website to find the nearest authorized Goodwin dealer."
      },
      {
        q: "How do I choose the right battery for my vehicle?",
        a: "You can use our 'Battery Finder' tool on the website by entering your vehicle type, make, model, and year. Alternatively, you can visit any authorized Goodwin dealer who will inspect your vehicle and recommend the perfect fit."
      },
      {
        q: "What is the lifespan of a Goodwin Battery?",
        a: "The lifespan depends on usage, vehicle electrical health, and environmental conditions. Our batteries are engineered with advanced technology to provide maximum life and reliability under standard operating conditions."
      }
    ]
  },
  {
    category: "Warranty & Registration",
    items: [
      {
        q: "How do I register my battery warranty?",
        a: "You can register your warranty online through our 'Warranty Registration' portal. You will need your battery serial number, purchase date, invoice, and dealer details. We highly recommend registering online within 15 days of purchase."
      },
      {
        q: "What does the warranty cover?",
        a: "The warranty covers manufacturing defects in materials and workmanship under normal use. It does not cover damage caused by improper installation, overcharging, undercharging, physical damage, or unauthorized modifications."
      },
      {
        q: "How do I make a warranty claim?",
        a: "You can initiate a claim online through our 'Warranty Claim' page or by visiting the authorized dealer where you purchased the battery. Always carry your original invoice and the physical battery."
      }
    ]
  },
  {
    category: "Maintenance & Care",
    items: [
      {
        q: "Do Goodwin Batteries require maintenance?",
        a: "Many of our automotive batteries are 'Maintenance-Free' or 'Zero Maintenance' (VRLA/SMF), meaning they do not require regular water top-ups. However, regular electrical checks of your vehicle's alternator are recommended."
      },
      {
        q: "How often should I get my battery checked?",
        a: "We recommend a basic battery health check every 6 months, or before long journeys and extreme weather changes (summer/winter). Authorized Goodwin dealers provide battery health check services."
      },
      {
        q: "What should I do if my battery dies completely?",
        a: "If your battery is completely discharged, do not attempt to continuously crank the engine. Have a qualified technician test the battery to determine if it can be safely recharged or if it needs replacement."
      }
    ]
  }
];

export default function FAQPage() {
  const [search, setSearch] = useState("");
  const [openIndex, setOpenIndex] = useState<string | null>("0-0");

  const toggleFAQ = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="flex flex-col w-full min-h-screen pt-20">
      {/* Header */}
      <section className="bg-surface py-20 border-b border-border relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-brand/10 blur-[100px] pointer-events-none" />
        <div className="container relative z-10">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-bold mb-6 tracking-wider uppercase">
            <Link href="/support" className="hover:text-brand transition-colors">Support</Link>
            <ChevronRight size={14} />
            <span className="text-foreground">FAQ</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-foreground mb-6">
            FREQUENTLY ASKED <span className="text-brand">QUESTIONS</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Find answers to common questions about our products, warranties, and maintenance.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-24 bg-background">
        <div className="container max-w-4xl">
          
          <div className="relative mb-12">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for a question..." 
              className="w-full bg-surface border border-border rounded-xl pl-12 pr-4 py-4 text-foreground focus:outline-none focus:border-brand transition-colors"
            />
          </div>

          <div className="space-y-12">
            {faqs.map((category, cIdx) => {
              const filteredItems = category.items.filter(item => 
                item.q.toLowerCase().includes(search.toLowerCase()) || 
                item.a.toLowerCase().includes(search.toLowerCase())
              );

              if (filteredItems.length === 0) return null;

              return (
                <div key={cIdx}>
                  <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <HelpCircle size={24} className="text-brand" /> {category.category}
                  </h2>
                  <div className="space-y-4">
                    {filteredItems.map((item, iIdx) => {
                      const id = `${cIdx}-${iIdx}`;
                      const isOpen = openIndex === id;
                      return (
                        <div key={iIdx} className="bg-surface border border-border rounded-xl overflow-hidden transition-all duration-200">
                          <button 
                            onClick={() => toggleFAQ(id)}
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-surface-hover transition-colors"
                          >
                            <h3 className="font-bold text-foreground pr-8">{item.q}</h3>
                            <ChevronDown size={20} className={clsx("text-muted-foreground transition-transform duration-300 shrink-0", isOpen && "rotate-180")} />
                          </button>
                          <div 
                            className={clsx(
                              "overflow-hidden transition-all duration-300 ease-in-out",
                              isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                            )}
                          >
                            <p className="p-6 pt-0 text-muted-foreground leading-relaxed border-t border-border/50 mt-2">
                              {item.a}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-16 bg-surface-hover border border-border rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">Still have questions?</h3>
            <p className="text-muted-foreground mb-6">Our customer support team is here to help.</p>
            <div className="flex justify-center gap-4">
              <Link href="/contact" className="bg-surface border border-border text-foreground hover:border-brand px-6 py-3 rounded font-bold transition-colors">
                Contact Us
              </Link>
              <Link href={`https://wa.me/91${GOODWIN_CONFIG.whatsapp}`} target="_blank" className="bg-green-500 text-white hover:bg-green-600 px-6 py-3 rounded font-bold transition-colors">
                WhatsApp Support
              </Link>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
