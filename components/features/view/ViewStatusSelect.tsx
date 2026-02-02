"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { FireIcon, Archive02Icon } from "@hugeicons/core-free-icons";
import { motion } from "motion/react";

export type ViewStatus = "today" | "back_burner";

interface ViewStatusSelectProps {
  value?: ViewStatus;
  defaultValue?: ViewStatus;
  onChange?: (value: ViewStatus) => void;
  className?: string;
  todayCount?: number;
  backBurnerCount?: number;
}

export const ViewStatusSelect = ({
  value,
  defaultValue = "today",
  onChange,
  className,
  todayCount,
  backBurnerCount,
}: ViewStatusSelectProps) => {
  const [internalValue, setInternalValue] = useState<ViewStatus>(defaultValue);
  const selected = value ?? internalValue;
  const handleChange = (next: ViewStatus) => {
    setInternalValue(next);
    onChange?.(next);
  };

  return (
    <div
      className={cn(
        "relative flex flex-row gap-1 p-1 rounded-lg bg-muted/50",
        className,
      )}
    >
      <Button
        variant="ghost"
        className={cn(
          "relative justify-start gap-2 flex-1 min-w-0 shrink overflow-hidden",
          selected === "today" ? "text-foreground" : "text-muted-foreground",
        )}
        onClick={() => handleChange("today")}
      >
        {selected === "today" && (
          <motion.span
            layoutId="activeTab"
            className="absolute inset-0 rounded-md bg-background shadow-sm"
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <HugeiconsIcon icon={FireIcon} />
          <span>Today</span>
          {todayCount !== undefined && todayCount > 0 && (
            <Badge
              variant={selected === "today" ? "secondary" : "outline"}
              className="ml-1 h-5 min-w-5 px-1.5"
            >
              {todayCount}
            </Badge>
          )}
        </span>
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "relative justify-start gap-2 flex-1 min-w-0 shrink overflow-hidden",
          selected === "back_burner"
            ? "text-foreground"
            : "text-muted-foreground",
        )}
        onClick={() => handleChange("back_burner")}
      >
        {selected === "back_burner" && (
          <motion.span
            layoutId="activeTab"
            className="absolute inset-0 rounded-md bg-background shadow-sm"
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 30,
            }}
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <HugeiconsIcon icon={Archive02Icon} />
          <span>Back Burner</span>
          {backBurnerCount !== undefined && backBurnerCount > 0 && (
            <Badge
              variant={selected === "back_burner" ? "secondary" : "outline"}
              className="ml-1 h-5 min-w-5 px-1.5"
            >
              {backBurnerCount}
            </Badge>
          )}
        </span>
      </Button>
    </div>
  );
};
