import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Online Battery Warranty Registration — Activate Digital E-Warranty | Goodwin Batteries",
  description:
    "Register your Goodwin battery online using your serial number, purchase invoice, and dealer details to activate paperless digital e-warranty coverage (up to 72 months).",
  alternates: {
    canonical: "/support/warranty-registration",
  },
};

export default function WarrantyRegistrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

