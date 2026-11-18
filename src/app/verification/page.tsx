"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type VerificationData = {
  school: { name: string; verificationStatus: "PENDING_REVIEW" | "APPROVED" | "REJECTED"; verificationNote: string | null } | null;
  documents: { id: string; originalName: string; size: number; createdAt: string }[];
};

function formatSize(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

export default function VerificationPage() {
  const router = useRouter();
  const [data, setData] = useState<VerificationData | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/school-documents", { cache: "no-store" });
    const body = await response.json();
    if (response.status === 401) {
      router.replace("/connexion");
      return;
    }
    if (!response.ok) throw new Error(body.error ?? "Impossible de charger le dossier.");
    setData(body as VerificationData);
  }

  useEffect(() => {
    load().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Chargement impossible."));
  }, []);

  async function upload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!file) {
      setError("Sélectionnez un justificatif officiel.");
      return;
    }
    const form = new FormData();
    form.append("files", file);
    setBusy(true);
    try {
      const response = await fetch("/api/school-documents", { method: "POST", body: form });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Dépôt impossible.");
      router.replace("/espace");
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Dépôt impossible.");
    } finally {
      setBusy(false);
    }
  }

  const status = data?.school?.verificationStatus;
  return (
    <main className="surface-dark glow-olive relative min-h-screen overflow-hidden px-5 py-12">
      <span className="tile -right-16 top-32 h-44 w-44 rotate-[16deg]" aria-hidden="true" />
      <div className="relative mx-auto max-w-2xl rounded-[22px] bg-white p-6 text-ink shadow-2xl sm:p-10">
        <p className="text-sm font-semibold text-olive">Vérification de l’établissement</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">{data?.school?.name ?? "Votre établissement"}</h1>
        <p className="mt-3 leading-7 text-muted">Pour protéger les écoles et éviter les usurpations, transmettez un document officiel attestant l’existence de votre établissement.</p>
        <p className="mt-3 rounded-xl bg-[#f7f8f4] p-4 text-sm leading-6 text-muted">
          Un seul document est nécessaire : une autorisation ou un agrément d’ouverture, ou une attestation d’enregistrement délivrée par l’autorité éducative.
        </p>
        {data && status !== "APPROVED" && (
          <section className="mt-6 rounded-2xl border border-line bg-white p-5">
            <h2 className="font-bold">Comment se déroule la vérification ?</h2>
            <ol className="mt-4 grid gap-3 text-sm leading-6">
              <li className="rounded-xl bg-[#f7f8f4] p-4">
                <strong>1. Contrôle automatique du fichier.</strong> Le système vérifie son type et sa taille.
              </li>
              <li className="rounded-xl bg-[#f7f8f4] p-4">
                <strong>2. Vérification humaine.</strong> Notre équipe examine le justificatif avant d’activer votre espace.
              </li>
            </ol>
            <p className="mt-4 text-sm leading-6 text-muted">
              Délai indicatif : entre 20 minutes et 1 heure, généralement autour de 30 minutes. Il peut varier selon le nombre de demandes.
            </p>
            <p className="mt-2 text-xs leading-5 text-muted">
              Le contrôle automatique vérifie le fichier, mais ne confirme pas l’authenticité du document. La décision finale est prise par notre équipe.
            </p>
          </section>
        )}

        {status === "APPROVED" ? (
          <div className="mt-7 rounded-2xl border border-lime bg-[#f6fce0] p-6">
            <h2 className="font-bold">Compte validé</h2>
            <p className="mt-1 text-sm text-muted">Vous pouvez maintenant accéder à votre espace et préparer vos cartes.</p>
            <Link href="/app" className="btn btn-primary mt-5">Ouvrir mon espace</Link>
          </div>
        ) : (
          <>
            <div className={`mt-7 rounded-2xl border p-6 ${status === "REJECTED" ? "border-[#f4c7c3] bg-[#fef3f2]" : "border-[#f6dda6] bg-[#fffaeb]"}`}>
              <h2 className="font-bold">{status === "REJECTED" ? "Dossier à compléter" : "Validation en attente"}</h2>
              <p className="mt-1 text-sm leading-6 text-[#3b4333]">
                {status === "REJECTED"
                  ? data?.school?.verificationNote || "Ajoutez le justificatif demandé puis transmettez à nouveau votre dossier."
                  : data?.documents.length
                    ? "L’accès à la gestion des élèves et à la génération des cartes sera ouvert après validation."
                    : "Transmettez un justificatif pour commencer la vérification de votre établissement."}
              </p>
            </div>
            {(status !== "PENDING_REVIEW" || !data?.documents.length) && (
              <form className="mt-7 grid gap-4" onSubmit={upload}>
                <label className="grid gap-2 text-sm">
                  <span className="font-semibold">Justificatif officiel de l’établissement</span>
                  <input
                    type="file"
                    name="files"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    required
                    onChange={(event) => setFile(event.currentTarget.files?.[0] ?? null)}
                    className="rounded-[10px] border border-dashed border-line-strong p-3 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-ink file:px-3.5 file:py-2 file:text-sm file:font-semibold file:text-white"
                  />
                  <span className="text-xs text-muted">Un seul fichier PDF, JPG ou PNG ; 10 Mo maximum.</span>
                </label>
                {file && <p className="text-sm text-muted">{file.name} ({formatSize(file.size)})</p>}
                <button disabled={busy} className="btn btn-primary w-fit px-6 py-3">
                  {busy ? "Envoi…" : "Transmettre le justificatif"}
                </button>
              </form>
            )}
            {status === "PENDING_REVIEW" && data?.documents.length ? (
              <div className="mt-7">
                <h2 className="font-bold">Pièces transmises</h2>
                <ul className="mt-2 grid gap-2 text-sm text-muted">
                  {data.documents.map((document) => <li key={document.id}>{document.originalName} · {formatSize(document.size)}</li>)}
                </ul>
              </div>
            ) : null}
          </>
        )}
        {error && <p className="mt-5 rounded-[10px] border border-[#f4c7c3] bg-[#fef3f2] p-3 text-sm text-[#7a271a]" role="alert">{error}</p>}
        <button onClick={() => load().catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Chargement impossible."))} className="mt-7 text-sm font-semibold underline decoration-lime decoration-2 underline-offset-4">Actualiser le statut</button>
      </div>
    </main>
  );
}
