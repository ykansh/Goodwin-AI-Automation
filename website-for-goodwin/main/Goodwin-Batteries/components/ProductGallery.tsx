"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/types";
import { Play } from "lucide-react";

export default function ProductGallery({ product }: { product: Product }) {
  // Setup the media array: first the main image, then unique gallery images, then videos.
  const mainImage = product.image;
  const galleryImages = (product.gallery || []).filter(img => img !== mainImage);
  const videos = product.videos || [];

  const [activeMedia, setActiveMedia] = useState<{ type: "image" | "video", url: string }>({
    type: "image",
    url: mainImage,
  });

  return (
    <div className="sticky top-28 flex flex-col gap-4">
      {/* Main Viewer */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 aspect-square flex items-center justify-center p-6 md:p-10 relative overflow-hidden shadow-lg group">
        <div className="absolute top-4 right-4 z-20">
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-[#00843D] border border-emerald-200">
            OEM Specification
          </span>
        </div>
        
        <div className="w-full h-full bg-white rounded-2xl flex items-center justify-center relative z-10 border border-slate-200/80 p-6 md:p-8 transition-all group-hover:border-[#00843D]/60 shadow-sm">
          {activeMedia.type === "image" ? (
            <Image
              src={activeMedia.url}
              alt={product.name}
              fill
              priority
              className="object-contain p-4 transition-transform duration-700 ease-out group-hover:scale-105 drop-shadow-[0_10px_20px_rgba(0,0,0,0.1)]"
            />
          ) : (
            <video
              src={activeMedia.url}
              controls
              autoPlay
              className="max-h-full max-w-full object-contain rounded-xl"
            />
          )}
        </div>
      </div>

      {/* Thumbnails */}
      {(galleryImages.length > 0 || videos.length > 0) && (
        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
          {/* Main Image Thumbnail */}
          <button
            onClick={() => setActiveMedia({ type: "image", url: mainImage })}
            className={`shrink-0 w-20 h-20 bg-white rounded-xl border-2 overflow-hidden flex items-center justify-center p-1 transition-all relative ${
              activeMedia.url === mainImage 
                ? "border-[#00843D] shadow-md shadow-emerald-600/20 scale-105" 
                : "border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100"
            }`}
          >
            <Image src={mainImage} alt="Main view" fill className="object-contain p-2" />
          </button>

          {/* Gallery Thumbnails */}
          {galleryImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveMedia({ type: "image", url: img })}
              className={`shrink-0 w-20 h-20 bg-white rounded-xl border-2 overflow-hidden flex items-center justify-center p-1 transition-all relative ${
                activeMedia.url === img 
                  ? "border-[#00843D] shadow-md shadow-emerald-600/20 scale-105" 
                  : "border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100"
              }`}
            >
              <Image src={img} alt={`Gallery view ${i + 1}`} fill className="object-contain p-2" />
            </button>
          ))}

          {/* Video Thumbnails */}
          {videos.map((vid, i) => (
            <button
              key={`vid-${i}`}
              onClick={() => setActiveMedia({ type: "video", url: vid })}
              className={`shrink-0 w-20 h-20 bg-white rounded-xl border-2 overflow-hidden flex items-center justify-center relative transition-all group ${
                activeMedia.url === vid 
                  ? "border-[#00843D] shadow-md shadow-emerald-600/20 scale-105" 
                  : "border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100"
              }`}
            >
              <Play className="text-[#00843D] w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
