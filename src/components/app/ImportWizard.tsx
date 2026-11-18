"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { EXCEL_MODELS } from "@/lib/brand";
import {
  analyzeStudentFiles,
  type ImportFormat,
  type ImportResult,
} from "@/lib/import-students";

const formats: {
  id: ImportFormat;
  title: string;
  detail: string;
  model: string;
}[] = [
  {
    id: "format1",
    title: "Toute l’école",
    detail: "Un classeur, avec une colonne classe sur chaque élève.",
    model: EXCEL_MODELS.format1,
  },
  {
    id: "format2",
    title: "Un fichier par classe",
    detail: "Sélectionnez les classeurs des classes ensemble.",
    model: EXCEL_MODELS.format2,
  },
];

export default function ImportWizard() {
  const [format, setFormat] = useState<ImportFormat>("format1");
  const [files, setFiles] = useState<File[]>([]);
  const [photos, setPhotos] = useState<File | undefined>();
  const [result, setResult] = useState<ImportResult | null>(null);
  const [photoChoices, setPhotoChoices] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [notice, setNotice] = useState("");
  const [importedCount, setImportedCount] = useState(0);
  const errors =
    result?.issues.filter((issue) => issue.severity === "error") ?? [];
  const warnings =
    result?.issues.filter((issue) => issue.severity === "warning") ?? [];

  useEffect(() => {
    return () => {
      if (!result) return;
      result.photoUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [result]);

  function chooseFormat(next: ImportFormat) {
    setFormat(next);
    setFiles([]);
    setResult(null);
    setPhotoChoices({});
    setAdded(false);
    setNotice("");
  }
  async function inspectFiles() {
    setBusy(true);
    setNotice("");
    setAdded(false);
    setPhotoChoices({});
    try {
      const directoryResponse = await fetch("/api/students", { cache: "no-store" });
      if (!directoryResponse.ok) {
        const detail = await directoryResponse.json().catch(() => null);
        throw new Error(detail?.error ?? "Impossible de charger le répertoire.");
      }
      const directory = await directoryResponse.json() as {
        students: { matricule: string }[];
      };
      const parsed = await analyzeStudentFiles(
        files,
        format,
        photos,
        "",
      );
      const known = new Set(
        directory.students.map((student) =>
          student.matricule.trim().toLocaleLowerCase(),
        ),
      );
      const duplicates = new Set(
        parsed.rows
          .filter((row) => known.has(row.matricule.trim().toLocaleLowerCase()))
          .map((row) => row.matricule.toLocaleLowerCase()),
      );
      if (duplicates.size) {
        parsed.issues.push({
          severity: "error",
          file: "Répertoire école",
          message: `Matricules déjà présents : ${Array.from(duplicates).join(", ")}. Vérifiez le répertoire avant de réimporter.`,
        });
        parsed.rows = parsed.rows.filter(
          (row) => !duplicates.has(row.matricule.toLocaleLowerCase()),
        );
      }
      setResult(parsed);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "L’analyse des fichiers a échoué.");
      setResult(null);
    } finally {
      setBusy(false);
    }
  }
  async function confirmImport() {
    if (!result?.rows.length) return;
    setBusy(true);
    setNotice("");
    try {
      const rows = await Promise.all(result.rows.map(async (row) => {
        let photoDataUrl: string | undefined;
        const selectedPhotoUrl =
          row.photoUrl ??
          row.photoSuggestions.find(
            (suggestion) => suggestion.file === photoChoices[row.id],
          )?.url;
        if (selectedPhotoUrl) {
          const response = await fetch(selectedPhotoUrl);
          if (!response.ok) throw new Error(`Impossible de lire la photo de ${row.matricule}.`);
          const bytes = new Uint8Array(await response.arrayBuffer());
          let binary = "";
          for (let offset = 0; offset < bytes.length; offset += 0x8000)
            binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
          photoDataUrl = `data:${response.headers.get("content-type") || "image/jpeg"};base64,${btoa(binary)}`;
        }
        return {
          matricule: row.matricule,
          nom: row.nom,
          prenoms: row.prenoms,
          dateNaissance: row.dateNaissance,
          lieuNaissance: row.lieuNaissance,
          sexe: row.sexe,
          classe: row.classe,
          anneeScolaire: row.anneeScolaire,
          telephoneParent: row.telephoneParent,
          photoDataUrl,
        };
      }));
      const response = await fetch("/api/students/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.error ?? "L’import n’a pas pu être enregistré.");
      setImportedCount(body.imported);
      setAdded(true);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "L’import n’a pas pu être enregistré.");
    } finally {
      setBusy(false);
    }
  }
  function reset() {
    setFiles([]);
    setPhotos(undefined);
    setResult(null);
    setPhotoChoices({});
    setAdded(false);
    setNotice("");
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-title">Importer une liste</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Choisissez le modèle utilisé par votre école, joignez les portraits,
            puis contrôlez les lignes avant de les ajouter.
          </p>
        </div>
        <Link href="/app/eleves" className="button-secondary">
          Consulter les élèves
        </Link>
      </div>
      {added ? (
        <section
          className="surface-dark glow-olive overflow-hidden rounded-[24px] p-7 sm:p-10"
          role="status"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime text-2xl font-bold text-ink">
            ✓
          </div>
          <h2 className="mt-5 text-2xl font-bold tracking-tight text-white">
            Import enregistré dans le répertoire de l’école
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
            {importedCount} élève{importedCount === 1 ? "" : "s"} enregistré
            {importedCount === 1 ? "" : "s"} en base de données. Les portraits
            associés sont stockés sur le serveur et seront intégrés aux cartes.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/app/eleves" className="btn-lime">
              Voir le répertoire <span aria-hidden>→</span>
            </Link>
            <Link href="/app/generer" className="btn-outline-light">
              Préparer les cartes
            </Link>
            <button onClick={reset} className="button-quiet text-white/70 hover:text-white">
              Importer un autre lot
            </button>
          </div>
        </section>
      ) : (
        <>
          <div
            className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2"
            aria-label="Étapes de l’import"
          >
            {["Format", "Fichiers", "Vérification"].map((label, index) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className={`step-dot ${index === 0 ? "step-dot-active" : ""}`}
                >
                  {index + 1}
                </span>
                <span
                  className={`text-sm ${index === 0 ? "font-semibold text-ink" : "text-muted"}`}
                >
                  {label}
                </span>
                {index < 2 && (
                  <span className="mx-1 h-px w-7 bg-line-strong sm:w-12" />
                )}
              </div>
            ))}
          </div>
          <section className="panel p-5 sm:p-7">
            <div className="section-kicker">01 · Choisir un modèle</div>
            <h2 className="mt-1 text-xl font-bold tracking-tight">
              Comment votre liste est-elle organisée ?
            </h2>
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {formats.map((item) => (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={format === item.id}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ")
                      chooseFormat(item.id);
                  }}
                  onClick={() => chooseFormat(item.id)}
                  className={`choice-card ${format === item.id ? "choice-card-selected" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`radio-mark ${format === item.id ? "radio-mark-selected" : ""}`}
                    >
                      {format === item.id ? "✓" : ""}
                    </span>
                    <div>
                      <div className="font-bold text-ink">
                        {item.title}
                      </div>
                      <p className="mt-1 text-sm leading-5 text-muted">
                        {item.detail}
                      </p>
                      <p className="mt-3 text-xs text-muted">
                        {item.id === "format1"
                          ? "Classe dans chaque ligne · 1 classeur"
                          : "Classe dans l’onglet « Classe » · plusieurs classeurs"}
                      </p>
                      <a
                        onClick={(event) => event.stopPropagation()}
                        href={item.model}
                        download
                        className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-ink underline decoration-lime decoration-2 underline-offset-4"
                      >
                        Télécharger le modèle Excel <span aria-hidden>↓</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="panel mt-4 p-5 sm:p-7">
            <div className="section-kicker">02 · Ajouter les fichiers</div>
            <h2 className="mt-1 text-xl font-bold tracking-tight">
              Votre liste et ses portraits
            </h2>
            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="upload-zone">
                <span className="upload-icon" aria-hidden>
                  ↥
                </span>
                <span className="mt-3 font-semibold text-ink">
                  {format === "format1"
                    ? "Déposer le fichier de l’école"
                    : "Déposer les fichiers des classes"}
                </span>
                <span className="mt-1 text-sm text-muted">
                  {format === "format1"
                    ? "Un seul classeur au format .xlsx"
                    : "Sélectionnez plusieurs classeurs .xlsx à la fois"}
                </span>
                <span className="mt-2 text-xs text-muted">
                  Jusqu’à 1 000 élèves par classeur · garder les noms d’onglets
                  et de colonnes
                </span>
                <input
                  className="sr-only"
                  type="file"
                  accept=".xlsx"
                  multiple={format === "format2"}
                  onChange={(event) => {
                    setFiles(Array.from(event.target.files ?? []));
                    setResult(null);
                    setPhotoChoices({});
                    setAdded(false);
                  }}
                />
                {files.length > 0 && (
                  <span className="file-pill mt-4">
                    {files.length === 1
                      ? files[0].name
                      : `${files.length} classeurs sélectionnés`}
                  </span>
                )}
              </label>
              <label className="upload-zone upload-zone-muted">
                <span className="upload-icon upload-icon-jade" aria-hidden>
                  ▧
                </span>
                <span className="mt-3 font-semibold text-ink">
                  Ajouter les portraits
                </span>
                <span className="mt-1 text-sm text-muted">
                  Un dossier compressé au format .zip
                </span>
                <span className="mt-2 text-xs text-muted">
                  JPG ou PNG · 2 Mo maximum par photo · associer via la colonne
                  « photo » ou le matricule
                </span>
                <input
                  className="sr-only"
                  type="file"
                  accept=".zip,application/zip"
                  onChange={(event) => {
                    setPhotos(event.target.files?.[0]);
                    setResult(null);
                    setPhotoChoices({});
                    setAdded(false);
                  }}
                />
                {photos && (
                  <span className="file-pill mt-4">{photos.name}</span>
                )}
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 text-sm">
              <p className="max-w-3xl text-muted">
                <span className="font-semibold text-ink">
                  Pas de photo dans Excel.
                </span>{" "}
                Nommez chaque portrait avec le matricule (ex. MAT-001.jpg) ;
                la colonne « photo » peut aussi indiquer un nom de fichier.
                En cas de différence, des suggestions locales sont proposées
                et doivent être confirmées. Les images ne sont pas envoyées à
                une IA externe. Les lignes EX- sont ignorées automatiquement.
              </p>
              <button
                disabled={!files.length || busy}
                onClick={inspectFiles}
                className="button-primary shrink-0"
              >
                {busy ? "Analyse…" : "Analyser les fichiers"}{" "}
                <span aria-hidden>→</span>
              </button>
            </div>
            <p className="mt-3 text-sm text-muted">
              Pour voir le résultat attendu, téléchargez l’exemple fictif :{" "}
              <a
                href="/modeles/exemple_format2_par_classe.xlsx"
                download
                className="font-semibold text-ink underline underline-offset-4"
              >
                classeur d’une classe
              </a>
              {" · "}
              <a
                href="/modeles/exemple_photos_classe.zip"
                download
                className="font-semibold text-ink underline underline-offset-4"
              >
                ZIP des portraits
              </a>
              .
            </p>
            {notice && (
              <p
                className="mt-3 rounded-[10px] border border-[#f4c7c3] bg-[#fef3f2] p-3 text-sm text-[#7a271a]"
                role="alert"
              >
                {notice}
              </p>
            )}
          </section>

          {result && (
            <section className="mt-5" aria-live="polite">
              <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <div className="section-kicker">
                    03 · Vérifier avant l’ajout
                  </div>
                  <h2 className="mt-1 text-xl font-bold tracking-tight">Rapport du lot</h2>
                </div>
                <span className="text-sm text-muted">
                  {result.format === "format1"
                    ? "Format toute l’école"
                    : `${files.length} classeur${files.length === 1 ? "" : "s"} de classe`}
                </span>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="metric-card">
                  <span className="metric-label">Lignes valides</span>
                  <span className="metric-value">{result.rows.length}</span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">Erreurs bloquantes</span>
                  <span
                    className={`metric-value ${errors.length ? "text-[#b42318]" : "text-olive"}`}
                  >
                    {errors.length}
                  </span>
                </div>
                <div className="metric-card">
                  <span className="metric-label">À vérifier</span>
                  <span className="metric-value text-[#b45309]">
                    {warnings.length}
                  </span>
                </div>
              </div>
              {result.rows.some((row) => row.photoSuggestions.length > 0) && (
                <p className="mt-3 rounded-xl border border-[#f4d7a1] bg-[#fff9ed] px-4 py-3 text-sm text-[#7a4b00]">
                  Les suggestions de portrait ne sont jamais appliquées seules.
                  Confirmez chaque association dans l’aperçu ; sans choix, la
                  ligne sera importée sans portrait.
                </p>
              )}
              {result.excludedExamples > 0 && (
                <p className="mt-3 rounded-xl border border-line bg-white px-4 py-3 text-sm text-muted">
                  {result.excludedExamples} ligne
                  {result.excludedExamples > 1 ? "s" : ""} d’exemple EX- ignorée
                  {result.excludedExamples > 1 ? "s" : ""}, conformément au
                  modèle.
                </p>
              )}
              {result.issues.length > 0 && (
                <div className="mt-3 space-y-2">
                  {result.issues.map((issue, index) => (
                    <div
                      key={`${issue.file}-${issue.row}-${index}`}
                      className={`issue-row ${issue.severity === "error" ? "issue-error" : "issue-warning"}`}
                    >
                      <span className="issue-indicator">
                        {issue.severity === "error" ? "!" : "i"}
                      </span>
                      <span>
                        <strong>
                          {issue.file}
                          {issue.row ? ` · ligne ${issue.row}` : ""}
                        </strong>{" "}
                        — {issue.message}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="panel mt-4 overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                  <div>
                    <h3 className="font-semibold">Aperçu des fiches</h3>
                    <p className="mt-0.5 text-xs text-muted">
                      Le téléphone du parent ne sera pas affiché sur les cartes.
                    </p>
                  </div>
                  <span className="badge badge-lime">
                    {result.rows.length} élève
                    {result.rows.length === 1 ? "" : "s"} prêt
                    {result.rows.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="max-h-[420px] overflow-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Portrait</th>
                        <th>Matricule</th>
                        <th>Élève</th>
                        <th>Classe</th>
                        <th>Naissance</th>
                        <th>Photo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.rows.map((row) => {
                        const selectedSuggestion = row.photoSuggestions.find(
                          (suggestion) =>
                            suggestion.file === photoChoices[row.id],
                        );
                        const previewUrl =
                          row.photoUrl ?? selectedSuggestion?.url;
                        return (
                          <tr key={`${row.sourceFile}-${row.sourceRow}`}>
                            <td>
                              {previewUrl ? (
                                <img
                                  src={previewUrl}
                                  alt={`Portrait de ${row.prenoms} ${row.nom}`}
                                  className="h-10 w-9 rounded-lg object-cover"
                                />
                              ) : (
                                <span className="avatar-placeholder">
                                  {row.prenoms[0]}
                                  {row.nom[0]}
                                </span>
                              )}
                            </td>
                            <td className="font-mono text-xs">{row.matricule}</td>
                            <td>
                              <span className="font-medium">
                                {row.prenoms} {row.nom}
                              </span>
                              <span className="block text-xs text-muted">
                                {row.sourceFile} · ligne {row.sourceRow}
                              </span>
                            </td>
                            <td>{row.classe}</td>
                            <td>{row.dateNaissance}</td>
                            <td>
                              {row.photoUrl ? (
                                <span className="badge badge-lime">
                                  {row.photoMatch === "matricule"
                                    ? "Matricule"
                                    : "Fichier"}
                                </span>
                              ) : selectedSuggestion ? (
                                <span className="badge badge-lime">
                                  Suggestion confirmée
                                </span>
                              ) : row.photoSuggestions.length ? (
                                <span className="badge badge-warn">
                                  À confirmer
                                </span>
                              ) : (
                                <span className="badge badge-warn">
                                  Avatar par défaut
                                </span>
                              )}
                              <span className="block max-w-[140px] truncate text-[10px] text-muted">
                                {row.photoMatchedFile ??
                                  selectedSuggestion?.file ??
                                  row.photoFile}
                              </span>
                              {!row.photoUrl &&
                                row.photoSuggestions.length > 0 && (
                                  <select
                                    aria-label={`Choisir une photo pour ${row.prenoms} ${row.nom}`}
                                    value={photoChoices[row.id] ?? ""}
                                    onChange={(event) =>
                                      setPhotoChoices((current) => ({
                                        ...current,
                                        [row.id]: event.target.value,
                                      }))
                                    }
                                    className="mt-2 max-w-[180px] rounded-lg border border-line bg-white px-2 py-1 text-xs"
                                  >
                                    <option value="">Ne pas associer</option>
                                    {row.photoSuggestions.map((suggestion) => {
                                      const selectedElsewhere = Object.entries(
                                        photoChoices,
                                      ).some(
                                        ([otherRowId, file]) =>
                                          otherRowId !== row.id &&
                                          file === suggestion.file,
                                      );
                                      return (
                                        <option
                                          key={suggestion.file}
                                          value={suggestion.file}
                                          disabled={selectedElsewhere}
                                        >
                                          {suggestion.file} ·{" "}
                                          {Math.round(suggestion.score * 100)}%
                                        </option>
                                      );
                                    })}
                                  </select>
                                )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {result.rows.length === 0 && (
                    <p className="p-8 text-center text-sm text-muted">
                      Aucune ligne valide à ajouter pour le moment.
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-lime bg-[#f6fce0] p-4 sm:px-5">
                <p className="text-sm text-ink">
                  {errors.length
                    ? "Les lignes valides peuvent être ajoutées; corrigez les erreurs dans le classeur pour inclure les lignes concernées."
                    : "Vérifiez l’aperçu puis enregistrez le lot dans la base de l’école."}
                </p>
                <button
                  onClick={confirmImport}
                  disabled={!result.rows.length || busy}
                  className="button-primary"
                >
                  {busy
                    ? "Enregistrement…"
                    : `Enregistrer ${result.rows.length} élève${result.rows.length === 1 ? "" : "s"}`}{" "}
                  <span aria-hidden>→</span>
                </button>
              </div>
            </section>
          )}
          <p className="mt-6 rounded-2xl border border-line bg-white px-4 py-3 text-xs leading-5 text-muted">
            Les classeurs et portraits sont analysés dans le navigateur, puis
            les lignes valides et photos associées sont transmises à l’API de
            l’école. Enregistrez d’abord les coordonnées de l’établissement.
          </p>
        </>
      )}
    </div>
  );
}
