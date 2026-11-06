import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Customer Support, Paperless E-Warranty Registration & Claim Portal | Goodwin Batteries",
  description:
    "Access Goodwin Batteries Customer Support: register your battery e-warranty online within 15 days of purchase, submit a replacement claim, track warranty status, or browse FAQs.",
  alternates: {
    canonical: "/support",
  },
};

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

