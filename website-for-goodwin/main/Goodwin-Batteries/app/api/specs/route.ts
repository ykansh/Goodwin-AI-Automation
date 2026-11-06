import { NextResponse } from "next/server";
import { getProducts } from "@/lib/data";
import { getVerifiedProductFeed } from "@/lib/product-specs";

export async function GET() {
  const products = await getProducts();
  const feed = getVerifiedProductFeed(products);
  return NextResponse.json(feed, {
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

