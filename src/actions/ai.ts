"use server";

import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { aiInsights } from "@/db/schema";
import {
  calcPnL,
  calcRecentTrend,
  calcReturnPct,
  calcTotalDeposited,
  calcTWRR,
  monthsBetween,
} from "@/lib/calculations";
import type { PortfolioInsightData } from "@/types";

const MODEL = "google/gemini-2.0-flash";

export interface AiInsightError {
  title: string;
  message: string;
  suggestion?: string;
  statusCode?: number;
  retryAfter?: string;
  details?: string[];
}

async function generateGeminiText(
  prompt: string,
  maxOutputTokens: number,
): Promise<string> {
  const gatewayKey = process.env.AI_GATEWAY_API_KEY;
  if (!gatewayKey) {
    throw new Error("Missing AI_GATEWAY_API_KEY");
  }

  const response = await fetch(
    "https://ai-gateway.vercel.sh/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${gatewayKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash",
        messages: [{ role: "user", content: prompt }],
        max_tokens: maxOutputTokens,
        temperature: 0.7,
      }),
    },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `AI Gateway request failed (${response.status}): ${details}`,
    );
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
    error?: {
      message?: string;
    };
  };

  if (data.error) {
    throw new Error(`AI Gateway error: ${data.error.message}`);
  }

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) {
    throw new Error("AI Gateway returned empty response");
  }

  return text;
}

// ─── Build insight data from DB ───────────────────────────────────────────────

async function getPortfolioInsightData(): Promise<PortfolioInsightData> {
  const [allDeposits, allSnapshots, allPortfolioSnaps, activeAssets] =
    await Promise.all([
      db.query.deposits.findMany({ with: { asset: true } }),
      db.query.snapshots.findMany({ with: { asset: true } }),
      db.query.portfolioSnapshots.findMany({
        orderBy: (p, { asc }) => [asc(p.snapshotAt)],
      }),
      db.query.assets.findMany({
        where: (a, { eq }) => eq(a.isActive, true),
      }),
    ]);

  const totalDeposited = calcTotalDeposited(allDeposits);

  // Get latest snapshot per asset
  const latestPerAsset: Record<string, number> = {};
  for (const asset of activeAssets) {
    const assetSnaps = allSnapshots
      .filter((s) => s.assetId === asset.id)
      .sort(
        (a, b) =>
          new Date(b.snapshotAt).getTime() - new Date(a.snapshotAt).getTime(),
      );
    latestPerAsset[asset.id] = assetSnaps[0]
      ? parseFloat(assetSnaps[0].value)
      : 0;
  }

  const currentValue = Object.values(latestPerAsset).reduce((s, v) => s + v, 0);
  const pnl = calcPnL(currentValue, totalDeposited);
  const pnlPct = calcReturnPct(currentValue, totalDeposited);
  const twrr = calcTWRR(allPortfolioSnaps, allDeposits);

  const firstDepositDate = allDeposits.reduce((earliest, d) => {
    const dt = new Date(d.depositedAt);
    return dt < earliest ? dt : earliest;
  }, new Date());
  const periodMonths = monthsBetween(firstDepositDate, new Date());

  const holdings = activeAssets.map((asset) => {
    const deposited = allDeposits
      .filter((d) => d.assetId === asset.id)
      .reduce((s, d) => s + parseFloat(d.amount), 0);
    const current = latestPerAsset[asset.id] ?? 0;
    const returnPct = calcReturnPct(current, deposited);
    const weight = currentValue > 0 ? (current / currentValue) * 100 : 0;
    return { name: asset.name, deposited, current, returnPct, weight };
  });

  const deposits = allDeposits
    .sort(
      (a, b) =>
        new Date(b.depositedAt).getTime() - new Date(a.depositedAt).getTime(),
    )
    .slice(0, 10)
    .map((d) => ({
      date: new Date(d.depositedAt).toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      amount: parseFloat(d.amount),
      assetName: d.asset?.name ?? "Unknown",
    }));

  const recentTrend = calcRecentTrend(allPortfolioSnaps);

  return {
    totalDeposited,
    currentValue,
    pnl,
    pnlPct,
    twrr,
    periodMonths,
    holdings,
    deposits,
    recentTrend,
  };
}

// ─── Build prompt ─────────────────────────────────────────────────────────────

function buildPrompt(data: PortfolioInsightData): string {
  const pnlSign = data.pnl >= 0 ? "+" : "";
  return `You are a personal finance assistant for a South African retail investor. Analyse this portfolio and give a direct, honest, specific insight.

## Portfolio Summary
- Total deposited: R${data.totalDeposited.toFixed(2)}
- Current value: R${data.currentValue.toFixed(2)}
- Unrealised P&L: ${pnlSign}R${data.pnl.toFixed(2)} (${pnlSign}${data.pnlPct.toFixed(2)}%)
- Time-weighted return (TWRR): ${data.twrr.toFixed(2)}%
- Investment period: ${data.periodMonths} months
- Recent trend: ${data.recentTrend}

## Holdings (deposited → current, return %)
${data.holdings.map((h) => `- ${h.name}: deposited R${h.deposited.toFixed(2)}, now R${h.current.toFixed(2)} (${h.returnPct >= 0 ? "+" : ""}${h.returnPct.toFixed(1)}%), ${h.weight.toFixed(1)}% of portfolio`).join("\n")}

## Recent Deposit History
${data.deposits.map((d) => `- ${d.date}: R${d.amount.toFixed(2)} → ${d.assetName}`).join("\n")}

## Instructions
1. Open with the single most important insight (1–2 sentences). Be direct.
2. Identify the biggest drag or risk and name it specifically (asset name, percentage).
3. Comment on the TWRR vs simple return difference if meaningful.
4. Give ONE specific, actionable recommendation for the next deposit or rebalance action.
5. If the portfolio is underwater on real invested capital, say so clearly — don't soften it.
6. Maximum 220 words. No generic disclaimers. Use R amounts, not percentages alone.
7. Format with short paragraphs, no bullet points.`;
}

