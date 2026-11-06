import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, orderId, customerName, customerPhone, customerEmail } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid order amount" }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // If real keys are provided, create official Razorpay order
    if (keyId && keySecret) {
      const razorpay = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const options = {
        amount: Math.round(amount * 100), // amount in smallest currency unit (paise)
        currency: "INR",
        receipt: orderId || `rcpt_${Date.now()}`,
        notes: {
          customerName: customerName || "Customer",
          customerPhone: customerPhone || "",
          orderId: orderId || "",
        },
      };

      const rzpOrder = await razorpay.orders.create(options);
      return NextResponse.json({
        success: true,
        orderId: rzpOrder.id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        keyId,
        isLive: true,
      });
    }

    // Test / sandbox fallback if API keys are not in .env yet
    const simulatedOrderId = `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    return NextResponse.json({
      success: true,
      orderId: simulatedOrderId,
      amount: Math.round(amount * 100),
      currency: "INR",
      keyId: keyId || "rzp_test_placeholder",
      isLive: false,
      message: "Razorpay running in test mode (provide RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in .env.local for live transactions)",
    });
  } catch (error: any) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create Razorpay order" }, { status: 500 });
  }
}
