import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Checkbox (AORTA Mesh hardened)
 * ------------------------------
 * - Cyan/black theme
 * - Accessibility: supports aria-label/aria-labelledby
 * - Testable via data-testid
 * - Clear checked/indeterminate states
 */

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    "data-testid"?: string;
  }
>(({ className, "data-testid": testId = "checkbox", ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-cyan-400 bg-black text-cyan-400",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      "data-[state=checked]:bg-cyan-600 data-[state=checked]:text-black",
      "data-[state=indeterminate]:bg-yellow-500 data-[state=indeterminate]:text-black",
      className
    )}
    data-testid={testId}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className="flex items-center justify-center text-current"
    >
      <Check className="h-3 w-3" aria-hidden="true" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";

export { Checkbox };
