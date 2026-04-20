'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { userSettings } from '@/db/schema'

export async function saveUserSettings(formData: FormData) {
  await db
    .insert(userSettings)
    .values({
      id:                 1,
      firstName:          formData.get('firstName') as string,
      reminderEmail:      formData.get('reminderEmail') as string,
      reminderFrequency:  formData.get('reminderFrequency') as 'weekly' | 'biweekly' | 'monthly',
      reminderDay:        formData.get('reminderDay') as string,
      reminderTime:       formData.get('reminderTime') as string,
      currencySymbol:     formData.get('currencySymbol') as string,
    })
    .onConflictDoUpdate({
      target: userSettings.id,
      set: {
        firstName:          formData.get('firstName') as string,
        reminderEmail:      formData.get('reminderEmail') as string,
        reminderFrequency:  formData.get('reminderFrequency') as 'weekly' | 'biweekly' | 'monthly',
        reminderDay:        formData.get('reminderDay') as string,
        reminderTime:       formData.get('reminderTime') as string,
        currencySymbol:     formData.get('currencySymbol') as string,
        updatedAt:          new Date(),
      },
    })

  revalidatePath('/dashboard/settings')
}
