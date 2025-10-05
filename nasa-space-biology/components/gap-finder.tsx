"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, BarChart3, DownloadCloud, Loader2, Rocket, Sparkles, Telescope } from "lucide-react"

import { cn } from "@/lib/utils"
import { useAPI } from "@/APIContext"

type GapReasonDetail = {
  type: string
  value?: number
  text: string
  evidence?: Record<string, unknown>
}

type GapHighlight = {
  organism: string
  tissue: string | null
  condition: string
  assay_type: string
  score: number
  reason?: string
  reasons_detail: GapReasonDetail[]
}

type GapMinimal = {
  organism: string
  tissue: string | null
  condition: string
  assay_type: string
}

type GapSearchResponse = {
  applied_url: string
  highlights: GapHighlight[]
  gaps_total: number
  gaps: GapMinimal[]
}

type GapOptions = {
  organisms: string[]
  assays: string[]
  conditions: string[]
  tissues: string[]
}

const sampleResponse: GapSearchResponse = {
  applied_url:
    "https://visualization.osdr.nasa.gov/biodata/api/v2/query/assays/?format=json.records&study.characteristics.organism=Mus+musculus%7CHomo+sapiens&investigation.study+assays.study+assay+technology+type=RNA+Sequencing+%28RNA-Seq%29%7CProteomics&%3Dstudy.factor+value.spaceflight=",
  highlights: [
    {
      organism: "Mus musculus",
      tissue: "Left Kidney",
      condition: "Spaceflight",
      assay_type: "Proteomics",
      score: 3.92,
      reasons_detail: [
        {
          type: "GroundBase",
          value: 1,
          text: "Robust ground evidence: 5 Ground/Analog datasets already cover Mus musculus / Left Kidney.",
          evidence: {
            ds_ground: 5,
            ground_examples: [
              "https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-102/?format=html",
              "https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-163/?format=html",
              "https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-462/?format=html",
            ],
          },
        },
        {
          type: "MultiOmics",
          value: 1,
          text: "Completes multi-omics stack: RNA Sequencing (RNA-Seq) present; Proteomics missing.",
          evidence: {
            present_layers: ["RNA Sequencing (RNA-Seq)"],
            missing_layer: "Proteomics",
          },
        },
        {
          type: "NeighborDensity",
          value: 1,
          text: "High nearby activity detected for Left Kidney / Spaceflight.",
        },
      ],
    },
    {
      organism: "Homo sapiens",
      tissue: "Whole Blood",
      condition: "Spaceflight",
      assay_type: "Proteomics",
      score: 3.45,
      reasons_detail: [
        {
          type: "MultiOmics",
          value: 1,
          text: "Completes multi-omics stack: RNA Sequencing (RNA-Seq) present; Proteomics missing.",
          evidence: {
            present_layers: ["RNA Sequencing (RNA-Seq)"],
            missing_layer: "Proteomics",
          },
        },
        {
          type: "PhaseCritical",
          value: 1,
          text: "Phase-critical gap: In-flight data missing relative to Pre/Post phases.",
          evidence: {
            present_phases: ["Ground/Analog", "Pre-flight", "Post-flight", "Spaceflight"],
          },
        },
      ],
    },
    {
      organism: "Mus musculus",
      tissue: "Right Retina",
      condition: "Spaceflight",
      assay_type: "Proteomics",
      score: 3.45,
      reasons_detail: [
        {
          type: "GroundBase",
          value: 1,
          text: "Robust ground evidence: 3 Ground/Analog datasets already cover Mus musculus / Right Retina.",
          evidence: {
            ds_ground: 3,
            ground_examples: [
              "https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-397/?format=html",
              "https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-255/?format=html",
              "https://visualization.osdr.nasa.gov/biodata/api/v2/dataset/OSD-194/?format=html",
            ],
          },
        },
        {
          type: "MultiOmics",
          value: 1,
          text: "Completes multi-omics stack: RNA Sequencing (RNA-Seq) present; Proteomics missing.",
          evidence: {
            present_layers: ["RNA Sequencing (RNA-Seq)"],
            missing_layer: "Proteomics",
          },
        },
      ],
    },
  ],
  gaps_total: 361,
  gaps: [
    {
      organism: "Homo sapiens",
      tissue: "Adrenal Gland",
      condition: "Ground/Analog",
      assay_type: "Proteomics",
    },
    {
      organism: "Homo sapiens",
      tissue: "Adrenal Gland",
      condition: "Spaceflight",
      assay_type: "Proteomics",
    },
    {
      organism: "Mus musculus",
      tissue: "Adrenal Gland",
      condition: "Spaceflight",
      assay_type: "Proteomics",
    },
  ],
}

