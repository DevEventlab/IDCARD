"use client";

import { useEffect, useMemo, useState } from "react";

type Student = {
  id: string;
  matricule: string;
  nom: string;
  prenoms: string;
  dateNaissance: string;
  sexe: string;
  classe: string;
  photo: boolean;
};
type ClassItem = { id: string; name: string; count: number };

export default function ElevesPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [classe, setClasse] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/students", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok) throw new Error(body.error ?? "Chargement impossible.");
        setStudents(body.students);
        setClasses(body.classes);
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Base de données indisponible."))
      .finally(() => setLoading(false));
  }, []);

  const rows = useMemo(
    () => students.filter((student) =>
      (!classe || student.classe === classe) &&
      `${student.nom} ${student.prenoms} ${student.matricule}`.toLowerCase().includes(query.toLowerCase()),
    ),
    [students, classe, query],
  );

  return (
    <>
      <h1 className="page-title">Élèves</h1>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un nom ou un matricule" aria-label="Rechercher" className="input w-full sm:w-80" />
        <select value={classe} onChange={(event) => setClasse(event.target.value)} aria-label="Filtrer par classe" className="input w-auto">
          <option value="">Toutes les classes</option>
          {classes.map((item) => <option key={item.id} value={item.name}>{item.name} ({item.count})</option>)}
        </select>
        <span className="text-sm text-muted">{loading ? "Chargement…" : `${rows.length} élève${rows.length > 1 ? "s" : ""}`}</span>
      </div>
      {error && <p className="mt-4 rounded-[10px] border border-[#f4c7c3] bg-[#fef3f2] p-3 text-sm text-[#7a271a]" role="alert">{error}</p>}

      <div className="mt-5 overflow-x-auto rounded-[20px] border border-line bg-white">
        <table className="data-table">
          <thead>
            <tr>{["Matricule", "Nom", "Prénoms", "Naissance", "Sexe", "Classe", "Photo"].map((heading) => <th key={heading}>{heading}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((student) => (
              <tr key={student.id}>
                <td className="tabular-nums">{student.matricule}</td>
                <td className="font-semibold">{student.nom}</td>
                <td>{student.prenoms}</td>
                <td className="tabular-nums">{student.dateNaissance}</td>
                <td>{student.sexe}</td>
                <td>{student.classe}</td>
                <td>{student.photo ? <span className="badge badge-lime">Présente</span> : <span className="badge badge-warn">Manquante</span>}</td>
              </tr>
            ))}
            {!loading && rows.length === 0 && <tr><td colSpan={7} className="py-12 text-center text-muted">{error ? "Le répertoire n’est pas accessible." : "Aucun élève enregistré. Importez un classeur pour commencer."}</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
