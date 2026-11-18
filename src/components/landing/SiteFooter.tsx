import Link from "next/link";
import { LogoMark } from "./SiteHeader";

const COLUMNS = [
  {
    title: "Produit",
    links: [
      { href: "/#fonctionnement", label: "Fonctionnement" },
      { href: "/#fichiers", label: "Fichiers Excel" },
      { href: "/templates", label: "Galerie des modèles" },
      { href: "/#tarifs", label: "Tarifs" },
    ],
  },
  {
    title: "Compte",
    links: [
      { href: "/connexion", label: "Se connecter" },
      { href: "/inscription", label: "Créer un compte école" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-16 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10">
        <div>
          <Link href="/" className="flex items-center gap-2.5 font-serif text-xl font-semibold">
            <LogoMark className="h-[22px] w-8 text-teal-500" />
            CarteÉcole
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
            Importez la liste de vos élèves, choisissez un modèle, imprimez des cartes au format carte bancaire (85,6 × 54 mm).
          </p>
        </div>
        {COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <p className="font-serif text-lg font-semibold">{column.title}</p>
            <ul className="mt-4 grid gap-3 text-sm text-white/65">
              {column.links.map((link) => (
                <li key={link.href}><Link href={link.href} className="hover:text-white">{link.label}</Link></li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-[1440px] px-6 py-6 text-xs text-white/45 lg:px-10">© 2026 CarteÉcole</p>
      </div>
    </footer>
  );
}
