import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITEMAP_URLS = [
  "https://www.amaron.com/sitemap.xml?page=1",
  "https://www.amaron.com/sitemap.xml?page=2",
  "https://www.amaron.com/sitemap.xml?page=3",
];

const OUTPUT_FILE = path.join(__dirname, "data", "amaron_raw.json");

interface ScrapedVariant {
  url: string;
  brand_slug: string;
  model_slug: string;
  fuel_slug: string;
  h1_title: string;
  recommended_batteries: string[];
}

async function fetchSitemapUrls(): Promise<string[]> {
  const urls: string[] = [];
  for (const sitemapUrl of SITEMAP_URLS) {
    console.log(`Fetching sitemap: ${sitemapUrl}`);
    const res = await fetch(sitemapUrl);
    const xml = await res.text();
    const $ = cheerio.load(xml, { xmlMode: true });
    
    $("loc").each((_, el) => {
      const url = $(el).text();
      // Only keep leaf nodes for two-wheelers: /battery/two-wheelers/brand/model/fuel
      const match = url.match(/https:\/\/www\.amaron\.com\/battery\/two-wheelers\/([^\/]+)\/([^\/]+)\/([^\/]+)$/);
      if (match) {
        urls.push(url);
      }
    });
  }
  return urls;
}

async function scrapeVariant(url: string): Promise<ScrapedVariant | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Failed to fetch ${url}: ${res.statusText}`);
      return null;
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    
    const h1_title = $("h1").text().replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    
    const recommended_batteries: string[] = [];
    $("th.pro-img div span.bold-font").each((_, el) => {
      recommended_batteries.push($(el).text().trim());
    });
    
    // Fallback if the DOM structure is slightly different
    if (recommended_batteries.length === 0) {
      $("div.proComparisionTable table thead tr th div span").each((_, el) => {
          recommended_batteries.push($(el).text().trim());
      });
    }

    const parts = url.split("/");
    const fuel_slug = parts.pop()!;
    const model_slug = parts.pop()!;
    const brand_slug = parts.pop()!;

    return {
      url,
      brand_slug,
      model_slug,
      fuel_slug,
      h1_title,
      recommended_batteries
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

async function main() {
  const urls = await fetchSitemapUrls();
  console.log(`Found ${urls.length} vehicle variants to scrape.`);
  
  const results: ScrapedVariant[] = [];
  
  // Scrape in batches of 10 to avoid overwhelming the server
  const BATCH_SIZE = 10;
  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE);
    console.log(`Scraping batch ${i / BATCH_SIZE + 1} of ${Math.ceil(urls.length / BATCH_SIZE)}...`);
    
    const promises = batch.map(url => scrapeVariant(url));
    const batchResults = await Promise.all(promises);
    
    for (const result of batchResults) {
      if (result) {
        results.push(result);
      }
    }
  }
  
  fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2));
  console.log(`Successfully scraped ${results.length} variants and saved to ${OUTPUT_FILE}`);
}

main().catch(console.error);
