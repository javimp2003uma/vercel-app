import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"

import { SpaceBackground } from "@/components/space-background"

const highlightSections = [
  {
    title: "Immersive Landing",
    description:
      "Set the tone for space biology exploration with a mission-ready hero, key stats, and quick access to the platform's core tools.",
    image: "/landing_page.png",
    alt: "Landing page overview of Stellar Mind AI with cosmic background",
  },
  {
    title: "Knowledge Chatbot",
    description:
      "Ask anything across 608 NASA papers. The assistant distills complex findings into natural language answers backed by curated sources.",
    image: "/chatbot.png",
    alt: "Screenshot of the Stellar Mind chatbot interface highlighting AI conversation",
  },
  {
    title: "3D Knowledge Graph",
    description:
      "Navigate interconnected missions in real time. Communities light up with planetary avatars, revealing where research converges.",
    image: "/graph.png",
    alt: "3D knowledge graph visualization with planetary nodes",
  },
  {
    title: "Assay Finder",
    description:
      "Describe your experiment and instantly surface matching assays grouped by technology, with direct links to NASA datasets.",
    image: "/assay_finder.png",
    alt: "Assay Finder interface showing prompt area and results card",
  },
  {
    title: "Gap Finder",
    description:
      "Prioritize underfunded opportunities. Investors see the evidence, scoring signals, and recommended next missions at a glance.",
    image: "/gap_finder.png",
    alt: "Gap Finder dashboard showing prompt and highlighted opportunities",
  },
]

export default function SummaryPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0b1648] via-[#140b2e] to-[#040213]">
      <SpaceBackground />
      <div className="pointer-events-none absolute inset-0 -z-20 mix-blend-screen [background-image:radial-gradient(circle_at_20%_18%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(circle_at_80%_14%,rgba(236,72,153,0.32),transparent_58%),radial-gradient(circle_at_50%_85%,rgba(56,189,248,0.3),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-sky-400/30 via-transparent to-transparent blur-3xl" />

      <section className="relative z-10 px-4 py-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-500/10 px-4 py-1 font-mono text-xs uppercase tracking-[0.3em] text-sky-100">
            <Sparkles className="h-3.5 w-3.5" aria-hidden /> Executive Overview
          </div>
          <h1 className="text-balance font-mono text-4xl font-bold text-white sm:text-5xl">
            Stellar Mind AI in One Orbit
          </h1>
          <p className="max-w-3xl text-balance text-sm text-slate-200/85 sm:text-base">
            NASA's space biology knowledge graph, conversational assistant, and investor tooling in a single glance. Each
            capture below highlights what the jury can expect to experience in seconds.
          </p>

          <div className="grid w-full gap-4 sm:grid-cols-3">
            {[
              { label: "NASA Papers", value: "608" },
              { label: "Interactive Tools", value: "5" },
              { label: "Realtime Insights", value: "Investors & Researchers" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-3xl border border-slate-600/40 bg-slate-900/70 p-5 text-slate-200 shadow-[0_0_30px_-15px_rgba(56,189,248,0.45)]"
              >
                <p className="font-mono text-3xl font-bold text-sky-200 sm:text-4xl">{stat.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 pb-24">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-4">
          {highlightSections.map((section, index) => (
            <article
              key={section.title}
              className="overflow-hidden rounded-3xl border border-slate-600/40 bg-slate-950/60 shadow-[0_0_40px_-20px_rgba(168,85,247,0.5)] backdrop-blur"
            >
              <div
                className={`flex flex-col gap-8 p-6 sm:p-10 ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } lg:items-center lg:gap-12`}
              >
                <div className="relative w-full overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-900/60">
                  <Image
                    src={section.image}
                    alt={section.alt}
                    width={1280}
                    height={720}
                    className="h-auto w-full object-cover"
                    priority={index === 0}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/30 via-transparent to-transparent" />
                </div>

                <div className="flex w-full flex-col gap-4 text-left">
                  <h2 className="font-mono text-2xl font-semibold text-white sm:text-3xl">{section.title}</h2>
                  <p className="text-sm leading-relaxed text-slate-200/80 sm:text-base">{section.description}</p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-300/70">
                    {index === 1 ? (
                      <span className="rounded-full border border-slate-600/40 bg-slate-900/70 px-3 py-1 font-mono">
                        Retrieval-Augmented Answers
                      </span>
                    ) : null}
                    {index === 2 ? (
                      <span className="rounded-full border border-slate-600/40 bg-slate-900/70 px-3 py-1 font-mono">
                        Planetary Communities
                      </span>
                    ) : null}
                    {index === 3 ? (
                      <span className="rounded-full border border-slate-600/40 bg-slate-900/70 px-3 py-1 font-mono">
                        NASA Dataset Links
                      </span>
                    ) : null}
                    {index === 4 ? (
                      <span className="rounded-full border border-slate-600/40 bg-slate-900/70 px-3 py-1 font-mono">
                        Investor-Ready Scores
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative z-10 px-4 pb-24">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 rounded-3xl border border-slate-600/40 bg-slate-900/70 p-10 text-center text-slate-200 shadow-[0_0_40px_-20px_rgba(56,189,248,0.55)] backdrop-blur">
          <h2 className="font-mono text-3xl font-semibold text-white sm:text-4xl">Ready for Lift-off</h2>
          <p className="text-sm text-slate-200/80 sm:text-base">
            Stellar Mind AI is production-ready today: investors, scientists, and mission architects already have
            dedicated entry points. Dive into any module to see live data, responsive tooling, and the open-science ethos
            NASA champions.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/assay-finder"
              className="inline-flex items-center gap-2 rounded-full border border-sky-400/60 bg-sky-500/20 px-5 py-2 font-mono text-sm uppercase tracking-[0.3em] text-sky-100 transition hover:border-sky-300/80 hover:bg-sky-500/30"
            >
              Explore Assay Finder
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/gap-finder"
              className="inline-flex items-center gap-2 rounded-full border border-purple-400/60 bg-purple-500/20 px-5 py-2 font-mono text-sm uppercase tracking-[0.3em] text-purple-100 transition hover:border-purple-300/80 hover:bg-purple-500/30"
            >
              Prioritize Gaps
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-full border border-slate-500/60 bg-slate-800/60 px-5 py-2 font-mono text-sm uppercase tracking-[0.3em] text-slate-100 transition hover:border-slate-300/80 hover:bg-slate-800/80"
            >
              Ask the Chatbot
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
