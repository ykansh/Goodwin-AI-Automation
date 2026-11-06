import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { 
  Clock, ArrowLeft, ShieldCheck, CheckCircle2, 
  Lightbulb, Share2, Tag, ArrowRight, UserCheck 
} from "lucide-react";
import { BLOG_POSTS, BlogPostItem } from "@/lib/blog-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);
  if (!post) return { title: "Article Not Found | Goodwin Batteries" };

  return {
    title: `${post.title} | Goodwin Batteries Knowledge Hub`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <article className="min-h-screen pt-20 pb-20 bg-white text-slate-900">
      {/* 1. Header / Breadcrumb */}
      <div className="bg-slate-50 border-b border-slate-200 py-10">
        <div className="container max-w-4xl">
          <Link 
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00843D] hover:text-[#006830] transition-colors mb-6"
          >
            <ArrowLeft size={14} /> Back to All Guides & Insights
          </Link>

          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-black uppercase bg-emerald-100 text-[#00843D]">
              {post.category}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <Clock size={13} /> {post.readTime}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              {post.publishDate}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-black text-slate-900 leading-tight uppercase mb-6">
            {post.title}
          </h1>

          <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-3 mt-6 pt-6 border-t border-slate-200">
            <div className="w-10 h-10 rounded-full bg-[#00843D] text-white flex items-center justify-center font-black text-sm">
              {post.author.charAt(0)}
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">{post.author}</div>
              <div className="text-xs text-slate-500">{post.authorRole}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Article Content Container */}
      <div className="container max-w-4xl py-12">
        {/* Featured Image */}
        <div className="relative w-full h-72 sm:h-96 md:h-[420px] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 mb-12 shadow-md">
          <Image 
            src={post.image} 
            alt={post.title} 
            fill 
            priority
            className="object-contain p-8" 
          />
        </div>

        {/* Introduction */}
        <div className="text-lg leading-relaxed text-slate-700 font-medium mb-10 pb-8 border-b border-slate-100">
          {post.content.introduction}
        </div>

        {/* Content Sections */}
        <div className="space-y-12">
          {post.content.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 uppercase">
                {section.heading}
              </h2>
              
              <div className="space-y-4 text-base leading-relaxed text-slate-600">
                {section.body.map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>

              {section.tip && (
                <div className="my-6 p-5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 shadow-xs">
                  <Lightbulb size={22} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-black uppercase tracking-wider text-amber-800 mb-1">
                      Goodwin Engineering Note
                    </div>
                    <div className="text-sm text-amber-900 leading-relaxed font-medium">
                      {section.tip}
                    </div>
                  </div>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Checklist Box */}
        {post.content.checklist && (
          <div className="my-12 p-8 rounded-3xl bg-slate-50 border border-slate-200">
            <h3 className="text-xl font-heading font-black text-slate-900 uppercase mb-4 flex items-center gap-2">
              <CheckCircle2 size={22} className="text-[#00843D]" /> Key Takeaway Checklist
            </h3>
            <ul className="space-y-3">
              {post.content.checklist.map((item, cIdx) => (
                <li key={cIdx} className="flex items-start gap-3 text-sm text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#00843D] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Conclusion */}
        <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 my-10">
          <h4 className="text-base font-black text-[#00843D] uppercase tracking-wide mb-2">Conclusion</h4>
          <p className="text-sm text-slate-800 leading-relaxed">
            {post.content.conclusion}
          </p>
        </div>

        {/* Recommended Product Box */}
        {post.content.recommendedProduct && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50 border border-emerald-300 my-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-sm">
            <div>
              <div className="text-[11px] font-black uppercase tracking-widest text-[#00843D] mb-1">
                Recommended Solution
              </div>
              <h4 className="text-xl font-heading font-black text-slate-900">
                {post.content.recommendedProduct.name}
              </h4>
              <p className="text-xs text-slate-600 mt-1">
                Category: {post.content.recommendedProduct.category} • Warranty: {post.content.recommendedProduct.warranty}
              </p>
            </div>
            <Link
              href={post.content.recommendedProduct.href}
              className="bg-[#00843D] hover:bg-[#006830] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider shrink-0 transition-all shadow-md flex items-center gap-1.5"
            >
              Explore Models <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-6 border-t border-slate-200 my-8">
          <Tag size={16} className="text-slate-400" />
          {post.tags.map(t => (
            <span key={t} className="px-3 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
              #{t}
            </span>
          ))}
        </div>

        {/* Author Bio Card */}
        <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4 my-8">
          <div className="w-14 h-14 rounded-2xl bg-[#00843D] text-white flex items-center justify-center text-xl font-black shrink-0">
            {post.author.charAt(0)}
          </div>
          <div>
            <div className="text-base font-bold text-slate-900">{post.author}</div>
            <div className="text-xs font-semibold text-[#00843D]">{post.authorRole}</div>
            <p className="text-xs text-slate-500 mt-1">
              Part of Goodwin Batteries technical engineering council specializing in electrochemical cell longevity, thermal stability, and field diagnostics across Indian road conditions.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Related Guides Section */}
      <section className="bg-slate-50 border-t border-slate-200 py-16">
        <div className="container max-w-5xl">
          <h3 className="text-2xl font-heading font-black text-slate-900 uppercase mb-8">
            Related Guides & Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedPosts.map((rPost) => (
              <div 
                key={rPost.slug} 
                className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-[#00843D] transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="text-[10px] font-black uppercase text-[#00843D] mb-1.5">
                    {rPost.category}
                  </div>
                  <Link href={`/blogs/${rPost.slug}`}>
                    <h4 className="font-bold text-sm text-slate-900 hover:text-[#00843D] transition-colors line-clamp-2 mb-2">
                      {rPost.title}
                    </h4>
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {rPost.excerpt}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>{rPost.readTime}</span>
                  <Link href={`/blogs/${rPost.slug}`} className="font-bold text-[#00843D] hover:underline flex items-center gap-1">
                    Read &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
