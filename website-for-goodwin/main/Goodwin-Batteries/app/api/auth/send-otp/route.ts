import { NextResponse } from "next/server";
import { generateAndSaveOtp } from "@/lib/otp-store";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    const cleanPhone = (phone || "").replace(/\D/g, "").slice(-10);

    if (cleanPhone.length !== 10) {
      return NextResponse.json(
        { error: "Please provide a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    const { otp, expiresAt, challengeToken } = generateAndSaveOtp(cleanPhone);

    console.log(`[Goodwin Auth] OTP generated for +91 ${cleanPhone}`);

    const isDev = process.env.NODE_ENV !== "production" || process.env.DEBUG_AUTH === "true";

    const response = NextResponse.json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone}`,
      expiresAt,
      challengeToken,
      // Only include deliveredOtp in development / test environments for preview
      ...(isDev ? { deliveredOtp: otp } : {}),
    });

    // Set secure HttpOnly challenge cookie
    response.cookies.set("goodwin_otp_challenge", challengeToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 300, // 5 minutes
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Error in send-otp route:", error);
    return NextResponse.json(
      { error: "Failed to send OTP. Please try again." },
      { status: 500 }
    );
  }
}
