'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Layers,
  ArrowDownToLine,
  Camera,
  Sparkles,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const nav = [
  { href: '/dashboard',                    label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/dashboard/assets',             label: 'Assets',     icon: Layers },
  { href: '/dashboard/deposits',           label: 'Deposits',   icon: ArrowDownToLine },
  { href: '/dashboard/snapshots',          label: 'Snapshots',  icon: Camera },
  { href: '/dashboard/insights',           label: 'AI Insights', icon: Sparkles },
  { href: '/dashboard/settings',           label: 'Settings',   icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-screen w-56 flex-col border-r bg-card">
      <div className="border-b px-5 py-4">
        <p className="font-semibold tracking-tight">WealthWatch</p>
        <p className="text-xs text-muted-foreground">portfolio tracker</p>
      </div>
      <nav className="flex-1 space-y-0.5 p-2 pt-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">v0.1.0 · open source</p>
      </div>
    </aside>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  const mobileNav = nav.slice(0, 5)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex border-t bg-background md:hidden">
      {mobileNav.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex flex-1 flex-col items-center gap-1 py-2 text-xs transition-colors',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="leading-none">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
