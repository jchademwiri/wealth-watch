"use client";

import {
  ArrowDownToLine,
  Camera,
  Layers,
  LayoutDashboard,
  Settings,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/assets", label: "Assets", icon: Layers },
  { href: "/dashboard/deposits", label: "Deposits", icon: ArrowDownToLine },
  { href: "/dashboard/snapshots", label: "Snapshots", icon: Camera },
  { href: "/dashboard/insights", label: "AI Insights", icon: Sparkles },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-sidebar-border/70 bg-sidebar/80 backdrop-blur">
      <div className="px-6 pb-4 pt-6">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-sm bg-linear-to-br from-primary/20 via-primary/10 to-transparent ring-1 ring-primary/10">
            <div className="h-5 w-5 rounded-sm bg-primary/80 shadow-sm" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold tracking-tight text-sidebar-foreground">
              WealthWatch
            </p>
            <span className="mt-0.5 inline-flex items-center gap-1 rounded-sm bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
              ALPHA v0.1.0
            </span>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 pb-4">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                buttonVariants({
                  variant: active ? "secondary" : "ghost",
                  size: "lg",
                }),
                "h-auto w-full justify-start gap-3 rounded-sm px-4 py-3 text-sm transition-all",
                active
                  ? "bg-primary/12 font-medium text-primary shadow-sm ring-1 ring-primary/10"
                  : "text-muted-foreground hover:bg-background/80 hover:text-foreground",
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm transition-colors",
                  active
                    ? "bg-primary/12 text-primary"
                    : "bg-background/70 text-muted-foreground",
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 pb-5 pt-3">
        <Card className="rounded-sm border-sidebar-border/60 bg-background/70 shadow-none">
          <CardContent className="px-4 py-3">
            {/* TODO: Replace with authenticated user details when auth is added */}
            <p className="text-xs text-muted-foreground">Not signed in</p>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const mobileNav = nav.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t border-border/70 bg-background/95 backdrop-blur md:hidden">
      {mobileNav.map(({ href, label, icon: Icon }) => {
        const active =
          pathname === href ||
          (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs transition-colors",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="leading-none">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
