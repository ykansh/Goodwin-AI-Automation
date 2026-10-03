'use client';

import React, { useState } from 'react';
import { X, Printer, Barcode } from 'lucide-react';
import { MockItem } from '@/lib/mockData';
import { formatINR } from '@/lib/utils';

interface BarcodePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MockItem | null;
  businessName: string;
}

export default function BarcodePrintModal({
  isOpen,
  onClose,
  item,
  businessName,
}: BarcodePrintModalProps) {
  const [copies, setCopies] = useState<number>(4);

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-14 px-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-[#4c3cce] flex items-center justify-center">
              <Barcode size={18} />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Print Barcode Labels</h3>
              <p className="text-[10px] text-slate-500">{item.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="font-semibold text-slate-700 block">Number of Sticker Labels</label>
              <p className="text-[10px] text-slate-500">Supports standard 50x25mm thermal roll and A4 sheets</p>
            </div>
            <input
              type="number"
              min="1"
              max="100"
              value={copies}
              onChange={(e) => setCopies(Math.max(1, Number(e.target.value)))}
              className="w-20 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-center font-bold text-sm text-slate-900 focus:outline-none focus:border-[#4c3cce]"
            />
          </div>

          {/* Barcode Label Preview Grid */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
              Print Preview (Thermal Sticker Style)
            </span>

            <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-3 bg-slate-100 rounded-xl border border-slate-200">
              {Array.from({ length: Math.min(copies, 8) }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white border border-slate-300 rounded-lg p-2.5 shadow-2xs flex flex-col items-center justify-between text-center min-h-[110px]"
                >
                  <p className="text-[9px] font-bold tracking-tight text-slate-800 uppercase truncate w-full">
                    {businessName}
                  </p>
                  <p className="text-[10px] font-medium text-slate-700 line-clamp-1 mt-0.5">
                    {item.name}
                  </p>

                  {/* Pseudo Barcode Lines */}
                  <div className="my-1.5 flex items-center gap-[2px] h-7 justify-center overflow-hidden">
                    {Array.from({ length: 30 }).map((_, barIdx) => (
                      <div
                        key={barIdx}
                        className={`h-full ${
                          barIdx % 2 === 0
                            ? barIdx % 3 === 0
                              ? 'w-1 bg-black'
                              : 'w-[1.5px] bg-black'
                            : 'w-[1px] bg-transparent'
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-[9px] font-mono font-semibold tracking-widest text-slate-600">
                    {item.barcode || '890123456701'}
                  </p>

                  <div className="flex items-center justify-between w-full pt-1 border-t border-slate-100 text-[10px]">
                    <span className="text-slate-400 line-through">MRP {formatINR(item.mrp || item.salesPrice * 1.2)}</span>
                    <span className="font-extrabold text-slate-900">Sale {formatINR(item.salesPrice)}</span>
                  </div>
                </div>
              ))}
            </div>
            {copies > 8 && (
              <p className="text-[10px] text-slate-400 text-center mt-1.5">
                + {copies - 8} more labels will be sent to the printer
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                window.print();
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-[#4c3cce] hover:bg-[#3d2eb5] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs"
            >
              <Printer size={15} />
              <span>Print {copies} Labels</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
