import { redirect } from "next/navigation";
import Sidebar from "@/components/app/Sidebar";
import { getCurrentSession } from "@/lib/auth";

export const metadata = { title: { default: "Espace école", template: "%s · Espace école" } };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect("/connexion");
  if (session.user.isPlatformAdmin) redirect("/admin");
  if (!session.user.school) redirect("/verification");
  if (session.user.school.verificationStatus !== "APPROVED") {
    redirect(session.user.school.verificationStatus === "PENDING_REVIEW" ? "/espace" : "/verification");
  }

  return (
    <div className="flex min-h-screen flex-col bg-white md:flex-row">
      <Sidebar />
      <div className="min-w-0 flex-1 px-5 py-8 sm:px-10 lg:py-12">
        <div className="mx-auto max-w-5xl">{children}</div>
      </div>
    </div>
  );
}
