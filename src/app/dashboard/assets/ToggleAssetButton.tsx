"use client";

import { useTransition } from "react";
import { toggleAssetActive } from "@/actions/assets";
import { Button } from "@/components/ui/button";

export function ToggleAssetButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          void toggleAssetActive(id);
        })
      }
      className="rounded-sm text-muted-foreground"
    >
      {pending ? "…" : isActive ? "Archive" : "Restore"}
    </Button>
  );
}
