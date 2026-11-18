"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function TextField({ label, name, type = "text", placeholder, autoComplete, minLength, maxLength, required = true }: {
  label: string; name: string; type?: string; placeholder?: string; autoComplete?: string; minLength?: number; maxLength?: number; required?: boolean;
}) {
  return (
    <label className="auth-field">
      <span>{label}</span>
      <input className="auth-input" id={name} name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} minLength={minLength} maxLength={maxLength} required={required} />
    </label>
  );
}

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const register = mode === "register";
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`/api/auth/${register ? "register" : "login"}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(register
          ? { schoolName: form.get("schoolName"), name: form.get("name"), email: form.get("email"), password: form.get("password") }
          : { email: form.get("email"), password: form.get("password") }),
      });
      const body = await response.json().catch(() => null) as { error?: string; next?: string } | null;
      if (!response.ok) throw new Error(body?.error ?? "Le serveur n’a pas pu traiter la demande. Réessayez dans un instant.");
      router.replace(body?.next || (register ? "/verification" : "/app"));
      router.refresh();
    } catch (cause) {
      setError(cause instanceof TypeError
        ? "Impossible de joindre le serveur. Vérifiez que l’application est démarrée puis réessayez."
        : cause instanceof Error ? cause.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {register && <TextField label="Nom de l’établissement" name="schoolName" placeholder="Ex. Collège Saint-Exupéry" minLength={2} maxLength={160} autoComplete="organization" />}
      {register && <TextField label="Votre nom complet" name="name" placeholder="Ex. Aïcha K. Mensah" minLength={2} maxLength={120} autoComplete="name" />}
      <TextField label="Adresse e-mail" name="email" type="email" placeholder="nom@etablissement.com" maxLength={254} autoComplete="email" />
      <label className="auth-field">
        <span>Mot de passe</span>
        <div className="auth-password-wrap">
          <input className="auth-input" id="password" name="password" type={showPassword ? "text" : "password"} placeholder={register ? "8 caractères minimum" : "Votre mot de passe"} minLength={register ? 8 : 1} maxLength={128} autoComplete={register ? "new-password" : "current-password"} required />
          <button className="auth-password-toggle" type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}>{showPassword ? "Masquer" : "Afficher"}</button>
        </div>
        {register && <small>8 caractères minimum.</small>}
        {!register && <Link className="auth-forgot-link" href="/mot-de-passe-oublie">Mot de passe oublié ?</Link>}
      </label>
      {error && <div className="auth-error" role="alert"><span aria-hidden="true">!</span><p>{error}</p></div>}
      {register && <p className="auth-review-note"><span aria-hidden="true">i</span> Après la création du compte, vous pourrez transmettre les justificatifs de votre établissement.</p>}
      <button disabled={busy} className="auth-submit" type="submit">
        {busy ? <><span className="auth-spinner" /> Création en cours…</> : register ? <>Créer mon espace école <span>→</span></> : <>Se connecter <span>→</span></>}
      </button>
      <p className="auth-switch">
        {register ? <>Vous avez déjà un compte ? <Link href="/connexion">Se connecter</Link></> : <>Votre école n’a pas encore de compte ? <Link href="/inscription">Créer un compte</Link></>}
      </p>
    </form>
  );
}
