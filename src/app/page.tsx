import Link from "next/link";
import HeroDemo from "@/components/landing/HeroDemo";
import Pricing from "@/components/landing/Pricing";
import Studio from "@/components/landing/Studio";

const steps = [
  ["01", "Inscription de l’école", "Créez l’espace sécurisé de votre établissement, renseignez l’année scolaire et ajoutez votre logo."],
  ["02", "Import Excel par classe", "Importez les listes de vos élèves. Les colonnes et les portraits sont associés automatiquement."],
  ["03", "Personnalisation du modèle", "Choisissez une présentation, appliquez les couleurs de votre école et prévisualisez vos cartes."],
  ["04", "Export PDF prêt à imprimer", "Téléchargez vos cartes au format CR80 ou sur des planches A4 avec repères de coupe."],
];

const features = [
  ["▤", "Importation Excel & CSV intelligente", "Importez vos fichiers Excel ou CSV. ScolarCard détecte les colonnes des élèves et signale les doublons."],
  ["▧", "Association automatique des photos", "Ajoutez des portraits nommés par matricule ou nom d’élève. Chaque photo est associée à la bonne fiche."],
  ["⌗", "QR code et code-barres anti-fraude", "Ajoutez un identifiant scannable pour vérifier les cartes et contrôler les accès."],
  ["▦", "Planches A4 et cartes PVC", "Exportez des planches PDF avec repères de coupe ou des cartes au format CR80."],
  ["▤", "Gestion multi-classes et archives", "Organisez les effectifs par niveau et retrouvez les cartes dans l’historique de l’établissement."],
  ["◇", "Sécurité et confidentialité", "Les données et les photos des élèves restent isolées dans l’espace de leur établissement."],
];

const faqs = [
  ["Quel format de fichier puis-je importer ?", "Vous pouvez importer un classeur Excel (.xlsx) préparé avec le modèle fourni dans votre espace. Les listes sont organisées par classe ou pour l’établissement entier."],
  ["Comment associer les photos des élèves ?", "Importez un fichier ZIP dont les photos portent le matricule de l’élève dans leur nom. Vous pouvez ensuite contrôler les associations avant de générer les cartes."],
  ["Peut-on imprimer les cartes sur une imprimante de bureau classique ?", "Oui. Exportez des planches PDF A4 avec repères de coupe ou des cartes au format CR80 pour une imprimante à badges."],
  ["Les données et photos des élèves sont-elles protégées ?", "Chaque établissement dispose de son propre espace. Les données élèves et les photos ne sont pas partagées entre établissements."],
  ["Combien de temps faut-il pour générer 800 cartes ?", "L’import des listes et la génération des cartes par lot préparent rapidement les cartes d’une classe ou de l’établissement."],
];

function BrandMark() {
  return <span className="sc-brand-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="5.5" width="17" height="13" rx="2" stroke="currentColor" strokeWidth="1.8"/><circle cx="9" cy="11" r="2" stroke="currentColor" strokeWidth="1.6"/><path d="M6.5 16c.7-1.3 1.5-2 2.5-2s1.8.7 2.5 2M14 10h4M14 13h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg></span>;
}

