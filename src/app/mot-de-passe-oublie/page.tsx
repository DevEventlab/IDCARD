"use client";

import Link from "next/link";
import { useState } from "react";
import AuthShell from "@/components/site/AuthShell";

export default function Page() {
  const [submitted, setSubmitted] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <AuthShell
      title="Réinitialiser votre mot de passe"
      subtitle="Indiquez votre adresse e-mail pour commencer la récupération de votre accès."
    >
      {submitted ? (
        <div className="auth-reset-confirmation" role="status">
          <span aria-hidden="true">✓</span>
          <div>
            <strong>Demande prise en compte</strong>
            <p>Si cette adresse est associée à un compte, les instructions de réinitialisation seront envoyées.</p>
          </div>
        </div>
      ) : (
        <form className="auth-form" onSubmit={submit}>
          <label className="auth-field">
            <span>Adresse e-mail</span>
            <input
              className="auth-input"
              id="reset-email"
              name="email"
              type="email"
              placeholder="nom@etablissement.com"
              maxLength={254}
              autoComplete="email"
              required
            />
          </label>
          <button className="auth-submit" type="submit">
            Continuer <span>→</span>
          </button>
        </form>
      )}

      <p className="auth-switch">
        <Link href="/connexion">← Retour à la connexion</Link>
      </p>
    </AuthShell>
  );
}
