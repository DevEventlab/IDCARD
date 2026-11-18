import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PendingSchoolSpace() {
  const session = await getCurrentSession();
  if (!session) redirect("/connexion");
  if (session.user.isPlatformAdmin) redirect("/admin");

  const school = session.user.school;
  if (!school) redirect("/verification");
  if (school.verificationStatus === "APPROVED") redirect("/app");
  if (school.verificationStatus !== "PENDING_REVIEW") redirect("/verification");

  const documents = await prisma.schoolDocument.findMany({
    where: { schoolId: school.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, originalName: true, createdAt: true },
  });
  if (!documents.length) redirect("/verification");

  return (
    <main className="surface-dark glow-olive relative min-h-screen overflow-hidden px-5 py-12">
      <span className="tile -right-16 top-32 h-44 w-44 rotate-[16deg]" aria-hidden="true" />
      <div className="relative mx-auto max-w-2xl rounded-[22px] bg-white p-6 text-ink shadow-2xl sm:p-10">
        <p className="text-sm font-semibold text-olive">Espace de votre établissement</p>
        <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight">{school.name}</h1>
        <div className="mt-6 rounded-2xl border border-[#f6dda6] bg-[#fffaeb] p-5">
          <h2 className="font-bold">Votre compte est en cours de vérification</h2>
          <p className="mt-2 text-sm leading-6 text-[#3b4333]">
            Votre justificatif a bien été transmis. Les autres options de votre espace seront activées après validation.
          </p>
          <p className="mt-3 text-sm text-muted">Délai indicatif : entre 20 minutes et 1 heure.</p>
        </div>
        <section className="mt-7">
          <h2 className="text-sm font-bold">Justificatif transmis</h2>
          <ul className="mt-3 grid gap-2 text-sm text-muted">
            {documents.map((document) => (
              <li key={document.id} className="flex flex-wrap justify-between gap-2 rounded-[10px] border border-line px-4 py-3">
                <span>{document.originalName}</span>
                <time dateTime={document.createdAt.toISOString()}>
                  {document.createdAt.toLocaleString("fr-FR")}
                </time>
              </li>
            ))}
          </ul>
        </section>
        <form action="/api/auth/logout" method="post" className="mt-8 border-t border-line pt-5">
          <button type="submit" className="text-sm font-semibold underline decoration-lime decoration-2 underline-offset-4">
            Se déconnecter
          </button>
        </form>
      </div>
    </main>
  );
}
