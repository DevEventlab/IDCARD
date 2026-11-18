import AuthShell from "@/components/site/AuthShell";
import AuthForm from "@/components/site/AuthForm";

export const metadata = { title: "Connexion" };

export default function Page() {
  return (
    <AuthShell title="Content de vous revoir" subtitle="Connectez-vous pour retrouver les élèves, les modèles et les PDF de votre établissement.">
      <AuthForm mode="login" />
    </AuthShell>
  );
}
