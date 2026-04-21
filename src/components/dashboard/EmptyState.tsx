import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: LucideIcon;
  badge?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  icon: Icon,
  badge,
  className,
}: Props) {
  return (
    <Card className={cn("rounded-sm", className)}>
      <CardContent className="p-8 text-center">
        {Icon && (
          <Icon className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        )}
        {badge && (
          <div className="mx-auto mb-3 inline-flex rounded-sm bg-primary/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
            {badge}
          </div>
        )}
        <p className="font-medium text-foreground">{title}</p>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
        {actionHref && actionLabel && (
          <Link
            href={actionHref}
            className="mt-3 inline-block text-sm text-primary hover:underline"
          >
            {actionLabel}
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
