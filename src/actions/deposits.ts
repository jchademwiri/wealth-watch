'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { deposits, insertDepositSchema } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { z } from 'zod'

export async function getDeposits() {
  try {
    return await db.query.deposits.findMany({
      with: { asset: true },
      orderBy: (d, { desc }) => [desc(d.depositedAt)],
    })
  } catch (error) {
    console.error('Failed to load deposits:', error)
    return []
  }
}

export async function getDepositsByAsset(assetId: string) {
  try {
    return await db.query.deposits.findMany({
      where: eq(deposits.assetId, assetId),
      orderBy: (d, { desc }) => [desc(d.depositedAt)],
    })
  } catch (error) {
    console.error('Failed to load deposits by asset:', error)
    return []
  }
}

export async function createDeposit(input: z.infer<typeof insertDepositSchema>) {
  const parsed = insertDepositSchema.safeParse(input)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  const [deposit] = await db.insert(deposits).values(parsed.data).returning()
  revalidatePath('/')
  revalidatePath('/dashboard/deposits')
  return { data: deposit }
}

export async function deleteDeposit(id: string) {
  await db.delete(deposits).where(eq(deposits.id, id))
  revalidatePath('/')
  revalidatePath('/dashboard/deposits')
  return { ok: true }
}

export async function getTotalDeposited(): Promise<number> {
  try {
    const all = await db.query.deposits.findMany()
    return all.reduce((sum, d) => sum + parseFloat(d.amount), 0)
  } catch (error) {
    console.error('Failed to load total deposited:', error)
    return 0
  }
}
