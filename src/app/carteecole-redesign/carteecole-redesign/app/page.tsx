import Link from "next/link";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import HeroDemo from "@/components/landing/HeroDemo";
import GalleryStrip from "@/components/landing/GalleryStrip";
import Guilloche from "@/components/landing/Guilloche";
import Pricing from "@/components/landing/Pricing";
import { EXCEL_MODELS } from "@/lib/brand";

const SPECS = [
  { value: "85,6 × 54", unit: "mm", label: "format carte bancaire" },
  { value: "1 000", unit: "élèves", label: "dans un seul fichier" },
  { value: "06", unit: "modèles", label: "recto · verso" },
  { value: "QR", unit: "au verso", label: "vérification intégrée" },
];

const STEPS = [
  { no: "01", file: "modele-ecole.xlsx", title: "La liste entre en atelier", text: "Un fichier clair, une ligne par élève. Choisissez un fichier pour toute l&apos;école ou un fichier par classe.", tag: "DONNÉES" },
  { no: "02", file: "photos.zip", title: "Chaque portrait trouve sa place", text: "Les photos nommées avec le matricule s'associent automatiquement. Les oublis et doublons sont repérés avant l'impression.", tag: "ASSEMBLAGE" },
  { no: "03", file: "cartes.pdf", title: "La classe sort en cartes", text: "Choisissez un modèle, vérifiez le rendu, puis exportez un PDF au format carte ou en planches A4 prêtes à découper.", tag: "IMPRESSION" },
];

const FEATURES = [
  { index: "A", title: "Rien ne part à l'aveugle", text: "Un rapport signale matricules en double, photos manquantes et colonnes vides avant le tirage." },
  { index: "B", title: "Une identité, quatre modèles", text: "Logo, couleurs et devise de l'école suivent les quatre modèles, de la carte officielle au badge vertical." },
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
  { q: "Combien d&apos;élèves par fichier ?", a: "Jusqu'à 1 000 élèves par fichier. Au-delà, utilisez le format « un fichier par classe »." },
  { q: "Que se passe-t-il si un élève n'a pas de photo ?", a: "La carte est générée avec un avatar par défaut, et l'élève apparaît dans le rapport de validation pour que vous puissiez ajouter la photo plus tard." },
  { q: "Quelle taille de carte ?", a: "Le format standard carte bancaire CR80 (85,6 × 54 mm), compatible avec la plupart des imprimantes de cartes PVC. Vous pouvez aussi imprimer sur papier épais et plastifier." },
  { q: "Peut-on changer de modèle plus tard ?", a: "Oui. Les données restent dans votre espace : vous pouvez régénérer toute l'école ou une seule classe avec un autre modèle, sans réimporter." },
];

