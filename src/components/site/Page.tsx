import type { ReactNode } from "react";

export function Page({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-4xl font-semibold text-primary-deep md:text-5xl">{title}</h1>
      {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      <div className="gold-rule my-6 w-48" />
      <div className="space-y-4 leading-relaxed text-foreground/85 [&_h2]:mt-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-primary-deep">
        {children}
      </div>
    </div>
  );
}

export const meta = (title: string, description: string) => ({
  meta: [
    { title: `${title} — Angadi` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — Angadi` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ],
});
