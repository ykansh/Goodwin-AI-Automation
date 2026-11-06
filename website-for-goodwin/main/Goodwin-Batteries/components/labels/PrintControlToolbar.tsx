"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Printer, Settings2, Sliders, Info, Check, RotateCcw } from "lucide-react";
import { PRINTER_CONFIG, THERMAL_FONT_PRESETS, VERTICAL_OFFSET_OPTIONS } from "@/lib/printer-config";

export interface PrintSettings {
  logoFont: string;
  bodyFont: string;
  serialFont: string;
  letterSpacing: string;
  printerModel: string;
  showBarcode?: boolean;
  verticalOffset?: number;
}

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {
  logoFont: THERMAL_FONT_PRESETS.logoFonts[0].value,
  bodyFont: THERMAL_FONT_PRESETS.bodyFonts[0].value,
  serialFont: THERMAL_FONT_PRESETS.serialFonts[0].value,
  letterSpacing: THERMAL_FONT_PRESETS.trackingOptions[0].value,
  printerModel: PRINTER_CONFIG.PRINTER_MODEL,
  showBarcode: false, // Default is Max QR Hero layout (requested by user)
  verticalOffset: 0, // Default 0mm (uses calibrated 1.4mm safe insets)
};

interface PrintControlToolbarProps {
  backHref: string;
  title: string;
  labelCount: number;
  settings: PrintSettings;
  onSettingsChange: (settings: PrintSettings) => void;
  onPrintAll: () => void;
  onPrintTest: () => void;
  onExportLsdx?: () => void;
  isOnlyTestLabel?: boolean;
  onToggleTestMode?: () => void;
}