function SectionMark({ children }: { children: string }) {
  return <p className="mb-5 flex items-center gap-3 font-mono text-[11px] font-semibold uppercase tracking-[.22em] text-teal-800"><span className="h-px w-8 bg-teal-700" />{children}</p>;
}

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="overflow-hidden">
        {/* Une couverture éditoriale, pas un écran de vente standard */}
        <section className="relative min-h-[760px] bg-ink text-white">
          <Guilloche className="pointer-events-none absolute -right-56 -top-32 h-[900px] w-[900px] text-white/[0.07]" />
          <div className="relative mx-auto grid max-w-[1440px] items-center gap-14 px-6 pb-16 pt-16 lg:min-h-[670px] lg:grid-cols-[.9fr_1.1fr] lg:px-10 lg:pb-20 lg:pt-20">
            <div className="relative z-10">
              <p className="mb-8 font-mono text-xs uppercase tracking-[.28em] text-seal">CarteÉcole · atelier de rentrée</p>
              <h1 className="max-w-2xl font-serif text-[clamp(3.4rem,7vw,6.8rem)] font-medium leading-[.91] tracking-[-.055em]">Une école.<br /><span className="text-seal">Mille visages.</span><br />Zéro carte à refaire.</h1>
              <p className="mt-8 max-w-lg text-lg leading-8 text-white/70">Votre fichier d&apos;élèves entre ici. Des cartes d&apos;identité scolaires, prêtes à imprimer, en ressortent.</p>
              <div className="mt-9 flex flex-wrap items-center gap-5">
                <Link href="/inscription" className="rounded-sm bg-teal-600 px-6 py-4 font-semibold text-white transition hover:bg-teal-500">Lancer mon premier tirage <span aria-hidden="true">↗</span></Link>
                <a href="#atelier" className="font-medium text-white/75 underline decoration-white/30 underline-offset-4 hover:text-white">Voir comment ça prend forme</a>
              </div>
              <p className="mt-5 text-sm text-white/45">14 jours pour essayer · sans carte bancaire</p>
            </div>
            <div className="relative lg:-mr-20"><div className="absolute -inset-8 rounded-full bg-teal-500/10 blur-3xl" /><div className="relative"><HeroDemo /></div><p className="mt-4 text-right font-mono text-[10px] uppercase tracking-[.2em] text-white/40">Pièce n° 001 · modèle personnalisable</p></div>
          </div>
          <div className="relative mx-auto grid max-w-[1440px] grid-cols-2 border-t border-white/15 lg:grid-cols-4">
            {SPECS.map((spec, i) => <div key={spec.label} className={`flex items-baseline gap-2 border-white/10 px-6 py-5 ${i < 2 ? "border-b" : ""} ${i % 2 === 0 ? "border-r" : ""} lg:border-b-0 lg:border-r lg:px-10 lg:py-7 lg:last:border-r-0`}><span className="font-serif text-2xl text-white">{spec.value}</span><span className="font-mono text-[10px] uppercase tracking-wider text-seal">{spec.unit}</span><span className="hidden text-xs text-white/45 sm:inline">{spec.label}</span></div>)}
          </div>
        </section>

        {/* Le parcours devient le fil visuel de la page */}
        <section id="atelier" className="relative scroll-mt-16 bg-[#e9edf1]">
          <div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-24 lg:grid-cols-[.7fr_1.3fr] lg:px-10 lg:py-32">
            <div className="lg:sticky lg:top-28 lg:self-start"><SectionMark>Le processus · 3 stations</SectionMark><h2 className="font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">Du tableur<br />au tour de cou.</h2><p className="mt-6 max-w-sm text-lg leading-8 text-slate-600">Pas de mise en page manuelle. Pas de copier-coller photo par photo. Un flux pensé pour toute une école.</p><div className="mt-10"><HeroDemo /></div></div>
            <div className="relative">
              <div className="absolute bottom-10 left-[21px] top-10 w-px bg-ink/15" aria-hidden="true" />
              {STEPS.map((step) => <article key={step.no} className="relative grid gap-5 border-b border-ink/15 py-10 first:pt-0 last:border-0 sm:grid-cols-[52px_1fr] sm:gap-8"><div className="relative z-10 grid h-11 w-11 place-items-center rounded-full border border-teal-700 bg-[#e9edf1] font-mono text-xs text-teal-800">{step.no}</div><div><p className="font-mono text-[10px] uppercase tracking-[.22em] text-teal-800">{step.tag}</p><h3 className="mt-3 font-serif text-3xl leading-tight">{step.title}</h3><p className="mt-3 max-w-xl leading-7 text-slate-600">{step.text}</p><code className="mt-5 inline-flex items-center gap-2 rounded-sm border border-ink/15 bg-white/70 px-3 py-2 font-mono text-xs text-slate-600"><span className="text-teal-700">↳</span>{step.file}</code></div></article>)}
            </div>
          </div>
        </section>

        {/* Matière première : le fichier réel, intégré à la narration */}
        <section id="fichiers" className="scroll-mt-16 bg-white">
          <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10 lg:py-32">
            <div className="grid items-end gap-8 lg:grid-cols-[1fr_.7fr]"><div><SectionMark>Station 01 · préparation</SectionMark><h2 className="max-w-3xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">Le fichier, c&apos;est votre plan de coupe.</h2></div><p className="max-w-lg leading-7 text-slate-600">Deux façons de ranger les élèves. Les deux modèles incluent les consignes, les colonnes requises et une ligne d&apos;exemple.</p></div>
            <div className="mt-14 grid gap-8 lg:grid-cols-[.82fr_1.18fr]">
              <div className="grid gap-4">
                <article className="group border-l-2 border-teal-700 bg-paper p-6 transition hover:pl-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-teal-800">Option A · vue école</p><h3 className="mt-3 font-serif text-2xl">Un classeur, toute l&apos;école</h3><p className="mt-3 text-sm leading-6 text-slate-600">Tous les élèves dans un fichier ; la classe est indiquée sur chaque ligne.</p><p className="mt-4 text-xs leading-5 text-slate-500">Matricule · nom · prénoms · naissance · sexe · classe · année · photo · contact parent</p><a href={EXCEL_MODELS.format1} download className="mt-5 inline-flex items-center gap-2 font-semibold text-ink underline decoration-teal-700 underline-offset-4">Prendre le modèle Excel <span aria-hidden="true">↓</span></a></article>
                <article className="group border-l-2 border-seal bg-paper p-6 transition hover:pl-8"><p className="font-mono text-[10px] uppercase tracking-[.2em] text-teal-800">Option B · vue classe</p><h3 className="mt-3 font-serif text-2xl">Un classeur par classe</h3><p className="mt-3 text-sm leading-6 text-slate-600">Pratique si plusieurs personnes préparent les listes. Le nom de classe est renseigné une seule fois.</p><p className="mt-4 text-xs leading-5 text-slate-500">Mêmes colonnes, sans la colonne classe : elle est portée par le fichier.</p><a href={EXCEL_MODELS.format2} download className="mt-5 inline-flex items-center gap-2 font-semibold text-ink underline decoration-seal underline-offset-4">Prendre le modèle Excel <span aria-hidden="true">↓</span></a></article>
              </div>
              <figure className="self-start border border-ink/10 bg-white shadow-[0_24px_70px_-45px_rgba(20,33,61,.6)]"><div className="flex items-center justify-between border-b border-ink/10 px-5 py-3"><span className="font-mono text-xs text-slate-500">EXEMPLE · MODELE-ECOLE.XLSX</span><span className="text-xs text-teal-800">● Prêt à remplir</span></div><div className="overflow-x-auto"><table className="w-full min-w-[480px] text-left text-sm"><thead><tr className="bg-ink text-white">{["matricule", "nom", "prénoms", "classe", "photo"].map((h) => <th key={h} className="px-4 py-3 font-mono text-[10px] font-normal uppercase tracking-wider">{h}</th>)}</tr></thead><tbody>{SHEET_ROWS.map((row, ri) => <tr key={row[0]} className={`border-b border-ink/5 ${ri % 2 ? "bg-paper/70" : "bg-white"}`}>{row.map((cell, i) => <td key={i} className={`px-4 py-4 ${i === 4 ? "font-mono text-xs text-teal-800" : ""}`}>{cell}</td>)}</tr>)}</tbody></table></div><figcaption className="px-5 py-3 font-mono text-[10px] text-slate-500">01 LIGNE = 01 ÉLÈVE · PHOTO ASSOCIÉE PAR MATRICULE</figcaption></figure>
            </div>
            <aside className="mt-8 grid gap-3 border-t border-ink/15 pt-6 sm:grid-cols-[150px_1fr]"><h3 className="font-serif text-xl">Les portraits</h3><p className="max-w-3xl text-sm leading-6 text-slate-600">Les photos ne se collent pas dans Excel : nommez-les avec le matricule (ex. <code>2026-0001.jpg</code>), placez-les dans un ZIP et envoyez-le avec le fichier. JPG ou PNG, portrait 3:4, 2 Mo maximum par photo.</p></aside>
          </div>
        </section>

        {/* Les cartes exposées comme des objets, plutôt qu'une galerie de vente */}
        <section id="modeles" className="scroll-mt-16 bg-[#e9edf1]">
          <div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10 lg:py-32"><div className="grid items-end gap-8 lg:grid-cols-[1fr_.7fr]"><div><SectionMark>Station 02 · identité</SectionMark><h2 className="max-w-3xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">Quatre modèles.<br />Votre identité.</h2></div><p className="max-w-lg leading-7 text-slate-600">Officiel ministériel, numérique, géométrique ou badge vertical : choisissez la carte qui convient à votre établissement. Le recto et le verso sont conçus ensemble.</p></div><div className="mt-12"><GalleryStrip /></div><Link href="/templates" className="mt-8 inline-flex items-center gap-3 font-semibold text-teal-800 underline decoration-teal-700 underline-offset-4">Parcourir les quatre modèles <span aria-hidden="true">↗</span></Link></div>
        </section>

        {/* Les garanties comme marge de contrôle qualité */}
        <section className="relative bg-ink text-white"><Guilloche className="pointer-events-none absolute -left-64 top-0 h-[700px] w-[700px] text-white/[0.045]" /><div className="relative mx-auto grid max-w-[1440px] gap-12 px-6 py-24 lg:grid-cols-[.68fr_1.32fr] lg:px-10 lg:py-32"><div><SectionMark>Contrôle qualité · à chaque tirage</SectionMark><h2 className="font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">Les erreurs restent à l&apos;écran.</h2><p className="mt-6 max-w-sm leading-7 text-white/60">Pas découvertes au moment de distribuer les cartes.</p><Link href="/inscription" className="mt-8 inline-block border border-white/30 px-5 py-3 text-sm font-medium transition hover:bg-white hover:text-ink">Préparer mon premier tirage ↗</Link></div><dl className="grid gap-x-8 sm:grid-cols-2">{FEATURES.map((f) => <div key={f.index} className="border-t border-white/20 py-6"><dt className="flex items-baseline gap-3 font-serif text-xl"><span className="font-mono text-xs text-seal">{f.index}</span>{f.title}</dt><dd className="mt-3 max-w-sm pl-7 text-sm leading-6 text-white/60">{f.text}</dd></div>)}</dl></div></section>

        {/* L'économie de l'atelier : les prix sont présents mais ne dominent pas le récit */}
        <section id="tarifs" className="scroll-mt-16 bg-white"><div className="mx-auto max-w-[1440px] px-6 py-24 lg:px-10 lg:py-32"><div className="grid items-end gap-8 lg:grid-cols-[1fr_.7fr]"><div><SectionMark>Le coût du tirage</SectionMark><h2 className="max-w-3xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">Un abonnement.<br />Pas de mauvaise surprise.</h2></div><p className="max-w-lg leading-7 text-slate-600">La formule suit le nombre d&apos;élèves de votre établissement. Générez autant de PDF que nécessaire pendant l&apos;année.</p></div><div className="mt-12"><Pricing /></div></div></section>

        <section id="questions" className="scroll-mt-16 border-t border-ink/10 bg-paper"><div className="mx-auto grid max-w-[1440px] gap-12 px-6 py-24 lg:grid-cols-[.7fr_1.3fr] lg:px-10 lg:py-32"><div><SectionMark>Notes de l&apos;atelier</SectionMark><h2 className="font-serif text-5xl leading-[1.02] tracking-tight sm:text-6xl">Avant le premier tirage.</h2><p className="mt-5 max-w-sm text-slate-600">Quelques réponses pratiques pour que tout roule dès la première classe.</p></div><div className="divide-y divide-ink/15 border-y border-ink/15">{FAQ.map((item, i) => <details key={item.q} className="group py-5"><summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-serif text-lg font-semibold marker:hidden [&::-webkit-details-marker]:hidden"><span><span className="mr-3 font-mono text-xs text-teal-800">0{i + 1}</span>{item.q}</span><span className="font-mono text-xl text-teal-800 transition-transform group-open:rotate-45" aria-hidden="true">+</span></summary><p className="mt-4 max-w-2xl pl-9 leading-7 text-slate-600">{item.a}</p></details>)}</div></div></section>

        <section className="relative overflow-hidden bg-teal-700 text-white"><Guilloche className="pointer-events-none absolute -right-40 -top-52 h-[700px] w-[700px] text-white/[0.09]" /><div className="relative mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-10 px-6 py-20 lg:px-10 lg:py-28"><div><p className="mb-5 font-mono text-xs uppercase tracking-[.24em] text-white/65">Prochaine pièce à fabriquer ?</p><h2 className="max-w-3xl font-serif text-5xl leading-[1.02] tracking-tight sm:text-7xl">La rentrée commence par une bonne liste.</h2><p className="mt-5 text-white/75">14 jours d&apos;essai gratuit · sans carte bancaire</p></div><Link href="/inscription" className="shrink-0 bg-white px-7 py-4 font-semibold text-ink transition hover:bg-paper">Ouvrir l&apos;atelier ↗</Link></div></section>
      </main>
      <SiteFooter />
    </>
  );
}
