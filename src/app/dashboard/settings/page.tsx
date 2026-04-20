import { db } from '@/db'
import { SettingsForm } from './SettingsForm'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  let settings = null
  try {
    settings = await db.query.userSettings.findFirst()
  } catch (error) {
    console.error('Failed to load user settings:', error)
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your reminder schedule and preferences.
        </p>
      </div>
      <div className="mx-auto max-w-5xl">
        <SettingsForm initialSettings={settings ?? null} />
      </div>
    </div>
  )
}
