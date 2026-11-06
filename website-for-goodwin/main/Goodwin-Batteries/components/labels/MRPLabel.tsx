import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import { PRINTER_CONFIG } from '@/lib/printer-config';

export interface MRPLabelProps {
  productName: string;
  productModel: string;
  voltage: string;
  capacity: string;
  mrp: string;
  mfgDate: string;
  serialNumber?: string;
  logoFont?: string;
  bodyFont?: string;
  serialFont?: string;
  letterSpacing?: string;
  verticalOffset?: number;
}

export default function MRPLabel({
  productName,
  productModel,
  voltage,
  capacity,
  mrp,
  mfgDate,
  serialNumber,
  bodyFont = "Tahoma, Verdana, sans-serif",
  serialFont = "'Consolas', 'Courier New', monospace",
  verticalOffset = 0,
}: MRPLabelProps) {
  const verifyUrl = serialNumber
    ? `https://goodwinbatteries.in/support/warranty-registration?serial=${encodeURIComponent(serialNumber.trim())}`
    : `https://goodwinbatteries.in/support/warranty-registration`;

  // Clean model and product name for display (strip any "Goodwin" text to keep ONLY GW logo)
  const cleanProductName = productName.replace(/goodwin\s*/gi, '').trim() || 'AUTOMOTIVE BATTERY';
  const cleanModel = productModel.replace(/\s*\([^)]*\)/g, '').trim() || productModel;

  // Auto-adjust font size for model based on length to guarantee 100% fit
  const getModelStyle = (len: number) => {
    if (len <= 7) return { fontSize: '7.2pt', letterSpacing: '0.15px' };
    if (len <= 11) return { fontSize: '6.0pt', letterSpacing: '0.05px' };
    if (len <= 15) return { fontSize: '5.2pt', letterSpacing: '0px' };
    return { fontSize: '4.6pt', letterSpacing: '-0.05px' };
  };

  // Auto-adjust font size for serial number based on length across full width
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
  const serialStyle = getSerialStyle(serialNumber?.length || 0);

  const topPadding = Math.max(0.5, 5.2 + (verticalOffset || 0));
  const bottomPadding = Math.max(0.5, 1.4 - (verticalOffset || 0));

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
        {/* Top Header: ONLY GW LOGO (No "Goodwin" text, No "GENUINE") + Auto-adjusting Model Box + Voltage/Capacity */}
        <div 
          className="flex justify-between items-center pb-[0.35mm] mb-[0.3mm] shrink-0"
          style={{ borderBottom: '0.35mm solid #000000' }}
        >
          <div className="flex items-center gap-[0.8mm] flex-1 min-w-0 pr-[1mm]">
            {/* Authentic GW Circular Emblem (Sharp 100% Black Vector) */}
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

            <div className="flex flex-col min-w-0">
              <div 
                className="font-black truncate text-black leading-tight uppercase" 
                style={{ 
                  fontFamily: bodyFont,
                  fontSize: '5.2pt', 
                  letterSpacing: '0.1px'
                }}
              >
                {cleanProductName}
              </div>
              <span className="text-[3.4pt] font-extrabold uppercase text-black tracking-wider leading-none mt-[0.2mm]">
                AUTOMOTIVE BATTERY
              </span>
            </div>
          </div>

          {/* Model Box on Header Right: Auto-adjusts for all models */}
          <div className="text-right flex-shrink-0 ml-[0.5mm] max-w-[18mm]">
            <div 
              className="font-black border-[0.35mm] border-black bg-white text-black px-[0.8mm] py-[0.25mm] inline-block w-full text-center rounded-[0.35mm] leading-tight" 
              style={{ 
                fontFamily: bodyFont,
                fontSize: modelStyle.fontSize, 
                lineHeight: '1.05',
                letterSpacing: modelStyle.letterSpacing,
                wordBreak: 'break-word'
              }}
            >
              {cleanModel}
            </div>
            <div 
              className="font-black text-black mt-[0.2mm] leading-none text-right" 
              style={{ 
                fontFamily: bodyFont,
                fontSize: '4.6pt', 
                lineHeight: '1' 
              }}
            >
              {voltage}|{capacity}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-row flex-grow justify-between items-stretch min-h-0">
          
          {/* Left Side: Pricing & Metadata */}
          <div 
            className="flex flex-col justify-between w-[52%] text-black h-full pr-[0.8mm]" 
            style={{ fontFamily: bodyFont }}
          >
            <div className="space-y-[0.35mm]">
              <div>
                <span className="font-extrabold" style={{ fontSize: '5.6pt' }}>MRP: </span> 
                <span 
                  className="font-black text-black ml-[0.5mm]" 
                  style={{ fontSize: '9.2pt', letterSpacing: '0.2px' }}
                >
                  ₹{mrp}
                </span>
                <div 
                  className="font-bold text-black" 
                  style={{ fontSize: '4.2pt', lineHeight: '1', letterSpacing: '0.1px' }}
                >
                  (Incl. of all taxes)
                </div>
              </div>
              
              <div 
                className="text-black font-black" 
                style={{ fontSize: '5.4pt', lineHeight: '1.1' }}
              >
                <strong>MFG: </strong> 
                <span className="font-bold">{mfgDate}</span>
              </div>
            </div>
            
            {/* Bottom details */}
            <div 
              className="pt-[0.2mm] text-black font-black" 
              style={{ 
                fontSize: '5.0pt', 
                lineHeight: '1.1',
                letterSpacing: '0.1px'
              }}
            >
              <div><strong className="font-black">CC:</strong> 9220404411</div>
            </div>
          </div>

          {/* Right Side: HIGHLIGHTED SCAN FOR WARRANTY ON TOP OF QR CODE */}
          <div className="flex flex-col justify-between items-center w-[48%] h-full pl-[0.8mm] border-l-[0.35mm] border-black">
            {/* Highlight on top of the QR */}
            <div 
              className="w-full bg-black text-white text-center font-black uppercase rounded-[0.4mm] py-[0.5mm] px-[0.2mm] mb-[0.4mm] leading-none shrink-0 label-badge-invert flex flex-col justify-center items-center gap-[0.25mm]"
              style={{ 
                backgroundColor: '#000000',
                color: '#ffffff',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <span className="text-[5.4pt] font-black uppercase tracking-wider leading-none text-white">
                SCAN FOR
              </span>
              <span className="text-[5.4pt] font-black uppercase tracking-wider leading-none text-white">
                WARRANTY
              </span>
            </div>

            <div className="w-full flex-1 flex items-center justify-center bg-white min-h-0">
              <QRCodeSVG 
                value={verifyUrl} 
                size={160}
                style={{ 
                  width: '12.8mm', 
                  height: '12.8mm', 
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
        </div>

        {/* Optional Full-width Serial Number (36mm wide - 100% visible for all serial lengths, zero overlap, no INDIA) */}
        {serialNumber && (
          <div className="w-full border-t-[0.4mm] border-black pt-[0.6mm] mt-[0.3mm] flex items-center justify-center shrink-0 leading-none overflow-hidden">
            <span 
              className="font-mono font-black text-center w-full leading-none whitespace-nowrap overflow-hidden text-black tracking-tight"
              style={{ 
                fontFamily: serialFont,
                fontSize: serialStyle.fontSize,
                letterSpacing: serialStyle.letterSpacing
              }}
            >
              {serialNumber}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
