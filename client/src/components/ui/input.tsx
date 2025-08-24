import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          // Base
          "flex h-10 w-full rounded-md px-3 py-2 text-sm md:text-base",
          // Theme colors for AORTA Mesh
          "bg-black text-cyan-300 border border-cyan-400 placeholder:text-cyan-600",
          // Focus + accessibility
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
          // File input consistency
          "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-cyan-400",
          // Disabled state
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
