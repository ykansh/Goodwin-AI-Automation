import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { supabase } from "@/lib/supabase";

const CONFIG_FILE = path.join(process.cwd(), "config", "order-notifications.json");

interface WhatsAppOrderConfig {
  whatsappNumber: string;
  countryCode: string;
  enableAlerts: boolean;
  autoOpenNotification: boolean;
  updatedAt: string;
}

const DEFAULT_CONFIG: WhatsAppOrderConfig = {
  whatsappNumber: "9667724411",
  countryCode: "91",
  enableAlerts: true,
  autoOpenNotification: true,
  updatedAt: new Date().toISOString(),
};

function readConfigFile(): WhatsAppOrderConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (err) {
    // Non-blocking in serverless environments
  }
  return DEFAULT_CONFIG;
}

function writeConfigFileSafe(config: WhatsAppOrderConfig): boolean {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
    return true;
  } catch {
    // Read-only filesystem in serverless environments is expected and non-fatal
    return false;
  }
}

export async function GET() {
  try {
    let config = readConfigFile();

    // Fetch live settings from Supabase
    try {
      const { data } = await supabase.from("global_settings").select("whatsapp_main").single();
      if (data?.whatsapp_main) {
        config.whatsappNumber = data.whatsapp_main.replace(/\D/g, "");
      }
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cleanNumber = (body.whatsappNumber || "9667724411").replace(/\D/g, "");

    if (cleanNumber.length < 10) {
      return NextResponse.json({ error: "Please enter a valid 10-digit WhatsApp number." }, { status: 400 });
    }

    const updatedConfig: WhatsAppOrderConfig = {
      whatsappNumber: cleanNumber,
      countryCode: (body.countryCode || "91").replace(/\D/g, ""),
      enableAlerts: body.enableAlerts !== false,
      autoOpenNotification: body.autoOpenNotification !== false,
      updatedAt: new Date().toISOString(),
    };

    // Save to disk if permitted (safe in serverless)
    writeConfigFileSafe(updatedConfig);

    // Sync to Supabase global_settings
    try {
      await supabase
        .from("global_settings")
        .update({
          whatsapp_main: cleanNumber,
          updated_at: new Date().toISOString(),
        })
        .neq("id", "00000000-0000-0000-0000-000000000000");
    } catch (sbErr) {
      console.warn("Could not sync whatsapp_main to global_settings", sbErr);
    }

    return NextResponse.json({ success: true, config: updatedConfig });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save settings" }, { status: 500 });
  }
}
