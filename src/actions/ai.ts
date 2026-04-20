'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { aiInsights } from '@/db/schema'
import { desc } from 'drizzle-orm'
import {
  calcTotalDeposited,
  calcPnL,
  calcReturnPct,
  calcTWRR,
  monthsBetween,
  calcRecentTrend,
} from '@/lib/calculations'
import type { PortfolioInsightData } from '@/types'

const MODEL = 'gemini-2.0-flash'

async function generateGeminiText(prompt: string, maxOutputTokens: number): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY (or GOOGLE_API_KEY)')
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens,
          temperature: 0.7,
        },
      }),
    }
  )

  if (!response.ok) {
    const details = await response.text()
    throw new Error(`Gemini request failed (${response.status}): ${details}`)
  }

  const data = await response.json() as {
    candidates?: Array<{
      content?: {
        parts?: Array<{ text?: string }>
      }
    }>
  }

  const text = data.candidates?.[0]?.content?.parts?.map(part => part.text ?? '').join('').trim()
  if (!text) {
    throw new Error('Gemini returned empty response')
  }

  return text
}

// ─── Build insight data from DB ───────────────────────────────────────────────

async function getPortfolioInsightData(): Promise<PortfolioInsightData> {
  const [allDeposits, allSnapshots, allPortfolioSnaps, activeAssets] = await Promise.all([
    db.query.deposits.findMany({ with: { asset: true } }),
    db.query.snapshots.findMany({ with: { asset: true } }),
    db.query.portfolioSnapshots.findMany({
      orderBy: (p, { asc }) => [asc(p.snapshotAt)],
    }),
    db.query.assets.findMany({
      where: (a, { eq }) => eq(a.isActive, true),
    }),
  ])

  const totalDeposited = calcTotalDeposited(allDeposits)

  // Get latest snapshot per asset
  const latestPerAsset: Record<string, number> = {}
  for (const asset of activeAssets) {
    const assetSnaps = allSnapshots
      .filter(s => s.assetId === asset.id)
      .sort((a, b) => new Date(b.snapshotAt).getTime() - new Date(a.snapshotAt).getTime())
    latestPerAsset[asset.id] = assetSnaps[0] ? parseFloat(assetSnaps[0].value) : 0
  }

  const currentValue = Object.values(latestPerAsset).reduce((s, v) => s + v, 0)
  const pnl          = calcPnL(currentValue, totalDeposited)
  const pnlPct       = calcReturnPct(currentValue, totalDeposited)
  const twrr         = calcTWRR(allPortfolioSnaps, allDeposits)

  const firstDepositDate = allDeposits.reduce((earliest, d) => {
    const dt = new Date(d.depositedAt)
    return dt < earliest ? dt : earliest
  }, new Date())
  const periodMonths = monthsBetween(firstDepositDate, new Date())

  const holdings = activeAssets.map(asset => {
    const deposited  = allDeposits
      .filter(d => d.assetId === asset.id)
      .reduce((s, d) => s + parseFloat(d.amount), 0)
    const current    = latestPerAsset[asset.id] ?? 0
    const returnPct  = calcReturnPct(current, deposited)
    const weight     = currentValue > 0 ? (current / currentValue) * 100 : 0
    return { name: asset.name, deposited, current, returnPct, weight }
  })

  const deposits = allDeposits
    .sort((a, b) => new Date(b.depositedAt).getTime() - new Date(a.depositedAt).getTime())
    .slice(0, 10)
    .map(d => ({
      date:      new Date(d.depositedAt).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }),
      amount:    parseFloat(d.amount),
      assetName: (d as any).asset?.name ?? 'Unknown',
    }))

  const recentTrend = calcRecentTrend(allPortfolioSnaps)

  return {
    totalDeposited, currentValue, pnl, pnlPct,
    twrr, periodMonths, holdings, deposits, recentTrend,
  }
}

// ─── Build prompt ─────────────────────────────────────────────────────────────

function buildPrompt(data: PortfolioInsightData): string {
  const pnlSign = data.pnl >= 0 ? '+' : ''
  return `You are a personal finance assistant for a South African retail investor. Analyse this portfolio and give a direct, honest, specific insight.

## Portfolio Summary
- Total deposited: R${data.totalDeposited.toFixed(2)}
- Current value: R${data.currentValue.toFixed(2)}
- Unrealised P&L: ${pnlSign}R${data.pnl.toFixed(2)} (${pnlSign}${data.pnlPct.toFixed(2)}%)
- Time-weighted return (TWRR): ${data.twrr.toFixed(2)}%
- Investment period: ${data.periodMonths} months
- Recent trend: ${data.recentTrend}

## Holdings (deposited → current, return %)
${data.holdings.map(h => `- ${h.name}: deposited R${h.deposited.toFixed(2)}, now R${h.current.toFixed(2)} (${h.returnPct >= 0 ? '+' : ''}${h.returnPct.toFixed(1)}%), ${h.weight.toFixed(1)}% of portfolio`).join('\n')}

## Recent Deposit History
${data.deposits.map(d => `- ${d.date}: R${d.amount.toFixed(2)} → ${d.assetName}`).join('\n')}

## Instructions
1. Open with the single most important insight (1–2 sentences). Be direct.
2. Identify the biggest drag or risk and name it specifically (asset name, percentage).
3. Comment on the TWRR vs simple return difference if meaningful.
4. Give ONE specific, actionable recommendation for the next deposit or rebalance action.
5. If the portfolio is underwater on real invested capital, say so clearly — don't soften it.
6. Maximum 220 words. No generic disclaimers. Use R amounts, not percentages alone.
7. Format with short paragraphs, no bullet points.`
}

// ─── Main action ──────────────────────────────────────────────────────────────

export async function generatePortfolioInsight(): Promise<{ data?: string; error?: string }> {
  try {
    const insightData = await getPortfolioInsightData()
    const prompt      = buildPrompt(insightData)
    const response    = await generateGeminiText(prompt, 500)

    await db.insert(aiInsights).values({
      snapshotAt: new Date(),
      prompt,
      response,
      model: MODEL,
    })

    revalidatePath('/')
    revalidatePath('/dashboard/insights')

    return { data: response }
  } catch (err) {
    console.error('AI insight error:', err)
    return { error: err instanceof Error ? err.message : 'Failed to generate insight. Check your GEMINI_API_KEY.' }
  }
}

// ─── Fetch latest cached insight ──────────────────────────────────────────────

export async function getLatestInsight() {
  try {
    return await db.query.aiInsights.findFirst({
      orderBy: desc(aiInsights.createdAt),
    })
  } catch (error) {
    console.error('Failed to load latest insight:', error)
    return null
  }
}

export async function getAllInsights() {
  try {
    return await db.query.aiInsights.findMany({
      orderBy: desc(aiInsights.createdAt),
    })
  } catch (error) {
    console.error('Failed to load all insights:', error)
    return []
  }
}

// ─── Short summary for email ──────────────────────────────────────────────────

export async function generateEmailSummary(data: PortfolioInsightData): Promise<string> {
  const prompt = `Summarise this South African investor's portfolio in 2 sentences for a reminder email. Be direct. Total deposited: R${data.totalDeposited.toFixed(2)}, current value: R${data.currentValue.toFixed(2)}, P&L: R${data.pnl.toFixed(2)} (${data.pnlPct.toFixed(2)}%). Worst holding: ${data.holdings.sort((a, b) => a.returnPct - b.returnPct)[0]?.name ?? 'n/a'}.`
  return generateGeminiText(prompt, 150)
}
