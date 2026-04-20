"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteDeposit } from "@/actions/deposits";
import { Button } from "@/components/ui/button";

export function DeleteDepositButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      disabled={pending}
      onClick={() => {
        if (!confirm("Delete this deposit?")) return;
        startTransition(() => {
          void deleteDeposit(id);
        });
      }}
      className="text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/60"
    >
      <Trash2 className="h-3.5 w-3.5" />
    </Button>
  );
}
