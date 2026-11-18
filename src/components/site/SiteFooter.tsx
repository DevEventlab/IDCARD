import Link from "next/link";
import Logo from "./Logo";
import { BRAND } from "@/lib/brand";

export default function SiteFooter() {
  return (
    <footer className="surface-dark border-t border-white/10">
      <div className="wrap grid gap-12 py-16 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">
            Importez la liste de vos élèves, choisissez un modèle, imprimez des cartes au format carte bancaire (85,6 × 54 mm).
          </p>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Produit</p>
          <ul className="mt-4 grid gap-3 text-white/60">
            <li><Link href="/#fonctionnement" className="transition-colors hover:text-lime">Fonctionnement</Link></li>
            <li><Link href="/#fichiers" className="transition-colors hover:text-lime">Fichiers Excel</Link></li>
            <li><Link href="/templates" className="transition-colors hover:text-lime">Galerie des modèles</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold text-white">Compte</p>
          <ul className="mt-4 grid gap-3 text-white/60">
            <li><Link href="/connexion" className="transition-colors hover:text-lime">Se connecter</Link></li>
            <li><Link href="/inscription" className="transition-colors hover:text-lime">Créer un compte école</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="wrap py-6 text-xs text-white/45">© {new Date().getFullYear()} {BRAND}</p>
      </div>
    </footer>
  );
}
