import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Contact Goodwin Batteries — Sales, Customer Care & Regional Offices (Delhi & Indore) | Goodwin Batteries",
  description:
    "Get in touch with Goodwin Batteries for product sales, B2B distribution enquiries, warranty support, and technical assistance at our Delhi Head Office and Indore Corporate Office.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

