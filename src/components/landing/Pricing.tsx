import Link from "next/link";

const PRICE_PER_CARD = 100;
const FEATURES = [
  "Import Excel et photos en ZIP",
  "Configuration et aperçu gratuits",
  "Modèles de cartes recto-verso",
  "Export PDF en format carte ou planches A4",
];

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n);

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="mt-1 h-4 w-4 shrink-0 text-lime" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 10.5l4 4 8-9" />
    </svg>
  );
}

export default function Pricing() {
  return (
    <div>
      <div className="grid items-stretch gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <article className="surface-dark glow-olive relative flex flex-col overflow-hidden rounded-[22px] border border-lime/60 p-7 text-white sm:p-9">
          <span className="text-xs font-bold uppercase tracking-[.18em] text-lime">Sans abonnement mensuel</span>
          <h3 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Vous payez au nombre de cartes</h3>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">Configurez votre école et préparez vos lots. Une carte correspond à un élève, recto et verso.</p>

          <div className="mt-8 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-6xl font-extrabold tabular-nums tracking-tight">{fmt(PRICE_PER_CARD)}</span>
            <span className="text-base font-semibold text-white/75">FCFA / carte produite</span>
          </div>
          <p className="mt-2 text-sm text-white/60">Un lot est facturé une seule fois ; le re-téléchargement du même PDF reste gratuit.</p>

          <ul className="mt-7 grid gap-3 text-sm leading-6 sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex gap-3 text-white/85">
                <Check />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <Link href="/inscription" className="btn-lime mt-8 w-full sm:w-fit">Créer mon espace école <span aria-hidden="true">→</span></Link>
        </article>

        <aside className="flex flex-col rounded-[22px] border border-line bg-white p-7 sm:p-9">
          <span className="text-xs font-bold uppercase tracking-[.18em] text-olive">Essai gratuit prévu</span>
          <h3 className="mt-3 text-2xl font-bold tracking-tight">10 jours pour essayer</h3>
          <div className="mt-6 rounded-2xl bg-[#f7faec] p-5">
            <span className="block text-4xl font-extrabold tabular-nums tracking-tight">{fmt(2)} cartes</span>
            <span className="mt-1 block text-sm font-medium text-muted">offertes pendant l’essai</span>
          </div>
          <p className="mt-5 text-sm leading-6 text-muted">Les réglages et aperçus restent gratuits. La facturation est calculée selon le nombre de cartes de chaque nouveau lot.</p>
          <p className="mt-auto pt-6 text-xs leading-5 text-muted">Les factures et la restriction du téléchargement après paiement ne sont pas encore activées. Elles seront mises en place après le choix d’un prestataire de paiement.</p>
        </aside>
      </div>
      <p className="mt-6 text-sm text-muted">Tarif proposé : {fmt(PRICE_PER_CARD)} FCFA par carte. Les conditions de l’essai et la facturation ne sont pas encore appliquées dans l’application.</p>
    </div>
  );
}
