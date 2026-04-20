"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { BookOpen, Heart, Scissors, Baby, Brain, Globe, Users, ArrowRight, FlaskConical, Library } from "lucide-react";
const DOMAINS = [
  {
    key: "adult_medicine",
    label: "Adult Medicine",
    subtitle: "Cardiologia, Infectologia, Pneumologia +7",
    icon: Heart,
    available: true,
    accent: "bg-gradient-to-br from-rose-50 to-cinnamon-50 border-rose-200",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    badge: "3 guias disponíveis",
    badgeStyle: "bg-white text-cinnamon-600 border border-cinnamon-200",
  },
  {
    key: "adult_surgery",
    label: "Adult Surgery",
    subtitle: "Cirurgia geral, Trauma, Ortopedia",
    icon: Scissors,
    available: false,
    accent: "bg-gradient-to-br from-blue-50 to-slate-50 border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badge: "Em breve",
    badgeStyle: "bg-neutral-100 text-neutral-400 border border-neutral-200",
  },
  {
    key: "womens_health",
    label: "Women's Health",
    subtitle: "Ginecologia, Obstetrícia, Mama",
    icon: Users,
    available: false,
    accent: "bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    badge: "Em breve",
    badgeStyle: "bg-neutral-100 text-neutral-400 border border-neutral-200",
  },
  {
    key: "child_health",
    label: "Child Health",
    subtitle: "Pediatria geral, Neonatologia, Desenvolvimento",
    icon: Baby,
    available: false,
    accent: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    badge: "Em breve",
    badgeStyle: "bg-neutral-100 text-neutral-400 border border-neutral-200",
  },
  {
    key: "mental_health",
    label: "Mental Health",
    subtitle: "Psiquiatria, Transtornos de humor, Dependências",
    icon: Brain,
    available: false,
    accent: "bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    badge: "Em breve",
    badgeStyle: "bg-neutral-100 text-neutral-400 border border-neutral-200",
  },
  {
    key: "population_health",
    label: "Population Health",
    subtitle: "Epidemiologia, Saúde pública, Bioética",
    icon: Globe,
    available: false,
    accent: "bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    badge: "Em breve",
    badgeStyle: "bg-neutral-100 text-neutral-400 border border-neutral-200",
  },
];

const GUIDE_TABS = [
  { label: "Panorama do Domínio", desc: "Sistemas mais cobrados e tipos de raciocínio" },
  { label: "High-Yield Topics", desc: "Top 10 tópicos com conceitos-chave e questões" },
  { label: "Guia Estratégico", desc: "Mapa mental, armadilhas e plano de estudo" },
];

export default function StudyLibraryPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    import("animejs").then((mod) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const anime = ((mod as any).default ?? mod) as any;

      // Hero entrance
      if (heroRef.current) {
        anime({
          targets: heroRef.current.querySelectorAll(".hero-item"),
          opacity: [0, 1],
          translateY: [20, 0],
          delay: anime.stagger(80),
          duration: 500,
          easing: "easeOutCubic",
        });
      }

      // Cards staggered entrance
      if (gridRef.current) {
        anime({
          targets: gridRef.current.querySelectorAll(".domain-card"),
          opacity: [0, 1],
          translateY: [24, 0],
          scale: [0.97, 1],
          delay: anime.stagger(60, { start: 200 }),
          duration: 450,
          easing: "easeOutCubic",
        });
      }
    });
  }, []);

  return (
    <div className="min-h-full bg-neutral-50">
      {/* Hero */}
      <div ref={heroRef} className="border-b border-neutral-200 bg-white px-6 py-10">
        <div className="max-w-3xl">
          <div className="hero-item flex items-center gap-2 mb-3" style={{ opacity: 0 }}>
            <FlaskConical className="h-4 w-4 text-cinnamon-500" />
            <span className="text-xs font-semibold uppercase tracking-widest text-cinnamon-500">
              miniMENTE Intelligence Layer
            </span>
          </div>
          <h1 className="hero-item text-3xl font-display font-bold text-neutral-900 leading-tight" style={{ opacity: 0 }}>
            Dissecando AMC
          </h1>
          <p className="hero-item mt-2 text-neutral-500 text-sm leading-relaxed max-w-xl" style={{ opacity: 0 }}>
            Guias estratégicos gerados por IA a partir das questões do banco — panoramas,
            tópicos high-yield e mapas mentais por domínio.
          </p>
          <div className="hero-item mt-6 flex flex-wrap gap-2" style={{ opacity: 0 }}>
            {GUIDE_TABS.map((tab) => (
              <div
                key={tab.label}
                className="flex items-center gap-1.5 rounded-full bg-neutral-100 border border-neutral-200 px-3 py-1"
              >
                <BookOpen className="h-3 w-3 text-neutral-400" />
                <span className="text-xs text-neutral-600 font-medium">{tab.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Domain grid */}
      <div className="p-6">
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl">
          {DOMAINS.map((domain) => {
            const Icon = domain.icon;
            const card = (
              <div
                className={`
                  domain-card group relative rounded-2xl border p-5 transition-all
                  ${domain.accent}
                  ${domain.available
                    ? "cursor-pointer hover:shadow-md hover:-translate-y-0.5"
                    : "opacity-55 cursor-default"
                  }
                `}
                style={{ opacity: 0 }}
              >
                <div className={`w-10 h-10 rounded-xl ${domain.iconBg} flex items-center justify-center mb-4`}>
                  <Icon className={`h-5 w-5 ${domain.iconColor}`} />
                </div>
                <h2 className="text-sm font-bold text-neutral-800 leading-tight">{domain.label}</h2>
                <p className="mt-1 text-xs text-neutral-500 leading-relaxed">{domain.subtitle}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${domain.badgeStyle}`}>
                    {domain.badge}
                  </span>
                  {domain.available && (
                    <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-cinnamon-500 group-hover:translate-x-0.5 transition-all" />
                  )}
                </div>
              </div>
            );

            return domain.available ? (
              <Link key={domain.key} href={`/study-library/${domain.key}`}>
                {card}
              </Link>
            ) : (
              <div key={domain.key}>{card}</div>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="mt-8 flex items-center gap-2 text-xs text-neutral-400 max-w-5xl">
          <Library className="h-3.5 w-3.5" />
          <span>Mais domínios serão adicionados conforme o banco de questões cresce.</span>
        </div>
      </div>
    </div>
  );
}
