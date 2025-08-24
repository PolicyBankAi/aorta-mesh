"use client"

import * as React from "react"
import * as HoverCardPrimitive from "@radix-ui/react-hover-card"

import { cn } from "@/lib/utils"

const HoverCard = HoverCardPrimitive.Root
const HoverCardTrigger = HoverCardPrimitive.Trigger

const HoverCardContent = React.forwardRef<
  React.ElementRef<typeof HoverCardPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof HoverCardPrimitive.Content>
>(
  (
    { className, align = "center", sideOffset = 4, ...props },
    ref
  ) => (
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      role="tooltip"
      className={cn(
        "z-50 w-64 rounded-md border border-cyan-400 bg-black p-4 text-cyan-300 shadow-lg outline-none",
        "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=closed]:animate-out",
        "motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=open]:fade-in-0",
        "motion-safe:data-[state=closed]:zoom-out-95 motion-safe:data-[state=open]:zoom-in-95",
        "motion-safe:data-[side=bottom]:slide-in-from-top-2",
        "motion-safe:data-[side=left]:slide-in-from-right-2",
        "motion-safe:data-[side=right]:slide-in-from-left-2",
        "motion-safe:data-[side=top]:slide-in-from-bottom-2",
        "origin-[--radix-hover-card-content-transform-origin]",
        className
      )}
      {...props}
    />
  )
)
HoverCardContent.displayName = HoverCardPrimitive.Content.displayName

export { HoverCard, HoverCardTrigger, HoverCardContent }
