"use client";

import React, { useRef } from "react";
import Barcode from "react-barcode";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Download, X, Scissors, CheckCircle2, ShieldCheck } from "lucide-react";
import { GOODWIN_GST_DETAILS, calculateGSTBreakdown, numberToIndianWords } from "@/lib/invoice";
import { formatINR } from "@/lib/pricing";

interface OrderData {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  vehicleDetails?: string;
  deliverySlot: string;
  paymentMethod: string;
  paymentStatus?: string;
  status: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  createdAt: string;
  invoiceNumber?: string;
  trackingNumber?: string;
  technicianName?: string;
  technicianPhone?: string;
  technicianVehicle?: string;
}

interface CombinedShippingLabelInvoiceProps {
  order: OrderData;
  onClose?: () => void;
}

export default function CombinedShippingLabelInvoice({
  order,
  onClose,
}: CombinedShippingLabelInvoiceProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const orderDate = new Date(order.createdAt);
  const formattedOrderDate = orderDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedOrderTime = orderDate.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const invoiceNo =
    order.invoiceNumber ||
    `GB/IND/${orderDate.getFullYear()}/${order.id.replace("GW-ORD-", "")}`;
  
  const awbCode =
    order.trackingNumber ||
    `FMPC${order.id.replace(/\D/g, "").slice(0, 10).padEnd(10, "0")}`;

  const sortHubCode = `IND-${order.pincode ? order.pincode.slice(-3) : "452"}`;

  const gstData = calculateGSTBreakdown(order.totalAmount, order.state || "Madhya Pradesh");

  // QR Code payload for courier routing
  const courierQrPayload = JSON.stringify({
    awb: awbCode,
    orderId: order.id,
    pin: order.pincode,
    phone: order.phone,
    carrier: "Goodwin Direct Logistics",
    gstin: GOODWIN_GST_DETAILS.gstin,
  });

  // Verification URL for Tax Invoice
  const invoiceVerifyUrl = `https://goodwinbatteries.com/track-order?orderId=${order.id}&invoice=${invoiceNo}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white text-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-auto border border-slate-300">
        
        {/* Top Control Bar (Hidden on print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between no-print border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-heading font-black text-xs sm:text-sm uppercase tracking-wider">
              Combined Shipping Label &amp; Tax Invoice &bull; {order.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#00843D] hover:bg-[#007033] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <Printer size={14} /> Print A4 Label
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* PRINTABLE DOCUMENT AREA */}
        <div 
          ref={printRef} 
          id="printable-shipping-invoice"
          className="p-6 sm:p-8 bg-white text-black font-sans leading-tight text-[11px] selection:bg-slate-200"
        >
          {/* ============================================================ */}
          {/* SECTION 1: TOP HALF - SHIPPING LABEL / PACKING SLIP          */}
          {/* ============================================================ */}
          <div className="border-2 border-black rounded-none">
            
            {/* Top Bar: STD | Carrier | PREPAID | E */}
            <div className="grid grid-cols-12 border-b-2 border-black text-center font-black uppercase text-[11px] bg-white">
              <div className="col-span-2 p-1.5 border-r-2 border-black font-mono tracking-wider">
                STD
              </div>
              <div className="col-span-6 p-1.5 border-r-2 border-black text-[12px] tracking-wide flex items-center justify-center gap-1.5">
                <span>Goodwin Direct Express</span>
                <span className="text-[9px] font-normal text-slate-600 lowercase">(logistics)</span>
              </div>
              <div className="col-span-3 p-1.5 border-r-2 border-black font-mono tracking-wider bg-slate-100">
                PREPAID
              </div>
              <div className="col-span-1 p-1.5 font-mono text-center">
                E
              </div>
            </div>

            {/* Sub-bar: "Ordered through: Goodwin Direct Store" */}
            <div className="px-3 py-1 border-b border-black text-[10px] text-slate-700 flex justify-between items-center bg-slate-50">
              <span>
                Ordered through: <strong className="text-black font-black">Goodwin Direct OEM Store</strong>
              </span>
              <span className="font-mono text-[9px] text-slate-500">
                Type: Genuine Factory Sealed VRLA Battery
              </span>
            </div>

            {/* Split row: Left Barcode/AWB - Right 2D QR Code & Customer Address */}
            <div className="grid grid-cols-12 border-b-2 border-black">
              {/* Left Column (AWB Barcode & Dates) */}
              <div className="col-span-5 p-3 border-r-2 border-black flex flex-col justify-between items-center bg-white">
                <div className="w-full text-center">
                  <span className="font-mono font-bold text-[9px] text-slate-500 block mb-1">
                    AWB No. {awbCode}
                  </span>
                  <div className="flex justify-center items-center overflow-hidden py-1">
                    <Barcode
                      value={awbCode}
                      width={1.15}
                      height={40}
                      fontSize={10}
                      margin={0}
                      displayValue={false}
                    />
                  </div>
                  <span className="font-mono font-black text-[11px] tracking-widest block mt-0.5">
                    {awbCode}
                  </span>
                </div>

                <div className="w-full pt-2 border-t border-slate-200 mt-2 text-[10px] font-mono grid grid-cols-2 gap-1 text-center">
                  <div>
                    <span className="text-slate-500 block text-[8px] uppercase">HBD</span>
                    <strong>{formattedOrderDate}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[8px] uppercase">CPD</span>
                    <strong>{formattedOrderDate}</strong>
                  </div>
                </div>
              </div>

              {/* Right Column (Courier QR Code & Customer Shipping Address) */}
              <div className="col-span-7 p-3 flex flex-col justify-between bg-white">
                <div className="flex items-start gap-3">
                  {/* Courier 2D QR Code */}
                  <div className="shrink-0 p-1 border border-black bg-white">
                    <QRCodeSVG
                      value={courierQrPayload}
                      size={86}
                      level="M"
                      marginSize={0}
                    />
                  </div>

                  {/* Customer Shipping Address */}
                  <div className="text-[10.5px] leading-snug flex-1">
                    <span className="font-black uppercase text-[9px] text-slate-600 block mb-1 underline">
                      Shipping / Customer Address:
                    </span>
                    <p className="font-black text-[12px] text-black">
                      {order.customerName}
                    </p>
                    <p className="text-slate-800 font-medium mt-0.5">
                      {order.address}
                    </p>
                    <p className="font-black text-[11px] text-black mt-0.5">
                      {order.city} &ndash; <span className="font-mono text-[12px] bg-slate-100 px-1 py-0.2 border border-slate-300">{order.pincode}</span>, {order.state}
                    </p>
                    <p className="font-mono font-bold text-[10px] text-slate-700 mt-1">
                      Phone: +91 {order.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sold By Details Strip */}
            <div className="p-2 border-b-2 border-black bg-slate-50 text-[10px]">
              <span className="font-black text-black">Sold By: </span>
              <strong className="text-black uppercase">{GOODWIN_GST_DETAILS.tradeName}</strong>, {GOODWIN_GST_DETAILS.fullAddress} &bull; <span className="font-black">GSTIN: {GOODWIN_GST_DETAILS.gstin}</span>
            </div>

            {/* SKU & Items Table */}
            <div className="border-b-2 border-black">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="border-b border-black bg-slate-100 font-black text-slate-900 uppercase">
                    <th className="p-1.5 border-r border-black w-28">SKU ID</th>
                    <th className="p-1.5 border-r border-black">Item Description / Vehicle Fitment</th>
                    <th className="p-1.5 text-center w-14">QTY</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((it, idx) => (
                    <tr key={idx} className="border-b border-slate-200 last:border-b-0">
                      <td className="p-1.5 border-r border-black font-mono font-bold text-[9px]">
                        GW-BAT-{it.productId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 8).toUpperCase()}
                      </td>
                      <td className="p-1.5 border-r border-black font-bold">
                        {it.name}
                        {order.vehicleDetails && (
                          <span className="text-[9px] font-normal text-slate-600 block">
                            Vehicle Fit: {order.vehicleDetails}
                          </span>
                        )}
                      </td>
                      <td className="p-1.5 text-center font-black font-mono">
                        {it.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bottom Bar: Barcode, Routing Code Box (B4) & Resale Note */}
            <div className="grid grid-cols-12 items-center bg-white p-2">
              <div className="col-span-9 flex flex-col justify-center">
                <Barcode
                  value={awbCode}
                  width={1.2}
                  height={26}
                  fontSize={9}
                  margin={0}
                  displayValue={false}
                />
                <span className="font-mono text-[9px] font-bold text-slate-600 mt-0.5">
                  {awbCode}
                </span>
              </div>

              {/* Routing Hub Code Box (Standard shipping label B4 sort code) */}
              <div className="col-span-3 text-right flex justify-end">
                <div className="border-2 border-black px-4 py-1.5 font-mono font-black text-[16px] bg-slate-100 tracking-wider">
                  {sortHubCode}
                </div>
              </div>
            </div>

            <div className="px-2 py-0.5 border-t border-slate-200 text-[8.5px] text-slate-500 flex justify-between">
              <span>Not for resale. Genuine Goodwin Automotive Battery.</span>
              <span className="font-mono">Printed at {formattedOrderTime} hrs, {formattedOrderDate}</span>
            </div>
          </div>

          {/* ============================================================ */}
          {/* PERFORATION TEAR-OFF LINE (CUT HERE)                         */}
          {/* ============================================================ */}
          <div className="my-5 relative flex items-center justify-center">
            <div className="w-full border-t-2 border-dashed border-slate-400" />
            <div className="absolute bg-white px-3 py-0.5 border border-slate-300 rounded-full text-[9px] font-mono font-bold text-slate-600 flex items-center gap-1.5 uppercase shadow-xs">
              <Scissors size={12} className="text-slate-500" />
              Tax Invoice (Cut Here)
            </div>
          </div>

          {/* ============================================================ */}
          {/* SECTION 2: BOTTOM HALF - OFFICIAL TAX INVOICE                */}
          {/* ============================================================ */}
          <div className="border border-black">
            
            {/* Top Invoice Strip: 4 Columns */}
            <div className="grid grid-cols-12 p-3 border-b border-black gap-2 items-start bg-slate-50">
              {/* Col 1: Title & Order ID */}
              <div className="col-span-4">
                <h1 className="font-black text-[15px] uppercase tracking-wide text-black leading-none mb-1">
                  Tax Invoice
                </h1>
                <p className="font-mono text-[10px]">
                  <strong>Order id: </strong>
                  <span className="font-black">{order.id}</span>
                </p>
                <p className="text-[9.5px] text-slate-600">
                  Order Date: {formattedOrderDate}, {formattedOrderTime}
                </p>
              </div>

              {/* Col 2: Invoice No & Date */}
              <div className="col-span-3">
                <p className="font-mono text-[10px]">
                  <strong>Invoice No: </strong>
                  <span className="font-black block">{invoiceNo}</span>
                </p>
                <p className="text-[9.5px] text-slate-600 mt-0.5">
                  Invoice Date: {formattedOrderDate}, {formattedOrderTime}
                </p>
              </div>

              {/* Col 3: GSTIN & PAN */}
              <div className="col-span-3 font-mono text-[10px]">
                <p>
                  <strong>GSTIN: </strong>
                  <span className="font-black">{GOODWIN_GST_DETAILS.gstin}</span>
                </p>
                <p className="text-[9.5px] text-slate-700">
                  PAN: <strong className="font-black">{GOODWIN_GST_DETAILS.pan}</strong>
                </p>
              </div>

              {/* Col 4: Digital Verification QR Code */}
              <div className="col-span-2 flex justify-end">
                <div className="p-1 border border-slate-300 bg-white shadow-xs">
                  <QRCodeSVG
                    value={invoiceVerifyUrl}
                    size={52}
                    level="L"
                    marginSize={0}
                  />
                </div>
              </div>
            </div>

            {/* 3 Column Address Block */}
            <div className="grid grid-cols-3 border-b border-black text-[9.5px] bg-white divide-x divide-black">
              {/* Sold By (Goodwin Batteries Indore) */}
              <div className="p-2.5">
                <span className="font-black uppercase text-[9px] text-slate-600 block mb-0.5">
                  Sold By:
                </span>
                <p className="font-black text-[10.5px] text-black">
                  {GOODWIN_GST_DETAILS.tradeName}
                </p>
                <p className="text-slate-700 leading-tight mt-0.5">
                  {GOODWIN_GST_DETAILS.addressLine1},<br />
                  {GOODWIN_GST_DETAILS.addressLine2},<br />
                  {GOODWIN_GST_DETAILS.city}, {GOODWIN_GST_DETAILS.state} &ndash; {GOODWIN_GST_DETAILS.pincode}
                </p>
                <p className="font-mono font-bold text-slate-900 mt-1">
                  GST: {GOODWIN_GST_DETAILS.gstin}
                </p>
              </div>

              {/* Shipping Address */}
              <div className="p-2.5">
                <span className="font-black uppercase text-[9px] text-slate-600 block mb-0.5">
                  Shipping Address:
                </span>
                <p className="font-black text-[10.5px] text-black">
                  {order.customerName}
                </p>
                <p className="text-slate-700 leading-tight mt-0.5">
                  {order.address},<br />
                  {order.city} &ndash; {order.pincode}, {order.state}
                </p>
                <p className="font-mono text-slate-800 mt-1">
                  Mobile: +91 {order.phone}
                </p>
              </div>

              {/* Billing Address */}
              <div className="p-2.5">
                <span className="font-black uppercase text-[9px] text-slate-600 block mb-0.5">
                  Billing Address:
                </span>
                <p className="font-black text-[10.5px] text-black">
                  {order.customerName}
                </p>
                <p className="text-slate-700 leading-tight mt-0.5">
                  {order.address},<br />
                  {order.city} &ndash; {order.pincode}, {order.state}
                </p>
                <p className="font-mono text-slate-800 mt-1">
                  Mobile: +91 {order.phone}
                </p>
              </div>
            </div>

            {/* Product & Tax Breakdown Table */}
            <div className="w-full overflow-x-auto">
              <table className="w-full text-left border-collapse text-[9.5px]">
                <thead>
                  <tr className="bg-slate-100 border-b border-black font-black uppercase text-slate-800 text-[8.5px]">
                    <th className="p-1.5 border-r border-slate-300">Product</th>
                    <th className="p-1.5 border-r border-slate-300">Description</th>
                    <th className="p-1.5 border-r border-slate-300 text-center w-8">Qty</th>
                    <th className="p-1.5 border-r border-slate-300 text-right w-16">Gross</th>
                    <th className="p-1.5 border-r border-slate-300 text-right w-14">Discount</th>
                    <th className="p-1.5 border-r border-slate-300 text-right w-16">Taxable</th>
                    <th className="p-1.5 border-r border-slate-300 text-right w-14">IGST</th>
                    <th className="p-1.5 border-r border-slate-300 text-right w-14">CGST</th>
                    <th className="p-1.5 border-r border-slate-300 text-right w-14">SGST</th>
                    <th className="p-1.5 text-right w-18">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((it, idx) => {
                    const itemTotal = it.price * it.quantity;
                    const itemGst = calculateGSTBreakdown(itemTotal, order.state || "Madhya Pradesh");

                    return (
                      <tr key={idx} className="border-b border-slate-200">
                        <td className="p-1.5 border-r border-slate-300 font-bold">
                          {it.name}
                        </td>
                        <td className="p-1.5 border-r border-slate-300 font-mono text-[8.5px] text-slate-700">
                          HSN: {GOODWIN_GST_DETAILS.hsn}
                          {itemGst.isIntraState ? (
                            <span className="block text-[8px] text-slate-500">
                              (CGST: 14% + SGST: 14%)
                            </span>
                          ) : (
                            <span className="block text-[8px] text-slate-500">
                              (IGST: 28%)
                            </span>
                          )}
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-center font-bold">
                          {it.quantity}
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                          {formatINR(itemTotal)}
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-right font-mono text-slate-500">
                          0.00
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-right font-mono font-bold">
                          {formatINR(itemGst.taxableValue)}
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                          {itemGst.igst > 0 ? formatINR(itemGst.igst) : "0.00"}
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                          {itemGst.cgst > 0 ? formatINR(itemGst.cgst) : "0.00"}
                        </td>
                        <td className="p-1.5 border-r border-slate-300 text-right font-mono">
                          {itemGst.sgst > 0 ? formatINR(itemGst.sgst) : "0.00"}
                        </td>
                        <td className="p-1.5 text-right font-black font-mono">
                          {formatINR(itemTotal)}
                        </td>
                      </tr>
                    );
                  })}

                  {/* Shipping and Installation row */}
                  <tr className="border-b border-black text-slate-700 bg-slate-50/50">
                    <td className="p-1.5 border-r border-slate-300 font-bold">
                      Shipping &amp; Doorstep Installation
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-[8.5px]">
                      Doorstep Delivery &amp; Multimeter Tested
                    </td>
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold">1</td>
                    <td className="p-1.5 border-r border-slate-300 text-right font-mono">0.00</td>
                    <td className="p-1.5 border-r border-slate-300 text-right font-mono">0.00</td>
                    <td className="p-1.5 border-r border-slate-300 text-right font-mono">0.00</td>
                    <td className="p-1.5 border-r border-slate-300 text-right font-mono">0.00</td>
                    <td className="p-1.5 border-r border-slate-300 text-right font-mono">0.00</td>
                    <td className="p-1.5 border-r border-slate-300 text-right font-mono">0.00</td>
                    <td className="p-1.5 text-right font-black font-mono">0.00</td>
                  </tr>

                  {/* Total Qty & Price Row */}
                  <tr className="bg-slate-100 font-black border-b border-black">
                    <td colSpan={3} className="p-1.5 border-r border-black font-mono text-[10px]">
                      TOTAL QTY: {order.items?.reduce((sum, it) => sum + it.quantity, 0) || 1}
                    </td>
                    <td colSpan={7} className="p-1.5 text-right font-mono text-[11px]">
                      TOTAL PRICE: <span className="text-[13px]">{formatINR(order.totalAmount)}</span>
                      <span className="block text-[8px] font-normal text-slate-600">All values are in INR</span>
                    </td>
                  </tr>

                  {/* Total Amount in Words */}
                  <tr className="bg-white">
                    <td colSpan={10} className="p-2 border-b border-black text-[10px]">
                      <strong className="text-slate-700">Amount in Words: </strong>
                      <span className="font-bold text-black italic">
                        {numberToIndianWords(order.totalAmount)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Declarations & Signatures */}
            <div className="p-3 bg-white grid grid-cols-12 gap-4 text-[9px] items-end">
              <div className="col-span-8 text-slate-700 space-y-1">
                <p>
                  <strong>Seller Registered Address: </strong>
                  {GOODWIN_GST_DETAILS.tradeName}, {GOODWIN_GST_DETAILS.fullAddress}
                </p>
                <p>
                  <strong>Declaration: </strong>
                  The goods sold are intended for end user consumption and not for resale.
                </p>
                <div className="flex items-center gap-3 pt-2 font-mono text-[8.5px] text-slate-500">
                  <span>Ordered Through: <strong className="text-black">Goodwin Direct Store</strong></span>
                  <span>&bull;</span>
                  <span>E. &amp; O.E.</span>
                </div>
              </div>

              {/* Digital Signature Box */}
              <div className="col-span-4 flex flex-col items-end">
                <div className="border border-slate-300 p-2.5 rounded text-center w-48 bg-slate-50">
                  <div className="h-8 flex items-center justify-center font-serif italic text-slate-800 text-[14px] font-bold tracking-wider">
                    {GOODWIN_GST_DETAILS.legalName}
                  </div>
                  <div className="border-t border-slate-300 pt-1 text-[8.5px] text-slate-600">
                    <strong className="block text-black">{GOODWIN_GST_DETAILS.tradeName}</strong>
                    Authorized Signatory
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions (Hidden on print) */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex justify-between items-center no-print">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck size={16} className="text-emerald-600" />
            <span>Format compliant with Indian Ecommerce Dispatch Standard &bull; GSTIN 23EAZPR0166R1ZN</span>
          </div>

          <div className="flex items-center gap-2.5">
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
              >
                Close
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-[#00843D] hover:bg-[#007033] text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Printer size={15} /> Print Shipping Label &amp; Invoice
            </button>
          </div>
        </div>

      </div>

      {/* Embedded Print CSS */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
          #printable-shipping-invoice {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 4mm !important;
            border: none !important;
            box-shadow: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 6mm;
          }
        }
      `}</style>
    </div>
  );
}
