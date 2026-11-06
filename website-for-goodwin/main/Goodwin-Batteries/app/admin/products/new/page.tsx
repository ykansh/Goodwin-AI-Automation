import ProductForm from "@/components/admin/ProductForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewProductPage() {
  return (
    <div>
      <div className="mb-8 flex items-center gap-4">
        <Link href="/admin/products" className="p-2 bg-surface border border-border rounded-lg hover:text-brand transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Add Product</h1>
          <p className="text-muted-foreground">Create a new battery model in the catalog.</p>
        </div>
      </div>
      
      <ProductForm />
    </div>
  );
}
