import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Frequently Asked Questions (FAQ) — Battery Fitment, Warranty & Maintenance | Goodwin Batteries",
  description:
    "Answers to common questions about buying Goodwin batteries, selecting vehicle fitment, registering paperless e-warranty, filing claims, and maintaining Two-Wheeler and Inverter batteries.",
  alternates: {
    canonical: "/support/faq",
  },
};

export default function FaqLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

