"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { FireIcon, Archive02Icon } from "@hugeicons/core-free-icons";

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
    <div className={cn("flex flex-row gap-1", className)}>
      <Button
        variant={selected === "today" ? "secondary" : "ghost"}
        className="justify-start gap-2"
        onClick={() => handleChange("today")}
      >
        <HugeiconsIcon icon={FireIcon} />
        <span>Today</span>
        {todayCount !== undefined && todayCount > 0 && (
          <Badge variant="outline" className="ml-1 h-5 min-w-5 px-1.5">
            {todayCount}
          </Badge>
        )}
      </Button>
      <Button
        variant={selected === "back_burner" ? "secondary" : "ghost"}
        className="justify-start gap-2"
        onClick={() => handleChange("back_burner")}
      >
        <HugeiconsIcon icon={Archive02Icon} />
        <span>Back Burner</span>
        {backBurnerCount !== undefined && backBurnerCount > 0 && (
          <Badge variant="outline" className="ml-1 h-5 min-w-5 px-1.5">
            {backBurnerCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};
