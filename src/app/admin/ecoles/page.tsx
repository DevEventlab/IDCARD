"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SchoolDocument = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

type School = {
  id: string;
  name: string;
  status: "PENDING_REVIEW" | "REJECTED" | "APPROVED";
  createdAt: string;
  authority: string | null;
  motto: string | null;
  phone: string | null;
  address: string | null;
  logoUrl: string | null;
  cardHeader: string | null;
  cardBackText: string | null;
  signatoryName: string | null;
  signatoryTitle: string | null;
  cardFont: string;
  cardHeaderSize: number;
  primaryColor: string;
  secondaryColor: string;
  defaultTemplate: string;
  schoolYear: string | null;
  note: string | null;
  contact: { name: string | null; email: string } | null;
  contacts: { name: string | null; email: string }[];
  counts: { students: number; classes: number; documents: number };
  documents: SchoolDocument[];
};

type StatusFilter = "all" | "PENDING_REVIEW" | "REJECTED" | "APPROVED";

const statusLabels: Record<School["status"], string> = {
  PENDING_REVIEW: "En attente",
  REJECTED: "À compléter",
  APPROVED: "Approuvée",
};

const statusStyles: Record<School["status"], string> = {
  PENDING_REVIEW: "border-[#f6dda6] bg-[#fffaeb] text-[#854d0e]",
  REJECTED: "border-[#f4c7c3] bg-[#fef3f2] text-[#912018]",
  APPROVED: "border-[#c9e8a0] bg-[#f6fce0] text-[#365314]",
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(new Date(date));
}

function formatFileSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${(bytes / 1024).toFixed(0)} Ko`
    : `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

