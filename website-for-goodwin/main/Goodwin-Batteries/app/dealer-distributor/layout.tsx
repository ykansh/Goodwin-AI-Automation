import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Become an Authorized Goodwin Battery Dealer or Distributor — B2B Partner Enquiry | Goodwin Batteries",
  description:
    "Partner with Goodwin Batteries as an authorized dealer or regional distributor. Enjoy strong trade margins, territory protection, marketing support, and paperless QR warranty settlement.",
  alternates: {
    canonical: "/dealer-distributor",
  },
};

export default function DealerDistributorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

