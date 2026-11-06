import type { Metadata } from "next";
import { getGlobalSettings, getApplications, getProducts } from "@/lib/data";
import HomePageClient from "@/components/home/HomePageClient";

export const metadata: Metadata = {
  title:
    "Goodwin Batteries | Two-Wheeler (48M), Inverter Tubular (72M), VRLA & Lithium Batteries in India",
  description:
    "Official website of Goodwin Batteries. Explore 30+ BIS-certified Two-Wheeler VRLA (48-month warranty), Tall Tubular Home Inverter & Solar (up to 72-month warranty), SMF/UPS, Agricultural Sprayer, and LiFePO4 Lithium batteries across India.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "Goodwin Batteries | Two-Wheeler (48M), Inverter Tubular (72M), VRLA & Lithium Batteries in India",
    description:
      "Engineered for Indian roads and power conditions. Browse BIS-certified Two-Wheeler, Tall Tubular Inverter (up to 72M warranty), VRLA/SMF, Agricultural Sprayer, and Lithium-Ion batteries.",
    url: "/",
    siteName: "Goodwin Batteries",
    type: "website",
  },
};

export default async function Home() {
  const settings = await getGlobalSettings();
  const applications = await getApplications();
  const products = await getProducts();

  return <HomePageClient applications={applications} products={products} settings={settings} />;
}