// ─── AI error formatting helpers ─────────────────────────────────────────────

function extractErrorJson(message: string): unknown {
  const jsonStart = message.indexOf("{");
  if (jsonStart === -1) {
    return undefined;
  }

  const rawJson = message.slice(jsonStart);
  try {
    return JSON.parse(rawJson);
  } catch {
    return undefined;
  }
}

function formatAiError(error: unknown): AiInsightError {
  const message = error instanceof Error ? error.message : String(error);
  const parsed = extractErrorJson(message) as
    | {
        error?: {
          code?: number;
          message?: string;
          status?: string;
          details?: Array<{
            "@type"?: string;
            retryDelay?: string;
            violations?: Array<{
              quotaMetric?: string;
              quotaId?: string;
              quotaDimensions?: Record<string, string>;
            }>;
          }>;
        };
      }
    | undefined;

  const apiError = parsed?.error;
  const retryDelay = apiError?.details?.find(
    (detail) => detail.retryDelay,
  )?.retryDelay;
  const quotaViolations = apiError?.details
    ?.flatMap((detail) => detail.violations ?? [])
    .map((violation) => {
      const model = violation.quotaDimensions?.model;
      if (violation.quotaMetric?.includes("requests") && model) {
        return `Request limit reached for ${model}.`;
      }

      if (violation.quotaMetric?.includes("input_token_count") && model) {
        return `Input token quota reached for ${model}.`;
      }

      return (
        violation.quotaMetric ?? violation.quotaId ?? "Quota limit reached."
      );
    });

  if (
    /quota/i.test(message) ||
    /RESOURCE_EXHAUSTED/.test(message) ||
    /rate limit/i.test(message)
  ) {
    return {
      title: "AI quota reached",
      message:
        "The AI provider rejected this request because the current key has no available quota.",
      suggestion:
        "Check your AI Gateway or provider plan, confirm the AI_GATEWAY_API_KEY in `.env.local`, and try again once quota is available.",
      statusCode: apiError?.code ?? 429,
      retryAfter: retryDelay,
      details: quotaViolations?.length
        ? Array.from(new Set(quotaViolations))
        : ["Request quota is unavailable for the configured AI model."],
    };
  }

  if (/Missing AI_GATEWAY_API_KEY/i.test(message)) {
    return {
      title: "Missing AI Gateway key",
      message: "No AI Gateway API key is configured for this app.",
      suggestion:
        "Set `AI_GATEWAY_API_KEY` in `.env.local`, then restart the app.",
    };
  }

  if (/empty response/i.test(message)) {
    return {
      title: "Empty AI response",
      message:
        "The AI provider completed the request but did not return any text.",
      suggestion:
        "Try refreshing again. If it keeps happening, reduce prompt size or inspect the provider response.",
    };
  }

  return {
    title: "AI insight failed",
    message: "The portfolio insight could not be generated right now.",
    suggestion:
      "Check the API key, quota, and provider response, then try again.",
  };
}

// ─── Main action ──────────────────────────────────────────────────────────────

export async function generatePortfolioInsight(): Promise<{
  data?: string;
  error?: AiInsightError;
}> {
  try {
    const insightData = await getPortfolioInsightData();
    const prompt = buildPrompt(insightData);
    const response = await generateGeminiText(prompt, 500);

    await db.insert(aiInsights).values({
      snapshotAt: new Date(),
      prompt,
      response,
      model: MODEL,
    });

    revalidatePath("/");
    revalidatePath("/dashboard/insights");

    return { data: response };
  } catch (err) {
    console.error("AI insight error:", err);
    return { error: formatAiError(err) };
  }
}

// ─── Fetch latest cached insight ──────────────────────────────────────────────

export async function getLatestInsight() {
  try {
    const insight = await db.query.aiInsights.findFirst({
      orderBy: desc(aiInsights.createdAt),
      limit: 1,
    });
    return insight ?? null;
  } catch (error) {
    console.error("Failed to load latest insight:", error);
    return null;
  }
}

export async function getAllInsights() {
  try {
    return await db.query.aiInsights.findMany({
      orderBy: desc(aiInsights.createdAt),
      limit: 100,
    });
  } catch (error) {
    console.error("Failed to load all insights:", error);
    return [];
  }
}

// ─── Short summary for email ──────────────────────────────────────────────────

export async function generateEmailSummary(
  data: PortfolioInsightData,
): Promise<string> {
  const prompt = `Summarise this South African investor's portfolio in 2 sentences for a reminder email. Be direct. Total deposited: R${data.totalDeposited.toFixed(2)}, current value: R${data.currentValue.toFixed(2)}, P&L: R${data.pnl.toFixed(2)} (${data.pnlPct.toFixed(2)}%). Worst holding: ${data.holdings.sort((a, b) => a.returnPct - b.returnPct)[0]?.name ?? "n/a"}.`;
  return generateGeminiText(prompt, 150);
}
