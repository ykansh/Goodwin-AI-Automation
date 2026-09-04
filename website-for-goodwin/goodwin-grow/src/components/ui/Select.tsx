import React from "react";
import { cn } from "../../lib/utils";

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-canvas-variant bg-canvas-surface px-3 py-2 text-sm text-secondary-dark ring-offset-canvas-surface placeholder:text-secondary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer",
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }
);
Select.displayName = "Select";
