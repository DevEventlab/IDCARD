export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="space-y-2">
        <h1 className="page-title">Fonctionnement & Architecture</h1>
        <p className="text-muted">Découvrez comment intégrer les modèles Colour Dome dans vos applications.</p>
      </div>

      <ol className="divide-y divide-line border-y border-line">
        {[
          { step: "01", title: "Sélection & Configuration", desc: "Choisissez les modèles de cartes interactives adaptées à votre plateforme." },
          { step: "02", title: "Intégration Tailwind & React", desc: "Copiez le code modulaire prêt pour Next.js avec prise en charge du Dark Mode." },
          { step: "03", title: "Déploiement Rapide", desc: "Exportation sous forme de build statique ou d'application hébergée instantanément." }
        ].map((item) => (
          <li key={item.step} className="flex items-start gap-5 py-6">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-lime">{item.step}</span>
            <div>
              <h3 className="text-lg font-bold tracking-tight">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">{item.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
