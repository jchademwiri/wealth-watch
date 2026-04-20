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

  try {
    const [asset] = await db.insert(assets).values(parsed.data).returning()
    revalidatePath('/')
    revalidatePath('/dashboard/assets')
    return { data: asset }
  } catch (error) {
    console.error('Failed to create asset:', error)
    return { error: 'Failed to create asset' }
  }
}

export async function updateAsset(
  id: string,
  input: Partial<z.infer<typeof insertAssetSchema>>
) {
  try {
    const [asset] = await db
      .update(assets)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(assets.id, id))
      .returning()

    revalidatePath('/')
    revalidatePath('/dashboard/assets')
    return { data: asset }
  } catch (error) {
    console.error('Failed to update asset:', error)
    return { error: 'Failed to update asset' }
  }
}

export async function toggleAssetActive(id: string) {
  try {
    const existing = await db.query.assets.findFirst({ where: eq(assets.id, id) })
    if (!existing) return { error: 'Asset not found' }

    const [asset] = await db
      .update(assets)
      .set({ isActive: !existing.isActive, updatedAt: new Date() })
      .where(eq(assets.id, id))
      .returning()

    revalidatePath('/dashboard/assets')
    return { data: asset }
  } catch (error) {
    console.error('Failed to toggle asset active state:', error)
    return { error: 'Failed to update asset status' }
  }
}
