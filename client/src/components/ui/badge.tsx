import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Badge Component (AORTA Mesh hardened)
 * -------------------------------------
 * - Cyan/black design system
 * - Accessible: role="status"
 * - Variants for workflow states
 */

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border border-cyan-400 bg-cyan-600 text-black hover:bg-cyan-700",
        success: "border border-green-500 bg-green-600 text-white hover:bg-green-700",
        warning: "border border-yellow-500 bg-yellow-600 text-black hover:bg-yellow-700",
        destructive: "border border-red-500 bg-red-600 text-white hover:bg-red-700",
        info: "border border-blue-500 bg-blue-600 text-white hover:bg-blue-700",
        outline: "border border-cyan-400 text-cyan-300 bg-transparent hover:bg-gray-900",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  "data-testid"?: string;
}

function Badge({ className, variant, "data-testid": testId = "badge", ...props }: BadgeProps) {
  return (
    <div
      role="status"
      aria-label={`badge-${variant || "default"}`}
      data-testid={testId}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
