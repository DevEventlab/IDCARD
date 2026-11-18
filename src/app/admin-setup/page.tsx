"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Field from "@/components/site/Field";
import Logo from "@/components/site/Logo";

export default function AdminSetupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: form.get("token"),
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error ?? "Configuration impossible.");
      router.push(body.next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Configuration impossible.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="surface-dark glow-olive relative grid min-h-screen place-items-center overflow-hidden px-5 py-12">
      <span className="tile -left-16 top-24 h-44 w-44 -rotate-[18deg]" aria-hidden="true" />
      <div className="relative w-full max-w-lg rounded-[22px] bg-white p-7 text-ink shadow-2xl sm:p-10">
        <Logo />
        <h1 className="mt-8 text-[1.75rem] font-bold leading-tight tracking-tight">Créer le super-administrateur</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Cette opération n’est possible qu’une seule fois. Configurez d’abord <code className="rounded bg-[#eef3e0] px-1.5 py-0.5 text-ink">PLATFORM_ADMIN_SETUP_TOKEN</code> sur le serveur et utilisez le code secret ici.</p>
        <form className="mt-7 grid gap-4" onSubmit={submit}>
          <Field label="Code de configuration" name="token" type="password" autoComplete="off" required />
          <Field label="Nom" name="name" autoComplete="name" minLength={2} maxLength={120} required />
          <Field label="Adresse e-mail" name="email" type="email" autoComplete="email" maxLength={254} required />
          <Field label="Mot de passe" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required hint="12 caractères minimum." />
          {error && <p className="rounded-[10px] border border-[#f4c7c3] bg-[#fef3f2] p-3 text-sm text-[#7a271a]" role="alert">{error}</p>}
          <button disabled={busy} className="btn btn-primary mt-1 w-full py-3.5">{busy ? "Création…" : "Créer le super-administrateur"}</button>
        </form>
      </div>
    </main>
  );
}
