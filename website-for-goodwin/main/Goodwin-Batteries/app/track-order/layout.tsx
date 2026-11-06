import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Track Your Battery Order Live — Dispatch & Delivery Status | Goodwin Batteries",
  description:
    "Track your Goodwin Batteries online order in real time using your Order ID or registered mobile number to check packing progress and delivery dispatch details.",
  alternates: {
    canonical: "/track-order",
  },
};

export default function TrackOrderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

