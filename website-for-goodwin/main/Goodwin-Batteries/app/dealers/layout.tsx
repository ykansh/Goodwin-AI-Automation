import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Find Authorized Goodwin Battery Dealers, Service Centers & Hubs Near You | Goodwin Batteries",
  description:
    "Locate authorized Goodwin Batteries dealers, regional distribution hubs, doorstep fitment partners, and paperless warranty claim centers across Delhi, Mumbai, Indore, Jaipur, and Pan-India.",
  alternates: {
    canonical: "/dealers",
  },
};

export default function DealersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

