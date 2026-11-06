import crypto from "crypto";

interface OtpEntry {
  otp: string;
  expiresAt: number;
  attempts: number;
}

const globalForOtp = globalThis as unknown as {
  goodwinOtpStore?: Map<string, OtpEntry>;
};

const otpStore: Map<string, OtpEntry> = globalForOtp.goodwinOtpStore || new Map();
if (process.env.NODE_ENV !== "production") {
  globalForOtp.goodwinOtpStore = otpStore;
}

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_ATTEMPTS = 5;
const OTP_SECRET = process.env.OTP_SECRET || process.env.NEXT_PUBLIC_SUPABASE_URL || "goodwin_secure_otp_signing_secret_2026";

/**
 * Generate cryptographically random 6-digit OTP
 */
export function generateAndSaveOtp(phone: string): { otp: string; expiresAt: number; challengeToken: string } {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);

  // Generate 6-digit cryptographically random integer
  const otp = crypto.randomInt(100000, 1000000).toString();
  const expiresAt = Date.now() + OTP_EXPIRY_MS;

  // In-memory record (dev/single-node support)
  otpStore.set(cleanPhone, {
    otp,
    expiresAt,
    attempts: 0,
  });

  // Serverless stateless HMAC signature (survives cold starts and multi-instances)
  const hmac = crypto
    .createHmac("sha256", OTP_SECRET)
    .update(`${cleanPhone}:${otp}:${expiresAt}`)
    .digest("hex");

  const challengeToken = Buffer.from(
    JSON.stringify({ phone: cleanPhone, expiresAt, hmac })
  ).toString("base64");

  return { otp, expiresAt, challengeToken };
}

/**
 * Verify customer OTP using both stateless token challenge and in-memory fallback
 */
export function verifyCustomerOtp(
  phone: string,
  enteredOtp: string,
  challengeToken?: string
): { valid: boolean; error?: string } {
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  const cleanEnteredOtp = enteredOtp.trim();

  // 1. Try stateless cryptographic token verification first (serverless-proof)
  if (challengeToken) {
    try {
      const decoded = JSON.parse(Buffer.from(challengeToken, "base64").toString("utf-8"));
      if (decoded.phone === cleanPhone) {
        if (Date.now() > decoded.expiresAt) {
          return { valid: false, error: "OTP has expired. Please click Resend OTP for a fresh code." };
        }

        const expectedHmac = crypto
          .createHmac("sha256", OTP_SECRET)
          .update(`${cleanPhone}:${cleanEnteredOtp}:${decoded.expiresAt}`)
          .digest("hex");

        if (crypto.timingSafeEqual(Buffer.from(expectedHmac), Buffer.from(decoded.hmac))) {
          // Clear any in-memory entry
          otpStore.delete(cleanPhone);
          return { valid: true };
        }
      }
    } catch {
      // fallback to in-memory check
    }
  }

  // 2. Fallback to in-memory store
  const entry = otpStore.get(cleanPhone);
  if (!entry) {
    return { valid: false, error: "No active verification session found. Please request a new OTP code." };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(cleanPhone);
    return { valid: false, error: "OTP has expired. Please click Resend OTP for a fresh code." };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    otpStore.delete(cleanPhone);
    return { valid: false, error: "Too many failed attempts. Please request a new OTP." };
  }

  entry.attempts += 1;

  if (entry.otp.trim() !== cleanEnteredOtp) {
    const remaining = MAX_ATTEMPTS - entry.attempts;
    return {
      valid: false,
      error: `Invalid OTP code. Please enter the correct 6-digit code (${remaining} attempt${remaining === 1 ? "" : "s"} remaining).`,
    };
  }

  otpStore.delete(cleanPhone);
  return { valid: true };
}
