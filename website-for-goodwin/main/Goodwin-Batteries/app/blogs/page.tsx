import Parser from "rss-parser";
import { Metadata } from "next";
import BlogsClient from "./BlogsClient";
import { BLOG_POSTS } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Battery Insights, Maintenance Guides & Technical Care | Goodwin Batteries",
  description: "Expert advice on automotive, two-wheeler, inverter, and solar battery selection and maintenance from Goodwin Batteries engineering team.",
};

export const revalidate = 3600; // Revalidate every hour

async function getBatteryNews() {
  try {
    const parser = new Parser({
      timeout: 5000,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GoodwinBatteriesBot/1.0)' }
    });
    const feed = await parser.parseURL(
      'https://news.google.com/rss/search?q=inverter+battery+OR+"lead-acid+battery"+OR+"automotive+battery"&hl=en-IN&gl=IN&ceid=IN:en'
    );
    
    return (feed.items || []).slice(0, 15).map(item => ({
      title: item.title || 'Battery Industry News',
      link: item.link || '#',
      pubDate: item.pubDate || new Date().toISOString(),
      contentSnippet: item.contentSnippet,
      guid: item.guid || item.link || Math.random().toString(),
    }));
  } catch (error) {
    console.warn("RSS feed fetch failed, falling back to empty feed:", error);
    return [];
  }
}

export default async function BlogsPage() {
  const news = await getBatteryNews();

  return (
    <main className="min-h-screen pt-16 bg-white text-slate-900">
      <BlogsClient initialPosts={BLOG_POSTS} rssNews={news} />
    </main>
  );
}
