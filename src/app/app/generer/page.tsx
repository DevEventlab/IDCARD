"use client";

import { useEffect, useMemo, useState } from "react";
import CardPreview from "@/components/cards/CardPreview";
import { TEMPLATES } from "@/components/cards";
import type { CardData, CardSide, CardStudent } from "@/lib/card-types";

type Student = CardStudent & { id: string; classId: string; photo: boolean };
type ClassItem = { id: string; name: string; count: number };
type School = CardData["school"] & { templateDefault: string };

const EMPTY_STUDENT: Student = {
  id: "",
  classId: "",
  matricule: "—",
  nom: "NOM",
  prenoms: "Prénom",
  dateNaissance: "",
  sexe: "M",
  classe: "Classe",
  anneeScolaire: "",
  photo: false,
};
const EMPTY_SCHOOL: CardData["school"] = {
  name: "Mon établissement",
  primary: "#1F3A5F",
  secondary: "#C9A24B",
};

function templateName(id: string) {
  return TEMPLATES.find((template) => template.id === id)?.name ?? id;
}

export default function GenererPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [school, setSchool] = useState<CardData["school"]>(EMPTY_SCHOOL);
  const [classId, setClassId] = useState("");
  const [templateId, setTemplateId] = useState("officiel");
  const [layout, setLayout] = useState<"single" | "a4-sheet">("a4-sheet");
  const [side, setSide] = useState<CardSide>("front");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [generationId, setGenerationId] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/students", { cache: "no-store" }),
      fetch("/api/school", { cache: "no-store" }),
    ]).then(async ([studentsResponse, schoolResponse]) => {
      const studentsBody = await studentsResponse.json();
      const schoolBody = await schoolResponse.json();
      if (!studentsResponse.ok || !schoolResponse.ok)
        throw new Error(studentsBody.error ?? schoolBody.error ?? "Chargement impossible.");
      if (!active) return;
      setStudents(studentsBody.students);
      setClasses(studentsBody.classes);
      if (schoolBody.school) {
        const { templateDefault, ...cardSchool } = schoolBody.school as School;
        setSchool(cardSchool);
        setTemplateId(TEMPLATES.some((template) => template.id === templateDefault) ? templateDefault : "officiel");
      }
    }).catch((cause: unknown) => {
      if (active) setError(cause instanceof Error ? cause.message : "Base de données indisponible.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  }, [downloadUrl]);

  const selectedClass = classes.find((item) => item.id === classId);
  const visibleStudents = useMemo(
    () => students.filter((student) => !classId || student.classId === classId),
    [students, classId],
  );
  const sample = visibleStudents[0] ?? EMPTY_STUDENT;
  const template = TEMPLATES.find((item) => item.id === templateId) ?? TEMPLATES[0];
  const cardData: CardData = { school, student: sample };

  async function generate() {
    setError("");
    setGenerationId("");
    setBusy(true);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl("");
    try {
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classId: classId || null, templateId, layout }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "La génération a échoué.");
      }
      const blob = await response.blob();
      if (blob.type !== "application/pdf") throw new Error("Le serveur n’a pas renvoyé un document PDF.");
      const id = response.headers.get("X-Generation-Id") ?? "";
      const url = URL.createObjectURL(blob);
      setGenerationId(id);
      setDownloadUrl(url);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cartes-${id || "eleves"}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "La génération a échoué.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h1 className="page-title">Générer les cartes</h1>
      <p className="mt-2 max-w-2xl text-muted">Choisissez une classe et un modèle. Le serveur crée et télécharge un vrai PDF à partir du répertoire.</p>
      {error && <p className="mt-5 rounded-[10px] border border-[#f4c7c3] bg-[#fef3f2] p-3 text-sm text-[#7a271a]" role="alert">{error}</p>}

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="grid content-start gap-7">
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Classe</span>
            <select value={classId} onChange={(event) => { setClassId(event.target.value); setGenerationId(""); }} className="input">
              <option value="">Toute l’école ({students.length} élèves)</option>
              {classes.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.count} élèves)</option>)}
            </select>
          </label>

          <fieldset>
            <legend className="text-sm font-semibold">Modèle de carte</legend>
            <div className="mt-2.5 grid grid-cols-2 gap-2.5">
              {TEMPLATES.map((item) => (
                <label key={item.id} className={`cursor-pointer rounded-[12px] border px-4 py-3 text-sm transition-colors focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-olive ${item.id === templateId ? "border-ink bg-[#f9fdea] shadow-[inset_0_0_0_1px_#050705]" : "border-line bg-white hover:border-ink"}`}>
                  <input type="radio" name="tpl" className="sr-only" checked={item.id === templateId} onChange={() => { setTemplateId(item.id); setGenerationId(""); }} />
                  <span className="block font-semibold">{item.name}</span>
                  <span className="text-muted">{item.orientation === "landscape" ? "Paysage" : "Portrait"}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-sm font-semibold">Mise en page du PDF</legend>
            <div className="mt-2.5 grid gap-2.5">
              {([
                { id: "a4-sheet", title: "Planches A4", text: "Plusieurs cartes par page, rectos et versos alignés." },
                { id: "single", title: "Une carte par page", text: "Une page par face, au format CR80." },
              ] as const).map((option) => (
                <label key={option.id} className={`flex cursor-pointer items-start gap-3 rounded-[12px] border px-4 py-3 text-sm transition-colors ${layout === option.id ? "border-ink bg-[#f9fdea] shadow-[inset_0_0_0_1px_#050705]" : "border-line bg-white hover:border-ink"}`}>
                  <input type="radio" name="layout" checked={layout === option.id} onChange={() => setLayout(option.id)} className="mt-1 h-4 w-4 accent-[#050705]" />
                  <span><span className="block font-semibold">{option.title}</span><span className="text-muted">{option.text}</span></span>
                </label>
              ))}
            </div>
          </fieldset>

          <div>
            <button onClick={generate} disabled={loading || busy || visibleStudents.length === 0} className="btn btn-primary px-6 py-3.5">
              {busy ? "Création du PDF…" : `Générer ${visibleStudents.length} carte${visibleStudents.length > 1 ? "s" : ""}`}
            </button>
            {loading && <p className="mt-3 text-sm text-muted">Chargement du répertoire…</p>}
            {!loading && visibleStudents.length === 0 && <p className="mt-3 text-sm text-muted">{selectedClass ? `Aucun élève dans ${selectedClass.name}.` : "Aucun élève enregistré. Importez d’abord un classeur."}</p>}
            {downloadUrl && generationId && (
              <p className="mt-4 rounded-[12px] border border-lime bg-[#f6fce0] p-4 text-sm leading-6" role="status">
                PDF créé pour {visibleStudents.length} élève{visibleStudents.length === 1 ? "" : "s"} · {templateName(templateId)}.
                {" "}<a href={`/api/generations/${generationId}/pdf`} className="font-semibold underline decoration-2 underline-offset-2">Télécharger à nouveau</a>
              </p>
            )}
          </div>
        </div>

        <div className="surface-dark glow-soft h-fit min-w-0 overflow-hidden rounded-[20px] p-5 sm:p-6 lg:sticky lg:top-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Aperçu : {sample.prenoms} {sample.nom}</h2>
            <div className="inline-flex overflow-hidden rounded-[10px] border border-white/20 text-sm">
              {(["front", "back"] as const).map((currentSide) => (
                <button key={currentSide} onClick={() => setSide(currentSide)} aria-pressed={side === currentSide} className={`px-4 py-2 font-medium transition-colors ${side === currentSide ? "bg-lime text-ink" : "text-white/80 hover:bg-white/10"}`}>{currentSide === "front" ? "Recto" : "Verso"}</button>
              ))}
            </div>
          </div>
          <div className="mt-5 grid min-h-[340px] grid-cols-[minmax(0,1fr)] place-items-center overflow-hidden rounded-[14px] border border-white/10 bg-night/70 p-4">
            <CardPreview templateId={templateId} data={cardData} side={side} scale={template.orientation === "landscape" ? 0.5 : 0.4} />
          </div>
          {sample.photoUrl && <p className="mt-3 text-center text-xs text-white/50">Portrait élève chargé depuis le serveur</p>}
        </div>
      </div>
    </>
  );
}
