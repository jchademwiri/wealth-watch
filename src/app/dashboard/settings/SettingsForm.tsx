"use client";

import { useState } from "react";
import { saveUserSettings } from "@/actions/settings";
import type { UserSettings } from "@/db/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface Props {
  initialSettings: UserSettings | null;
}

export function SettingsForm({ initialSettings }: Props) {
  const s = initialSettings;
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    await saveUserSettings(fd);
    setPending(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-6 xl:grid-cols-[1fr_1.15fr]"
    >
      <div className="space-y-6">
        <Section title="Profile">
          <Field
            label="First name"
            name="firstName"
            type="text"
            defaultValue={s?.firstName ?? "Jacob"}
            disabled={pending}
          />
        </Section>

        <Section title="Display">
         
          <div>
            <Label className="mb-1.5 block">Currency symbol</Label>
            <Select
              name="currencySymbol"
              defaultValue={s?.currencySymbol ?? "R"}
              disabled={pending}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="R">R — South African Rand (ZAR)</SelectItem>
                <SelectItem value="$">$ — US Dollar (USD)</SelectItem>
                <SelectItem value="£">£ — British Pound (GBP)</SelectItem>
                <SelectItem value="€">€ — Euro (EUR)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>

      <div className="space-y-6">
        <Section title="Email reminders">
          <Field
            label="Reminder email"
            name="reminderEmail"
            type="email"
            defaultValue={s?.reminderEmail ?? ""}
            placeholder="you@email.com"
            disabled={pending}
          />
          <div className="rounded-sm border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-200">
            <strong>Note:</strong> Reminders are sent every Monday at 08:00
            SAST. The frequency/time settings below are stored for future use.
          </div>
        </Section>

        <Section title="Appearance">
          <div className="flex items-center justify-between">
            <div>
              <Label className="block">Theme</Label>
              <p className="text-sm text-muted-foreground">
                Toggle between dark and light mode
              </p>
            </div>
            <ThemeToggle />
          </div>
        </Section>
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border bg-card p-4 space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  type,
  defaultValue,
  placeholder,
  disabled,
}: {
  label: string;
  name: string;
  type: string;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <Label htmlFor={name} className="mb-1.5 block">
        {label}
      </Label>
      <Input
        id={name}
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
