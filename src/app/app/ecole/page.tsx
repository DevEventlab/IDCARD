"use client";

import { useEffect, useState } from "react";
import CardPreview from "@/components/cards/CardPreview";
import { TEMPLATES } from "@/components/cards";
import Field from "@/components/site/Field";
import type { CardSchool, CardStudent } from "@/lib/card-types";

const EMPTY_SCHOOL: CardSchool = {
  name: "",
  primary: "#1F3A5F",
  secondary: "#C9A24B",
  cardHeader: "",
  cardBackText: "",
  signatoryName: "",
  signatoryTitle: "",
  cardFont: "template",
  cardHeaderSize: 16,
};
const EMPTY_STUDENT: CardStudent = {
  matricule: "—",
  nom: "NOM",
  prenoms: "Prénom",
  dateNaissance: "",
  sexe: "M",
  classe: "Classe",
  anneeScolaire: "",
};

type SchoolResponse = {
  school: (CardSchool & { templateDefault: string; schoolYear: string }) | null;
};

export default function EcolePage() {
  const [school, setSchool] = useState<CardSchool>(EMPTY_SCHOOL);
  const [templateId, setTemplateId] = useState("officiel");
  const [schoolYear, setSchoolYear] = useState("");
  const [student, setStudent] = useState<CardStudent>(EMPTY_STUDENT);
  const [previewSide, setPreviewSide] = useState<"front" | "back">("front");
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/school", { cache: "no-store" }),
      fetch("/api/students", { cache: "no-store" }),
    ]).then(async ([schoolResponse, studentsResponse]) => {
      const schoolBody = await schoolResponse.json();
      const studentsBody = await studentsResponse.json();
      if (!schoolResponse.ok || !studentsResponse.ok)
        throw new Error(schoolBody.error ?? studentsBody.error ?? "Chargement impossible.");
      if (!active) return;
      const data = schoolBody as SchoolResponse;
      if (data.school) {
        const { templateDefault, schoolYear: year, ...cardSchool } = data.school;
        setSchool(cardSchool);
        setTemplateId(TEMPLATES.some((template) => template.id === templateDefault) ? templateDefault : "officiel");
        setSchoolYear(year);
      }
      const first = studentsBody.students?.[0];
      if (first) setStudent(first);
      setReady(true);
    }).catch((cause: unknown) => {
      if (active) {
        setError(cause instanceof Error ? cause.message : "Base de données indisponible.");
        setReady(true);
      }
    });
    return () => { active = false; };
  }, []);

  const set = (key: keyof CardSchool) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setSchool((current) => ({ ...current, [key]: event.target.value }));
    setSaved(false);
  };
  const setText = (key: "cardHeader" | "cardBackText") => (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSchool((current) => ({ ...current, [key]: event.target.value }));
    setSaved(false);
  };
  const setCardOption = (key: "cardFont" | "cardHeaderSize") => (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSchool((current) => ({ ...current, [key]: key === "cardHeaderSize" ? Number(event.target.value) : event.target.value }));
    setSaved(false);
  };

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/school", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...school, templateDefault: templateId, schoolYear }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Enregistrement impossible.");
      const { templateDefault, schoolYear: year, ...cardSchool } = body.school;
      setSchool(cardSchool);
      setTemplateId(TEMPLATES.some((template) => template.id === templateDefault) ? templateDefault : "officiel");
      setSchoolYear(year);
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  }

  const selectedTemplate = TEMPLATES.find((item) => item.id === templateId);
  return (
    <>
      <h1 className="page-title">Mon école</h1>
      <p className="mt-2 max-w-2xl text-muted">Ces informations sont enregistrées en base et imprimées sur les cartes.</p>
      {error && <p className="mt-5 rounded-[10px] border border-[#f4c7c3] bg-[#fef3f2] p-3 text-sm text-[#7a271a]" role="alert">{error}</p>}

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[1fr_1fr]">
        <form className="grid content-start gap-5" onSubmit={save}>
          <Field label="Nom de l’établissement" value={school.name} onChange={set("name")} required />
          <Field label="Mention officielle" value={school.authority ?? ""} onChange={set("authority")} hint="Par exemple : Établissement privé agréé." />
          <Field label="Devise" value={school.motto ?? ""} onChange={set("motto")} />
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Texte d’en-tête de la carte</span>
            <textarea value={school.cardHeader ?? ""} onChange={setText("cardHeader")} maxLength={180} rows={2} placeholder="République du Bénin · Ministère de l’Éducation" className="input" />
            <span className="text-xs text-muted">Personnalisez la mention affichée en haut du recto (180 caractères maximum).</span>
          </label>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Police des cartes</span>
              <select value={school.cardFont ?? "template"} onChange={setCardOption("cardFont")} className="input">
                <option value="template">Police du modèle</option>
                <option value="sans">Sans sérif — moderne</option>
                <option value="serif">Sérif — institutionnelle</option>
              </select>
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-semibold">Taille du texte d’en-tête</span>
              <select value={school.cardHeaderSize ?? 16} onChange={setCardOption("cardHeaderSize")} className="input">
                <option value={12}>Compacte · 12 px</option>
                <option value={16}>Standard · 16 px</option>
                <option value={20}>Grande · 20 px</option>
                <option value={22}>Très grande · 22 px</option>
              </select>
            </label>
          </div>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Texte du verso</span>
            <textarea value={school.cardBackText ?? ""} onChange={setText("cardBackText")} maxLength={300} rows={4} placeholder="Cette carte est personnelle et obligatoire pour les démarches scolaires." className="input" />
            <span className="text-xs text-muted">Texte de validité ou consignes au verso. Un message court reste plus lisible sur une carte (300 caractères maximum).</span>
          </label>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="Nom du signataire" value={school.signatoryName ?? ""} onChange={set("signatoryName")} maxLength={120} placeholder="Nom du directeur" />
            <Field label="Fonction du signataire" value={school.signatoryTitle ?? ""} onChange={set("signatoryTitle")} maxLength={80} placeholder="Directeur / Directrice" />
          </div>
          <Field label="Adresse" value={school.address ?? ""} onChange={set("address")} />
          <Field label="Téléphone de l’établissement" value={school.phone ?? ""} onChange={set("phone")} />
          <Field label="Année scolaire" value={schoolYear} onChange={(event) => { setSchoolYear(event.target.value); setSaved(false); }} />
          <div className="grid grid-cols-2 gap-5">
            <label className="grid gap-1.5 text-sm"><span className="font-semibold">Couleur principale</span><input type="color" value={school.primary} onChange={set("primary")} className="h-11 w-full cursor-pointer rounded-[10px] border border-line-strong bg-white p-1" /></label>
            <label className="grid gap-1.5 text-sm"><span className="font-semibold">Couleur d’accent</span><input type="color" value={school.secondary} onChange={set("secondary")} className="h-11 w-full cursor-pointer rounded-[10px] border border-line-strong bg-white p-1" /></label>
          </div>
          <label className="grid gap-1.5 text-sm">
            <span className="font-semibold">Modèle de carte par défaut</span>
            <select value={templateId} onChange={(event) => { setTemplateId(event.target.value); setSaved(false); }} className="input">
              {TEMPLATES.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
            </select>
          </label>
          <div className="flex items-center gap-4 pt-1">
            <button disabled={!ready || busy} className="btn btn-primary px-6 py-3.5">{busy ? "Enregistrement…" : "Enregistrer"}</button>
            {saved && <span className="badge badge-lime" aria-live="polite">Enregistré en base de données.</span>}
          </div>
        </form>

        <div className="surface-dark glow-soft grid h-fit min-w-0 grid-cols-[minmax(0,1fr)] content-start justify-items-center gap-5 overflow-hidden rounded-[20px] p-6 lg:sticky lg:top-8">
          <div className="inline-flex overflow-hidden rounded-[10px] border border-white/20" role="group" aria-label="Face de la carte à prévisualiser">
            {(["front", "back"] as const).map((side) => (
              <button key={side} type="button" onClick={() => setPreviewSide(side)} aria-pressed={previewSide === side} className={`px-4 py-2 text-sm font-medium transition-colors ${previewSide === side ? "bg-lime text-ink" : "text-white/80 hover:bg-white/10"}`}>
                {side === "front" ? "Recto" : "Verso"}
              </button>
            ))}
          </div>
          <CardPreview templateId={templateId} data={{ school, student }} side={previewSide} scale={selectedTemplate?.orientation === "landscape" ? 0.5 : 0.4} />
        </div>
      </div>
    </>
  );
}