export default function PrintControlToolbar({
  backHref,
  title,
  labelCount,
  settings,
  onSettingsChange,
  onPrintAll,
  onPrintTest,
  onExportLsdx,
  isOnlyTestLabel,
  onToggleTestMode
}: PrintControlToolbarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateSetting = <K extends keyof PrintSettings>(key: K, value: PrintSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onSettingsChange(updated);
    try {
      localStorage.setItem("goodwin_thermal_print_settings", JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  const handleReset = () => {
    onSettingsChange(DEFAULT_PRINT_SETTINGS);
    try {
      localStorage.removeItem("goodwin_thermal_print_settings");
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="print:hidden bg-surface border-b border-border sticky top-0 z-50 shadow-md">
      {/* Primary Bar */}
      <div className="p-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href={backHref} 
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm font-semibold transition-colors"
          >
            <ArrowLeft size={16} /> Back
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <h1 className="text-lg font-bold text-foreground truncate max-w-xs md:max-w-md">
            {title}
          </h1>
          <span className="bg-brand/10 text-brand text-xs px-2.5 py-1 rounded-full font-bold">
            {labelCount} {labelCount === 1 ? 'Label' : 'Labels'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 text-xs bg-blue-500/10 text-blue-500 px-3 py-1.5 rounded-lg border border-blue-500/20 font-medium">
            <Info size={14} />
            <span>Profile:</span> <strong>{settings.printerModel}</strong> (38x25mm)
          </div>

          <button
            type="button"
            onClick={() => updateSetting("showBarcode", !settings.showBarcode)}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
              !settings.showBarcode 
                ? 'bg-emerald-50 text-[#00843D] border-emerald-300 shadow-2xs' 
                : 'bg-background hover:bg-border text-foreground border-border'
            }`}
            title="Switch between Max QR Hero layout and QR + Barcode layout"
          >
            <span>Layout:</span>
            <strong>{!settings.showBarcode ? "Max QR Hero" : "With Barcode"}</strong>
          </button>

          {/* Quick Hardware Feed Nudge Selector */}
          <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2.5 py-1.5 shadow-2xs" title="Nudge content up or down to compensate for printer feed drift">
            <span className="text-[11px] font-bold text-muted-foreground whitespace-nowrap">Nudge:</span>
            <select
              value={settings.verticalOffset ?? 0}
              onChange={(e) => updateSetting("verticalOffset", parseFloat(e.target.value))}
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
            >
              {VERTICAL_OFFSET_OPTIONS.map((o) => (
                <option key={o.id} value={o.value}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition-all ${
              showAdvanced 
                ? 'bg-brand text-white border-brand shadow-sm' 
                : 'bg-background hover:bg-border text-foreground border-border'
            }`}
          >
            <Sliders size={14} />
            DC Code Thermal Settings
          </button>

          {onExportLsdx && (
            <button 
              type="button"
              onClick={onExportLsdx}
              className="bg-background border border-border text-foreground px-3 py-2 rounded-lg text-xs font-bold hover:bg-border transition-colors"
            >
              Export .lsdx
            </button>
          )}

          <button 
            type="button"
            onClick={onPrintTest}
            className="bg-background border border-border text-foreground px-4 py-2 rounded-lg text-xs font-bold hover:bg-border transition-colors flex items-center gap-1.5"
            title="Prints only 1 sample label to verify clarity with DC Code printer"
          >
            <Printer size={14} />
            Test 1 Label
          </button>

          <button 
            type="button"
            onClick={onPrintAll}
            className="bg-brand hover:bg-brand-dark text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 shadow-lg shadow-brand/20 transition-all"
          >
            <Printer size={15} />
            Print All ({labelCount})
          </button>
        </div>
      </div>

      {/* Advanced DC Code Font & Thermal Optimization Panel */}
      {showAdvanced && (
        <div className="px-4 pb-4 pt-2 border-t border-border bg-background/80 backdrop-blur-sm animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand flex items-center gap-1.5">
                <Settings2 size={13} /> DC Code / DCode Thermal Printing Fine-Tuning
              </span>
              <span className="text-[11px] text-muted-foreground hidden md:inline">
                (Changes update live on the preview below and apply directly to the printhead)
              </span>
            </div>
            <button 
              type="button"
              onClick={handleReset}
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <RotateCcw size={12} /> Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Logo Font */}
            <div>
              <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                1. Logo Font (Header)
              </label>
              <select
                value={settings.logoFont}
                onChange={(e) => updateSetting("logoFont", e.target.value)}
                className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:border-brand focus:outline-none"
              >
                {THERMAL_FONT_PRESETS.logoFonts.map((f) => (
                  <option key={f.id} value={f.value}>
                    {f.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">
                Bold, heavy strokes prevent thermal dropouts.
              </p>
            </div>

            {/* Body & Bottom Text Font */}
            <div>
              <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                2. Bottom Text & Body Font
              </label>
              <select
                value={settings.bodyFont}
                onChange={(e) => updateSetting("bodyFont", e.target.value)}
                className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:border-brand focus:outline-none"
              >
                {THERMAL_FONT_PRESETS.bodyFonts.map((f) => (
                  <option key={f.id} value={f.value}>
                    {f.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">
                Wide counters and uniform stems stop blur.
              </p>
            </div>

            {/* Serial Number Font */}
            <div>
              <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                3. Serial Number Font
              </label>
              <select
                value={settings.serialFont}
                onChange={(e) => updateSetting("serialFont", e.target.value)}
                className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:border-brand focus:outline-none"
              >
                {THERMAL_FONT_PRESETS.serialFonts.map((f) => (
                  <option key={f.id} value={f.value}>
                    {f.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">
                Monospaced digits ensure zero character collision.
              </p>
            </div>

            {/* Letter Spacing (Anti-Bleed) */}
            <div>
              <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                4. Letter Spacing (Anti-Bleed)
              </label>
              <select
                value={settings.letterSpacing}
                onChange={(e) => updateSetting("letterSpacing", e.target.value)}
                className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:border-brand focus:outline-none"
              >
                {THERMAL_FONT_PRESETS.trackingOptions.map((t) => (
                  <option key={t.id} value={t.value}>
                    {t.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">
                Adds spacing so heated thermal ink doesn't fuse letters.
              </p>
            </div>

            {/* Vertical Alignment / Hardware Feed Nudge */}
            <div>
              <label className="block text-[11px] font-bold text-foreground mb-1 uppercase tracking-wider">
                5. Hardware Feed Nudge (Top/Down)
              </label>
              <select
                value={settings.verticalOffset ?? 0}
                onChange={(e) => updateSetting("verticalOffset", parseFloat(e.target.value))}
                className="w-full bg-surface border border-border rounded-md px-2.5 py-1.5 text-xs text-foreground focus:border-brand focus:outline-none"
              >
                {VERTICAL_OFFSET_OPTIONS.map((o) => (
                  <option key={o.id} value={o.value}>
                    {o.name}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted-foreground mt-1">
                Nudges content down if printer cuts off top header, or up if bottom clips.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
