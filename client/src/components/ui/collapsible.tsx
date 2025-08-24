"use client";

import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { cn } from "@/lib/utils";

/**
 * Collapsible (AORTA Mesh hardened)
 * ---------------------------------
 * - Cyan/black theme
 * - Accessibility: ensures trigger has aria-expanded
 * - Testable with data-testid
 * - Smooth expand/collapse transitions
 */

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger> & {
    "data-testid"?: string;
  }
>(({ className, "data-testid": testId = "collapsible-trigger", ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleTrigger
    ref={ref}
    className={cn(
      "w-full flex items-center justify-between px-4 py-2 text-cyan-300 bg-black border border-cyan-400 rounded-md transition hover:bg-gray-900 hover:text-cyan-400",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
      className
    )}
    data-testid={testId}
    {...props}
  />
));
CollapsibleTrigger.displayName = "CollapsibleTrigger";

const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent> & {
    "data-testid"?: string;
  }
>(({ className, "data-testid": testId = "collapsible-content", ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleContent
    ref={ref}
    className={cn(
      "overflow-hidden transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down",
      "bg-black border border-cyan-400 rounded-md p-4 text-cyan-200",
      className
    )}
    data-testid={testId}
    {...props}
  />
));
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
