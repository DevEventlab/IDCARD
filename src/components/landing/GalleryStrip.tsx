"use client";

import CardPreview from "@/components/cards/CardPreview";
import { TEMPLATES } from "@/components/cards";
import { MOCK_DATA } from "@/lib/mock";

export default function GalleryStrip() {
  return (
    <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {TEMPLATES.map((t) => (
        <figure key={t.id}>
          <div className="surface-dark glow-soft grid h-[270px] place-items-center overflow-hidden rounded-[18px] p-6">
            <CardPreview templateId={t.id} data={MOCK_DATA} side="front" scale={t.orientation === "landscape" ? 0.3 : 0.24} />
          </div>
          <figcaption className="mt-4">
            <span className="text-base font-bold tracking-tight">{t.name}</span>
            <span className="mt-0.5 block text-sm text-muted">
              {t.description}, {t.orientation === "landscape" ? "format paysage" : "format portrait"}
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
