"use client";

import { QuickCreateItemDialog } from "@/components/features/view/QuickCreateItemDialog";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";

export function GlobalQuickCapture() {
  const { openCreateItem, setOpenCreateItem } = useKeyboardNavigation();

  return (
    <QuickCreateItemDialog
      open={openCreateItem}
      onOpenChange={setOpenCreateItem}
    />
  );
}
