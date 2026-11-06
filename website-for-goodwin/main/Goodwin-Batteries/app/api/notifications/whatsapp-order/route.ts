import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { formatINR } from "@/lib/pricing";
import { supabase } from "@/lib/supabase";

const CONFIG_FILE = path.join(process.cwd(), "config", "order-notifications.json");

async function getTargetWhatsAppNumber(): Promise<{ number: string; countryCode: string }> {
  // Check Supabase global_settings first
  try {
    const { data } = await supabase.from("global_settings").select("whatsapp_main").single();
    if (data?.whatsapp_main) {
      return {
        number: data.whatsapp_main.replace(/\D/g, ""),
        countryCode: "91",
      };
    }
  } catch {
    // fallback
  }

  // Fallback to local file if available
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
      return {
        number: (data.whatsappNumber || "9667724411").replace(/\D/g, ""),
        countryCode: (data.countryCode || "91").replace(/\D/g, ""),
      };
    }
  } catch {
    // fallback
  }
  return { number: "9667724411", countryCode: "91" };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order, isTest } = body;

    const { number, countryCode } = await getTargetWhatsAppNumber();
    const fullRecipient = `${countryCode}${number}`;

    if (isTest) {
      const testMsg = 
        `🔔 *GOODWIN BATTERIES - TEST ORDER ALERT*\n\n` +
        `✅ Your WhatsApp notification system is *Active and Connected*.\n` +
        `📱 Configured WhatsApp Number: +${countryCode} ${number}\n` +
        `📦 Sample Order ID: GW-ORD-TEST-101\n` +
        `💰 Sample Amount: ₹4,299 (Paid Online)\n` +
        `📍 Test Location: Delhi NCR - 201301\n\n` +
        `Whenever a customer completes an online purchase on your website, you will instantly receive full order & customer details here! 🚀`;

      const whatsappUrl = `https://wa.me/${fullRecipient}?text=${encodeURIComponent(testMsg)}`;
      return NextResponse.json({
        success: true,
        isTest: true,
        targetNumber: `+${countryCode} ${number}`,
        whatsappUrl,
        message: testMsg,
      });
    }

    if (!order || !order.id) {
      return NextResponse.json({ error: "Missing order information" }, { status: 400 });
    }

    const itemsSummary = (order.items || [])
      .map((it: any) => `• ${it.name} (Qty: ${it.quantity}) - ${formatINR(it.price * it.quantity)}`)
      .join("\n");

    const orderMsg = 
      `🚨 *NEW ONLINE ORDER RECEIVED - GOODWIN BATTERIES* 🚨\n\n` +
      `📦 *Order ID:* ${order.id}\n` +
      `💰 *Total Amount:* ${formatINR(order.totalAmount)} (PAID ONLINE)\n` +
      `💳 *Payment Status:* ${order.paymentStatus || "Paid"} (${order.transactionId || "Razorpay"})\n\n` +
      `👤 *Customer Name:* ${order.customerName}\n` +
      `📞 *Customer Mobile:* ${order.phone}\n` +
      (order.email ? `✉️ *Email:* ${order.email}\n` : "") +
      `📍 *Delivery Address:* ${order.address}, ${order.city} - ${order.pincode}\n` +
      (order.landmark ? `🏢 *Landmark:* ${order.landmark}\n` : "") +
      `⏰ *Delivery Slot:* ${order.deliverySlot?.replace(/-/g, " ")}\n` +
      `🚗 *Vehicle / Model:* ${order.vehicleDetails || "Standard"}\n\n` +
      `🛒 *Batteries Ordered:*\n${itemsSummary}\n\n` +
      `📦 *Next Steps:* Dispatch sealed battery for doorstep delivery (Fitment by customer).\n` +
      `🕒 *Order Time:* ${new Date(order.createdAt || Date.now()).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`;

    const whatsappUrl = `https://wa.me/${fullRecipient}?text=${encodeURIComponent(orderMsg)}`;

    return NextResponse.json({
      success: true,
      targetNumber: `+${countryCode} ${number}`,
      whatsappUrl,
      message: orderMsg,
    });
  } catch (err: any) {
    console.error("WhatsApp notification dispatch error:", err);
    return NextResponse.json({ error: err.message || "Failed to format WhatsApp notification" }, { status: 500 });
  }
}
