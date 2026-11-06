import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          { success: false, error: "Payment gateway secret is not configured on server." },
          { status: 500 }
        );
      }
      // Non-production test environment fallback
      if (razorpay_payment_id) {
        return NextResponse.json({
          success: true,
          paymentId: razorpay_payment_id,
          verified: true,
          isSandbox: true,
        });
      }
      return NextResponse.json({ success: false, error: "Missing payment transaction ID." }, { status: 400 });
    }

    // In live production with Razorpay secret:
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Incomplete payment verification payload (order_id, payment_id, or signature missing)." },
        { status: 400 }
      );
    }

    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: "Invalid payment signature verification failed." }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      verified: true,
    });
  } catch (error: any) {
    console.error("Razorpay verification error:", error);
    return NextResponse.json({ error: error.message || "Payment verification failed" }, { status: 500 });
  }
}
