import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Check Battery Warranty Registration & Claim Status Online | Goodwin Batteries",
  description:
    "Track the real-time status of your Goodwin battery warranty registration or replacement claim using your Claim ID, Serial Number, or registered mobile number.",
  alternates: {
    canonical: "/support/warranty-status",
  },
};

export default function WarrantyStatusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

