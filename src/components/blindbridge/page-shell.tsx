import type { ReactNode } from "react";
import { SiteFooter, SiteHeader } from "./site-chrome";

export function PageShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="aurora pointer-events-none absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl px-4 pt-32 pb-16">
        <h1 className="text-4xl font-bold sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted-foreground">{intro}</p>
        <div className="mt-8">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
