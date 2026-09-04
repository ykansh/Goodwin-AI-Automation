import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-canvas-variant bg-canvas-surface text-secondary-dark shadow-level-1",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 p-6", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold leading-none tracking-tight font-display", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return (
    <div className={cn("p-6 pt-0", className)} {...props} />
  );
}
