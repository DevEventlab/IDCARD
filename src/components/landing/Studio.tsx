"use client";

import { useState } from "react";
import CardPreview from "@/components/cards/CardPreview";
import { TEMPLATES } from "@/components/cards";
import { MOCK_DATA } from "@/lib/mock";
import { DEMO_STUDENTS } from "@/components/landing/HeroDemo";
import type { CardSide } from "@/lib/card-types";

const COLORS = [
  ["#0d47a1", "#00acc1"],
  ["#0f766e", "#34d399"],
  ["#4338ca", "#fb7185"],
  ["#7c2d12", "#f59e0b"],
];

export default function Studio() {
  const [templateId, setTemplateId] = useState<string>(TEMPLATES[0].id);
  const [side, setSide] = useState<CardSide>("front");
  const [palette, setPalette] = useState(-1);
  const [school, setSchool] = useState(MOCK_DATA.school.name);
  const [year, setYear] = useState(MOCK_DATA.student.anneeScolaire);
  const template = TEMPLATES.find((item) => item.id === templateId) ?? TEMPLATES[0];
  const defaultColors = templateId === "geometrique"
    ? ["#0d47a1", "#00acc1"]
    : templateId === "badge"
      ? ["#00897b", "#0f172a"]
      : [MOCK_DATA.school.primary, MOCK_DATA.school.secondary];
  const colors = palette < 0 ? defaultColors : COLORS[palette];
  const data = {
    ...MOCK_DATA,
    school: { ...MOCK_DATA.school, name: school || MOCK_DATA.school.name, primary: colors[0], secondary: colors[1] },
    student: { ...MOCK_DATA.student, anneeScolaire: year || MOCK_DATA.student.anneeScolaire },
  };

  return (
    <>
    <div className="sc-studio">
      <div className="sc-studio-controls">
        <label className="sc-label">1. Choisir un modèle</label>
        <div className="sc-template-options">
          {TEMPLATES.map((item, index) => (
            <button key={item.id} type="button" className={`sc-template-option ${template.id === item.id ? "is-active" : ""}`} onClick={() => setTemplateId(item.id)} aria-pressed={template.id === item.id}>
              <span className="sc-option-index">0{index + 1}</span><span><b>{item.name}</b><small>{item.description}</small></span><span className="sc-option-shape">{item.orientation === "landscape" ? "▱" : "▯"}</span>
            </button>
          ))}
        </div>
        <div className="sc-input-grid">
          <label className="sc-label">Nom de l’école<input value={school} maxLength={48} onChange={(event) => setSchool(event.target.value)} /></label>
          <label className="sc-label">Année scolaire<input value={year} maxLength={12} onChange={(event) => setYear(event.target.value)} /></label>
        </div>
        <div className="sc-studio-bottom">
          <div><span className="sc-label">2. Palette de l’établissement</span><div className="sc-swatches">{COLORS.map(([primary, secondary], index) => <button key={primary} type="button" aria-label={`Palette ${index + 1}`} aria-pressed={palette === index} onClick={() => setPalette(index)} style={{ background: `linear-gradient(135deg,${primary} 55%,${secondary} 55%)` }} />)}</div></div>
          <div><span className="sc-label">3. Face de la carte</span><div className="sc-side-switch">{(["front", "back"] as const).map((face) => <button key={face} type="button" onClick={() => setSide(face)} aria-pressed={side === face} className={side === face ? "is-active" : ""}>{face === "front" ? "Recto" : "Verso"}</button>)}</div></div>
        </div>
      </div>
      <div className="sc-studio-preview">
        <div className="sc-preview-top"><span><i /> APERÇU EN DIRECT</span><span>{template.orientation === "landscape" ? "85,6 × 54 mm" : "54 × 85,6 mm"} · {side === "front" ? "RECTO" : "VERSO"}</span></div>
        <div className="sc-card-stage" style={{ minHeight: template.orientation === "landscape" ? 430 : 430 }}><CardPreview templateId={template.id} data={data} side={side} scale={template.orientation === "landscape" ? 0.51 : 0.45} /></div>
        <p>▣ &nbsp; Rendu haute netteté 300 DPI — fond blanc ou ivoire économique à l’impression</p>
      </div>
    </div>
    <div className="sc-gallery-heading"><div><h3>Aperçu comparatif des 4 présentations</h3><p>Formats horizontaux officiels, modernes ou badges verticaux avec lanière : chaque école choisit son style.</p></div><span>Inclus dans tous les abonnements</span></div>
    <div className="sc-template-gallery">
      {TEMPLATES.map((item, index) => {
        const galleryColors = index === 2 ? ["#0D47A1", "#00ACC1"] : index === 3 ? ["#00897B", "#0F172A"] : [MOCK_DATA.school.primary, MOCK_DATA.school.secondary];
        const sample = DEMO_STUDENTS[index];
        const galleryData = { ...MOCK_DATA, school: { ...MOCK_DATA.school, name: sample.ecole, primary: galleryColors[0], secondary: galleryColors[1] }, student: { ...MOCK_DATA.student, ...sample } };
        const badges = ["Fond blanc · Format CR80 horizontal", "Fond ivoire · Contrôle d’accès rapide", "Fond blanc & bleu · Signature direction", "Fond blanc & turquoise · Portrait hexagone"];
        return <article className="sc-gallery-card" key={item.id}><div className="sc-gallery-title">{item.name}<span>{badges[index]}</span></div><div className="sc-gallery-stage"><CardPreview templateId={item.id} data={galleryData} side="front" scale={item.orientation === "landscape" ? 0.51 : 0.45} /></div></article>;
      })}
    </div>
    </>
  );
}
