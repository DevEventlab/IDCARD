"use client";

import { useState } from "react";
import Link from "next/link";
import CardPreview from "@/components/cards/CardPreview";
import { TEMPLATES } from "@/components/cards";
import { MOCK_DATA } from "@/lib/mock";
import type { CardData, CardSide } from "@/lib/card-types";

const SCALE = 0.51;

export default function TemplatesPage() {
  const [side, setSide] = useState<CardSide>("front");
  const [primary, setPrimary] = useState(MOCK_DATA.school.primary);
  const [secondary, setSecondary] = useState(MOCK_DATA.school.secondary);
  const [classe, setClasse] = useState(MOCK_DATA.student.classe);

  const data: CardData = {
    ...MOCK_DATA,
    school: { ...MOCK_DATA.school, primary, secondary },
    student: { ...MOCK_DATA.student, classe },
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="surface-dark glow-olive border-b border-white/10">
        <div className="wrap py-12 lg:py-16">
          <Link href="/" className="text-sm text-white/65 underline decoration-white/30 underline-offset-4 transition-colors hover:text-lime">Retour à l&apos;accueil</Link>
          <h1 className="mt-5 text-[clamp(2.2rem,5vw,3.75rem)] font-extrabold leading-[1.02] tracking-[-.04em]">Modèles de carte</h1>
          <p className="mt-3 max-w-xl leading-7 text-white/65">Aperçu avec des données fictives. Changez les couleurs de l&apos;école pour voir le rendu.</p>
        </div>
      </div>

      <div className="wrap py-10">
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4 rounded-[18px] border border-line bg-white p-4 sm:px-6">
          <div className="inline-flex overflow-hidden rounded-[10px] border border-line-strong text-sm">
            {(["front", "back"] as const).map((s) => (
              <button key={s} onClick={() => setSide(s)} aria-pressed={side === s} className={`px-5 py-2.5 font-medium transition-colors ${side === s ? "bg-ink text-lime" : "bg-white hover:bg-[#f4f8e6]"}`}>
                {s === "front" ? "Recto" : "Verso"}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-3 text-sm font-medium">
            Couleur principale
            <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-line-strong bg-white p-0.5" />
          </label>
          <label className="flex items-center gap-3 text-sm font-medium">
            Accent
            <input type="color" value={secondary} onChange={(e) => setSecondary(e.target.value)} className="h-9 w-12 cursor-pointer rounded-lg border border-line-strong bg-white p-0.5" />
          </label>
          <label className="flex items-center gap-3 text-sm font-medium">
            Classe
            <input value={classe} onChange={(e) => setClasse(e.target.value)} className="input w-28" />
          </label>
        </div>

        <div className="mt-10 grid min-w-0 gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-2">
          {TEMPLATES.map((t) => (
            <section key={t.id} className="min-w-0">
              <div className="surface-dark glow-soft grid min-h-[340px] place-items-center overflow-hidden rounded-[18px] p-6">
                <CardPreview templateId={t.id} data={data} side={side} scale={t.orientation === "landscape" ? SCALE : 0.45} />
              </div>
              <h2 className="mt-4 text-lg font-bold tracking-tight">{t.name}</h2>
              <p className="text-sm text-muted">
                {t.description} · {t.orientation === "landscape" ? "paysage" : "portrait"}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
