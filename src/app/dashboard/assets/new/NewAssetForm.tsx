"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createAsset } from "@/actions/assets";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const PRESET_COLORS = [
  "#1B3A8A",
  "#7F77DD",
  "#378ADD",
  "#D85A30",
  "#BA7517",
  "#1D9E75",
  "#E24B4A",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F59E0B",
  "#6B7280",
];

const ASSET_TYPES = [
  { value: "etf", label: "ETF" },
  { value: "stock", label: "Stock" },
  { value: "crypto", label: "Crypto" },
  { value: "unit_trust", label: "Unit Trust" },
  { value: "cash", label: "Cash / Money Market" },
  { value: "bond", label: "Bond" },
  { value: "reit", label: "REIT" },
  { value: "other", label: "Other" },
];

const BROKERS = [
  { value: "easy_equities", label: "EasyEquities" },
  { value: "luno", label: "Luno" },
  { value: "satrix", label: "Satrix" },
  { value: "allan_gray", label: "Allan Gray" },
  { value: "absa", label: "ABSA" },
  { value: "fnb", label: "FNB" },
  { value: "nedbank", label: "Nedbank" },
  { value: "standard_bank", label: "Standard Bank" },
  { value: "other", label: "Other" },
];

export function NewAssetForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      ticker: (fd.get("ticker") as string) || null,
      type: fd.get("type") as any,
      broker: fd.get("broker") as any,
      color,
      notes: (fd.get("notes") as string) || null,
      sortOrder: 0,
    };

    startTransition(async () => {
      const result = await createAsset(data);
      if (result.error) {
        setError(JSON.stringify(result.error));
      } else {
        router.push("/dashboard/assets");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="rounded-sm border bg-card p-4 space-y-4">
        <div>
          <Label htmlFor="name" className="mb-1.5 block">
            Asset name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="e.g. Large Cap, Bitcoin, S&P 500 SPDR"
          />
        </div>

        <div>
          <Label htmlFor="ticker" className="mb-1.5 block">
            Ticker symbol{" "}
            <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="ticker"
            name="ticker"
            placeholder="e.g. STXNDQ, BTC, SPY"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="mb-1.5 block">Type</Label>
            <Select name="type" defaultValue="etf">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ASSET_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">Broker / platform</Label>
            <Select name="broker" defaultValue="easy_equities">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select broker" />
              </SelectTrigger>
              <SelectContent>
                {BROKERS.map((b) => (
                  <SelectItem key={b.value} value={b.value}>
                    {b.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Colour</Label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <Button
                key={c}
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Select ${c} colour`}
                onClick={() => setColor(c)}
                className="h-7 w-7 rounded-sm transition-transform hover:scale-110"
                style={{
                  background: c,
                  outline: color === c ? `3px solid ${c}` : "none",
                  outlineOffset: "2px",
                }}
              />
            ))}
            <Input
              id="color"
              type="color"
              name="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-7 w-7 rounded-sm border-0 bg-transparent p-0"
              title="Custom colour"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="notes" className="mb-1.5 block">
            Notes <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Textarea
            id="notes"
            name="notes"
            rows={2}
            placeholder="e.g. 3x leveraged NASDAQ ETF — high risk"
          />
        </div>
      </div>

      {error && (
        <p className="rounded-sm bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Saving…" : "Add asset"}
      </Button>
    </form>
  );
}
