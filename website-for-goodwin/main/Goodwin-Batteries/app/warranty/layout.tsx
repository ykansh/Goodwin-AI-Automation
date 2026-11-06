import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Instant Battery E-Warranty Status Check & Authenticity Verification | Goodwin Batteries",
  description:
    "Verify genuine Goodwin battery authenticity, activation date, and remaining free-replacement or pro-rata warranty coverage online using your battery serial number.",
  alternates: {
    canonical: "/warranty",
  },
};

export default function WarrantyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