export default function Home() {
  return (
    <main className="sc-landing">
      <header className="sc-nav">
        <div className="sc-nav-inner">
          <Link href="/" className="sc-brand"><BrandMark/><span>Scolar<strong>Card</strong></span></Link>
          <nav className="sc-nav-links" aria-label="Navigation principale">
            <a href="#comment-ca-marche">Comment ça marche</a><a href="#simulateur">Modèles &amp; Studio</a><a href="#fonctionnalites">Fonctionnalités</a><a href="#tarifs">Tarifs</a><a href="#faq">FAQ</a>
          </nav>
          <div className="sc-nav-actions"><Link href="/connexion" className="sc-login">Connexion</Link><Link href="/inscription" className="sc-nav-cta">Essai gratuit <span>→</span></Link></div>
          <a className="sc-mobile-cta" href="/inscription">Essai gratuit</a>
          <details className="sc-mobile-menu"><summary aria-label="Ouvrir le menu">☰</summary><nav aria-label="Navigation mobile"><a href="#comment-ca-marche">Comment ça marche</a><a href="#simulateur">Modèles &amp; Studio</a><a href="#fonctionnalites">Fonctionnalités</a><a href="#tarifs">Tarifs</a><a href="#faq">FAQ</a><Link href="/connexion">Connexion</Link></nav></details>
        </div>
      </header>

      <section className="sc-hero">
        <div className="sc-hero-glow" />
        <div className="sc-container sc-hero-grid">
          <div className="sc-hero-copy">
            <span className="sc-pill"><i /> Nouvelle version 2026 · Génération par lot ultra-rapide</span>
            <h1>De votre fichier <em>Excel</em> aux cartes scolaires en <strong>1 clic.</strong></h1>
            <p>Inscrivez votre établissement, importez vos listes d’élèves par classe (.xlsx ou .csv) et laissez <b>ScolarCard</b> extraire chaque ligne pour générer instantanément des cartes d’identité officielles, sécurisées et prêtes à imprimer.</p>
            <div className="sc-hero-buttons"><Link href="/inscription" className="sc-button-dark">✦ <span>Générer mes premières cartes</span> <b>→</b></Link><a href="#simulateur" className="sc-button-light">▷ <span>Tester le studio en direct</span></a></div>
            <div className="sc-metrics"><div><b>1 000+</b><span>Cartes générées / min</span></div><div><b>100%</b><span>Compatible Excel &amp; CSV</span></div><div><b>300 DPI</b><span>Export PDF haute définition</span></div></div>
          </div>
          <div className="sc-hero-demo"><div className="sc-demo-heading"><span><i /> DÉMO INTERACTIVE</span><b>Choisissez une ligne</b></div><HeroDemo /></div>
        </div>
      </section>

      <section className="sc-social"><div className="sc-container"><p>ADOPTÉ PAR PLUS DE 320 ÉTABLISSEMENTS SCOLAIRES, COLLÈGES, LYCÉES ET INSTITUTS SUPÉRIEURS</p><div><span>♜ Collège Montaigne</span><span>▤ Groupe Scolaire Élite</span><span>✦ Institut Polytechnique</span><span>⌂ Lycée Les Lauriers</span></div></div></section>

      <section id="comment-ca-marche" className="sc-section sc-steps"><div className="sc-container"><div className="sc-section-heading"><span className="sc-eyebrow">PROCESSUS SIMPLIFIÉ</span><h2>Comment ça <em>marche ?</em></h2><p>Fini la saisie manuelle interminable sur Photoshop ou Word. Créez les cartes de tout votre établissement en quatre étapes fluides.</p></div><div className="sc-step-grid">{steps.map(([number, title, copy], index) => <article className="sc-step" key={number}><div className={`sc-step-number ${index === 3 ? "is-green" : ""}`}>{number}</div><div className="sc-step-icon">{["⌂", "▤", "✳", "▱"][index]}</div><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section id="simulateur" className="sc-studio-section"><div className="sc-container"><div className="sc-section-heading sc-heading-dark"><span className="sc-eyebrow">STUDIO INTERACTIF EN DIRECT</span><h2>Testez nos 4 modèles de cartes haute précision</h2><p>Des mises en page lumineuses sur fond blanc ou ivoire, pensées pour une lisibilité parfaite à l’impression et adaptées aux établissements scolaires.</p></div><Studio /></div></section>

      <section id="fonctionnalites" className="sc-section sc-features"><div className="sc-container"><div className="sc-section-heading"><span className="sc-eyebrow">CONÇU POUR LES SECRÉTARIATS &amp; DIRECTIONS</span><h2>Tout ce qu’il faut pour automatiser vos cartes scolaires</h2><p>Une plateforme pensée pour réduire les erreurs de saisie et gagner du temps à chaque rentrée scolaire.</p></div><div className="sc-feature-grid">{features.map(([icon, title, copy]) => <article className="sc-feature" key={title}><span>{icon}</span><h3>{title}</h3><p>{copy}</p></article>)}</div></div></section>

      <section id="tarifs" className="sc-section sc-pricing"><div className="sc-container"><div className="sc-section-heading"><span className="sc-eyebrow">TARIFS TRANSPARENTS</span><h2>Un tarif simple, par carte produite</h2><p>Pas d’abonnement mensuel : le tarif proposé dépend du nombre de cartes générées.</p></div><Pricing /></div></section>

      <section id="faq" className="sc-section sc-faq"><div className="sc-container sc-faq-inner"><div className="sc-section-heading"><span className="sc-eyebrow">QUESTIONS FRÉQUENTES</span><h2>Tout savoir sur ScolarCard</h2></div><div className="sc-faq-list">{faqs.map(([question, answer], i) => <details key={question}><summary><span>0{i + 1}</span><b>{question}</b><i>⌄</i></summary><p>{answer}</p></details>)}</div></div></section>

      <section className="sc-final"><div className="sc-container"><div className="sc-final-content"><h2>Prêt à digitaliser les cartes scolaires de votre établissement ?</h2><p>Inscrivez votre école et générez vos premières cartes élèves à partir de votre fichier Excel.</p><div><Link href="/inscription" className="sc-button-green">Créer mon espace école gratuitement <span>→</span></Link><a href="#simulateur" className="sc-final-secondary">Revoir les 4 modèles</a></div></div></div></section>

      <footer className="sc-footer"><div className="sc-container"><div className="sc-footer-main"><div><Link href="/" className="sc-brand sc-brand-footer"><BrandMark/><span>Scolar<strong>Card</strong></span></Link><p>La plateforme SaaS de référence pour créer et imprimer des cartes d’identité scolaires depuis Excel.</p></div><nav aria-label="Plateforme"><a href="#comment-ca-marche">Comment ça marche</a><a href="#simulateur">Modèles de cartes</a><a href="#fonctionnalites">Fonctionnalités</a><a href="#tarifs">Tarifs</a></nav><nav aria-label="Support et informations"><a href="#faq">Centre d’aide &amp; FAQ</a><Link href="/connexion">Espace établissement</Link><a href="#confidentialite">Confidentialité des données</a><a href="#conditions">Conditions d’utilisation</a></nav></div><div className="sc-footer-bottom"><span>© 2026 ScolarCard SaaS. Tous droits réservés.</span><span>Génération sécurisée haute précision · 300 DPI</span></div></div></footer>
    </main>
  );
}
