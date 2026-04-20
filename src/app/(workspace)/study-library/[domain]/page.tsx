import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Heart, Scissors, Baby, Brain, Globe, Users } from "lucide-react";
import { DomainTabs } from "./DomainTabs";

// ── Domain config ──

const DOMAIN_META: Record<
  string,
  { label: string; icon: React.ComponentType<{ className?: string }>; iconBg: string; iconColor: string }
> = {
  adult_medicine: { label: "Adult Medicine", icon: Heart, iconBg: "bg-rose-100", iconColor: "text-rose-600" },
  adult_surgery: { label: "Adult Surgery", icon: Scissors, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  womens_health: { label: "Women's Health", icon: Users, iconBg: "bg-pink-100", iconColor: "text-pink-600" },
  child_health: { label: "Child Health", icon: Baby, iconBg: "bg-green-100", iconColor: "text-green-600" },
  mental_health: { label: "Mental Health", icon: Brain, iconBg: "bg-violet-100", iconColor: "text-violet-600" },
  population_health: { label: "Population Health", icon: Globe, iconBg: "bg-teal-100", iconColor: "text-teal-600" },
};

function readDoc(domain: string, filename: string): string {
  const filePath = path.join(process.cwd(), "docs", "dissecando-amc", domain, filename);
  if (!fs.existsSync(filePath)) return "";
  return fs.readFileSync(filePath, "utf-8");
}

// ── Page ──

interface Params {
  params: Promise<{ domain: string }>;
}

export default async function DomainStudyPage({ params }: Params) {
  const { domain } = await params;

  const meta = DOMAIN_META[domain];
  if (!meta) notFound();

  const panorama = readDoc(domain, "01-panorama-do-dominio.md");
  const highYield = readDoc(domain, "02-high-yield-topics.md");
  const guia = readDoc(domain, "03-guia-estudo-estrategico.md");

  // No content yet for this domain
  if (!panorama && !highYield && !guia) {
    return (
      <div className="flex flex-col h-full">
        <DomainHeader domain={domain} meta={meta} />
        <div className="flex-1 flex items-center justify-center text-center p-8">
          <div>
            <p className="text-neutral-500 text-sm">Guias para {meta.label} em breve.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <DomainHeader domain={domain} meta={meta} />
      <div className="flex-1 overflow-hidden">
        <DomainTabs
          panorama={panorama || "*Conteúdo não disponível ainda.*"}
          highYield={highYield || "*Conteúdo não disponível ainda.*"}
          guia={guia || "*Conteúdo não disponível ainda.*"}
        />
      </div>
    </div>
  );
}

// ── Header sub-component ──

function DomainHeader({
  domain,
  meta,
}: {
  domain: string;
  meta: { label: string; icon: React.ComponentType<{ className?: string }>; iconBg: string; iconColor: string };
}) {
  const Icon = meta.icon;
  return (
    <div className="shrink-0 border-b border-neutral-200 bg-white px-6 py-4 flex items-center gap-4">
      <Link
        href="/study-library"
        className="flex items-center gap-1 text-xs font-medium text-neutral-400 hover:text-neutral-700 transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5" />
        Biblioteca
      </Link>

      <div className="h-4 w-px bg-neutral-200" />

      <div className={`w-8 h-8 rounded-lg ${meta.iconBg} flex items-center justify-center shrink-0`}>
        <Icon className={`h-4 w-4 ${meta.iconColor}`} />
      </div>

      <div>
        <h1 className="text-sm font-bold text-neutral-800">{meta.label}</h1>
        <p className="text-xs text-neutral-400">Dissecando AMC · miniMENTE Intelligence</p>
      </div>

      <div className="ml-auto">
        <Link
          href={`/practice/session?domain=${domain}`}
          className="flex items-center gap-1.5 rounded-lg bg-cinnamon-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cinnamon-600 transition-colors"
        >
          Praticar domínio
        </Link>
      </div>
    </div>
  );
}
