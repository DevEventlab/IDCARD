"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Logo from "@/components/site/Logo";

const NAV = [
  { href: "/app", label: "Tableau de bord", exact: true },
  { href: "/app/import", label: "Importer des élèves" },
  { href: "/app/eleves", label: "Élèves" },
  { href: "/app/generer", label: "Générer les cartes" },
  { href: "/app/ecole", label: "Mon école" },
];

export default function Sidebar() {
  const path = usePathname();
  const router = useRouter();
  const [schoolName, setSchoolName] = useState("Mon école");
  const [logoutError, setLogoutError] = useState("");
  useEffect(() => {
    fetch("/api/school", { cache: "no-store" })
      .then((response) => response.json())
      .then((body) => {
        if (body.school?.name) setSchoolName(body.school.name);
      })
      .catch(() => undefined);
  }, []);
  return (
    <aside className="surface-dark flex w-full shrink-0 flex-col border-b border-white/10 md:sticky md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r">
      <div className="px-5 py-5"><Logo href="/app" light /></div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-0">
        {NAV.map((n) => {
          const active = n.exact ? path === n.href : path.startsWith(n.href);
          return (
            <Link key={n.href} href={n.href} aria-current={active ? "page" : undefined} className={`relative whitespace-nowrap rounded-[10px] px-3.5 py-2.5 text-sm transition-colors ${active ? "bg-white/10 font-semibold text-white before:absolute before:inset-y-2 before:left-0 before:w-[3px] before:rounded-full before:bg-lime" : "text-white/65 hover:bg-white/5 hover:text-white"}`}>
              {n.label}
            </Link>
          );
        })}
        <Link href="/templates" className="whitespace-nowrap rounded-[10px] px-3.5 py-2.5 text-sm text-white/65 transition-colors hover:bg-white/5 hover:text-white">Galerie des modèles</Link>
      </nav>
      <div className="mt-auto border-t border-white/10 p-5 text-sm">
        <p className="truncate font-semibold text-white" title={schoolName}>{schoolName}</p>
        <Link href="/app/ecole" className="mt-1 inline-block text-white/55 transition-colors hover:text-lime">Configurer l’école</Link>
        <button
          onClick={async () => {
            setLogoutError("");
            try {
              const response = await fetch("/api/auth/logout", { method: "POST" });
              if (!response.ok) throw new Error("Déconnexion impossible.");
              router.push("/connexion");
            } catch (cause) {
              setLogoutError(cause instanceof Error ? cause.message : "Déconnexion impossible.");
            }
          }}
          className="mt-3 block text-white/55 transition-colors hover:text-lime"
        >Se déconnecter</button>
        {logoutError && <p className="mt-2 text-xs text-rose-300" role="alert">{logoutError}</p>}
      </div>
    </aside>
  );
}
