'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { assets, insertAssetSchema } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

export async function getAssets() {
  try {
    return await db.query.assets.findMany({
      orderBy: (a, { asc }) => [asc(a.sortOrder), asc(a.createdAt)],
    })
  } catch (error) {
    console.error('Failed to load assets:', error)
    return []
  }
}

export async function getActiveAssets() {
  try {
    return await db.query.assets.findMany({
      where: eq(assets.isActive, true),
      orderBy: (a, { asc }) => [asc(a.sortOrder), asc(a.createdAt)],
    })
  } catch (error) {
    console.error('Failed to load active assets:', error)
    return []
  }
}

export async function createAsset(input: z.infer<typeof insertAssetSchema>) {
  const parsed = insertAssetSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const [asset] = await db.insert(assets).values(parsed.data).returning()
  revalidatePath('/')
  revalidatePath('/dashboard/assets')
  return { data: asset }
}

export async function updateAsset(
  id: string,
  input: Partial<z.infer<typeof insertAssetSchema>>
) {
  const [asset] = await db
    .update(assets)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(assets.id, id))
    .returning()

  revalidatePath('/')
  revalidatePath('/dashboard/assets')
  return { data: asset }
}

export async function toggleAssetActive(id: string) {
  const existing = await db.query.assets.findFirst({ where: eq(assets.id, id) })
  if (!existing) return { error: 'Asset not found' }

  const [asset] = await db
    .update(assets)
    .set({ isActive: !existing.isActive, updatedAt: new Date() })
    .where(eq(assets.id, id))
    .returning()

  revalidatePath('/dashboard/assets')
  return { data: asset }
}
