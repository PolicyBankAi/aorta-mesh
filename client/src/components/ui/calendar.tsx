import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

/**
 * Calendar (AORTA Mesh hardened)
 * ------------------------------
 * - Cyan/black theme
 * - Accessible nav buttons
 * - Testable with data-testid
 * - Clear states: today, selected, disabled
 */
function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-black text-cyan-200 rounded-lg border border-cyan-400", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center text-cyan-400 font-semibold",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline", size: "icon" }),
          "h-7 w-7 bg-black text-cyan-300 border-cyan-400 p-0 hover:bg-gray-900 hover:text-cyan-400 focus:ring-2 focus:ring-cyan-500"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-cyan-400 rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal text-cyan-200 hover:bg-gray-900 aria-selected:opacity-100"
        ),
        day_selected:
          "bg-cyan-600 text-black border border-cyan-400 hover:bg-cyan-700 focus:bg-cyan-700 focus:text-black",
        day_today: "border border-cyan-400 text-cyan-400 font-bold",
        day_outside:
          "text-gray-500 opacity-60 aria-selected:bg-cyan-600/50",
        day_disabled:
          "text-gray-600 opacity-40 line-through cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-cyan-500/50 aria-selected:text-black",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ className, ...props }) => (
          <ChevronLeft
            aria-label="Previous month"
            className={cn("h-4 w-4 text-cyan-300", className)}
            {...props}
          />
        ),
        IconRight: ({ className, ...props }) => (
          <ChevronRight
            aria-label="Next month"
            className={cn("h-4 w-4 text-cyan-300", className)}
            {...props}
          />
        ),
      }}
      data-testid="calendar"
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
