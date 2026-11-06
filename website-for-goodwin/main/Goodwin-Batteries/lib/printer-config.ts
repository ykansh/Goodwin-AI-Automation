export const PRINTER_CONFIG = {
  LABEL_WIDTH_MM: 38,
  LABEL_HEIGHT_MM: 25,
  PRINTER_MODEL: "DCode DC 421 / 423 & TSC TE244",
  SUPPORTED_PRINTERS: [
    { id: "tsc", name: "TSC TE244 (203 DPI)", model: "TSC TE244" },
    { id: "dcode", name: "DCode DC 421 / 423 (203 DPI)", model: "DCode DC 421 / 423" },
    { id: "zebra", name: "Zebra ZD / ZT Series (203 DPI)", model: "Zebra ZD / ZT" },
  ]
};

export const THERMAL_FONT_PRESETS = {
  logoFonts: [
    { id: "arial", name: "Arial Bold (Highest Thermal Sharpness - Recommended)", value: "Arial, Helvetica, sans-serif" },
    { id: "tahoma", name: "Tahoma Bold (Ultra Clean)", value: "Tahoma, Verdana, sans-serif" },
    { id: "trebuchet", name: "Trebuchet MS Bold", value: "'Trebuchet MS', sans-serif" },
  ],
  bodyFonts: [
    { id: "arial", name: "Arial Bold (Crisp & High Contrast - Recommended)", value: "Arial, Helvetica, sans-serif" },
    { id: "tahoma", name: "Tahoma (Spacious)", value: "Tahoma, Verdana, sans-serif" },
    { id: "consolas", name: "Consolas Monospace", value: "Consolas, 'Courier New', monospace" },
  ],
  serialFonts: [
    { id: "consolas", name: "Consolas Monospace (Crisp Digits - Recommended)", value: "Consolas, 'Courier New', monospace" },
    { id: "arial", name: "Arial Bold", value: "Arial, Helvetica, sans-serif" },
    { id: "courier", name: "Courier New", value: "'Courier New', Courier, monospace" },
  ],
  trackingOptions: [
    { id: "standard", name: "Standard (0px - Crisp Non-Bleeding)", value: "0px" },
    { id: "anti-bleed", name: "Anti-Bleed (+0.1px)", value: "0.1px" },
    { id: "wide", name: "Wide (+0.3px)", value: "0.3px" },
  ]
};

export const VERTICAL_OFFSET_OPTIONS = [
  { id: "up-1.5", name: "-1.5mm (Shift Up)", value: -1.5 },
  { id: "up-1.0", name: "-1.0mm (Shift Up)", value: -1.0 },
  { id: "up-0.5", name: "-0.5mm (Shift Up)", value: -0.5 },
  { id: "center", name: "0mm (Centered - Safe Insets)", value: 0 },
  { id: "down-0.5", name: "+0.5mm (Nudge Down)", value: 0.5 },
  { id: "down-1.0", name: "+1.0mm (Nudge Down)", value: 1.0 },
  { id: "down-1.5", name: "+1.5mm (Nudge Down)", value: 1.5 },
  { id: "down-2.0", name: "+2.0mm (Nudge Down)", value: 2.0 },
];

export const getPrintCss = (verticalOffset = 0) => {
  const baseTop = 5.2;
  const baseBottom = 1.4;
  const topPad = Math.max(0.5, baseTop + verticalOffset).toFixed(1);
  const bottomPad = Math.max(0.5, baseBottom - verticalOffset).toFixed(1);

  return `
  @page {
    size: ${PRINTER_CONFIG.LABEL_WIDTH_MM}mm ${PRINTER_CONFIG.LABEL_HEIGHT_MM}mm;
    margin: 0;
  }
  @media print {
    *, *:before, *:after {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      box-sizing: border-box !important;
      outline: 0 none transparent !important;
      box-shadow: none !important;
      text-decoration: none !important;
    }
    html, body {
      width: ${PRINTER_CONFIG.LABEL_WIDTH_MM}mm !important;
      height: auto !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
      -webkit-font-smoothing: none !important;
      -moz-osx-font-smoothing: unset !important;
      text-rendering: optimizeSpeed !important;
      image-rendering: pixelated !important;
    }
    .print\\:hidden, nav, header, footer, .sidebar, aside {
      display: none !important;
    }
    .print-page-wrapper {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      width: ${PRINTER_CONFIG.LABEL_WIDTH_MM}mm !important;
      height: auto !important;
      border: 0 none transparent !important;
    }
    .print-labels-container {
      display: block !important;
      margin: 0 !important;
      padding: 0 !important;
      gap: 0 !important;
      width: ${PRINTER_CONFIG.LABEL_WIDTH_MM}mm !important;
      height: auto !important;
      border: 0 none transparent !important;
    }
    .print-label-item {
      display: block !important;
      width: ${PRINTER_CONFIG.LABEL_WIDTH_MM}mm !important;
      height: ${PRINTER_CONFIG.LABEL_HEIGHT_MM}mm !important;
      max-height: ${PRINTER_CONFIG.LABEL_HEIGHT_MM}mm !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 none transparent !important;
      border-width: 0 !important;
      border-style: none !important;
      outline: 0 none transparent !important;
      box-shadow: none !important;
      page-break-after: always !important;
      break-after: page !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      overflow: hidden !important;
    }
    .print-label-item:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
    }
    .label-container {
      width: ${PRINTER_CONFIG.LABEL_WIDTH_MM}mm !important;
      height: ${PRINTER_CONFIG.LABEL_HEIGHT_MM}mm !important;
      max-height: ${PRINTER_CONFIG.LABEL_HEIGHT_MM}mm !important;
      margin: 0 !important;
      padding: ${topPad}mm 1.2mm ${bottomPad}mm 1.2mm !important;
      box-sizing: border-box !important;
      display: flex !important;
      flex-direction: column !important;
      justify-content: space-between !important;
      overflow: hidden !important;
      background: #ffffff !important;
      color: #000000 !important;
      position: relative !important;
      border: 0 none transparent !important;
      border-width: 0 !important;
      border-style: none !important;
      outline: 0 none transparent !important;
      box-shadow: none !important;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
      -webkit-font-smoothing: none !important;
      text-rendering: optimizeSpeed !important;
    }
    .label-container *:not(.label-badge-invert):not(.label-badge-invert *) {
      color: #000000 !important;
      -webkit-font-smoothing: none !important;
      text-rendering: optimizeSpeed !important;
    }
    .label-badge-invert, .label-badge-invert * {
      background-color: #000000 !important;
      color: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .label-warranty-badge {
      border: 0.38mm solid #000000 !important;
      border-radius: 0.4mm !important;
      box-sizing: border-box !important;
    }
    .label-model-box {
      border: 0.38mm solid #000000 !important;
      border-radius: 0.4mm !important;
      box-sizing: border-box !important;
    }
    .label-vertical-divider {
      width: 0.4mm !important;
      background-color: #000000 !important;
      display: block !important;
      flex-shrink: 0 !important;
    }
    .label-horizontal-divider {
      width: 100% !important;
      height: 0.42mm !important;
      background-color: #000000 !important;
      display: block !important;
      flex-shrink: 0 !important;
    }
  }
`;
};
