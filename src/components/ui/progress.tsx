"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ProgressProps = {
  value?: number;
  className?: string;
  indicatorClassName?: string;
};

export const Progress = ({
  className,
  value = 0,
  indicatorClassName,
}: ProgressProps) => (
  <div
    className={cn(
      "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
  >
    <div
      className={cn(
        "h-full bg-primary transition-all duration-300 ease-out",
        indicatorClassName
      )}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);
