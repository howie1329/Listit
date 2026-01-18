"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon, Calendar03Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

export type ViewStatus = "today" | "back_burner";

interface ViewStatusSelectProps {
  value?: ViewStatus;
  defaultValue?: ViewStatus;
  onChange?: (value: ViewStatus) => void;
  className?: string;
}

export const ViewStatusSelect = ({
  value,
  defaultValue = "today",
  onChange,
  className,
}: ViewStatusSelectProps) => {
  const [internalValue, setInternalValue] = useState<ViewStatus>(defaultValue);
  const selected = value ?? internalValue;

  const handleChange = (next: ViewStatus) => {
    setInternalValue(next);
    onChange?.(next);
  };

  const getLabel = (status: ViewStatus) =>
    status === "today" ? "Today" : "Back Burner";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "gap-2 h-11 px-4 text-base md:h-8 md:px-3 md:text-sm",
            className,
          )}
        >
          <HugeiconsIcon icon={Calendar03Icon} />
          <span>{getLabel(selected)}</span>
          <HugeiconsIcon icon={ArrowDown01Icon} />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56">
        <div className="flex flex-col gap-1">
          <Button
            variant={selected === "today" ? "secondary" : "ghost"}
            className="justify-start"
            onClick={() => handleChange("today")}
          >
            Today
          </Button>
          <Button
            variant={selected === "back_burner" ? "secondary" : "ghost"}
            className="justify-start"
            onClick={() => handleChange("back_burner")}
          >
            Back Burner
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
