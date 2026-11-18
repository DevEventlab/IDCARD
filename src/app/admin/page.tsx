"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SchoolCase = {
  id: string;
  name: string;
  status: "PENDING_REVIEW" | "REJECTED" | "APPROVED";
  note: string | null;
  createdAt: string;
  contact: { name: string | null; email: string } | null;
  documents: { id: string; originalName: string; size: number; createdAt: string }[];
};

type SchoolStatusFilter = "pending" | "rejected" | "approved";

type VerificationCounts = {
  pending: number;
  rejected: number;
  approved: number;
};

type SchoolsResponse = {
  error?: string;
  schools: SchoolCase[];
  pendingDocuments: { id: string; schoolName: string }[];
  counts: VerificationCounts;
};

async function readJsonResponse<T>(response: Response): Promise<T> {
  if (!response.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    throw new Error(`Réponse serveur invalide (HTTP ${response.status}). Rechargez la page ou redémarrez l’application.`);
  }
  return response.json();
}

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

export default function AdminPage() {
  const [schools, setSchools] = useState<SchoolCase[]>([]);
  const [counts, setCounts] = useState<VerificationCounts>({ pending: 0, rejected: 0, approved: 0 });
  const [statusFilter, setStatusFilter] = useState<SchoolStatusFilter>("pending");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const seenDocuments = useRef<Set<string> | null>(null);

  const load = useCallback(async (notify = false) => {
    const response = await fetch(`/api/admin/schools?status=${statusFilter}`, { cache: "no-store" });
    const body = await readJsonResponse<SchoolsResponse>(response);
    if (!response.ok) throw new Error(body.error ?? "Chargement impossible.");
    const nextSchools = body.schools;
    const pendingDocuments = body.pendingDocuments;
    const documentIds = new Set(pendingDocuments.map((document) => document.id));
    if (notify && seenDocuments.current) {
      const newDocuments = pendingDocuments.filter((document) => !seenDocuments.current?.has(document.id));
      if (newDocuments.length) {
        setNotification(
          newDocuments.length === 1
            ? `Nouveau justificatif reçu : ${newDocuments[0].schoolName}.`
            : `${newDocuments.length} nouveaux justificatifs reçus.`,
        );
      }
    }
    seenDocuments.current = documentIds;
    setCounts(body.counts);
    setSchools(nextSchools);
    setLastUpdated(new Date());
  }, [statusFilter]);

  useEffect(() => {
    load(true).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Chargement impossible."))
      .finally(() => setLoading(false));
    const interval = window.setInterval(() => {
      load(true).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Actualisation impossible."));
    }, 30_000);
    return () => window.clearInterval(interval);
  }, [load]);

  async function review(school: SchoolCase, decision: "approve" | "reject") {
    setError("");
    setNotice("");
    setBusy(school.id);
    try {
      const response = await fetch(`/api/admin/schools/${school.id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, note: notes[school.id] ?? "" }),
      });
      const body = await readJsonResponse<{ error?: string }>(response);
      if (!response.ok) throw new Error(body.error ?? "Décision impossible.");
      await load();
      setNotice(decision === "approve" ? "Établissement approuvé." : "Correction demandée à l’établissement.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Décision impossible.");
    } finally {
      setBusy("");
    }
  }

  const filteredSchools = schools.filter((school) => {
    const query = search.trim().toLocaleLowerCase();
    return !query || [school.name, school.contact?.name, school.contact?.email]
      .some((value) => value?.toLocaleLowerCase().includes(query));
  });

  const tabs: { id: SchoolStatusFilter; label: string; count: number }[] = [
    { id: "pending", label: "À examiner", count: counts.pending },
    { id: "rejected", label: "À compléter", count: counts.rejected },
    { id: "approved", label: "Approuvés", count: counts.approved },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Vue d’ensemble</h1>
          <p className="mt-2 max-w-2xl text-muted">Suivez les demandes, examinez les justificatifs et gérez l’accès des établissements.</p>
        </div>
        <button
          type="button"
          onClick={() => load(true).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Actualisation impossible."))}
          className="btn border border-line bg-white"
        >Actualiser</button>
      </div>
      <section className="mt-6 rounded-[16px] border border-[#f6dda6] bg-[#fffaeb] p-5" aria-live="polite">
        <h2 className="font-bold">Notifications</h2>
        <p className="mt-1 text-sm text-muted">
          {counts.pending
            ? `${counts.pending} demande${counts.pending === 1 ? "" : "s"} en attente de traitement.`
            : "Aucune nouvelle demande en attente."}
        </p>
        {notification && <p className="mt-2 text-sm font-semibold text-ink" role="status">{notification}</p>}
        {lastUpdated && <p className="mt-2 text-xs text-muted">Actualisé à {lastUpdated.toLocaleTimeString("fr-FR")}. Vérification automatique toutes les 30 secondes.</p>}
      </section>
      <section className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Résumé des établissements">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setLoading(true);
              setStatusFilter(tab.id);
            }}
            aria-pressed={statusFilter === tab.id}
            className={`rounded-[16px] border p-4 text-left transition-colors ${statusFilter === tab.id ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"}`}
          >
            <span className={`block text-sm ${statusFilter === tab.id ? "text-white/70" : "text-muted"}`}>{tab.label}</span>
            <span className="mt-1 block text-2xl font-bold tabular-nums">{tab.count}</span>
          </button>
        ))}
      </section>
      {error && <p className="mt-5 rounded-[10px] border border-[#f4c7c3] bg-[#fef3f2] p-3 text-sm text-[#7a271a]" role="alert">{error}</p>}
      {notice && <p className="mt-5 rounded-[10px] border border-lime bg-[#f6fce0] p-3 text-sm" role="status">{notice}</p>}
      <label className="mt-6 grid max-w-md gap-1.5 text-sm">
        <span className="font-semibold">Rechercher un établissement ou un contact</span>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="input"
          type="search"
          placeholder="Nom, adresse e-mail…"
        />
      </label>
      {loading ? <p className="mt-8 text-muted">Chargement des établissements…</p> : null}
      {!loading && filteredSchools.length === 0 ? (
        <p className="panel mt-8 p-8 text-muted">
          {schools.length ? "Aucun résultat pour cette recherche." : "Aucun établissement dans cette catégorie."}
        </p>
      ) : null}
      <div className="mt-8 grid gap-5">
        {!loading && filteredSchools.map((school) => (
          <section key={school.id} className="panel p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold tracking-tight">{school.name}</h2>
                <p className="mt-1 text-sm text-muted">{school.contact?.name ?? "Contact"} · {school.contact?.email ?? "Adresse inconnue"}</p>
                <p className="mt-1 text-xs text-muted">Inscription : {new Date(school.createdAt).toLocaleDateString("fr-FR")}</p>
              </div>
              <span className={`badge ${school.status === "APPROVED" ? "badge-lime" : school.status === "REJECTED" ? "badge-danger" : "badge-warn"}`}>
                {school.status === "APPROVED" ? "Approuvé" : school.status === "REJECTED" ? "À compléter" : "En attente"}
              </span>
            </div>
            {school.note && <p className="mt-4 rounded-[10px] bg-[#fef3f2] p-3 text-sm text-[#7a271a]">Motif précédent : {school.note}</p>}
            <div className="mt-6">
              <h3 className="text-sm font-bold">Justificatifs ({school.documents.length})</h3>
              {school.documents.length ? (
                <ul className="mt-3 grid gap-2">
                  {school.documents.map((document) => (
                    <li key={document.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] border border-line px-4 py-3 text-sm">
                      <span>
                        {document.originalName} <span className="text-muted">· {formatSize(document.size)} · transmis le {new Date(document.createdAt).toLocaleString("fr-FR")}</span>
                      </span>
                      <a className="font-semibold underline decoration-lime decoration-2 underline-offset-4" href={`/api/admin/schools/${school.id}/documents/${document.id}`}>Télécharger</a>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-2 text-sm text-muted">Aucune pièce transmise.</p>}
            </div>
            {school.status !== "APPROVED" && (
              <>
                <label className="mt-6 grid gap-1.5 text-sm">
                  <span className="font-semibold">Motif demandé en cas de correction</span>
                  <textarea
                    value={notes[school.id] ?? ""}
                    onChange={(event) => setNotes((current) => ({ ...current, [school.id]: event.target.value }))}
                    maxLength={1000}
                    rows={2}
                    className="input"
                    placeholder="Indiquez les pièces ou corrections attendues."
                  />
                </label>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    disabled={busy === school.id || !school.documents.length}
                    onClick={() => review(school, "approve")}
                    className="btn btn-primary"
                  >{busy === school.id ? "Enregistrement…" : "Valider le compte"}</button>
                  <button
                    disabled={busy === school.id || !(notes[school.id] ?? "").trim()}
                    onClick={() => review(school, "reject")}
                    className="btn border border-[#e5a39d] bg-white text-[#912018] hover:bg-[#fef3f2] disabled:opacity-50"
                  >Demander une correction</button>
                </div>
              </>
            )}
          </section>
        ))}
      </div>
    </>
  );
}
