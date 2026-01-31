"use client";

import { useState, useRef } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

  const handleChange = (next: ViewStatus) => {
    setInternalValue(next);
    onChange?.(next);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-row gap-1 p-1 rounded-lg bg-muted/50",
        className,
      )}
    >
      {/* Animated background indicator */}
      <motion.div
        className="absolute inset-y-1 rounded-md bg-background shadow-sm"
        layoutId="activeTab"
        initial={false}
        animate={{
          x: selected === "today" ? 4 : "calc(100% - 4px)",
          width: "calc(50% - 8px)",
        }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
        }}
      />

      <Button
        variant="ghost"
        className={cn(
          "relative z-10 justify-start gap-2 flex-1",
          selected === "today" ? "text-foreground" : "text-muted-foreground",
        )}
        onClick={() => handleChange("today")}
      >
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
      </Button>
      <Button
        variant="ghost"
        className={cn(
          "relative z-10 justify-start gap-2 flex-1",
          selected === "back_burner"
            ? "text-foreground"
            : "text-muted-foreground",
        )}
        onClick={() => handleChange("back_burner")}
      >
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
      </Button>
    </div>
  );
};
