import { Metadata } from "next";
import GalleryClient from "./GalleryClient";

export const metadata: Metadata = {
  title: "Manufacturing Plant, Quality Testing Labs & Gallery | Goodwin Batteries",
  description: "Explore the Goodwin Batteries manufacturing facility, automated assembly lines, vibration and CCA testing labs, and automotive fleets across India.",
};

export default function GalleryPage() {
  return (
    <main className="min-h-screen pt-16 bg-white text-slate-900">
      <GalleryClient />
    </main>
  );
}
