import AuthShell from "@/components/site/AuthShell";
import AuthForm from "@/components/site/AuthForm";

export const metadata = { title: "Créer un compte" };

export default function Page() {
  return (
    <AuthShell title="Créer le compte de votre école" subtitle="Créez l’espace de votre établissement en quelques étapes. Vous pourrez ensuite transmettre les justificatifs pour faire valider l’accès aux cartes.">
      <AuthForm mode="register" />
    </AuthShell>
  );
}
