import Link from "next/link";

const NAV = [
  { href: "/#fonctionnement", label: "Fonctionnement" },
  { href: "/#fichiers", label: "Fichiers Excel" },
  { href: "/#modeles", label: "Modèles de carte" },
  { href: "/#tarifs", label: "Tarifs" },
  { href: "/#questions", label: "Questions" },
];

export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 22" className={className} aria-hidden="true">
      <rect width="32" height="22" rx="4" fill="currentColor" />
      <circle cx="9.5" cy="9" r="3.2" fill="#fff" />
      <path d="M4.5 18c.6-3 2.4-4.3 5-4.3s4.4 1.3 5 4.3z" fill="#fff" />
      <rect x="18" y="6.5" width="9" height="2" rx="1" fill="#fff" />
      <rect x="18" y="11" width="6" height="2" rx="1" fill="#fff" opacity=".6" />
    </svg>
  );
}

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-6 lg:px-10">
        <Link href="/" className="flex items-center gap-2.5 font-serif text-xl font-semibold tracking-tight">
          <LogoMark className="h-[22px] w-8 text-teal-700" />
          CarteÉcole
        </Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-8 text-sm text-ink/75 lg:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-ink">{item.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/connexion" className="hidden px-3 py-2 font-medium text-ink/80 hover:text-ink sm:block">Se connecter</Link>
          <Link href="/inscription" className="rounded-md bg-ink px-4 py-2.5 font-medium text-white hover:bg-[#09543f]">Essai gratuit</Link>
        </div>
      </div>
    </header>
  );
}
