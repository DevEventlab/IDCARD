"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Generation = {
  id: string;
  date: string;
  classe: string;
  modele: string;
  total: number;
  statut: string;
};

export default function Dashboard() {
  const [students, setStudents] = useState<{ photo: boolean }[]>([]);
  const [classCount, setClassCount] = useState(0);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/students", { cache: "no-store" }),
      fetch("/api/generations", { cache: "no-store" }),
    ]).then(async ([studentsResponse, generationsResponse]) => {
      const studentsBody = await studentsResponse.json();
      const generationsBody = await generationsResponse.json();
      if (!studentsResponse.ok || !generationsResponse.ok)
        throw new Error(studentsBody.error ?? generationsBody.error ?? "Chargement impossible.");
      setStudents(studentsBody.students);
      setClassCount(studentsBody.classes.length);
      setGenerations(generationsBody.generations);
    }).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Base de données indisponible."))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Élèves enregistrés", value: students.length },
    { label: "Classes", value: classCount },
    { label: "Sans photo", value: students.filter((student) => !student.photo).length },
    { label: "PDF générés", value: generations.filter((item) => item.statut === "DONE").length },
  ];

  return (
    <>
      {error && <div className="mb-6 rounded-[10px] border border-[#f4c7c3] bg-[#fef3f2] px-4 py-3 text-sm text-[#7a271a]" role="alert">{error}</div>}
      <h1 className="page-title">Tableau de bord</h1>
      <p className="mt-2 text-muted">L’état de votre répertoire et de vos tirages en un coup d’œil.</p>
      <dl className="mt-8 grid grid-cols-2 overflow-hidden rounded-[20px] border border-line lg:grid-cols-4">
        {stats.map((item, i) => (
          <div key={item.label} className={`p-6 ${i % 2 === 0 ? "border-r border-line" : ""} ${i < 2 ? "border-b border-line lg:border-b-0" : ""} lg:border-r lg:border-line lg:last:border-r-0`}>
            <dt className="text-sm text-muted">{item.label}</dt>
            <dd className="mt-2 text-4xl font-bold tabular-nums tracking-tight">{loading ? "—" : item.value}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Link href="/app/import" className="group rounded-[20px] border border-line bg-white p-7 transition-colors hover:border-ink">
          <h2 className="text-lg font-bold tracking-tight">Importer des élèves</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Validez un fichier Excel et enregistrez les élèves et portraits dans la base.</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline decoration-lime decoration-2 underline-offset-4">Commencer l’import <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span></span>
        </Link>
        <Link href="/app/generer" className="surface-dark glow-olive group rounded-[20px] p-7">
          <h2 className="text-lg font-bold tracking-tight">Générer les cartes</h2>
          <p className="mt-2 text-sm leading-6 text-white/70">Créez un PDF réel à partir des élèves, de leur classe et du modèle choisi.</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-lime">Ouvrir la génération <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span></span>
        </Link>
      </div>

      <h2 className="mt-12 text-xl font-bold tracking-tight">Dernières générations</h2>
      <div className="mt-4 overflow-x-auto rounded-[20px] border border-line bg-white">
        <table className="data-table">
          <thead>
            <tr><th>Date</th><th>Classe</th><th>Modèle</th><th>Cartes</th><th>Statut</th><th>PDF</th></tr>
          </thead>
          <tbody>
            {generations.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.date).toLocaleString("fr-FR")}</td>
                <td>{item.classe}</td>
                <td>{item.modele}</td>
                <td className="tabular-nums">{item.total}</td>
                <td><span className={`badge ${item.statut === "DONE" ? "badge-lime" : ""}`}>{item.statut}</span></td>
                <td>{item.statut === "DONE" ? <a href={`/api/generations/${item.id}/pdf`} className="font-semibold underline decoration-lime decoration-2 underline-offset-4">Télécharger</a> : "—"}</td>
              </tr>
            ))}
            {!loading && generations.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-muted">Aucune génération enregistrée.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
