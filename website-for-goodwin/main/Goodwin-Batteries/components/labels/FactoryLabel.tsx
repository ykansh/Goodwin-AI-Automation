import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { PRINTER_CONFIG } from '@/lib/printer-config';

export interface FactoryLabelProps {
  serialNumber: string;
  productModel: string;
  warranty: string;
  mfgDate: string;
  logoFont?: string;
  bodyFont?: string;
  serialFont?: string;
  letterSpacing?: string;
  showBarcode?: boolean;
  verticalOffset?: number;
}

export default function FactoryLabel({
  serialNumber,
  productModel,
  warranty,
  mfgDate,
  bodyFont = "Arial, Helvetica, sans-serif",
  serialFont = "'Consolas', 'Courier New', monospace",
  showBarcode = false,
  verticalOffset = 0,
}: FactoryLabelProps) {
  const verifyUrl = serialNumber
    ? `https://goodwinbatteries.in/support/warranty-registration?serial=${encodeURIComponent(serialNumber.trim())}`
    : `https://goodwinbatteries.in/support/warranty-registration`;

  // Clean model name for display (e.g. "GW-XL2.5LC (12 Months)" -> "GW-XL2.5LC")
  const rawModel = productModel.replace(/\s*\([^)]*\)/g, '').trim() || productModel;
  // If model name contains hyphens without spaces (e.g. "GOLD-SERIES-12V-12AH"), convert hyphens to spaces for natural multi-line display
  const cleanModel = rawModel.includes(' ') ? rawModel : rawModel.replace(/-/g, ' ');

  // Clean warranty for badge (e.g. "48 Months" -> "48M", "36 Months" -> "36M")
  const cleanWarranty = warranty.replace(/Months?/i, 'M').replace(/\s+/g, '').trim() || warranty;

  // Dynamically auto-adjust font size & spacing for any model name length
  // to ensure 100% fit with multi-line wrap support (NO ellipsis truncation)
  const getModelStyle = (len: number) => {
    if (len <= 8) return { fontSize: '7.2pt', letterSpacing: '0.1px' };
    if (len <= 14) return { fontSize: '6.2pt', letterSpacing: '0px' };
    if (len <= 22) return { fontSize: '5.2pt', letterSpacing: '-0.05px' };
    if (len <= 28) return { fontSize: '4.6pt', letterSpacing: '-0.08px' };
    return { fontSize: '4.0pt', letterSpacing: '-0.1px' };
  };

  // Dynamically calculate font-size and spacing based on serial number length
  // Calibrated for 35mm width so any serial up to 48+ chars is 100% visible with zero right-edge clipping
  const getSerialStyle = (len: number) => {
    if (len <= 14) return { fontSize: '6.0pt', letterSpacing: '0.3px' };
    if (len <= 20) return { fontSize: '5.2pt', letterSpacing: '0.2px' };
    if (len <= 26) return { fontSize: '4.6pt', letterSpacing: '0.1px' };
    if (len <= 32) return { fontSize: '4.0pt', letterSpacing: '0.04px' };
    if (len <= 38) return { fontSize: '3.6pt', letterSpacing: '0px' };
    if (len <= 44) return { fontSize: '3.2pt', letterSpacing: '-0.05px' };
    return { fontSize: '2.8pt', letterSpacing: '-0.1px' };
  };

  const modelStyle = getModelStyle(cleanModel.length);
  const serialStyle = getSerialStyle(serialNumber.length);

  // LAYOUT 1: EXACT MATCH TO SPECIFICATION MOCKUP
  // Left: 2-line "SCAN FOR / WARRANTY" in black box + crisp QR code
  // Center: Crisp vertical divider line
  // Right: GW circle logo + Warranty box, Centered Battery Model box, MFG date
  // Bottom: Full-width horizontal divider line + monospace serial number
  const topPadding = Math.max(0.5, 5.2 + (verticalOffset || 0));
  const bottomPadding = Math.max(0.5, 1.4 - (verticalOffset || 0));

  if (!showBarcode) {
    return (
      <div 
        className="label-container bg-white text-black box-border relative flex flex-col justify-between"
        style={{
          width: `${PRINTER_CONFIG.LABEL_WIDTH_MM}mm`,
          height: `${PRINTER_CONFIG.LABEL_HEIGHT_MM}mm`,
          maxHeight: `${PRINTER_CONFIG.LABEL_HEIGHT_MM}mm`,
          padding: `${topPadding}mm 1.2mm ${bottomPadding}mm 1.2mm`,
          overflow: 'hidden',
          fontFamily: bodyFont,
          boxSizing: 'border-box',
          backgroundColor: '#ffffff',
          color: '#000000',
          border: '0 none transparent',
          outline: '0 none transparent',
          boxShadow: 'none',
          WebkitFontSmoothing: 'none',
          textRendering: 'optimizeSpeed'
        }}
      >
        <div className="w-full h-full flex flex-col justify-between flex-1 min-h-0" style={{ border: '0 none transparent', outline: '0 none transparent' }}>
          {/* MAIN UPPER SECTION: QR CODE (LEFT) + VERTICAL DIVIDER + DETAILS (RIGHT) */}
          <div className="flex flex-row items-stretch justify-between flex-1 min-h-0 pb-[0.6mm]">
            
            {/* LEFT: 2-LINE "SCAN FOR / WARRANTY" BADGE + HIGH CONTRAST QR CODE */}
            <div className="flex flex-col items-center justify-between w-[12.6mm] shrink-0">
              {/* Highlighted Banner on top of QR code (Two-line format for max font size) */}
              <div 
                className="w-full bg-black text-white text-center font-black uppercase rounded-[0.4mm] py-[0.45mm] px-[0.2mm] leading-none shrink-0 label-badge-invert flex flex-col justify-center items-center gap-[0.2mm]"
                style={{ 
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  WebkitPrintColorAdjust: 'exact',
                  printColorAdjust: 'exact',
                }}
              >
                <span className="text-[5.0pt] font-black uppercase tracking-wider leading-none text-white">
                  SCAN FOR
                </span>
                <span className="text-[5.0pt] font-black uppercase tracking-wider leading-none text-white">
                  WARRANTY
                </span>
              </div>

              {/* Scannable Crisp QR Code */}
              <div className="w-full flex-1 flex items-center justify-center bg-white min-h-0 pt-[0.4mm]">
                <QRCodeSVG 
                  value={verifyUrl} 
                  size={160}
                  style={{ 
                    width: '11.8mm', 
                    height: '11.8mm', 
                    maxWidth: '100%', 
                    maxHeight: '100%',
                    shapeRendering: 'crispEdges'
                  }}
                  level="L" 
                  boostLevel={false}
                  marginSize={1}
                  fgColor="#000000"
                  bgColor="#FFFFFF"
                />
              </div>
            </div>

            {/* VERTICAL DIVIDER LINE (Extends from top to the horizontal divider) */}
            <div className="label-vertical-divider w-[0.4mm] bg-black shrink-0 self-stretch mx-[0.8mm]" style={{ backgroundColor: '#000000', width: '0.4mm' }} />

            {/* RIGHT: GW LOGO + WARRANTY BADGE + MODEL BOX + MFG DATE */}
            <div className="flex flex-col justify-between flex-1 min-w-0 h-full">
              {/* Top Row: Authentic GW Circular Emblem + Bold Warranty Badge (Zero Overflow) */}
              <div className="flex items-center justify-between pb-[0.2mm] gap-[0.8mm] shrink-0">
                <svg 
                  viewBox="0 0 100 100" 
                  className="w-[4.4mm] h-[4.4mm] shrink-0" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle cx="50" cy="50" r="46" stroke="#000000" strokeWidth="8" fill="#ffffff" />
                  <path 
                    d="M 68 32 C 60 22 45 20 34 28 C 20 39 20 61 34 72 C 45 80 62 76 68 66 C 70 62 70 54 70 50 L 50 50 L 50 42 L 76 42 C 78 42 78 52 76 62 C 68 76 48 84 32 74 C 14 60 14 36 32 22 C 46 12 66 14 74 26 Z" 
                    fill="#000000" 
                  />
                </svg>

                {/* Self-contained horizontal Warranty badge: Guaranteed to fit within container with all 4 borders */}
                <div 
                  className="label-warranty-badge bg-white flex items-center justify-center gap-[0.5mm] px-[1.0mm] py-[0.35mm] shrink-0"
                  style={{
                    border: '0.38mm solid #000000',
                    borderRadius: '0.4mm',
                    boxSizing: 'border-box'
                  }}
                >
                  <span className="font-black text-[6.6pt] text-black tracking-tight leading-none">
                    {cleanWarranty}
                  </span>
                  <span className="text-[3.8pt] font-black uppercase text-black tracking-wider leading-none">
                    WARRANTY
                  </span>
                </div>
              </div>

              {/* Model Box - BORDERED WITH MULTI-LINE CENTERED MODEL NAME */}
              <div 
                className="label-model-box bg-white flex flex-col items-center justify-center text-center my-[0.25mm] flex-1 min-h-[6.5mm] px-[0.8mm] py-[0.4mm]"
                style={{
                  border: '0.38mm solid #000000',
                  borderRadius: '0.4mm',
                  boxSizing: 'border-box'
                }}
              >
                <div className="text-[4.4pt] font-black text-black uppercase leading-none tracking-wider mb-[0.35mm]">
                  BATTERY MODEL
                </div>
                <div 
                  className="font-black text-black uppercase tracking-tight text-center leading-[1.15] w-full"
                  style={{ 
                    fontFamily: bodyFont,
                    fontSize: modelStyle.fontSize,
                    letterSpacing: modelStyle.letterSpacing,
                    wordBreak: 'break-word',
                    overflow: 'hidden'
                  }}
                >
                  {cleanModel}
                </div>
              </div>

              {/* MFG Date Row - Single bold line */}
              <div className="flex items-center justify-start text-black font-black text-[5.6pt] leading-none pt-[0.15mm] whitespace-nowrap overflow-hidden shrink-0">
                <strong className="font-black mr-[0.8mm]">MFG:</strong>
                <span className="font-black">{mfgDate}</span>
              </div>
            </div>
          </div>

          {/* HORIZONTAL DIVIDER LINE (Full width across entire label) */}
          <div className="label-horizontal-divider w-full h-[0.42mm] bg-black shrink-0" style={{ backgroundColor: '#000000', height: '0.42mm' }} />

          {/* BOTTOM SECTION: ONLY COMPLETE SERIAL NUMBER (AUTO-ADJUSTS, MAXIMUM LEGIBILITY) */}
          <div className="w-full pt-[0.45mm] flex items-center justify-center shrink-0 leading-none overflow-hidden" style={{ border: '0 none transparent', outline: '0 none transparent', boxShadow: 'none' }}>
            <span 
              className="font-black text-black uppercase whitespace-nowrap overflow-hidden font-mono text-center w-full leading-none"
              style={{ 
                fontFamily: serialFont,
                fontSize: serialStyle.fontSize,
                letterSpacing: serialStyle.letterSpacing,
                lineHeight: 1
              }}
            >
              {serialNumber}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // LAYOUT 2: QR + FULL-WIDTH BARCODE (OPTIONAL)
  return (
    <div 
      className="label-container bg-white text-black box-border relative flex flex-col justify-between"
      style={{
        width: `${PRINTER_CONFIG.LABEL_WIDTH_MM}mm`,
        height: `${PRINTER_CONFIG.LABEL_HEIGHT_MM}mm`,
        maxHeight: `${PRINTER_CONFIG.LABEL_HEIGHT_MM}mm`,
        padding: `${topPadding}mm 1.2mm ${bottomPadding}mm 1.2mm`,
        overflow: 'hidden',
        fontFamily: bodyFont,
        boxSizing: 'border-box',
        backgroundColor: '#ffffff',
        color: '#000000',
        border: '0 none transparent',
        outline: '0 none transparent',
        boxShadow: 'none',
        WebkitFontSmoothing: 'none',
        textRendering: 'optimizeSpeed'
      }}
    >
      <div className="w-full h-full flex flex-col justify-between flex-1 min-h-0">
        {/* Top Header: Only GW Logo + Model Box + Warranty (NO "Goodwin" text) */}
        <div className="flex items-center justify-between border-b-[0.35mm] border-black pb-[0.35mm] shrink-0">
          <svg 
            viewBox="0 0 100 100" 
            className="w-[4.6mm] h-[4.6mm] shrink-0" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="46" stroke="#000000" strokeWidth="8" fill="#ffffff" />
            <path 
              d="M 68 32 C 60 22 45 20 34 28 C 20 39 20 61 34 72 C 45 80 62 76 68 66 C 70 62 70 54 70 50 L 50 50 L 50 42 L 76 42 C 78 42 78 52 76 62 C 68 76 48 84 32 74 C 14 60 14 36 32 22 C 46 12 66 14 74 26 Z" 
              fill="#000000" 
            />
          </svg>

          <div className="border-[0.35mm] border-black rounded-[0.35mm] px-[1mm] py-[0.35mm] bg-white text-center inline-flex items-center gap-[0.5mm]">
            <span className="text-[3.6pt] font-black text-black uppercase leading-none">MODEL:</span>
            <span 
              className="font-black text-black uppercase tracking-tight whitespace-nowrap leading-none"
              style={{ 
                fontFamily: bodyFont,
                fontSize: modelStyle.fontSize,
                lineHeight: 1
              }}
            >
              {cleanModel}
            </span>
          </div>

          <span 
            className="font-black text-black border-[0.35mm] border-black rounded-[0.35mm] px-[1.0mm] py-[0.35mm] uppercase text-center"
            style={{ fontSize: '5.6pt', lineHeight: 1 }}
          >
            {cleanWarranty}
          </span>
        </div>

        {/* Middle Row: Highlighted QR Code + Metadata */}
        <div className="flex flex-row items-center justify-between gap-[1.5mm] my-[0.2mm] shrink-0">
          <div className="shrink-0 flex flex-col items-center">
            <div 
              className="w-full bg-black text-white text-center font-black uppercase rounded-[0.3mm] py-[0.4mm] px-[0.3mm] mb-[0.35mm] leading-none shrink-0 label-badge-invert"
              style={{ 
                fontSize: '4.2pt', 
                letterSpacing: '0.2px',
                backgroundColor: '#000000',
                color: '#ffffff',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact'
              }}
            >
              SCAN FOR WARRANTY
            </div>
            <div className="p-[0.2mm] bg-white border border-black/50 rounded-[0.3mm]">
              <QRCodeSVG 
                value={verifyUrl} 
                size={160}
                style={{ width: '11.5mm', height: '11.5mm', shapeRendering: 'crispEdges' }}
                level="L" 
                boostLevel={false}
                marginSize={1} 
                fgColor="#000000"
                bgColor="#FFFFFF"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between h-[13.0mm] py-[0.2mm]">
            <div className="text-[4.2pt] font-black uppercase text-black leading-tight">
              SCAN TO REGISTER DIGITAL WARRANTY
            </div>
            <div className="text-[5.0pt] font-bold text-black leading-none">
              <strong>MFG:</strong> {mfgDate}
            </div>
            <div className="text-[4.4pt] font-black uppercase text-black tracking-wider">
              GOODWIN BATTERIES
            </div>
          </div>
        </div>

        {/* Bottom Row: Full-width Barcode + Protected Serial Number */}
        <div className="border-t-[0.35mm] border-black pt-[0.3mm] shrink-0">
          <div className="w-full flex items-center justify-center h-[3.8mm] overflow-hidden">
            <div className="w-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-h-[3.8mm]">
              <Barcode 
                value={serialNumber} 
                format="CODE128"
                width={1}
                height={16}
                displayValue={false}
                margin={0}
                background="#ffffff"
                lineColor="#000000"
              />
            </div>
          </div>

          <div 
            className="font-black text-center text-black mt-[0.3mm] whitespace-nowrap overflow-hidden font-mono" 
            style={{ 
              fontFamily: serialFont,
              fontSize: serialStyle.fontSize, 
              letterSpacing: serialStyle.letterSpacing,
              lineHeight: 1
            }}
          >
            {serialNumber}
          </div>
        </div>
      </div>
    </div>
  );
}
