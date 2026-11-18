"use client";

import Link from "next/link";
import { useState } from "react";

/* À ADAPTER : prix (FCFA / mois), plafonds d'élèves et contact commercial. */
const CONTACT_HREF = "mailto:contact@carteecole.com";
const YEARLY_MONTHS_BILLED = 10; // 12 mois pour le prix de 10

type Plan = {
  id: string;
  name: string;
  audience: string;
  monthly: number | null;
  students: string;
  features: string[];
  cta: string;
  href: string;
  highlight?: boolean;
};

const PLANS: Plan[] = [
  {
    id: "essentiel",
    name: "Essentiel",
    audience: "Pour les petites écoles",
    monthly: 15000,
    students: "Jusqu'à 300 élèves",
    features: [
      "Import Excel et photos en ZIP",
      "Rapport de validation avant impression",
      "Les quatre modèles de carte, recto et verso",
      "PDF une carte par page ou planches A4",
    ],
    cta: "Commencer l'essai gratuit",
    href: "/inscription",
  },
  {
    id: "etablissement",
    name: "Établissement",
    audience: "Pour la plupart des écoles",
    monthly: 35000,
    students: "Jusqu'à 1 000 élèves",
    features: [
      "Tout ce qui est inclus dans Essentiel",
      "Logo, couleurs et devise de l'école",
      "QR code de vérification au verso",
      "Régénération par classe ou école entière",
      "Historique des PDF, à retélécharger à tout moment",
    ],
    cta: "Commencer l'essai gratuit",
    href: "/inscription",
    highlight: true,
  },
  {
    id: "reseau",
    name: "Réseau",
    audience: "Groupes scolaires",
    monthly: null,
    students: "Plusieurs établissements",
    features: [
      "Tout ce qui est inclus dans Établissement",
      "Un espace par école",
      "Aide à la mise en route",
      "Facturation unique",
    ],
    cta: "Nous contacter",
    href: CONTACT_HREF,
  },
];

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

function Check({ dark }: { dark?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" className={`mt-1 h-4 w-4 shrink-0 ${dark ? "text-lime" : "text-olive"}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

export default function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <div>
      <div role="radiogroup" aria-label="Période de facturation" className="inline-flex rounded-full border border-line-strong bg-white p-1 text-sm">
        {([
          { value: false, label: "Mensuel" },
          { value: true, label: "Annuel" },
        ] as const).map((option) => (
          <button
            key={option.label}
            type="button"
            role="radio"
            aria-checked={yearly === option.value}
            onClick={() => setYearly(option.value)}
            className={`rounded-full px-5 py-2 font-semibold transition-colors ${yearly === option.value ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
          >
            {option.label}
            {option.value && <span className={`ml-2 text-xs font-semibold ${yearly ? "text-lime" : "text-olive"}`}>2 mois offerts</span>}
          </button>
        ))}
      </div>

      <div className="mt-10 grid items-stretch gap-5 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const dark = plan.highlight;
          const perMonth = plan.monthly === null ? null : yearly ? Math.round((plan.monthly * YEARLY_MONTHS_BILLED) / 12) : plan.monthly;
          return (
            <article
              key={plan.id}
              className={
                dark
                  ? "surface-dark glow-olive relative flex flex-col overflow-hidden rounded-[22px] border border-lime/60 p-8 lg:-my-4 lg:p-10"
                  : "flex flex-col rounded-[22px] border border-line bg-white p-8 lg:p-10"
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">{plan.name}</h3>
                  <p className={`mt-1 text-sm ${dark ? "text-white/65" : "text-muted"}`}>{plan.audience}</p>
                </div>
                {dark && <span className="shrink-0 whitespace-nowrap rounded-full bg-lime px-3 py-1 text-xs font-bold text-ink">Le plus choisi</span>}
              </div>

              <div className="mt-8 min-h-[5.5rem]">
                {perMonth === null ? (
                  <p className="text-4xl font-bold tracking-tight">Sur devis</p>
                ) : (
                  <>
                    <p className="flex items-baseline gap-2">
                      <span className="text-5xl font-extrabold tabular-nums tracking-tight">{fmt(perMonth)}</span>
                      <span className={`text-sm ${dark ? "text-white/65" : "text-muted"}`}>FCFA / mois</span>
                    </p>
                    <p className={`mt-2 text-sm ${dark ? "text-white/65" : "text-muted"}`}>
                      {yearly && plan.monthly ? `Facturé ${fmt(plan.monthly * YEARLY_MONTHS_BILLED)} FCFA par an` : "Facturé chaque mois"}
                    </p>
                  </>
                )}
              </div>

              <p className={`mt-6 border-t pt-6 font-semibold ${dark ? "border-white/15" : "border-line"}`}>{plan.students}</p>
              <ul className="mt-5 grid gap-3 text-[15px] leading-6">
                {plan.features.map((feature) => (
                  <li key={feature} className={`flex gap-3 ${dark ? "text-white/85" : "text-[#2f3727]"}`}>
                    <Check dark={dark} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-10">
                {plan.href.startsWith("mailto:") ? (
                  <a href={plan.href} className="button-secondary w-full">{plan.cta}</a>
                ) : (
                  <Link href={plan.href} className={`${dark ? "btn-lime" : "button-primary"} w-full`}>
                    {plan.cta}
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <p className="mt-8 text-sm text-muted">Chaque formule démarre par un essai gratuit de 14 jours. Prix en FCFA.</p>
    </div>
  );
}
