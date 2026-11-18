"use client";

import { useEffect, useRef, useState } from "react";
import CardPreview from "@/components/cards/CardPreview";
import { TEMPLATES } from "@/components/cards";
import { MOCK_DATA } from "@/lib/mock";
import type { CardSide } from "@/lib/card-types";

export const DEMO_STUDENTS = [
  { nom: "DUPONT", prenoms: "Tété Gbodja Sènankpon", fullName: "Tété Gbodja DUPONT", matricule: "12345678901", shortId: "SC-2026-0841", classe: "3ème M5", dateNaissance: "09/08/2009", lieuNaissance: "Cotonou", sexe: "M" as const, nationalite: "Béninoise", telephoneParent: "+229 01 97 42 18 05", emergencyContact: "+229 01 97 42 18 05", parentName: "M. Komlan DUPONT", ecole: "CEG STE-RITA COTONOU", photoUrl: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=300&q=85" },
  { nom: "SAMBA", prenoms: "Varlo Junior", fullName: "SAMBA VARLO", matricule: "2026-LAEL-042", shortId: "SC-2026-0842", classe: "CE2", dateNaissance: "14/05/2016", lieuNaissance: "Brazzaville", sexe: "M" as const, nationalite: "Congolaise", telephoneParent: "+242 06 612 45 89", emergencyContact: "+242 06 612 45 89", parentName: "Mme Clarisse SAMBA", ecole: "ÉCOLE LAEL", photoUrl: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=300&q=85" },
  { nom: "DIALLO", prenoms: "Awa Fatoumata", fullName: "Awa Fatoumata DIALLO", matricule: "2026-ABC-119", shortId: "SC-2026-0843", classe: "2nde C", dateNaissance: "22/09/2010", lieuNaissance: "Dakar", sexe: "F" as const, nationalite: "Sénégalaise", telephoneParent: "+221 77 540 12 30", emergencyContact: "+221 77 540 12 30", parentName: "M. Mamadou DIALLO", ecole: "GROUPE SCOLAIRE LES ÉLITES", photoUrl: "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?auto=format&fit=crop&w=300&q=85" },
  { nom: "MENSAH", prenoms: "Koffi David", fullName: "Koffi David MENSAH", matricule: "2026-TCD-308", shortId: "SC-2026-0844", classe: "Tle D1", dateNaissance: "03/11/2008", lieuNaissance: "Lomé", sexe: "M" as const, nationalite: "Togolaise", telephoneParent: "+228 90 14 78 22", emergencyContact: "+228 90 14 78 22", parentName: "Mme Akossiwa MENSAH", ecole: "COLLÈGE SAINT-JOSEPH", photoUrl: "https://images.unsplash.com/photo-1507152832244-10d45c7eda57?auto=format&fit=crop&w=300&q=85" },
];

export default function HeroDemo() {
  const [studentIndex, setStudentIndex] = useState(0);
  const [templateId, setTemplateId] = useState("officiel");
  const [side, setSide] = useState<CardSide>("front");
  const autoCycle = useRef<ReturnType<typeof setInterval> | null>(null);
  const studentIndexRef = useRef(0);
  useEffect(() => {
    autoCycle.current = setInterval(() => {
      const next = (studentIndexRef.current + 1) % DEMO_STUDENTS.length;
      studentIndexRef.current = next;
      setStudentIndex(next);
      setTemplateId(["officiel", "numerique", "geometrique", "badge"][next]);
    }, 5000);
    return () => { if (autoCycle.current) clearInterval(autoCycle.current); };
  }, []);
  const stopAutoCycle = () => { if (autoCycle.current) clearInterval(autoCycle.current); };
  const student = DEMO_STUDENTS[studentIndex];
  const template = TEMPLATES.find((item) => item.id === templateId) ?? TEMPLATES[0];
  const colors = templateId === "geometrique"
    ? ["#0d47a1", "#00acc1"]
    : templateId === "badge"
      ? ["#00897b", "#0f172a"]
      : [MOCK_DATA.school.primary, MOCK_DATA.school.secondary];
  const data = { ...MOCK_DATA, school: { ...MOCK_DATA.school, name: student.ecole, primary: colors[0], secondary: colors[1] }, student: { ...MOCK_DATA.student, ...student } };

  return (
    <div className="sc-excel-demo">
      <div className="sc-excel-window">
        <div className="sc-excel-title"><span><i className="sc-dot red"/><i className="sc-dot yellow"/><i className="sc-dot green"/></span><b>▤ liste_eleves_3eme_A.xlsx</b><small>EXEMPLE</small></div>
        <div className="sc-table-scroll"><table><thead><tr><th>Ligne</th><th>Matricule</th><th>Nom &amp; prénom</th><th>Classe</th><th>Naissance</th></tr></thead><tbody>{DEMO_STUDENTS.map((row, index) => <tr key={row.matricule} onClick={() => { stopAutoCycle(); studentIndexRef.current = index; setStudentIndex(index); setTemplateId(["officiel", "numerique", "geometrique", "badge"][index]); }} aria-selected={studentIndex === index}><td><i className="sc-row-dot"/>#{index + 1}</td><td>{row.shortId}</td><td>{row.fullName}</td><td><span className="sc-class-pill">{row.classe}</span></td><td>{row.dateNaissance}</td></tr>)}</tbody></table></div>
      </div>
      <div className="sc-excel-controls"><span className="sc-row-badge">✳ Ligne #{studentIndex + 1}</span><div className="sc-quick-templates">{TEMPLATES.map((item, index) => <button type="button" key={item.id} aria-label={item.name} onClick={() => { stopAutoCycle(); setTemplateId(item.id); }} aria-pressed={item.id === template.id}>{["Officiel", "Numérique", "Moderne", "Badge"][index]}</button>)}</div><div className="sc-face-buttons">{(["front", "back"] as const).map((face) => <button type="button" key={face} onClick={() => setSide(face)} aria-pressed={side === face}>{face === "front" ? "Recto" : "Verso"}</button>)}</div></div>
      <div className="sc-excel-card" style={{ minHeight: template.orientation === "landscape" ? 300 : 420 }}><CardPreview templateId={template.id} data={data} side={side} scale={template.orientation === "landscape" ? 0.51 : 0.45} /></div>
      <p className="sc-excel-caption"><b>Excel → carte élève</b><span>Sélectionnez une ligne et essayez les modèles.</span></p>
    </div>
  );
}
