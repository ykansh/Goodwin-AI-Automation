"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Clock, ArrowRight, Search, ShieldCheck, 
  ExternalLink, Sparkles, BookOpen, ChevronRight, User, Tag 
} from "lucide-react";
import { BlogPostItem } from "@/lib/blog-data";

interface RSSItem {
  title: string;
  link: string;
  pubDate: string;
  contentSnippet?: string;
  guid: string;
}

interface BlogsClientProps {
  initialPosts: BlogPostItem[];
  rssNews: RSSItem[];
}

const CATEGORIES = [
  "All",
  "Automotive",
  "Two-Wheeler",
  "Inverter & Solar",
  "Commercial & Fleet",
  "Battery Care",
  "Live Industry Wire"
] as const;

export default function BlogsClient({ initialPosts, rssNews }: BlogsClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCategory = 
        selectedCategory === "All" || post.category === selectedCategory;
      const matchesSearch = 
        searchQuery.trim() === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, selectedCategory, searchQuery]);

  const featuredPost = initialPosts[0];

  return (
    <div className="w-full">
      {/* 1. Header & Search Banner */}
      <section className="bg-gradient-to-b from-slate-50 via-white to-slate-50 py-16 md:py-20 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-1/3 h-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        <div className="container relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-300 bg-emerald-50 mb-6 shadow-sm">
            <Sparkles size={14} className="text-[#00843D]" />
            <span className="text-[#00843D] text-xs font-black tracking-widest uppercase">
              Goodwin Knowledge & Care Hub
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-black text-slate-900 mb-6 uppercase tracking-tight">
            BATTERY INSIGHTS & <span className="text-[#00843D]">EXPERT GUIDES</span>
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl leading-relaxed mb-8">
            Authored by Goodwin&apos;s electrochemical engineers. Discover professional battery sizing advice, seasonal maintenance checklists, and technology breakdowns engineered for Indian driving and power conditions.
          </p>

          {/* Search Bar */}
          <div className="max-w-xl relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by vehicle, battery type (e.g. Inverter, VRLA, Tractor, Sulfation)..."
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white border border-slate-300 focus:border-[#00843D] focus:ring-2 focus:ring-emerald-500/20 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. Category Filter Navigation Bar */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 py-3 shadow-xs">
        <div className="container">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${
                  selectedCategory === cat
                    ? "bg-[#00843D] text-white shadow-md shadow-emerald-700/20 scale-102"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat}
                {cat === "Live Industry Wire" && (
                  <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] bg-amber-400 text-slate-900 font-black">
                    Live
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container py-12">
        {/* VIEW 1: Live RSS Industry Wire */}
        {selectedCategory === "Live Industry Wire" ? (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-heading font-black text-slate-900 uppercase">
                Real-Time Industry News Wire
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Aggregated live updates from global automotive, lead-acid, and energy storage news feeds.
              </p>
            </div>

            {rssNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rssNews.map((post) => (
                  <a
                    key={post.guid}
                    href={post.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-[#00843D] transition-all p-6 shadow-sm hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-[#00843D] mb-3">
                      <Clock size={14} />
                      <span>{new Date(post.pubDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-[#00843D] transition-colors mb-3 line-clamp-3">
                      {post.title}
                    </h3>
                    {post.contentSnippet && (
                      <p className="text-xs text-slate-600 line-clamp-3 mb-4 leading-relaxed flex-1">
                        {post.contentSnippet}
                      </p>
                    )}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#00843D]">
                      <span>Read Source Article</span>
                      <ExternalLink size={14} />
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-200">
                <p className="text-slate-600">News wire temporarily syncing. Check back shortly.</p>
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: Editorial Articles */
          <div>
            {/* Featured Post Spotlight (only when search is empty and viewing All) */}
            {selectedCategory === "All" && searchQuery === "" && featuredPost && (
              <div className="mb-14">
                <div className="text-xs font-black uppercase tracking-widest text-[#00843D] mb-3 flex items-center gap-1.5">
                  <Sparkles size={14} /> Featured Master Guide
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl hover:border-[#00843D] transition-all group grid grid-cols-1 lg:grid-cols-12">
                  <div className="lg:col-span-7 relative h-72 sm:h-96 lg:h-auto bg-slate-100 p-8 flex items-center justify-center">
                    <Image 
                      src={featuredPost.image} 
                      alt={featuredPost.title} 
                      fill 
                      className="object-contain p-6 group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-4 left-4 bg-emerald-50 text-[#00843D] border border-emerald-200 px-3 py-1 rounded-full text-xs font-black uppercase">
                      {featuredPost.category}
                    </div>
                  </div>

                  <div className="lg:col-span-5 p-8 sm:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 font-medium">
                        <span className="flex items-center gap-1"><Clock size={13} /> {featuredPost.readTime}</span>
                        <span>•</span>
                        <span>{featuredPost.publishDate}</span>
                      </div>
                      <Link href={`/blogs/${featuredPost.slug}`}>
                        <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 group-hover:text-[#00843D] transition-colors leading-tight mb-4">
                          {featuredPost.title}
                        </h2>
                      </Link>
                      <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-6">
                        {featuredPost.tags.map(tag => (
                          <span key={tag} className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#00843D] flex items-center justify-center text-xs font-black">
                          {featuredPost.author.charAt(0)}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-900">{featuredPost.author}</div>
                          <div className="text-[10px] text-slate-500">{featuredPost.authorRole}</div>
                        </div>
                      </div>

                      <Link 
                        href={`/blogs/${featuredPost.slug}`}
                        className="inline-flex items-center gap-1.5 bg-[#00843D] hover:bg-[#006830] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all"
                      >
                        Read Guide <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Articles Grid */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl sm:text-2xl font-heading font-black text-slate-900 uppercase">
                {selectedCategory === "All" ? "All Technical Guides & Articles" : `${selectedCategory} Guides`}
                <span className="ml-2 text-sm font-normal text-slate-500">({filteredPosts.length})</span>
              </h2>
            </div>

            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <article
                    key={post.slug}
                    className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-[#00843D] transition-all flex flex-col group shadow-sm hover:shadow-xl hover:-translate-y-1.5"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-52 bg-slate-50 border-b border-slate-100 p-6 flex items-center justify-center overflow-hidden">
                      <Image 
                        src={post.image} 
                        alt={post.title} 
                        fill 
                        className="object-contain p-4 group-hover:scale-105 transition-transform duration-300" 
                      />
                      <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-[#00843D] border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-black uppercase shadow-xs">
                        {post.category}
                      </div>
                      <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                        <Clock size={11} /> {post.readTime}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="text-[11px] text-slate-500 font-medium mb-2">
                          {post.publishDate}
                        </div>
                        <Link href={`/blogs/${post.slug}`}>
                          <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-[#00843D] transition-colors mb-3 line-clamp-2">
                            {post.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-xs text-slate-500 font-medium truncate max-w-[150px]">
                          By {post.author}
                        </div>
                        <Link 
                          href={`/blogs/${post.slug}`}
                          className="text-xs font-bold text-[#00843D] hover:text-[#006830] flex items-center gap-1 transition-colors"
                        >
                          Read Article <ChevronRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200 p-8">
                <BookOpen size={48} className="mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-bold text-slate-800 mb-2">No guides found matching your search</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                  Try clearing your search terms or selecting another category above.
                </p>
                <button
                  onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                  className="bg-[#00843D] text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-[#006830] transition-colors"
                >
                  View All Guides
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Bottom CTA: Battery Finder & Dealer Locator */}
      <section className="bg-slate-50 border-t border-slate-200 py-16">
        <div className="container max-w-4xl text-center">
          <ShieldCheck size={40} className="text-[#00843D] mx-auto mb-4" />
          <h2 className="text-2xl sm:text-4xl font-heading font-black text-slate-900 uppercase mb-4">
            NEED ADVICE ON THE RIGHT BATTERY?
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mb-8">
            Use our precision Vehicle & Application Finder to match the ideal Goodwin battery model, cold cranking amps, and warranty coverage for your specific needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/battery-finder" 
              className="bg-[#00843D] hover:bg-[#006830] text-white px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              Open Battery Finder
            </Link>
            <Link 
              href="/dealers" 
              className="bg-white hover:bg-slate-100 text-slate-800 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-slate-300 shadow-xs"
            >
              Find Nearest Dealer
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
