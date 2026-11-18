"use client";

import Link from "next/link";
import CardPreview from "@/components/cards/CardPreview";
import { MOCK_DATA } from "@/lib/mock";

export default function AuthShell({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  const registering = title.toLowerCase().includes("créer");

  return (
    <main className="auth-page">
      <section className="auth-main">
        <header className="auth-topbar">
          <Link href="/" className="auth-brand"><span className="auth-brand-mark">SC</span><span>Scolar<strong>Card</strong></span></Link>
          <Link href="/" className="auth-back">← <span>Retour au site</span></Link>
        </header>

        <div className="auth-form-wrap">
          <div className="auth-kicker"><span /> ESPACE ÉTABLISSEMENT</div>
          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
          <div className="auth-form-card">{children}</div>
          <p className="auth-secure-note"><span aria-hidden="true">✓</span> Vos informations restent privées et sécurisées.</p>
        </div>
        <footer className="auth-main-footer"><span>© 2026 ScolarCard</span><Link href="/#faq">Besoin d’aide ?</Link></footer>
      </section>

      <aside className="auth-aside">
        <div className="auth-aside-glow" />
        <div className="auth-aside-content">
          <span className="auth-aside-label">SCOLARCARD · CARTES SCOLAIRES</span>
          <h2>{registering ? <>Tout commence avec<br/><em>votre établissement.</em></> : <>Ravi de vous<br/><em>revoir ici.</em></>}</h2>
          <p>{registering ? "Créez votre espace et préparez vos cartes scolaires depuis vos listes Excel." : "Retrouvez vos élèves, vos cartes et vos documents dans l’espace sécurisé de votre établissement."}</p>
          <div className="auth-benefits">
            <span><i>✓</i> Import Excel et CSV</span>
            <span><i>✓</i> Quatre modèles recto verso</span>
            <span><i>✓</i> Export PDF prêt à imprimer</span>
          </div>
          <div className="auth-card-preview"><CardPreview templateId="officiel" data={MOCK_DATA} side="front" scale={0.43} /></div>
          <div className="auth-aside-caption"><span>APERÇU DU MODÈLE OFFICIEL</span><span>300 DPI · FORMAT CR80</span></div>
        </div>
        <div className="auth-aside-bottom"><span>Une carte claire pour chaque élève.</span><span>{registering ? "Déjà inscrit ?" : "Nouveau sur ScolarCard ?"} <Link href={registering ? "/connexion" : "/inscription"}>{registering ? "Se connecter" : "Créer un compte"} →</Link></span></div>
      </aside>
    </main>
  );
}
