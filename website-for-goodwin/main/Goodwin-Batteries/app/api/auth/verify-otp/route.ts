import { NextResponse } from "next/server";
import { verifyCustomerOtp } from "@/lib/otp-store";
import crypto from "crypto";

const SESSION_SECRET = process.env.OTP_SECRET || process.env.NEXT_PUBLIC_SUPABASE_URL || "goodwin_session_signing_secret_2026";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, otp, name, challengeToken: bodyToken } = body;
    const cleanPhone = (phone || "").replace(/\D/g, "").slice(-10);
    const cleanOtp = (otp || "").replace(/\D/g, "").trim();

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: "Please provide a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (!cleanOtp || cleanOtp.length !== 6) {
      return NextResponse.json(
        { error: "Please enter the complete 6-digit OTP code." },
        { status: 400 }
      );
    }

    // Read cookie token if bodyToken wasn't passed
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/goodwin_otp_challenge=([^;]+)/);
    const cookieToken = match ? decodeURIComponent(match[1]) : undefined;
    const effectiveToken = bodyToken || cookieToken;

    const result = verifyCustomerOtp(cleanPhone, cleanOtp, effectiveToken);

    if (!result.valid) {
      return NextResponse.json(
        { error: result.error || "Invalid OTP code entered." },
        { status: 400 }
      );
    }

    // Create cryptographically signed customer session token
    const customerPayload = {
      phone: cleanPhone,
      name: (name || "").trim(),
      authenticatedAt: new Date().toISOString(),
    };

    const sessionPayloadStr = JSON.stringify(customerPayload);
    const sessionHmac = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(sessionPayloadStr)
      .digest("hex");

    const sessionToken = Buffer.from(
      JSON.stringify({ payload: customerPayload, sig: sessionHmac })
    ).toString("base64");

    const response = NextResponse.json({
      success: true,
      message: "Mobile number verified successfully.",
      user: customerPayload,
      sessionToken,
    });

    // Set signed customer session cookie
    response.cookies.set("goodwin_customer_session", sessionToken, {
      httpOnly: false, // Accessible to client-side scripts for UI greeting
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    // Clear the OTP challenge cookie
    response.cookies.delete("goodwin_otp_challenge");

    return response;
  } catch (error: any) {
    console.error("Error in verify-otp route:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP. Please try again." },
      { status: 500 }
    );
  }
}
