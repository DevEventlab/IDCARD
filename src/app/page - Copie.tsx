import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import HeroDemo from "@/components/landing/HeroDemo";
import GalleryStrip from "@/components/landing/GalleryStrip";
import Pricing from "@/components/landing/Pricing";
import { EXCEL_MODELS } from "@/lib/brand";

const SPECS = [
  { value: "85,6 × 54", unit: "mm", label: "format carte bancaire" },
  { value: "1 000", unit: "élèves", label: "dans un seul fichier" },
  { value: "06", unit: "modèles", label: "recto · verso" },
  { value: "QR", unit: "au verso", label: "vérification intégrée" },
];

const STEPS = [
  { no: "01", file: "modele-ecole.xlsx", title: "La liste entre en atelier", text: "Un fichier clair, une ligne par élève. Choisissez un fichier pour toute l'école ou un fichier par classe.", tag: "DONNÉES" },
  { no: "02", file: "photos.zip", title: "Chaque portrait trouve sa place", text: "Les photos nommées avec le matricule s'associent automatiquement. Les oublis et doublons sont repérés avant l'impression.", tag: "ASSEMBLAGE" },
  { no: "03", file: "cartes.pdf", title: "La classe sort en cartes", text: "Choisissez un modèle, vérifiez le rendu, puis exportez un PDF au format carte ou en planches A4 prêtes à découper.", tag: "IMPRESSION" },
];

const FEATURES = [
  { index: "A", title: "Rien ne part à l'aveugle", text: "Un rapport signale matricules en double, photos manquantes et colonnes vides avant le tirage." },
  { index: "B", title: "Une identité, six finitions", text: "Logo, couleurs et devise de l'école suivent chacun des six modèles, du plus sobre au plus institutionnel." },
  { index: "C", title: "Un contrôle au verso", text: "Le QR code permet de vérifier l'authenticité de chaque carte." },
  { index: "D", title: "Le bon format, tout de suite", text: "PDF individuel au format CR80 ou planches A4 avec rectos et versos alignés." },
  { index: "E", title: "La liberté de recommencer", text: "Changez de modèle sans réimporter les élèves : régénérez une classe ou toute l'école." },
  { index: "F", title: "Chaque tirage reste accessible", text: "Retrouvez l'historique de vos PDF et téléchargez à nouveau une génération quand vous en avez besoin." },
];

const SHEET_ROWS = [
  ["2026-0001", "AGBODJI", "Marie Claire", "6eA", "2026-0001.jpg"],
  ["2026-0002", "DOSSOU", "Koffi", "6eA", "2026-0002.jpg"],
  ["2026-0003", "HOUNKPATIN", "Afi", "6eB", "2026-0003.jpg"],
];

const FAQ = [
  { q: "Comment fonctionne l'abonnement ?", a: "L'abonnement est souscrit par établissement, au mois ou à l'année. L'essai gratuit de 14 jours donne accès à toutes les fonctions : vous choisissez la formule ensuite." },
  { q: "Puis-je changer de formule ou résilier ?", a: "Oui, à tout moment depuis votre espace. Après une résiliation, vos PDF déjà générés restent téléchargeables pendant une période de grâce." },
  { q: "Pourquoi les photos ne sont-elles pas dans le fichier Excel ?", a: "Des photos collées dans Excel alourdissent le fichier, se déplacent quand on trie les lignes et perdent en qualité. Un ZIP de photos nommées avec le matricule est fiable, et chaque photo reste réutilisable d'une année sur l'autre." },
  { q: "Combien d'élèves par fichier ?", a: "Jusqu'à 1 000 élèves par fichier. Au-delà, utilisez le format « un fichier par classe »." },
  { q: "Que se passe-t-il si un élève n'a pas de photo ?", a: "La carte est générée avec un avatar par défaut, et l'élève apparaît dans le rapport de validation pour que vous puissiez ajouter la photo plus tard." },
  { q: "Quelle taille de carte ?", a: "Le format standard carte bancaire CR80 (85,6 × 54 mm), compatible avec la plupart des imprimantes de cartes PVC. Vous pouvez aussi imprimer sur papier épais et plastifier." },
  { q: "Peut-on changer de modèle plus tard ?", a: "Oui. Les données restent dans votre espace : vous pouvez régénérer toute l'école ou une seule classe avec un autre modèle, sans réimporter." },
];

