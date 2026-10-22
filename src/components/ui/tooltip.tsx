"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: "right" | "left" | "top" | "bottom";
}

export function Tooltip({ content, children, side = "right" }: TooltipProps) {
  const positionClasses = {
    right: "left-full ml-2 top-1/2 -translate-y-1/2",
    left: "right-full mr-2 top-1/2 -translate-y-1/2",
    top: "bottom-full mb-2 left-1/2 -translate-x-1/2",
    bottom: "top-full mt-2 left-1/2 -translate-x-1/2",
  };

  return (
    <div className="group/tooltip relative">
      {children}
      <div
        className={cn(
          "pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md border",
          "opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200",
          positionClasses[side]
        )}
      >
        {content}
      </div>
    </div>
  );
}
