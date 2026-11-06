import { Metadata } from "next";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Express Checkout & Doorstep Installation",
  description: "Order Goodwin maintenance-free automotive and inverter batteries online with free doorstep delivery and professional installation.",
};

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col pt-16">
      <CheckoutClient />
    </div>
  );
}
