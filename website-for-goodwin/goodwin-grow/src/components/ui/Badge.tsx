import React from "react";
import { cn } from "../../lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'ai';
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-canvas-variant text-secondary-dark border-transparent",
    success: "bg-primary/10 text-primary-dark border-primary/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    destructive: "bg-danger/10 text-danger border-danger/20",
    ai: "bg-tertiary/20 text-secondary-dark border-tertiary",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
