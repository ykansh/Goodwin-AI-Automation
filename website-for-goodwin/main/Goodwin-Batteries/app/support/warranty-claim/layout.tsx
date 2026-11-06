import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Submit a Battery Warranty Claim Online — Inspection & Replacement | Goodwin Batteries",
  description:
    "Initiate a warranty replacement or technical inspection claim online for your Goodwin battery using your serial number or warranty registration ID.",
  alternates: {
    canonical: "/support/warranty-claim",
  },
};

export default function WarrantyClaimLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