const reasonTone: Record<string, string> = {
  GroundBase: "from-amber-500/20",
  MultiOmics: "from-violet-500/20",
  PhaseCritical: "from-rose-500/20",
  SpeciesTranslation: "from-emerald-500/20",
  NeighborDensity: "from-sky-500/20",
  Feasibility: "from-cyan-500/20",
}

const escapeCsvValue = (value: string | null): string => {
  const raw = value ?? ""
  if (raw.includes(",") || raw.includes("\"") || raw.includes("\n")) {
    return `"${raw.replace(/"/g, '""')}"`
  }
  return raw
}

export function GapFinder() {
  const { gaps } = useAPI()
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [results, setResults] = useState<GapSearchResponse | null>(null)
  const [isSample, setIsSample] = useState(false)
  const [options, setOptions] = useState<GapOptions | null>(null)
  const [optionsError, setOptionsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    gaps
      .getOptions<GapOptions>()
      .then((response) => {
        if (!cancelled && response?.data) {
          setOptions(response.data)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setOptionsError(err instanceof Error ? err.message : "Unable to load filter options.")
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!prompt.trim()) {
      setError("Describe the kind of opportunity you want to explore before launching the search.")
      setResults(null)
      setIsSample(false)
      return
    }

    setError(null)
    setLoading(true)
    setIsSample(false)

    try {
      const response = await gaps.search<GapSearchResponse>(prompt.trim())
      if (!response) {
        setError("No response from the Gap Finder service.")
        setResults(null)
        return
      }

      const data = response.data ?? null
      if (!data || !Array.isArray(data.highlights)) {
        setError("No opportunities were found for that briefing.")
        setResults(null)
        return
      }

      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "We could not map the gaps right now.")
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const handleUseSample = () => {
    setPrompt("Show me proteomics gaps where spaceflight is underserved but ground data exists")
    setError(null)
  }

  const handleDownloadReport = useCallback(() => {
    if (!results?.gaps?.length) return

    const header = ["Organism", "Tissue", "Condition", "Assay Type"].join(",")
    const rows = results.gaps.map((gap) =>
      [gap.organism, gap.tissue, gap.condition, gap.assay_type].map((field) => escapeCsvValue(field)).join(","),
    )
    const csvContent = [header, ...rows].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "gap-finder-report.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [results])

  const topScore = useMemo(() => {
    if (!results?.highlights?.length) return null
    return results.highlights.reduce((max, item) => (item.score > max ? item.score : max), results.highlights[0].score)
  }, [results])

  const gapSegments = useMemo(() => {
    if (!results?.gaps?.length) return []
    return results.gaps.slice(0, 12)
  }, [results])

  const uniqueInvestableTargets = useMemo(() => {
    if (!results?.highlights) return 0
    const keySet = new Set(results.highlights.map((h) => `${h.organism}|${h.tissue}|${h.assay_type}`))
    return keySet.size
  }, [results])

  const hasGaps = Boolean(results?.gaps?.length)

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-4 pb-24 pt-28">
      <header className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1 font-mono text-xs uppercase tracking-[0.3em] text-purple-100">
          <Rocket className="h-3.5 w-3.5" /> Gap Finder
        </div>
        <h1 className="text-balance font-mono text-4xl font-bold text-white sm:text-5xl">
          Identify Strategic Gaps in Space Biology
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-balance text-base text-slate-200/80 sm:text-lg">
          Describe the asset you want to back and we will surface the gaps with the highest potential impact. We combine
          coverage, ground evidence strength, and omics layers to highlight missions that are ready for lift-off.
        </p>
      </header>

      <section className="relative overflow-hidden rounded-3xl border border-slate-500/30 bg-slate-900/60 shadow-[0_0_40px_-20px_rgba(168,85,247,0.6)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-sky-500/10" />
        <div className="relative flex flex-col gap-6 p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-slate-100">
              <Telescope className="h-5 w-5 text-purple-200" />
              <span className="font-mono text-sm uppercase tracking-[0.3em] text-slate-200/80">Briefing</span>
            </div>
            <button
              type="button"
              onClick={handleUseSample}
              className="inline-flex items-center gap-2 rounded-full border border-purple-400/40 bg-purple-500/10 px-4 py-2 text-xs font-medium text-purple-100 transition hover:border-purple-300/60 hover:bg-purple-500/20"
            >
              Load example
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="e.g. Gaps for multi-omics packages in human cardio tissues with strong ground analogs"
              className="min-h-[140px] w-full rounded-2xl border border-slate-700/70 bg-slate-950/80 p-4 font-mono text-sm text-slate-100 outline-none transition focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/20"
            />

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2 text-xs text-slate-300/70">
                {options?.conditions?.slice(0, 3).map((cond) => (
                  <span
                    key={cond}
                    className="inline-flex items-center rounded-full border border-slate-600/50 bg-slate-900/80 px-3 py-1 font-medium text-slate-200/90"
                  >
                    {cond}
                  </span>
                ))}
                {optionsError ? <span className="text-rose-300/80">{optionsError}</span> : null}
              </div>
              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-full border px-6 py-2 text-sm font-semibold transition",
                  loading
                    ? "border-slate-700/80 bg-slate-900/60 text-slate-400"
                    : "border-purple-400/60 bg-purple-500/20 text-purple-100 hover:border-purple-300/80 hover:bg-purple-500/30",
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing gaps...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Find opportunities
                  </>
                )}
              </button>
            </div>
          </form>

          {error ? (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-200/90">
              {error}
            </div>
          ) : null}
        </div>
      </section>

      {results ? (
        <div className="space-y-12">
          <section className="grid gap-6 rounded-3xl border border-slate-600/40 bg-slate-950/60 p-8 text-slate-100 backdrop-blur sm:grid-cols-3">
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-slate-400">High Score</span>
              <div className="flex items-baseline gap-2">
                <BarChart3 className="h-6 w-6 text-purple-300" />
                <span className="text-3xl font-bold text-white">{topScore?.toFixed(2) ?? "—"}</span>
              </div>
              <p className="text-sm text-slate-300/80">
                Priority score calculated from NASA coverage signals.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-slate-400">Highlights</span>
              <div className="flex items-baseline gap-2">
                <Sparkles className="h-6 w-6 text-purple-300" />
                <span className="text-3xl font-bold text-white">{results.highlights.length}</span>
              </div>
              <p className="text-sm text-slate-300/80">
                Opportunities ranked by score, {isSample ? "using the example payload" : "calculated live"}.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-xs font-mono uppercase tracking-[0.3em] text-slate-400">Universe</span>
              <div className="flex items-baseline gap-2">
                <Rocket className="h-6 w-6 text-purple-300" />
                <span className="text-3xl font-bold text-white">{results.gaps_total}</span>
              </div>
              <p className="text-sm text-slate-300/80">
                Total combinations <span className="font-semibold text-slate-200">without coverage</span> in the current scope.
              </p>
            </div>
          </section>

          <section className="space-y-8">
            <header className="flex flex-col gap-2 text-slate-100 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-mono text-2xl font-semibold text-white">Suggested portfolio</h2>
                <p className="text-sm text-slate-300/80">
                  {uniqueInvestableTargets} unique configurations · {isSample ? "Example data" : "Service data"}
                </p>
              </div>
              <Link
                href={results.applied_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-slate-500/60 bg-slate-900/70 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-slate-400/70 hover:text-white"
              >
                View OSDR query
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </header>

            <div className="grid gap-6 md:grid-cols-2">
              {results.highlights.map((highlight) => (
                <article
                  key={`${highlight.organism}-${highlight.tissue}-${highlight.assay_type}-${highlight.condition}`}
                  className="group relative overflow-hidden rounded-3xl border border-slate-700/60 bg-slate-900/70 p-6 transition duration-300 hover:border-purple-400/60 hover:bg-slate-900/90"
                >
                  <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100 [background:radial-gradient(circle_at_top,rgba(192,132,252,0.12),transparent_60%)]" />
                  <div className="relative z-10 flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-300/80">Opportunity</p>
                        <h3 className="text-balance font-mono text-xl font-semibold text-white">
                          {highlight.organism} · {highlight.tissue ?? "No tissue declared"}
                        </h3>
                        <p className="text-sm text-slate-300/80">{highlight.condition} · {highlight.assay_type}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-mono uppercase tracking-[0.3em] text-purple-200">Score</span>
                        <span className="text-3xl font-bold text-purple-100">{highlight.score.toFixed(2)}</span>
                      </div>
                    </div>

                    {highlight.reasons_detail.length ? (
                      <div className="flex flex-wrap gap-3">
                        {highlight.reasons_detail.map((detail) => (
                          <span
                            key={`${detail.type}-${detail.text}`}
                            className={cn(
                              "inline-flex items-center rounded-full border border-slate-600/60 bg-gradient-to-r px-3 py-1 text-[11px] font-medium text-slate-100",
                              reasonTone[detail.type] ?? "from-slate-500/30",
                            )}
                          >
                            {detail.type}
                            {typeof detail.value === "number" ? ` · ${detail.value.toFixed(2)}` : ""}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {highlight.reasons_detail.length ? (
                      <ul className="space-y-2 text-xs text-slate-300/80">
                        {highlight.reasons_detail.map((detail) => (
                          <li key={detail.text} className="flex items-start gap-2">
                            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-200" />
                            <span>{detail.text}</span>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="space-y-6 rounded-3xl border border-slate-600/30 bg-slate-950/60 p-8 text-slate-200">
            <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-mono text-xl font-semibold text-white">Gap map</h3>
                <p className="text-sm text-slate-300/80">
                  First {gapSegments.length} uncovered combinations in view.
                </p>
              </div>
              <div className="flex flex-col gap-2 text-sm text-slate-300/80 sm:items-end">
                <span className="text-xs font-mono uppercase tracking-[0.3em] text-slate-400">
                  {results.gaps_total} gaps detected
                </span>
                <button
                  type="button"
                  onClick={handleDownloadReport}
                  className="inline-flex items-center gap-2 rounded-full border border-purple-400/50 bg-purple-500/10 px-4 py-2 text-xs font-semibold text-purple-100 transition hover:border-purple-300/70 hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:border-slate-700/60 disabled:bg-slate-900/60 disabled:text-slate-400"
                  disabled={!hasGaps}
                >
                  <DownloadCloud className="h-4 w-4" />
                  Download full report
                </button>
              </div>
            </header>

            {gapSegments.length ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {gapSegments.map((gap) => (
                  <div
                    key={`${gap.organism}-${gap.tissue}-${gap.condition}-${gap.assay_type}`}
                    className="rounded-2xl border border-slate-700/50 bg-slate-900/70 p-4 text-sm text-slate-200/90"
                  >
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400">Gap</p>
                    <p className="mt-1 font-semibold text-white">{gap.organism}</p>
                    <p className="text-slate-300/80">{gap.tissue ?? "Tissue not specified"}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-slate-100">
                      <span className="inline-flex items-center rounded-full border border-purple-400/40 bg-purple-500/10 px-3 py-1">
                        {gap.condition}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-slate-500/60 bg-slate-800/70 px-3 py-1">
                        {gap.assay_type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-300/70">All covered! No gaps detected in the current scope.</p>
            )}
          </section>
        </div>
      ) : (
        <section className="rounded-3xl border border-slate-600/40 bg-slate-900/70 p-10 text-center text-slate-300/80">
          <p className="mx-auto max-w-2xl text-balance">
            Share a briefing and Gap Finder will estimate where investment could unlock new data layers. Use the example
            button to preview a report without waiting for the API.
          </p>
        </section>
      )}
    </div>
  )
}
