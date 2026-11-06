"use client";

import { ShieldCheck, FileText, Phone, Search, FileSignature, ArrowRight } from "lucide-react";
import Link from "next/link";
import { GOODWIN_CONFIG } from "@/config/goodwin";

export default function SupportPage() {
  return (
    <div className="flex flex-col w-full min-h-screen pt-20">
      <section className="bg-surface py-20 border-b border-border relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/2 h-full bg-brand/10 blur-[100px] pointer-events-none" />
        <div className="container relative z-10 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold text-foreground mb-6">
            CUSTOMER <span className="text-brand">SUPPORT</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            We&apos;re here to help. Register your warranty, check your claim status, or find answers to common questions. Access our warranty portal, track claims, and find answers.
          </p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container max-w-6xl">
          
          <div className="mb-12">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Warranty Portal</h2>
            <p className="text-muted-foreground">Manage your Goodwin Battery warranty and claims in one place.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* Register */}
            <Link href="/support/warranty-registration" className="bg-surface border border-border p-8 rounded-2xl flex flex-col items-start hover:border-brand transition-colors group relative overflow-hidden shadow-sm hover:shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <FileSignature size={120} />
              </div>
              <div className="bg-brand/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <FileSignature size={28} className="text-brand" />
              </div>
              <h3 className="font-bold text-2xl text-foreground mb-3 relative z-10">Register Warranty</h3>
              <p className="text-sm text-muted-foreground mb-6 relative z-10">Activate your warranty online within 15 days of purchase for hassle-free support.</p>
              <div className="mt-auto flex items-center gap-2 text-brand font-bold text-sm tracking-widest uppercase relative z-10">
                Register Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Claim */}
            <Link href="/support/warranty-claim" className="bg-surface border border-border p-8 rounded-2xl flex flex-col items-start hover:border-brand transition-colors group relative overflow-hidden shadow-sm hover:shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <ShieldCheck size={120} />
              </div>
              <div className="bg-brand/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck size={28} className="text-brand" />
              </div>
              <h3 className="font-bold text-2xl text-foreground mb-3 relative z-10">Submit a Claim</h3>
              <p className="text-sm text-muted-foreground mb-6 relative z-10">Facing an issue? Submit a warranty claim to request an inspection or replacement.</p>
              <div className="mt-auto flex items-center gap-2 text-brand font-bold text-sm tracking-widest uppercase relative z-10">
                Start Claim <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Track */}
            <Link href="/support/warranty-status" className="bg-surface border border-border p-8 rounded-2xl flex flex-col items-start hover:border-brand transition-colors group relative overflow-hidden shadow-sm hover:shadow-xl">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Search size={120} />
              </div>
              <div className="bg-brand/10 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Search size={28} className="text-brand" />
              </div>
              <h3 className="font-bold text-2xl text-foreground mb-3 relative z-10">Track Status</h3>
              <p className="text-sm text-muted-foreground mb-6 relative z-10">Check the real-time status of your warranty registration or an active claim.</p>
              <div className="mt-auto flex items-center gap-2 text-brand font-bold text-sm tracking-widest uppercase relative z-10">
                Track Now <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          <div className="border-t border-border pt-16">
            <h2 className="text-3xl font-heading font-bold text-foreground mb-8">Help & Resources</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link href="/support/faq" className="bg-surface-hover border border-border p-6 rounded-xl flex items-center gap-6 hover:border-brand transition-colors group">
                <div className="bg-background w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border border-border">
                  <FileText size={24} className="text-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-brand transition-colors">FAQs</h3>
                  <p className="text-sm text-muted-foreground">Answers to common questions about selection, installation, and maintenance.</p>
                </div>
              </Link>
              <Link href="/contact" className="bg-surface-hover border border-border p-6 rounded-xl flex items-center gap-6 hover:border-brand transition-colors group">
                <div className="bg-background w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border border-border">
                  <Phone size={24} className="text-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-brand transition-colors">Contact Support</h3>
                  <p className="text-sm text-muted-foreground">Reach out directly to our dedicated customer support team.</p>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </section>
      
      {/* CTA */}
      <section className="py-20 bg-brand text-white text-center">
        <div className="container max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Need Immediate Assistance?</h2>
          <p className="text-lg text-foreground/90 mb-8">Our customer care executives are available on WhatsApp and phone during business hours.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href={`https://wa.me/91${GOODWIN_CONFIG.whatsapp}`} target="_blank" rel="noopener noreferrer" className="bg-white text-foreground px-8 py-4 rounded font-bold uppercase tracking-wider hover:bg-silver/20 transition-colors">
              Chat on WhatsApp
            </a>
            <a href={`tel:+91${GOODWIN_CONFIG.phone}`} className="bg-transparent border-2 border-white text-foreground px-8 py-4 rounded font-bold uppercase tracking-wider hover:bg-white/10 transition-colors">
              Call {GOODWIN_CONFIG.phone}
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
