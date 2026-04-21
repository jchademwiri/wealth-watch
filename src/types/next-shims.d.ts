declare module "next" {
  export interface Metadata {
    title?: string;
    description?: string;
    [key: string]: unknown;
  }
}

declare module "next/cache" {
  export function revalidatePath(path: string, type?: "page" | "layout"): void;
}

declare module "next/link" {
  import type * as React from "react";

  type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

  const Link: React.ForwardRefExoticComponent<
    LinkProps & React.RefAttributes<HTMLAnchorElement>
  >;

  export default Link;
}

declare module "next/navigation" {
  export interface AppRouterInstance {
    push(href: string): void;
    replace(href: string): void;
    refresh(): void;
    back(): void;
  }

  export function useRouter(): AppRouterInstance;
  export function usePathname(): string;
  export function redirect(href: string): never;
}

declare module "next/server" {
  export class NextRequest extends Request {}

  export class NextResponse extends Response {
    static json(
      body: unknown,
      init?: ResponseInit,
    ): NextResponse;
  }
}