function SectionTitle({ title, text, dark = false }: { title: React.ReactNode; text: string; dark?: boolean }) {
  return (
    <div className="grid items-end gap-6 lg:grid-cols-[1.6fr_.7fr] lg:gap-16">
      <h2 className="max-w-4xl text-[clamp(2.2rem,4.6vw,3.4rem)] font-bold leading-[1.05] tracking-[-.035em]">{title}</h2>
      <p className={`max-w-md leading-7 ${dark ? "text-white/65" : "text-muted"}`}>{text}</p>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="overflow-hidden">
        {/* Ouverture : fond noir et lueur olive, titre à fort contraste d'échelle, démo cadrée en lime */}
        <section className="surface-dark glow-olive relative">
          <span className="tile -left-24 top-56 hidden h-56 w-56 -rotate-[18deg] lg:block" aria-hidden="true" />
          <span className="tile -right-20 bottom-40 hidden h-48 w-48 rotate-[16deg] lg:block" aria-hidden="true" />
          <div className="wrap relative pb-16 pt-16 text-center lg:pt-24">
            <h1 className="mx-auto max-w-5xl">
              <span className="block text-[clamp(1.5rem,3.4vw,2.6rem)] font-bold tracking-tight">Une école. Mille visages.</span>
              <span className="mt-2 block text-balance text-[clamp(3rem,9vw,7.5rem)] font-extrabold leading-[.95] tracking-[-.05em]">Zéro carte à refaire.</span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/75">
              <span className="font-semibold text-lime">CarteÉcole</span> transforme votre fichier d’élèves en cartes d’identité scolaires, prêtes à imprimer.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link href="/inscription" className="btn-lime px-7 py-4 text-base">Lancer mon premier tirage</Link>
              <a href="#fonctionnement" className="btn-outline-light px-7 py-4 text-base">Voir comment ça marche</a>
            </div>
            <p className="mt-5 text-sm text-white/50">14 jours pour essayer · sans carte bancaire</p>

            <div className="relative mt-16 text-left"><HeroDemo /></div>
          </div>

          <div className="relative border-t border-white/10">
            <div className="wrap grid grid-cols-2 lg:grid-cols-4">
              {SPECS.map((spec, i) => (
                <div key={spec.label} className={`px-2 py-7 lg:px-8 ${i % 2 === 0 ? "border-r border-white/10" : ""} ${i < 2 ? "border-b border-white/10 lg:border-b-0" : ""} lg:border-r lg:border-white/10 lg:first:pl-0 lg:last:border-r-0`}>
                  <p className="flex items-baseline gap-2"><span className="text-2xl font-bold tracking-tight">{spec.value}</span><span className="text-sm font-semibold text-lime">{spec.unit}</span></p>
                  <p className="mt-1 text-sm text-white/55">{spec.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Parcours en trois étapes */}
        <section id="fonctionnement" className="scroll-mt-20 bg-white">
          <div className="wrap py-24 lg:py-32">
            <SectionTitle title={<>Du tableur<br />au tour de cou.</>} text="Pas de mise en page manuelle. Pas de copier-coller photo par photo. Un flux pensé pour toute une école." />
            <ol className="relative mt-16 grid gap-12 lg:grid-cols-3 lg:gap-10">
              <div className="absolute left-[22px] top-6 hidden h-px w-[calc(100%-2rem)] bg-line-strong lg:block" aria-hidden="true" />
              {STEPS.map((step) => (
                <li key={step.no} className="relative">
                  <span className="relative z-10 grid h-11 w-11 place-items-center rounded-full bg-ink text-sm font-bold text-lime ring-8 ring-white">{step.no}</span>
                  <p className="mt-6 text-sm font-semibold capitalize text-olive">{step.tag.toLowerCase()}</p>
                  <h3 className="mt-2 text-2xl font-bold leading-tight tracking-tight">{step.title}</h3>
                  <p className="mt-3 leading-7 text-muted">{step.text}</p>
                  <code className="mt-5 inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-xs font-medium text-ink"><span className="text-olive" aria-hidden="true">↳</span>{step.file}</code>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Fichiers Excel : le tableur blanc posé sur le noir, comme l'écran de l'affiche */}
        <section id="fichiers" className="surface-dark glow-olive scroll-mt-20">
          <div className="wrap py-24 lg:py-32">
            <SectionTitle dark title="Le fichier, c'est votre plan de coupe." text="Deux façons de ranger les élèves. Les deux modèles incluent les consignes, les colonnes requises et une ligne d'exemple." />
            <div className="mt-14 grid gap-5 md:grid-cols-2">
              <article className="flex flex-col rounded-[18px] border border-white/12 bg-night/80 p-7">
                <h3 className="text-xl font-bold tracking-tight">Un classeur, toute l&apos;école</h3>
                <p className="mt-1 text-sm font-medium text-lime">Vue école</p>
                <p className="mt-4 text-sm leading-6 text-white/70">Tous les élèves dans un fichier ; la classe est indiquée sur chaque ligne.</p>
                <p className="mt-3 text-xs leading-5 text-white/45">Matricule · nom · prénoms · naissance · sexe · classe · année · photo · contact parent</p>
                <div className="mt-auto pt-6"><a href={EXCEL_MODELS.format1} download className="btn-lime">Prendre le modèle Excel <span aria-hidden="true">↓</span></a></div>
              </article>
              <article className="flex flex-col rounded-[18px] border border-white/12 bg-night/80 p-7">
                <h3 className="text-xl font-bold tracking-tight">Un classeur par classe</h3>
                <p className="mt-1 text-sm font-medium text-lime">Vue classe</p>
                <p className="mt-4 text-sm leading-6 text-white/70">Pratique si plusieurs personnes préparent les listes. Le nom de classe est renseigné une seule fois.</p>
                <p className="mt-3 text-xs leading-5 text-white/45">Mêmes colonnes, sans la colonne classe : elle est portée par le fichier.</p>
                <div className="mt-auto pt-6"><a href={EXCEL_MODELS.format2} download className="btn-outline-light">Prendre le modèle Excel <span aria-hidden="true">↓</span></a></div>
              </article>
            </div>
            <figure className="frame-lime mt-5 rounded-[14px] p-2 sm:p-3">
              <div className="overflow-hidden rounded-[8px] bg-white text-ink">
                <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
                  <span className="text-sm font-semibold">modele-ecole.xlsx</span>
                  <span className="badge badge-lime">Prêt à remplir</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="data-table min-w-[560px]">
                    <thead><tr>{["matricule", "nom", "prénoms", "classe", "photo"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
                    <tbody>{SHEET_ROWS.map((row) => <tr key={row[0]}>{row.map((cell, i) => <td key={i} className={i === 4 ? "text-xs font-medium text-olive" : ""}>{cell}</td>)}</tr>)}</tbody>
                  </table>
                </div>
                <figcaption className="border-t border-line px-5 py-3 text-xs text-muted">Une ligne = un élève. La photo est associée par le matricule.</figcaption>
              </div>
            </figure>
            <aside className="mt-10 grid gap-3 border-l-2 border-lime pl-6 sm:grid-cols-[170px_1fr]">
              <h3 className="text-lg font-bold tracking-tight">Les portraits</h3>
              <p className="max-w-3xl text-sm leading-6 text-white/70">Les photos ne se collent pas dans Excel : nommez-les avec le matricule (ex. <code className="rounded bg-white/10 px-1.5 py-0.5 text-white">2026-0001.jpg</code>), placez-les dans un ZIP et envoyez-le avec le fichier. JPG ou PNG, portrait 3:4, 2 Mo maximum par photo.</p>
            </aside>
          </div>
        </section>

        {/* Modèles de carte */}
        <section id="modeles" className="scroll-mt-20 bg-white">
          <div className="wrap py-24 lg:py-32">
            <SectionTitle title={<>La même école.<br />Six caractères.</>} text="Sobre, coloré, institutionnel : trouvez la forme qui ressemble à votre établissement. Le recto et le verso sont conçus ensemble." />
            <div className="mt-14"><GalleryStrip /></div>
            <Link href="/templates" className="button-secondary mt-12">Parcourir les six modèles <span aria-hidden="true">↗</span></Link>
          </div>
        </section>

        {/* Garanties */}
        <section className="surface-dark glow-soft">
          <div className="wrap grid gap-14 py-24 lg:grid-cols-[.8fr_1.2fr] lg:py-32">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="text-[clamp(2.2rem,5vw,3.75rem)] font-bold leading-[1.05] tracking-[-.035em]">Les erreurs restent à l&apos;écran.</h2>
              <p className="mt-6 max-w-sm leading-7 text-white/65">Pas découvertes au moment de distribuer les cartes.</p>
              <Link href="/inscription" className="btn-lime mt-9">Préparer mon premier tirage</Link>
            </div>
            <dl className="grid gap-x-10 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <div key={f.index} className="border-t border-white/15 py-7">
                  <dt className="flex items-start gap-3 text-lg font-bold leading-snug tracking-tight"><span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-[3px] bg-lime" aria-hidden="true" />{f.title}</dt>
                  <dd className="mt-3 pl-[1.4rem] text-sm leading-6 text-white/60">{f.text}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* Tarifs */}
        <section id="tarifs" className="scroll-mt-20 bg-white">
          <div className="wrap py-24 lg:py-32">
            <SectionTitle title={<>Un abonnement.<br />Pas de mauvaise surprise.</>} text="La formule suit le nombre d'élèves de votre établissement. Générez autant de PDF que nécessaire pendant l'année." />
            <div className="mt-12"><Pricing /></div>
          </div>
        </section>

        {/* Questions */}
        <section id="questions" className="scroll-mt-20 border-t border-line bg-white">
          <div className="wrap grid gap-14 py-24 lg:grid-cols-[.7fr_1.3fr] lg:py-32">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <h2 className="text-[clamp(2.2rem,5vw,3.75rem)] font-bold leading-[1.05] tracking-[-.035em]">Avant le premier tirage.</h2>
              <p className="mt-5 max-w-sm leading-7 text-muted">Quelques réponses pratiques pour que tout roule dès la première classe.</p>
            </div>
            <div className="divide-y divide-line border-y border-line">
              {FAQ.map((item) => (
                <details key={item.q} className="group py-6">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-semibold leading-snug marker:hidden [&::-webkit-details-marker]:hidden">
                    <span>{item.q}</span>
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line-strong text-lg leading-none transition group-open:rotate-45 group-open:border-ink group-open:bg-lime" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-4 max-w-2xl leading-7 text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Appel final */}
        <section className="surface-dark glow-olive relative">
          <span className="tile -left-20 bottom-10 hidden h-44 w-44 -rotate-[16deg] lg:block" aria-hidden="true" />
          <div className="wrap relative py-24 text-center lg:py-32">
            <h2 className="mx-auto max-w-4xl text-[clamp(2.4rem,6.5vw,5rem)] font-extrabold leading-[1] tracking-[-.045em]">La rentrée commence par une bonne liste.</h2>
            <p className="mt-6 text-white/65">14 jours d&apos;essai gratuit · sans carte bancaire</p>
            <Link href="/inscription" className="btn-lime mt-9 px-8 py-4 text-base">Créer le compte de mon école</Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
