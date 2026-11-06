import { getGlobalSettings, getApplications, getProducts } from "@/lib/data";
import HomePageClient from "@/components/home/HomePageClient";

export default async function Home() {
  const settings = await getGlobalSettings();
  const applications = await getApplications();
  const products = await getProducts();

  return <HomePageClient applications={applications} products={products} settings={settings} />;
}
