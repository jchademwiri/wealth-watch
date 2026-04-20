/**
 * Format a number as ZAR currency.
 * e.g. 3723.52 → "R3 723,52" (SA locale) or "R3,723.52" (en-US style)
 */
export function formatZAR(value: number, options?: { compact?: boolean }): string {
  if (options?.compact && Math.abs(value) >= 1000) {
    return `R${(value / 1000).toFixed(1)}k`
  }
  return `R${value.toLocaleString('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format a return percentage with + or - prefix.
 * e.g. -27.0 → "-27.00%" | 24.1 → "+24.10%"
 */
export function formatPct(value: number, decimals = 2): string {
  const formatted = Math.abs(value).toFixed(decimals)
  return value >= 0 ? `+${formatted}%` : `-${formatted}%`
}

/**
 * Format a date as "15 Apr 2026"
 */
export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-ZA', {
    day:   'numeric',
    month: 'short',
    year:  'numeric',
  })
}

/**
 * Format a date as "Apr 15" (short, for chart labels)
 */
export function formatDateShort(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-ZA', {
    day:   'numeric',
    month: 'short',
  })
}

/**
 * Format a date as "Mon 15 Apr" (for snapshot headers)
 */
export function formatDateFull(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-ZA', {
    weekday: 'short',
    day:     'numeric',
    month:   'long',
    year:    'numeric',
  })
}

/**
 * Return a Tailwind-compatible color class based on a positive/negative value.
 */
export function pnlColor(value: number): string {
  if (value > 0) return 'text-emerald-600 dark:text-emerald-400'
  if (value < 0) return 'text-red-500 dark:text-red-400'
  return 'text-muted-foreground'
}

/**
 * Return a Tailwind background class for P&L badges.
 */
export function pnlBadgeClass(value: number): string {
  if (value > 0) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
  if (value < 0) return 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
  return 'bg-muted text-muted-foreground'
}

/**
 * Truncate asset name for display in tight spaces.
 */
export function truncateName(name: string, maxLength = 12): string {
  return name.length > maxLength ? name.slice(0, maxLength - 1) + '…' : name
}