function Detail({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-ink">{value || "Non renseigné"}</dd>
    </div>
  );
}

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selectedSchool && !dialog.open) dialog.showModal();
    else if (!selectedSchool && dialog.open) dialog.close();
  }, [selectedSchool]);

  useEffect(() => {
    let active = true;

    async function loadSchools() {
      try {
        const response = await fetch("/api/admin/schools?status=all", { cache: "no-store" });
        const body = await response.json() as { error?: string; schools?: School[] };
        if (!response.ok) throw new Error(body.error ?? "Impossible de charger les écoles.");
        if (active) setSchools(body.schools ?? []);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Impossible de charger les écoles.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadSchools();
    return () => { active = false; };
  }, []);

  const counts = useMemo(() => ({
    all: schools.length,
    PENDING_REVIEW: schools.filter((school) => school.status === "PENDING_REVIEW").length,
    REJECTED: schools.filter((school) => school.status === "REJECTED").length,
    APPROVED: schools.filter((school) => school.status === "APPROVED").length,
  }), [schools]);

  const filteredSchools = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return schools.filter((school) => {
      const matchesStatus = statusFilter === "all" || school.status === statusFilter;
      const matchesSearch = !query || [
        school.name,
        school.contact?.name,
        school.contact?.email,
        school.phone,
        school.address,
      ].some((value) => value?.toLocaleLowerCase().includes(query));
      return matchesStatus && matchesSearch;
    });
  }, [schools, search, statusFilter]);

  const filters: { id: StatusFilter; label: string }[] = [
    { id: "all", label: "Toutes" },
    { id: "PENDING_REVIEW", label: "En attente" },
    { id: "REJECTED", label: "À compléter" },
    { id: "APPROVED", label: "Approuvées" },
  ];

  return (
    <>
      <section className="relative overflow-hidden rounded-3xl bg-[#10251f] p-7 text-white sm:p-9">
        <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="relative flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-300">Pilotage des établissements</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Annuaire des écoles</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/65">Un aperçu clair de chaque établissement, de son statut et de son activité sur ScolarCard.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur">
            <span className="block text-xs font-medium text-white/55">Écoles référencées</span>
            <span className="mt-1 block text-3xl font-bold tabular-nums">{loading ? "—" : counts.all}</span>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Répartition par statut">
        {([
          ["APPROVED", "Approuvées", "Accès actif", "bg-emerald-500"],
          ["PENDING_REVIEW", "En attente", "À examiner", "bg-amber-400"],
          ["REJECTED", "À compléter", "Action requise", "bg-rose-400"],
        ] as const).map(([status, title, caption, dot]) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(statusFilter === status ? "all" : status)}
            aria-pressed={statusFilter === status}
            className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${statusFilter === status ? "border-ink ring-2 ring-ink/10" : "border-line"}`}
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-muted">{title}</span>
              <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
            </span>
            <span className="mt-3 block text-3xl font-bold tabular-nums tracking-tight">{loading ? "—" : counts[status]}</span>
            <span className="mt-1 block text-xs text-muted">{caption}</span>
          </button>
        ))}
      </section>

      <section className="mt-8 rounded-2xl border border-line bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold tracking-tight">Répertoire</h2>
            <p className="mt-1 text-sm text-muted">{loading ? "Chargement…" : `${filteredSchools.length} établissement${filteredSchools.length === 1 ? "" : "s"} affiché${filteredSchools.length === 1 ? "" : "s"}`}</p>
          </div>
          <label className="grid gap-1.5 text-sm sm:w-80">
            <span className="sr-only">Rechercher une école</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="input"
              type="search"
              placeholder="Nom, contact, e-mail, ville…"
            />
          </label>
        </div>
        <div className="flex flex-wrap gap-2 border-b border-line px-5 py-3" aria-label="Filtrer par statut">
          {filters.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              aria-pressed={statusFilter === filter.id}
              className={`rounded-full px-3.5 py-2 text-xs font-semibold transition ${statusFilter === filter.id ? "bg-ink text-white" : "bg-[#f3f5f4] text-muted hover:bg-[#e8ece9]"}`}
            >
              {filter.label} <span className="ml-1 opacity-70">{counts[filter.id]}</span>
            </button>
          ))}
        </div>

        {error ? <p className="m-5 rounded-xl border border-[#f4c7c3] bg-[#fef3f2] p-4 text-sm text-[#7a271a]" role="alert">{error}</p> : null}
        {loading ? <p className="p-8 text-center text-sm text-muted">Chargement de l’annuaire…</p> : null}
        {!loading && !error && filteredSchools.length === 0 ? (
          <p className="p-10 text-center text-sm text-muted">{schools.length ? "Aucune école ne correspond à ces filtres." : "Aucune école n’est encore inscrite."}</p>
        ) : null}
        {!loading && filteredSchools.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-[#f8faf9] text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Établissement</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Contact</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Coordonnées</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Activité</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Inscription</th>
                  <th scope="col" className="px-5 py-3.5 font-semibold">Statut</th>
                  <th scope="col" className="px-5 py-3.5 text-right font-semibold">Détails</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filteredSchools.map((school) => (
                  <tr key={school.id} className="transition-colors hover:bg-[#fbfcfb]">
                    <td className="px-5 py-4">
                      <span className="block font-bold text-ink">{school.name}</span>
                      <span className="mt-1 block max-w-52 truncate text-xs text-muted" title={school.address ?? undefined}>{school.address || "Adresse non renseignée"}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="block font-medium">{school.contact?.name || "Contact non renseigné"}</span>
                      <span className="mt-1 block text-xs text-muted">{school.contact?.email || "—"}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted">{school.phone || "Téléphone non renseigné"}</td>
                    <td className="px-5 py-4">
                      <span className="block font-semibold tabular-nums">{school.counts.students} élèves</span>
                      <span className="mt-1 block text-xs text-muted">{school.counts.classes} classes · {school.counts.documents} pièces</span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-xs text-muted">{formatDate(school.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[school.status]}`}>
                        <span className="mr-1.5">●</span>{statusLabels[school.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSchool(school)}
                        className="rounded-lg border border-line px-3 py-2 text-xs font-bold text-ink transition hover:border-ink hover:bg-[#f8faf9]"
                        aria-label={`Afficher les détails de ${school.name}`}
                      >
                        Voir la fiche
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <dialog
        ref={dialogRef}
        aria-labelledby="school-detail-title"
        className="max-h-[90vh] w-[min(960px,calc(100%-2rem))] overflow-y-auto rounded-3xl border-0 p-0 text-ink shadow-2xl backdrop:bg-[#061b1490]"
        onCancel={(event) => {
          event.preventDefault();
          setSelectedSchool(null);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setSelectedSchool(null);
        }}
      >
        {selectedSchool && (
          <div>
            <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b border-line bg-white/95 p-5 backdrop-blur sm:p-7">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Fiche établissement</p>
                <h2 id="school-detail-title" className="mt-2 break-words text-2xl font-extrabold tracking-tight sm:text-3xl">{selectedSchool.name}</h2>
                <span className={`mt-3 inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[selectedSchool.status]}`}>
                  {statusLabels[selectedSchool.status]}
                </span>
              </div>
              <button
                type="button"
                autoFocus
                onClick={() => setSelectedSchool(null)}
                className="grid h-10 w-10 flex-none place-items-center rounded-full border border-line text-xl text-muted transition hover:bg-[#f3f5f4] hover:text-ink"
                aria-label="Fermer la fiche"
              >
                ×
              </button>
            </header>

            <div className="grid gap-5 p-5 sm:p-7">
              <section className="rounded-2xl border border-line p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-bold">Établissement &amp; activité</h3>
                    <p className="mt-1 text-sm text-muted">Coordonnées, inscription et espace scolaire.</p>
                  </div>
                  <span className="rounded-xl bg-[#f3f5f4] px-3 py-2 text-right text-xs text-muted">
                    <strong className="block text-lg tabular-nums text-ink">{selectedSchool.counts.students}</strong>
                    élèves
                  </span>
                </div>
                <dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Detail label="Nom de l’établissement" value={selectedSchool.name} />
                  <Detail label="Tutelle" value={selectedSchool.authority} />
                  <Detail label="Année scolaire" value={selectedSchool.schoolYear} />
                  <Detail label="Adresse" value={selectedSchool.address} />
                  <Detail label="Téléphone" value={selectedSchool.phone} />
                  <Detail label="Inscription" value={formatDate(selectedSchool.createdAt)} />
                  <Detail label="Classes" value={String(selectedSchool.counts.classes)} />
                  <Detail label="Justificatifs transmis" value={String(selectedSchool.counts.documents)} />
                  <Detail label="Devise" value={selectedSchool.motto} />
                  <Detail label="Logo (URL)" value={selectedSchool.logoUrl} />
                </dl>
              </section>

              <section className="rounded-2xl border border-line p-5">
                <h3 className="font-bold">Comptes associés</h3>
                {selectedSchool.contacts.length ? (
                  <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                    {selectedSchool.contacts.map((contact) => (
                      <li key={contact.email} className="rounded-xl bg-[#f8faf9] p-4">
                        <span className="block text-sm font-semibold">{contact.name || "Nom non renseigné"}</span>
                        <a className="mt-1 block break-all text-sm text-emerald-800 underline underline-offset-2" href={`mailto:${contact.email}`}>{contact.email}</a>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-3 text-sm text-muted">Aucun compte associé.</p>}
              </section>

              <section className="rounded-2xl border border-line p-5">
                <h3 className="font-bold">Personnalisation des cartes</h3>
                <dl className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                  <Detail label="Modèle par défaut" value={selectedSchool.defaultTemplate} />
                  <Detail label="Police" value={selectedSchool.cardFont} />
                  <Detail label="Signataire" value={selectedSchool.signatoryName} />
                  <Detail label="Fonction du signataire" value={selectedSchool.signatoryTitle} />
                  <Detail label="En-tête" value={selectedSchool.cardHeader} />
                  <Detail label="Taille de l’en-tête" value={`${selectedSchool.cardHeaderSize} px`} />
                  <Detail label="Couleur principale" value={selectedSchool.primaryColor} />
                  <Detail label="Couleur secondaire" value={selectedSchool.secondaryColor} />
                  <div className="sm:col-span-2">
                    <Detail label="Texte au verso" value={selectedSchool.cardBackText} />
                  </div>
                </dl>
              </section>

              <section className="rounded-2xl border border-line p-5">
                <div className="flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <h3 className="font-bold">Justificatifs</h3>
                    <p className="mt-1 text-sm text-muted">Documents transmis par l’établissement.</p>
                  </div>
                  <span className="text-xs font-semibold text-muted">{selectedSchool.documents.length} fichier{selectedSchool.documents.length === 1 ? "" : "s"}</span>
                </div>
                {selectedSchool.documents.length ? (
                  <ul className="mt-4 grid gap-3">
                    {selectedSchool.documents.map((document) => (
                      <li key={document.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#f8faf9] p-4">
                        <div className="min-w-0">
                          <span className="block break-words text-sm font-semibold">{document.originalName}</span>
                          <span className="mt-1 block text-xs text-muted">
                            {document.mimeType} · {formatFileSize(document.size)} · transmis le {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium", timeStyle: "short" }).format(new Date(document.createdAt))}
                          </span>
                        </div>
                        <a
                          href={`/api/admin/schools/${selectedSchool.id}/documents/${document.id}`}
                          className="inline-flex flex-none items-center gap-2 rounded-lg bg-ink px-3.5 py-2.5 text-xs font-bold text-white transition hover:bg-[#233b35]"
                        >
                          Télécharger <span aria-hidden="true">↓</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-4 rounded-xl bg-[#f8faf9] p-4 text-sm text-muted">Aucun justificatif transmis.</p>}
              </section>

              {selectedSchool.note && (
                <section className="rounded-2xl border border-[#f4c7c3] bg-[#fef3f2] p-5">
                  <h3 className="font-bold text-[#7a271a]">Dernière demande de correction</h3>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#7a271a]">{selectedSchool.note}</p>
                </section>
              )}
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}
