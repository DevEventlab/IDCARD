import Link from "next/link";
import Logo from "./Logo";

const LINKS = [
  { href: "/#fonctionnement", label: "Fonctionnement" },
  { href: "/#fichiers", label: "Fichiers Excel" },
  { href: "/#modeles", label: "Modèles de carte" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/#questions", label: "Questions" },
];

export default function SiteHeader() {
  return (
    <header className="surface-dark sticky top-0 z-40 border-b border-white/10">
      <div className="wrap flex h-[68px] items-center justify-between gap-6">
        <Logo light />
        <nav aria-label="Navigation principale" className="hidden items-center gap-8 text-sm text-white/70 lg:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="transition-colors hover:text-white">{l.label}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2 text-sm">
          <Link href="/connexion" className="hidden px-3 py-2 font-medium text-white/80 transition-colors hover:text-white sm:block">Se connecter</Link>
          <Link href="/inscription" className="btn-lime whitespace-nowrap px-4 py-2.5">Créer un compte</Link>
          <details className="group relative lg:hidden">
            <summary aria-label="Ouvrir le menu" className="grid h-10 w-10 cursor-pointer list-none place-items-center rounded-[10px] border border-white/20 marker:hidden [&::-webkit-details-marker]:hidden">
              <span className="grid gap-[5px]" aria-hidden="true">
                <span className="block h-0.5 w-4 bg-white" /><span className="block h-0.5 w-4 bg-white" /><span className="block h-0.5 w-4 bg-white" />
              </span>
            </summary>
            <nav aria-label="Menu mobile" className="absolute right-0 top-12 grid w-64 gap-1 rounded-2xl border border-white/10 bg-night p-3 shadow-2xl">
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} className="rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white">{l.label}</a>
              ))}
              <Link href="/connexion" className="rounded-lg px-3 py-2.5 text-sm text-white/80 hover:bg-white/10 hover:text-white sm:hidden">Se connecter</Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
