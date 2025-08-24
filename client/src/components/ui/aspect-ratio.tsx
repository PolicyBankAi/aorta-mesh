import * as React from "react";
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

/**
 * AspectRatio (AORTA Mesh wrapper)
 * --------------------------------
 * - Default ratio fallback (16:9)
 * - Testability via data-testid
 * - For embedding images, video, dashboards
 */

interface AspectRatioProps
  extends React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root> {
  ratio?: number; // Optional prop with default
  "data-testid"?: string;
}

const AspectRatio = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  AspectRatioProps
>(({ ratio = 16 / 9, "data-testid": testId = "aspect-ratio", ...props }, ref) => (
  <AspectRatioPrimitive.Root ref={ref} ratio={ratio} data-testid={testId} {...props} />
));

AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
