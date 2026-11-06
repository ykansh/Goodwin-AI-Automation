"use client";

import { useEffect, useState, use } from "react";
import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("products").select("*").eq("id", id).single().then(({ data }) => {
      setProduct(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-brand" size={32} /></div>;

  if (!product) return <div>Product not found.</div>;

  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/products" className="p-2 bg-surface border border-border rounded-lg hover:text-brand transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Edit Product</h1>
          <p className="text-muted-foreground">Update specifications for {product.name}.</p>
        </div>
      </div>
      
      <ProductForm initialData={product} />
    </div>
  );
}
