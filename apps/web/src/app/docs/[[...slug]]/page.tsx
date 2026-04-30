import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BookOpen,
  Database,
  FileText,
  LayoutDashboard,
  Rocket,
  Server,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildMetadata } from "@/lib/seo";
import { docsPages, getDocNavigation, getDocPage } from "@/data/docs";

export const metadata: Metadata = buildMetadata({
  title: "Docs",
  description:
    "Tai lieu noi bo cho EduCourse: kien truc Next.js, backend C#, SQL Server, judge service, payment va phan bao ve do an.",
  path: "/docs",
  type: "website",
  keywords: ["docs", "architecture", "Next.js", "C#", "SQL Server", "judge"],
});

export function generateStaticParams() {
  return [
    { slug: [] },
    ...docsPages.map((page) => ({
      slug: [page.slug],
    })),
  ];
}

export default async function DocsPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolved = await getDocPageFromParams(params);

  if (!resolved) {
    notFound();
  }

  const page = resolved.page;
  const navigation = getDocNavigation();

  return (
    <div className="section-shell space-y-8 py-12 fade-in">
      <div className="surface-card overflow-hidden rounded-3xl border border-emerald-100/80 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-8 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">
              <BookOpen className="size-4" />
              Project docs
            </p>
            <h1 className="section-title text-4xl font-semibold text-emerald-950">
              {page.title}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-emerald-900/75">
              {page.summary}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[24rem] lg:grid-cols-2">
            <StatCard icon={<LayoutDashboard className="size-4" />} label="Route shell" value="Next.js" />
            <StatCard icon={<Server className="size-4" />} label="Boundary" value="C# API" />
            <StatCard icon={<Database className="size-4" />} label="Storage" value="SQL Server" />
            <StatCard icon={<Rocket className="size-4" />} label="Judge" value="Sandbox" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="surface-card h-fit rounded-3xl p-4 xl:sticky xl:top-24">
          <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Noi dung
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const active = item.slug === page.slug;
              return (
                <Link
                  key={item.slug}
                  href={item.href}
                  className={[
                    "block rounded-2xl px-3 py-2 transition-colors",
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-emerald-900/80 hover:bg-emerald-50 hover:text-emerald-950",
                  ].join(" ")}
                >
                  <div className="text-sm font-semibold">{item.title}</div>
                  <div className={active ? "text-xs text-white/75" : "text-xs text-emerald-800/65"}>
                    {item.summary}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-900/80">
            <p className="font-semibold text-emerald-950">Muc tieu</p>
            <p className="mt-2 leading-6">
              Dung docs nay de bao ve do an, giai thich kien truc, va lam tai lieu van hanh khi can.
            </p>
          </div>
        </aside>

        <main className="space-y-6">
          <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl font-semibold text-emerald-950">
                {page.eyebrow}
              </CardTitle>
              <CardDescription>{page.purpose}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 pt-6 lg:grid-cols-2">
              {page.blocks.map((block) => (
                <section key={block.heading} className="space-y-3">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                    {block.heading}
                  </h2>
                  <ul className="space-y-2 text-sm leading-6 text-slate-700">
                    {block.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2"
                      >
                        <span className="mt-1 size-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-semibold text-emerald-950">
                  Bai hoc ruot tu stack
                </CardTitle>
                <CardDescription>
                  Ket hop Next.js, Mono style boundary va SQL style hot-path thinking.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                {page.stackNotes.map((note) => (
                  <div key={note} className="flex gap-2 text-sm leading-6 text-slate-700">
                    <ArrowRight className="mt-1 size-4 shrink-0 text-emerald-600" />
                    <span>{note}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle className="text-lg font-semibold text-emerald-950">
                  File can doc lai
                </CardTitle>
                <CardDescription>
                  Danh sach file lien quan trong repo de doi chieu luc bao ve hoac sua tiep.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 pt-6">
                {page.files.map((file) => (
                  <div
                    key={file}
                    className="rounded-2xl border border-slate-100 bg-slate-50/70 px-3 py-2 text-sm text-slate-700"
                  >
                    {file}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-3xl border border-slate-200/80 shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-emerald-950">
                Tai lieu lien quan
              </CardTitle>
              <CardDescription>
                Nhanh chong di chuyen giua cac trang docs co lien quan den flow nay.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 pt-6 sm:grid-cols-2 xl:grid-cols-3">
              {page.related.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-slate-900">{item.label}</span>
                    <FileText className="size-4 text-emerald-600 transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}

async function getDocPageFromParams(
  params: Promise<{ slug?: string[] }>
): Promise<{ page: (typeof docsPages)[number] } | null> {
  const resolved = await params;
  const page = getDocPage(resolved.slug);

  if (resolved.slug && resolved.slug[0] && !docsPages.some((item) => item.slug === resolved.slug?.[0])) {
    return null;
  }

  return { page };
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-base font-semibold text-emerald-950">{value}</div>
    </div>
  );
}
