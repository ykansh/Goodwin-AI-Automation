"use client";

import { ShieldCheck, Zap, Users, Globe, MapPin, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="flex flex-col w-full min-h-screen pt-20">
      
      {/* 1. Hero & Who We Are */}
      <section className="relative w-full h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden bg-surface">
        <div className="absolute inset-0 z-0">
          <Image 
            src="/assets/about/about-hero.jpg" 
            alt="Goodwin Batteries Premium Automotive Battery" 
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-surface/90 via-surface/80 to-surface/20 z-10" />
        </div>

        <div className="container relative z-20 flex flex-col items-start pt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-white/50 backdrop-blur-md mb-6">
              <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
              <span className="text-foreground text-xs font-bold tracking-widest uppercase">Who We Are</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-bold text-foreground leading-[1.1] tracking-tight mb-6 uppercase">
              DRIVING POWER, <span className="text-brand">DELIVERING TRUST.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl leading-relaxed">
              We are committed to providing robust, technologically advanced, and long-lasting energy storage solutions that empower Indian industries, vehicles, and everyday lives.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. Our Story / YouTube Video */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="flex flex-col gap-6 order-2 lg:order-1">
              <span className="text-brand font-bold uppercase tracking-widest text-sm">Our Story</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                Power is the backbone of progress
              </h2>
              <div className="prose prose-lg text-muted-foreground">
                <p>
                  At Goodwin Batteries, we believe that reliable power is essential for a moving world. Founded with a clear vision to provide dependable, long-lasting battery solutions, we have grown into a trusted name in the automotive power industry. 
                </p>
                <p>
                  From the beginning, our mission has been simple — to offer premium quality battery products engineered specifically for Indian conditions, backed by excellent service and expert support. 
                </p>
                <p>
                  What truly sets us apart is our customer-first approach. We don&apos;t just sell batteries; we provide peace of mind on the road. From helping you select the right fitment to offering nationwide network support, our team is committed to making your journey smooth and hassle-free.
                </p>
              </div>
            </div>

            <div className="order-1 lg:order-2 w-full">
              <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-border bg-surface">
                <iframe 
                  className="absolute inset-0 w-full h-full"
                  src="https://www.youtube.com/embed/1V8bok8jTW4?si=_CsXpuKTjEQSErLT&rel=0" 
                  title="Meet Goodwin Batteries" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. What We Stand For (Mission & Vision) */}
      <section className="py-24 bg-surface border-y border-border">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-background border border-border p-10 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap size={120} className="text-brand" />
              </div>
              <span className="text-brand font-bold uppercase tracking-widest text-sm block mb-4 relative z-10">Our Mission</span>
              <h3 className="text-2xl font-heading font-bold text-foreground mb-4 relative z-10">Moving Forward</h3>
              <p className="text-muted-foreground leading-relaxed text-lg relative z-10">
                To deliver powerful, safe, and eco-friendly battery solutions that keep people, vehicles, and businesses moving forward with complete confidence.
              </p>
            </div>

            <div className="bg-background border border-border p-10 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Globe size={120} className="text-brand" />
              </div>
              <span className="text-brand font-bold uppercase tracking-widest text-sm block mb-4 relative z-10">Our Vision</span>
              <h3 className="text-2xl font-heading font-bold text-foreground mb-4 relative z-10">A Trusted Name</h3>
              <p className="text-muted-foreground leading-relaxed text-lg relative z-10">
                To be a leading name in the Indian automotive battery industry known for uncompromising quality, innovation, and an extensive nationwide network of trust.
              </p>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/vision"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand/10 text-brand font-bold text-xs uppercase tracking-wider hover:bg-brand hover:text-white transition-all shadow-xs"
            >
              Explore Our Complete Vision 2030 Roadmap & 5 Core Pillars →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Why Goodwin */}
      <section className="py-24 bg-background">
        <div className="container max-w-5xl">
          <div className="text-center mb-16">
            <span className="text-brand font-bold uppercase tracking-widest text-sm block mb-4">Why Goodwin</span>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">Engineered for Excellence</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={32} />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-3">Uncompromising Quality</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Every battery undergoes rigorous testing to ensure it meets strict standards for durability, vibration resistance, and extreme temperatures.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6">
                <Users size={32} />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-3">Customer First</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                From finding the right fitment to robust after-sales support and warranty registration, our dedicated team is always ready to assist.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mb-6">
                <Zap size={32} />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-3">Continuous Innovation</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We invest in advanced lead-acid and lithium technologies to ensure our batteries deliver higher cranking power and longer life cycles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Leadership Team */}
      <section className="py-24 bg-surface border-y border-border">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">Leadership Team</h2>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="bg-background rounded-2xl border border-border shadow-lg overflow-hidden flex flex-col md:flex-row group">
              <div className="w-full md:w-2/5 relative aspect-square md:aspect-auto">
                <Image 
                  src="/assets/about/leadership-placeholder.jpg" 
                  alt="Aman Rajarwal - Leadership Team" 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="w-full md:w-3/5 p-10 md:p-12 flex flex-col justify-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold tracking-widest uppercase w-fit mb-6">
                  Leadership
                </div>
                <h3 className="text-3xl font-heading font-bold text-foreground mb-2">Aman Rajarwal</h3>
                <p className="text-brand font-semibold text-lg mb-6">Leadership Team</p>
                <p className="text-muted-foreground leading-relaxed mb-8">
                  Under strong leadership, Goodwin Batteries has continuously pushed the boundaries of power storage technology. Our focus remains steadfast on delivering uncompromised quality, building long-lasting relationships with our dealer network, and ensuring every customer has a reliable power source for their journey.
                </p>
                <div className="flex gap-4">
                  <a href="mailto:info@goodwinbatteries.com" className="text-sm font-bold uppercase tracking-wider text-foreground hover:text-brand transition-colors flex items-center gap-2">
                    Contact <ArrowRight size={16} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Network / Reach */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-xl border border-border">
              <Image 
                src="/assets/about/about-network.jpg" 
                alt="Goodwin Nationwide Logistics and Dealer Network" 
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex flex-col gap-6">
              <span className="text-brand font-bold uppercase tracking-widest text-sm">Our Network</span>
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
                Nationwide Support
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-4">
                A great battery requires a great support system. Our extensive network of verified dealers and distributors ensures that wherever you are, a Goodwin Battery is never far away. 
              </p>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <MapPin size={14} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Widespread Availability</h4>
                    <p className="text-sm text-muted-foreground">Easily find authorized dealers in your local area.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-brand/10 text-brand flex items-center justify-center shrink-0">
                    <ShieldCheck size={14} />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Authorized Service</h4>
                    <p className="text-sm text-muted-foreground">Professional installation and warranty claim assistance.</p>
                  </div>
                </li>
              </ul>

              <div className="mt-6">
                <Link href="/dealer-distributor" className="inline-flex items-center gap-2 bg-transparent border-2 border-brand text-brand px-6 py-3 rounded font-bold uppercase tracking-wider hover:bg-brand hover:text-white transition-all">
                  Find a Dealer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Call to Action */}
      <section className="py-20 bg-brand text-white text-center">
        <div className="container max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">Ready to Experience Reliable Power?</h2>
          <p className="text-brand-light mb-10 text-lg">
            Use our intelligent Battery Finder to discover the perfect fitment for your vehicle today.
          </p>
          <Link href="/#battery-finder" className="inline-flex items-center gap-2 bg-white text-brand px-8 py-4 rounded font-bold uppercase tracking-wider hover:bg-gray-100 transition-colors shadow-xl shadow-black/10">
            Find Your Battery <ArrowRight size={18} />
          </Link>
        </div>
      </section>

    </div>
  );
}
