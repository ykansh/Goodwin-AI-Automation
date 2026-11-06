"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { AlertCircle, Edit2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function UnmatchedReport() {
  const [fitments, setFitments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    // Fetch fitments without a mapped goodwin product or pending status
    const { data } = await supabase
      .from("goodwin_vehicle_fitments")
      .select(`
        id,
        source_brand,
        source_product_reference,
        fitment_status,
        brand:brand_id(name),
        model:model_id(name),
        variant:variant_id(name)
      `)
      .or('goodwin_product_id.is.null,fitment_status.eq.pending');
      
    setFitments(data || []);
    setLoading(false);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Unmatched Vehicles Report</h2>
          <p className="text-muted-foreground">Vehicles scraped from references that don't map to a Goodwin product.</p>
        </div>
      </div>

      <div className="bg-surface border border-border rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-muted-foreground">Loading unmatched records...</div>
        ) : fitments.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <CheckCircle2 size={48} className="text-green-500 mb-4" />
            <h3 className="text-xl font-bold text-foreground mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">All scraped vehicles have been successfully mapped to a Goodwin battery.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-background border-b border-border text-muted-foreground uppercase text-xs">
                <tr>
                  <th className="px-6 py-4 font-semibold">Vehicle</th>
                  <th className="px-6 py-4 font-semibold">Reference (e.g. Amaron)</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fitments.map((fitment) => (
                  <tr key={fitment.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-foreground">
                        {fitment.brand?.name} {fitment.model?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">{fitment.variant?.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="text-amber-500" />
                        <span className="font-mono text-xs">{fitment.source_product_reference || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-bold capitalize">
                        {fitment.fitment_status || "Unmapped"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/admin/battery-finder/compatibility`}
                        className="text-brand hover:text-brand-dark flex items-center gap-1 justify-end font-bold"
                      >
                        <Edit2 size={16} /> Map Product
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
