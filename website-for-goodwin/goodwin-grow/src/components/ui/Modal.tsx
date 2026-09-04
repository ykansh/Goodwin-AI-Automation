import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-secondary-dark/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div 
        className={cn(
          "relative z-50 w-full max-w-lg rounded-xl bg-canvas-surface p-6 shadow-level-3 transition-all",
          className
        )}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-display font-semibold text-secondary-dark tracking-tight">
            {title}
          </h2>
          <button 
            onClick={onClose}
            className="rounded-md p-1 text-secondary-light hover:bg-canvas-variant hover:text-secondary-dark transition-colors"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
}
