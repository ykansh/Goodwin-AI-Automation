"use client";

import { createContext, useContext } from "react";

export interface GlobalSettings {
  id?: string;
  company_name?: string;
  tagline?: string;
  phone_support?: string;
  phone_sales?: string;
  whatsapp_main?: string;
  email_support?: string;
  email_sales?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  google_maps_url?: string;
  facebook_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  hero_image_desktop?: string;
  hero_image_mobile?: string;
  hero_image_alt?: string;
  hero_is_active?: boolean;
}

const GlobalSettingsContext = createContext<GlobalSettings | null>(null);

export function GlobalSettingsProvider({ children, settings }: { children: React.ReactNode, settings: GlobalSettings | null }) {
  return (
    <GlobalSettingsContext.Provider value={settings}>
      {children}
    </GlobalSettingsContext.Provider>
  );
}

export function useGlobalSettings() {
  const context = useContext(GlobalSettingsContext);
  if (context === undefined) {
    throw new Error("useGlobalSettings must be used within a GlobalSettingsProvider");
  }
  return context;
}
