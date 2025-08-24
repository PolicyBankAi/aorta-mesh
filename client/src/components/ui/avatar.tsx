"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

/**
 * Avatar (AORTA Mesh hardened)
 * ----------------------------
 * - Themed (cyan/black)
 * - Supports size variants
 * - Accessible with alt/fallback
 * - Displays initials if image is missing
 */

const avatarSizes = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-14 w-14",
};

interface AvatarProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> {
  size?: keyof typeof avatarSizes;
  "data-testid"?: string;
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(({ className, size = "md", "data-testid": testId = "avatar-root", ...props }, ref) => (
  <AvatarPrimitive.Root
    ref={ref}
    data-testid={testId}
    className={cn(
      "relative flex shrink-0 overflow-hidden rounded-full border border-cyan-400",
      avatarSizes[size],
      className
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Image>,
  React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>
>(({ className, alt, ...props }, ref) => (
  <AvatarPrimitive.Image
    ref={ref}
    alt={alt || "User avatar"}
    className={cn("aspect-square h-full w-full object-cover", className)}
    data-testid="avatar-image"
    {...props}
  />
));
AvatarImage.displayName = "AvatarImage";

interface AvatarFallbackProps
  extends React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> {
  initials?: string; // NEW: show user initials
}

const AvatarFallback = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Fallback>,
  AvatarFallbackProps
>(({ className, initials = "?", ...props }, ref) => (
  <AvatarPrimitive.Fallback
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gray-900 text-cyan-400 font-semibold",
      className
    )}
    data-testid="avatar-fallback"
    {...props}
  >
    {initials}
  </AvatarPrimitive.Fallback>
));
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };

