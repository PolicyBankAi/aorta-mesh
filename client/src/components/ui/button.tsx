import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button (AORTA Mesh hardened)
 * ----------------------------
 * - Cyan/black theming
 * - Variants for workflow states (success, warning, info, destructive)
 * - Accessible (aria support for icon-only)
 * - Testable with data-testid
 */

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-cyan-600 text-black hover:bg-cyan-700 border border-cyan-400",
        secondary:
          "bg-gray-900 text-cyan-300 border border-cyan-400 hover:bg-gray-800",
        destructive:
          "bg-red-600 text-white border border-red-500 hover:bg-red-700",
        success:
          "bg-green-600 text-white border border-green-500 hover:bg-green-700",
        warning:
          "bg-yellow-500 text-black border border-yellow-400 hover:bg-yellow-600",
        info: "bg-blue-600 text-white border border-blue-500 hover:bg-blue-700",
        outline:
          "border border-cyan-400 text-cyan-300 bg-transparent hover:bg-gray-900",
        ghost: "text-cyan-300 hover:bg-gray-900 hover:text-cyan-400",
        link: "text-cyan-400 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10 p-0 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  "data-testid"?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      "data-testid": testId = "button",
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        data-testid={testId}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

