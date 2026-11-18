import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-poppins", display: "swap" });

export const metadata: Metadata = {
  title: { default: "CarteÉcole : cartes d'identité scolaires", template: "%s · CarteÉcole" },
  description: "Créez les cartes d'identité de vos élèves à partir d'un fichier Excel. Abonnement par établissement, essai gratuit de 14 jours.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
