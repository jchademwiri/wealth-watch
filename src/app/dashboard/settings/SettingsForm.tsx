'use client'

import { useState } from 'react'
import { saveUserSettings } from '@/actions/settings'
import type { UserSettings } from '@/db/schema'

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Section title="Profile">
        <Field label="First name" name="firstName" type="text" defaultValue={s?.firstName ?? 'Jacob'} disabled={pending} />
      </Section>

      <Section title="Email reminders">
        <Field label="Reminder email" name="reminderEmail" type="email" defaultValue={s?.reminderEmail ?? ''} placeholder="you@email.com" disabled={pending} />
        <div>
          <label className="mb-1.5 block text-sm font-medium">Frequency</label>
          <select name="reminderFrequency" defaultValue={s?.reminderFrequency ?? 'weekly'} disabled={pending}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
            <option value="weekly">Weekly (recommended)</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Day of week</label>
          <select name="reminderDay" defaultValue={s?.reminderDay ?? 'monday'} disabled={pending}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
            {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
              <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
            ))}
          </select>
        </div>
        <Field label="Time (SAST)" name="reminderTime" type="time" defaultValue={s?.reminderTime ?? '08:00'} disabled={pending} />
        <p className="text-xs text-muted-foreground">
          The cron job runs at 08:00 SAST (06:00 UTC) every Monday by default.
          To change frequency, update <code className="font-mono">vercel.json</code>.
        </p>
      </Section>

      <Section title="Display">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Currency symbol</label>
          <select name="currencySymbol" defaultValue={s?.currencySymbol ?? 'R'} disabled={pending}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50">
            <option value="R">R — South African Rand (ZAR)</option>
            <option value="$">$ — US Dollar (USD)</option>
            <option value="£">£ — British Pound (GBP)</option>
            <option value="€">€ — Euro (EUR)</option>
          </select>
        </div>
      </Section>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-60"
      >
        {pending ? 'Saving…' : 'Save settings'}
      </button>
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
