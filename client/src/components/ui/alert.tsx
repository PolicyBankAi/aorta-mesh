import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Alert Component (AORTA Mesh hardened)
 * -------------------------------------
 * - Cyan/black design system
 * - Accessible with aria-live
 * - Variants: default, destructive, success, warning, info
 */

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 aria-live-politeness [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4",
  {
    variants: {
      variant: {
        default: "bg-black text-cyan-200 border-cyan-400 [&>svg]:text-cyan-400",
        destructive:
          "bg-black text-red-200 border-red-500 [&>svg]:text-red-500",
        success:
          "bg-black text-green-200 border-green-500 [&>svg]:text-green-500",
        warning:
          "bg-black text-yellow-200 border-yellow-500 [&>svg]:text-yellow-500",
        info: "bg-black text-blue-200 border-blue-500 [&>svg]:text-blue-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    aria-live="polite"
    className={cn(alertVariants({ variant }), className)}
    data-testid={`alert-${variant || "default"}`}
    {...props}
  />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn(
      "mb-1 font-semibold leading-none tracking-tight text-cyan-400",
      className
    )}
    data-testid="alert-title"
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-cyan-200 [&_p]:leading-relaxed", className)}
    data-testid="alert-description"
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };

