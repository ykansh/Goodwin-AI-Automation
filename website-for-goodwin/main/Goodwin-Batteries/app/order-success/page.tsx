import { Suspense } from "react";
import { Metadata } from "next";
import OrderSuccessClient from "@/components/checkout/OrderSuccessClient";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Order Placed Successfully | Goodwin",
  description: "Your Goodwin battery order has been confirmed. Factory-sealed battery scheduled for safe doorstep delivery.",
};

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col pt-16">
      <Suspense fallback={
        <div className="flex-1 flex items-center justify-center p-8">
          <Loader2 className="animate-spin text-[#00843D]" size={36} />
        </div>
      }>
        <OrderSuccessClient />
      </Suspense>
    </div>
  );
}

