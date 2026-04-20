import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { db } from '@/db'
import { portfolioSnapshots } from '@/db/schema'
import { desc } from 'drizzle-orm'
import { PortfolioReminderEmail } from '@/emails/portfolio-reminder'
import { generateEmailSummary } from '@/actions/ai'
import { getPortfolioSummary } from '@/lib/portfolio'
import { calcReturnPct } from '@/lib/calculations'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function GET(req: NextRequest) {
  // ── Auth guard ──────────────────────────────────────────────────────────────
  const auth = req.headers.get('authorization')
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const settings = await db.query.userSettings.findFirst()
    if (!settings?.reminderEmail) {
      return NextResponse.json({ error: 'No reminder email configured' }, { status: 400 })
    }

    // ── Latest portfolio snapshot ──────────────────────────────────────────────
    const latestSnap = await db.query.portfolioSnapshots.findFirst({
      orderBy: desc(portfolioSnapshots.snapshotAt),
    })

    // ── Generate AI summary for email ─────────────────────────────────────────
    let aiSummary: string | undefined
    try {
      const summary    = await getPortfolioSummary()
      const insightData = {
        totalDeposited: summary.totalDeposited,
        currentValue:   summary.currentValue,
        pnl:            summary.pnl,
        pnlPct:         summary.returnPct,
        twrr:           summary.twrr,
        periodMonths:   6,
        holdings:       summary.assets.map(a => ({
          name:       a.name,
          deposited:  a.totalDeposited,
          current:    a.latestValue,
          returnPct:  a.returnPct,
          weight:     summary.currentValue > 0 ? (a.latestValue / summary.currentValue) * 100 : 0,
        })),
        deposits:       [],
        recentTrend:    'stable' as const,
      }
      aiSummary = await generateEmailSummary(insightData)
    } catch {
      // AI summary is optional — don't fail the email if it errors
    }

    // ── Send email ─────────────────────────────────────────────────────────────
    if (!resend) {
      console.error('Missing RESEND_API_KEY')
      return NextResponse.json({ error: 'Missing RESEND_API_KEY' }, { status: 500 })
    }

    const { data, error } = await resend.emails.send({
      from:    `WealthWatch <noreply@${process.env.RESEND_DOMAIN ?? 'yourdomain.com'}>`,
      to:      settings.reminderEmail,
      subject: `📊 Portfolio update reminder — ${new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}`,
      react:   PortfolioReminderEmail({
        firstName:        settings.firstName,
        lastSnapshotDate: latestSnap?.snapshotAt ?? null,
        lastTotalValue:   latestSnap?.totalValue ?? null,
        lastPnlPct:       latestSnap?.pnlPct ?? null,
        updateUrl:        `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/snapshots/new`,
        aiSummary,
      }),
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error }, { status: 500 })
    }

    console.log('✓ Portfolio reminder sent:', data?.id)
    return NextResponse.json({ ok: true, emailId: data?.id })

  } catch (err) {
    console.error('Cron error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
