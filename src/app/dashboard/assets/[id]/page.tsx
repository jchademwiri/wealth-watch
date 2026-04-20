import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { db } from '@/db'
import { eq } from 'drizzle-orm'
import { assets } from '@/db/schema'
import { EditAssetForm } from './EditAssetForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditAssetPage({ params }: Props) {
  const { id } = await params
  let asset = null
  try {
    asset = await db.query.assets.findFirst({
      where: eq(assets.id, id),
    })
  } catch (error) {
    console.error('Failed to load asset by id:', error)
  }

  if (!asset) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Asset not found.</p>
        <Link href="/dashboard/assets" className="mt-2 inline-block text-sm text-primary hover:underline">
          Back to assets →
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard/assets" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-semibold">Edit asset</h1>
      </div>
      <div className="mx-auto max-w-lg">
        <EditAssetForm asset={asset} />
      </div>
    </div>
  )
}
