import { Metadata } from "next";
import UpcomingProductsClient from "./UpcomingProductsClient";

export const metadata: Metadata = {
  title: "Upcoming Innovations & Next-Gen Battery Lineup | Goodwin Batteries",
  description: "Preview upcoming Goodwin batteries: Commercial E-Rickshaw heavy-duty power, VoltMax solar tall tubular, AGM stop-start micro-hybrid, and smart LFP lithium packs.",
};

export default function UpcomingProductsPage() {
  return (
    <main className="min-h-screen pt-16 bg-white text-slate-900">
      <UpcomingProductsClient />
    </main>
  );
}
