import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession } from "@/lib/auth";
import { LogoMark } from "@/components/site/Logo";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect("/connexion");
  if (!session.user.isPlatformAdmin) {
    const school = session.user.school;
    redirect(
      school?.verificationStatus === "APPROVED"
        ? "/app"
        : school?.verificationStatus === "PENDING_REVIEW"
          ? "/espace"
          : "/verification",
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="surface-dark border-b border-white/10">
        <div className="wrap flex max-w-5xl items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-3.5">
            <LogoMark onDark />
            <div>
              <p className="font-bold tracking-tight text-white">Super-administration</p>
              <p className="text-sm text-white/55">{session.user.email}</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-2 sm:gap-3" aria-label="Administration">
            <Link href="/admin" className="rounded-lg px-3 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white">Vue d’ensemble</Link>
            <Link href="/admin/ecoles" className="rounded-lg px-3 py-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white">Écoles</Link>
            <form action="/api/auth/logout" method="post">
              <button className="btn-outline-light py-2.5">Se déconnecter</button>
            </form>
          </nav>
        </div>
      </header>
      <main className="wrap max-w-6xl py-10">{children}</main>
    </div>
  );
}
