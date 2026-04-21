import * as React from "react";

import { cn } from "@/lib/utils";

function Input({
  className,
  type,
  value,
  defaultValue,
  onChange,
  ...props
}: React.ComponentProps<"input">) {
  const [val, setVal] = React.useState(defaultValue ?? "");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVal(e.target.value);
    onChange?.(e);
  };

  return (
    <input
      type={type}
      value={value ?? val}
      onChange={handleChange}
      className={cn(
        "flex h-8 w-full min-w-0 rounded-sm border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
