'use client'

import { useState } from 'react'
import { saveUserSettings } from '@/actions/settings'
import type { UserSettings } from '@/db/schema'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  initialSettings: UserSettings | null
}

export function SettingsForm({ initialSettings }: Props) {
  const s = initialSettings
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const fd = new FormData(e.currentTarget)
    await saveUserSettings(fd)
    setPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
      <div className="space-y-6">
        <Section title="Profile">
          <Field label="First name" name="firstName" type="text" defaultValue={s?.firstName ?? 'Jacob'} disabled={pending} />
        </Section>

        <Section title="Display">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Currency symbol</label>
            <Select name="currencySymbol" defaultValue={s?.currencySymbol ?? 'R'} disabled={pending}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="R">R — South African Rand (ZAR)</SelectItem>
                <SelectItem value="$">$ — US Dollar (USD)</SelectItem>
                <SelectItem value="£">£ — British Pound (GBP)</SelectItem>
                <SelectItem value="€">€ — Euro (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
        >
          {pending ? 'Saving…' : 'Save settings'}
        </button>
      </div>

      <div className="space-y-6">
        <Section title="Email reminders">
          <Field label="Reminder email" name="reminderEmail" type="email" defaultValue={s?.reminderEmail ?? ''} placeholder="you@email.com" disabled={pending} />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Frequency</label>
            <Select name="reminderFrequency" defaultValue={s?.reminderFrequency ?? 'weekly'} disabled={pending}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly (recommended)</SelectItem>
                <SelectItem value="biweekly">Bi-weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Day of week</label>
            <Select name="reminderDay" defaultValue={s?.reminderDay ?? 'monday'} disabled={pending}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map((d) => (
                  <SelectItem key={d} value={d}>
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Field label="Time (SAST)" name="reminderTime" type="time" defaultValue={s?.reminderTime ?? '08:00'} disabled={pending} />
          <p className="text-xs text-muted-foreground">
            The cron job runs at 08:00 SAST (06:00 UTC) every Monday by default.
            To change frequency, update <code className="font-mono">vercel.json</code>.
          </p>
        </Section>
      </div>

    </form>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, name, type, defaultValue, placeholder, disabled }: {
  label:         string
  name:          string
  type:          string
  defaultValue?: string
  placeholder?:  string
  disabled?:     boolean
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
      />
    </div>
  )
}
