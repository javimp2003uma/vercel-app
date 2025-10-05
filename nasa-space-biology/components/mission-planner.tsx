"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Loader2, Rocket, Sparkles, User } from "lucide-react"

import { useAPI } from "@/APIContext"
import { Button } from "@/components/ui/button"

interface MissionTimelineEntry {
  phase?: string
  window?: string
  timeframe?: string
  duration?: string
  milestones?: string[]
  activities?: string[]
  notes?: string
}

interface MissionRecommendation {
  priority?: string
  title?: string
  headline?: string
  detail?: string
  details?: string
}

interface MissionObjective {
  title?: string
  name?: string
  focus?: string
  detail?: string
  description?: string
  domain?: string
  icon?: string
}

interface MissionResourceEntry {
  label: string
  status?: string
  value?: number | string
  unit?: string
  current?: number
  capacity?: number
}

interface MissionSummaryContent {
  title?: string
  tagline?: string
  overview?: string
  description?: string
  mission_name?: string
  launch_window?: string
  destination?: string
  crew_composition?: string
  highlight?: string
}

interface MissionPlan {
  mission_summary?: MissionSummaryContent | string
  objectives?: MissionObjective[]
  recommendations?: MissionRecommendation[]
  timeline?: MissionTimelineEntry[]
  resources?: Record<string, unknown> | MissionResourceEntry[]
  risk_level?: string
  visual_elements?: {
    diagram?: string
  }
  sources?: Array<{ label?: string; url?: string } | string>
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
}

const samplePlan: MissionPlan = {
  mission_summary: {
    title: "Lunar Immuno-Regeneration Campaign",
    tagline: "Rebooting immune resilience for long-duration crews",
    overview:
      "A 45-day lunar gateway mission focused on decoding immune dysregulation, skeletal remodeling, and habitat resilience under sustained microgravity.",
    launch_window: "Q2 2027",
    destination: "Lunar Gateway · Halo Orbit NRHO",
    crew_composition: "4 astronauts (2 biomedical specialists, 1 systems engineer, 1 pilot)",
    highlight: "Integrates in-flight omics labs with autonomous medical decision support to de-risk Mars-class missions.",
  },
  objectives: [
    {
      title: "Immune Reset",
      detail: "Track T-cell exhaustion markers during extended microgravity and validate countermeasures.",
      icon: "🧬",
    },
    {
      title: "Skeletal Shielding",
      detail: "Quantify bone turnover with mechanobiology payloads and on-demand pharmaceuticals.",
      icon: "🦴",
    },
    {
      title: "Neurovestibular Adaptation",
      detail: "Evaluate AI-assisted guidance for motion sickness mitigation during prolonged lunar operations.",
      icon: "🧠",
    },
  ],
  recommendations: [
    {
      priority: "high",
      headline: "Upgrade in-flight lab automation",
      detail: "Deploy modular centrifuge and microfluidics kit to support real-time immune assays.",
    },
    {
      priority: "medium",
      headline: "Stagger EVA windows",
      detail: "Offset circadian disruption by alternating EVA teams to minimize immune stress.",
    },
    {
      priority: "medium",
      headline: "Ground analog rehearsals",
      detail: "Run 14-day isolation rehearsal with full digital twin telemetry to validate decision support tooling.",
    },
  ],
  timeline: [
    {
      phase: "Pre-launch",
      window: "-12 to -3 months",
      milestones: ["Crew selection & immune baseline", "Habitat systems integration", "Analog rehearsals complete"],
    },
    {
      phase: "Transit",
      window: "Launch + 7 days",
      milestones: ["In-flight omics sampling", "Autonomous med-kit checkout", "Gateway docking"],
    },
    {
      phase: "Gateway Operations",
      window: "Days 8-38",
      milestones: ["Primary immune experiments", "Sequential EVA blocks", "Habitat stress tests"],
    },
    {
      phase: "Return & Recovery",
      window: "Days 39-45",
      milestones: ["Re-entry", "Immediate post-flight assays", "30-day follow-up protocols"],
    },
  ],
  resources: {
    crew_readiness: { status: "optimal", current: 4, capacity: 4 },
    power_margin: { status: "caution", value: "68%", unit: "reserve" },
    comm_latency: { status: "nominal", value: "1.5 sec" },
    mass_budget: { status: "tight", current: 12.4, capacity: 13.5, unit: "t" },
    habitat_bandwidth: { status: "optimal", value: "+20% surplus" },
  },
  risk_level: "medium",
  visual_elements: {
    diagram: "https://images-assets.nasa.gov/image/6900802/6900802~orig.jpg",
  },
  sources: [
    {
      label: "NASA OSDR - Immune Adaptation",
      url: "https://osdr.nasa.gov/bio/repo/data/experiment/OSD-456",
    },
    {
      label: "TRISH Long Duration Immune",
      url: "https://trishlabs.org",
    },
  ],
}

const suggestionPrompts = [
  "Plan a 30-day Mars analog to test immune countermeasures",
  "Design a mission to study bone density recovery on Gateway",
  "Outline a lunar surface campaign for radiation resilience",
  "Create a 14-day Artemis support mission focused on cardiovascular health",
]

const priorityColors: Record<string, string> = {
  high: "bg-rose-500/15 border-rose-400/40 text-rose-100",
  medium: "bg-amber-400/15 border-amber-400/40 text-amber-100",
  low: "bg-emerald-400/15 border-emerald-400/40 text-emerald-100",
}

const riskColors: Record<string, string> = {
  high: "bg-rose-500/20 text-rose-200 border border-rose-400/40",
  medium: "bg-amber-400/20 text-amber-100 border border-amber-400/40",
  low: "bg-emerald-500/20 text-emerald-100 border border-emerald-400/40",
}

function normaliseObjectives(value: MissionPlan["objectives"]): MissionObjective[] {
  if (!value) return []
  return value.map((entry) => ({
    title: entry.title ?? entry.name ?? entry.focus ?? "Mission Objective",
    detail: entry.detail ?? entry.description ?? entry.focus ?? "",
    icon: entry.icon,
  }))
}

function normaliseRecommendations(value: MissionPlan["recommendations"]): MissionRecommendation[] {
  if (!value) return []
  return value.map((entry) => ({
    priority: entry.priority?.toLowerCase() ?? "medium",
    title: entry.title,
    headline: entry.headline ?? entry.title,
    detail: entry.detail ?? entry.details ?? "",
  }))
}

function normaliseTimeline(value: MissionPlan["timeline"]): MissionTimelineEntry[] {
  if (!value) return []
  return value.map((entry) => ({
    phase: entry.phase,
    window: entry.window ?? entry.timeframe ?? entry.duration,
    milestones: entry.milestones ?? entry.activities ?? (entry.notes ? [entry.notes] : []),
  }))
}

function normaliseResources(value: MissionPlan["resources"]): MissionResourceEntry[] {
  if (!value) return []
  if (Array.isArray(value)) {
    return value.map((item) => ({
      label: item.label ?? "Resource",
      status: item.status,
      value: item.value ?? item.current,
      unit: item.unit,
      current: item.current,
      capacity: item.capacity,
    }))
  }

  return Object.entries(value).map(([key, entry]) => {
    if (entry && typeof entry === "object") {
      const typed = entry as Record<string, unknown>
      return {
        label: key.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase()),
        status: typeof typed.status === "string" ? typed.status : undefined,
        value:
          typeof typed.value === "string" || typeof typed.value === "number"
            ? typed.value
            : typeof typed.current === "number"
              ? typed.current
              : undefined,
        unit: typeof typed.unit === "string" ? typed.unit : undefined,
        current: typeof typed.current === "number" ? typed.current : undefined,
        capacity: typeof typed.capacity === "number" ? typed.capacity : undefined,
      }
    }

    return {
      label: key,
      value: entry as number | string,
    }
  })
}

function safeParsePlan(raw: unknown): MissionPlan | null {
  if (!raw) return null
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw) as MissionPlan
    } catch (error) {
      console.error("Failed to parse mission plan JSON", error)
      return null
    }
  }
  if (typeof raw === "object") {
    return raw as MissionPlan
  }
  return null
}

export function MissionPlanner() {
  const { chat } = useAPI()
  const [chatUuid, setChatUuid] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [plan, setPlan] = useState<MissionPlan | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const missionPanelRef = useRef<HTMLDivElement>(null)

  const ensureChat = useCallback(async () => {
    if (chatUuid) return chatUuid
    setIsInitializing(true)
    try {
      const response = await chat.create()
      const newUuid = response?.data?.chat_uuid
      if (!newUuid) {
        throw new Error("Unable to initialise mission planner session.")
      }
      setChatUuid(newUuid)
      setError(null)
      return newUuid
    } catch (err) {
      const message = err instanceof Error ? err.message : "Mission planner service is unavailable."
      setError(message)
      throw err
    } finally {
      setIsInitializing(false)
    }
  }, [chat, chatUuid])

  useEffect(() => {
    ensureChat().catch((err) => {
      console.error("Failed to initialise mission planner", err)
    })
  }, [])

  useEffect(() => {
    if (plan && missionPanelRef.current) {
      missionPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [plan])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!prompt.trim()) {
      setError("Describe what kind of mission you want to plan.")
      return
    }

    setError(null)
    setLoading(true)

    try {
      const activeChatUuid = await ensureChat()
      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: prompt.trim(),
      }
      setMessages((prev) => [...prev, userMessage])

      const response = await chat.planMission(activeChatUuid, {
        message: prompt.trim(),
        metodo: "local",
      })

      const rawPlan = (response?.data as { plan?: unknown; answer?: unknown })?.plan ?? response?.data
      const parsedPlan = safeParsePlan(rawPlan ?? (response?.data as { answer?: string })?.answer)

      if (!parsedPlan) {
        throw new Error("The mission planner could not interpret the response.")
      }

      setPlan(parsedPlan)
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: "Mission plan generated.",
        },
      ])
      setPrompt("")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Mission planner could not generate a response."
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const objectives = useMemo(() => normaliseObjectives(plan?.objectives), [plan?.objectives])
  const recommendations = useMemo(() => normaliseRecommendations(plan?.recommendations), [plan?.recommendations])
  const timeline = useMemo(() => normaliseTimeline(plan?.timeline), [plan?.timeline])
  const resources = useMemo(() => normaliseResources(plan?.resources), [plan?.resources])

  const missionSummary = plan?.mission_summary
  const summaryContent: MissionSummaryContent | null =
    missionSummary && typeof missionSummary === "string"
      ? { overview: missionSummary }
      : (missionSummary as MissionSummaryContent | null)

  const riskTone = plan?.risk_level ? riskColors[plan.risk_level.toLowerCase()] ?? riskColors.medium : null

  return (
    <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-4 pb-24 pt-28">
      <header className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1 font-mono text-xs uppercase tracking-[0.3em] text-purple-100">
          <Rocket className="h-3.5 w-3.5" /> Mission Planner
        </div>
        <h1 className="text-balance font-mono text-4xl font-bold text-white sm:text-5xl">
          Architect Missions with NASA Intelligence
        </h1>
        <p className="mx-auto mt-4 max-w-3xl text-balance text-base text-slate-200/80 sm:text-lg">
          Describe the science theme, destination, or duration you have in mind. Mission Planner synthesises NASA's space
          biology knowledge to deliver objectives, timelines, resources, and risks tailored to your concept.
        </p>
      </header>

      <section className="relative overflow-hidden rounded-3xl border border-slate-500/30 bg-slate-900/60 shadow-[0_0_40px_-20px_rgba(59,130,246,0.6)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-purple-500/10" />
        <div className="relative flex flex-col gap-6 p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-slate-100">
              <Sparkles className="h-5 w-5 text-sky-200" />
              <span className="font-mono text-sm uppercase tracking-[0.3em] text-slate-200/80">Mission Brief</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPlan(samplePlan)
                setError(null)
              }}
              className="inline-flex items-center gap-2 rounded-full border border-sky-400/40 bg-sky-500/10 px-4 py-2 text-xs font-medium text-sky-100 transition hover:border-sky-300/60 hover:bg-sky-500/20"
            >
              Load example mission
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="e.g. We need a 60-day Gateway mission to validate cardiovascular countermeasures before Mars"
              className="min-h-[140px] w-full rounded-2xl border border-slate-700/70 bg-slate-950/80 p-4 font-mono text-sm text-slate-100 outline-none transition focus:border-sky-400/60 focus:ring-2 focus:ring-sky-500/20"
            />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {suggestionPrompts.map((text) => (
                <button
                  key={text}
                  type="button"
                  onClick={() => setPrompt(text)}
                  className="rounded-xl border border-slate-600/40 bg-slate-900/70 px-4 py-3 text-left text-xs font-mono text-slate-200/80 transition hover:border-sky-400/40 hover:text-sky-100"
                >
                  {text}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-300/70">
                We call the `/astroplan` mission endpoint with your intent. Results compile objectives, risk posture, and
                recommended sequencing.
              </p>
              <Button
                type="submit"
                disabled={loading || isInitializing}
                className="inline-flex items-center gap-2 rounded-full border border-sky-400/60 bg-sky-500/20 px-6 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-300/80 hover:bg-sky-500/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Charting mission...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate mission plan
                  </>
                )}
              </Button>
            </div>
          </form>

          {error ? (
            <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}
        </div>
      </section>

      {plan ? (
        <section ref={missionPanelRef} className="space-y-12">
          {/* Mission summary */}
          <article className="relative overflow-hidden rounded-3xl border border-slate-600/40 bg-slate-950/60 shadow-[0_0_40px_-20px_rgba(56,189,248,0.5)]">
            {plan.visual_elements?.diagram ? (
              <div className="absolute inset-0 opacity-30">
                <Image
                  src={plan.visual_elements.diagram}
                  alt="Mission concept visual"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-950/90 to-slate-950/70" />
              </div>
            ) : null}

            <div className="relative grid gap-8 p-8 lg:grid-cols-[2fr,1fr]">
              <div className="space-y-4 text-slate-100">
                <h2 className="font-mono text-3xl font-semibold text-white sm:text-4xl">
                  {summaryContent?.title ?? "Mission Concept"}
                </h2>
                {summaryContent?.tagline ? (
                  <p className="text-base text-sky-200/90">{summaryContent.tagline}</p>
                ) : null}
                {summaryContent?.overview ? (
                  <p className="text-sm leading-relaxed text-slate-200/80">{summaryContent.overview}</p>
                ) : null}
                <dl className="grid gap-3 text-xs text-slate-200/70 sm:grid-cols-2">
                  {summaryContent?.launch_window ? (
                    <div className="flex justify-between rounded-xl border border-slate-600/40 bg-slate-900/70 p-3">
                      <dt className="font-mono uppercase tracking-[0.3em] text-slate-400">Launch window</dt>
                      <dd>{summaryContent.launch_window}</dd>
                    </div>
                  ) : null}
                  {summaryContent?.destination ? (
                    <div className="flex justify-between rounded-xl border border-slate-600/40 bg-slate-900/70 p-3">
                      <dt className="font-mono uppercase tracking-[0.3em] text-slate-400">Destination</dt>
                      <dd>{summaryContent.destination}</dd>
                    </div>
                  ) : null}
                  {summaryContent?.crew_composition ? (
                    <div className="flex justify-between rounded-xl border border-slate-600/40 bg-slate-900/70 p-3">
                      <dt className="font-mono uppercase tracking-[0.3em] text-slate-400">Crew</dt>
                      <dd>{summaryContent.crew_composition}</dd>
                    </div>
                  ) : null}
                  {summaryContent?.highlight ? (
                    <div className="rounded-xl border border-slate-600/40 bg-slate-900/70 p-3 text-left">
                      <dt className="font-mono uppercase tracking-[0.3em] text-slate-400">Highlight</dt>
                      <dd className="mt-1 text-slate-200/80">{summaryContent.highlight}</dd>
                    </div>
                  ) : null}
                </dl>
              </div>

              <div className="flex flex-col gap-4">
                {riskTone ? (
                  <div className={`rounded-2xl px-4 py-3 text-center font-mono text-sm uppercase tracking-[0.3em] ${riskTone}`}>
                    Risk posture · {plan.risk_level?.toUpperCase()}
                  </div>
                ) : null}

                <div className="rounded-2xl border border-slate-600/40 bg-slate-900/70 p-6 text-sm text-slate-200/80">
                  <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400">Conversation log</h3>
                  <div className="mt-3 space-y-3 text-left">
                    {messages.map((message) => (
                      <div key={message.id} className="flex items-start gap-2 text-xs text-slate-300/70">
                        <span className="font-semibold text-slate-200">
                          {message.role === "user" ? "You" : "Planner"}:
                        </span>
                        <span>{message.content}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* Objectives */}
          {objectives.length ? (
            <article className="space-y-6">
              <header className="flex flex-col gap-2 text-slate-100 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-mono text-2xl font-semibold text-white">Mission Objectives</h3>
                  <p className="text-sm text-slate-300/80">Priority focus areas and expected science return.</p>
                </div>
              </header>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {objectives.map((objective, idx) => (
                  <div
                    key={`${objective.title}-${idx}`}
                    className="rounded-2xl border border-slate-600/40 bg-slate-900/70 p-5 text-slate-200"
                  >
                    <div className="mb-3 flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-600/40 bg-slate-800/70 text-lg">
                        {objective.icon ?? "🛰️"}
                      </span>
                      <h4 className="font-mono text-base font-semibold text-white">{objective.title}</h4>
                    </div>
                    <p className="text-sm text-slate-300/80">{objective.detail}</p>
                  </div>
                ))}
              </div>
            </article>
          ) : null}

          {/* Recommendations */}
          {recommendations.length ? (
            <article className="space-y-6">
              <header className="flex flex-col gap-2 text-slate-100 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-mono text-2xl font-semibold text-white">Mission Recommendations</h3>
                  <p className="text-sm text-slate-300/80">Operational advisories and next best actions.</p>
                </div>
              </header>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {recommendations.map((rec, idx) => (
                  <div
                    key={`${rec.headline}-${idx}`}
                    className={`rounded-2xl border px-5 py-6 text-slate-200 ${
                      priorityColors[rec.priority ?? "medium"] ?? priorityColors.medium
                    }`}
                  >
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-100/80">
                      Priority · {rec.priority?.toUpperCase() ?? "MEDIUM"}
                    </p>
                    <h4 className="mt-2 font-mono text-base font-semibold text-white">{rec.headline}</h4>
                    <p className="mt-2 text-sm text-slate-100/80">{rec.detail}</p>
                  </div>
                ))}
              </div>
            </article>
          ) : null}

          {/* Timeline */}
          {timeline.length ? (
            <article className="space-y-6">
              <header className="flex flex-col gap-2 text-slate-100 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-mono text-2xl font-semibold text-white">Mission Timeline</h3>
                  <p className="text-sm text-slate-300/80">Sequencing from pre-launch through recovery.</p>
                </div>
              </header>

              <div className="relative space-y-8 border-l border-slate-600/30 pl-6">
                {timeline.map((entry, idx) => (
                  <div key={`${entry.phase}-${idx}`} className="relative">
                    <span className="absolute -left-3 top-1 block h-3 w-3 rounded-full border border-slate-400/60 bg-slate-900/80" />
                    <div className="rounded-2xl border border-slate-600/40 bg-slate-900/70 p-5 text-slate-200">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h4 className="font-mono text-base font-semibold text-white">{entry.phase ?? `Phase ${idx + 1}`}</h4>
                        {entry.window ? (
                          <span className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400">{entry.window}</span>
                        ) : null}
                      </div>
                      {entry.milestones?.length ? (
                        <ul className="mt-3 space-y-2 text-sm text-slate-300/80">
                          {entry.milestones.map((milestone, milestoneIndex) => (
                            <li key={`${milestone}-${milestoneIndex}`} className="flex items-start gap-2">
                              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
                              <span>{milestone}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ) : null}

          {/* Resources */}
          {resources.length ? (
            <article className="space-y-6">
              <header className="flex flex-col gap-2 text-slate-100 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="font-mono text-2xl font-semibold text-white">Mission Resources</h3>
                  <p className="text-sm text-slate-300/80">Readiness snapshot across logistics, crew, and systems.</p>
                </div>
              </header>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resources.map((resource, idx) => (
                  <div
                    key={`${resource.label}-${idx}`}
                    className="rounded-2xl border border-slate-600/40 bg-slate-900/70 p-5 text-slate-200"
                  >
                    <p className="font-mono text-xs uppercase tracking-[0.3em] text-slate-400">{resource.label}</p>
                    <div className="mt-2 text-xl font-semibold text-white">
                      {resource.current !== undefined && resource.capacity !== undefined ? (
                        <span>
                          {resource.current}
                          {resource.unit ? ` ${resource.unit}` : ""}
                          <span className="text-slate-400/80"> / {resource.capacity}</span>
                        </span>
                      ) : resource.value !== undefined ? (
                        <span>
                          {resource.value}
                          {resource.unit ? ` ${resource.unit}` : ""}
                        </span>
                      ) : (
                        <span className="text-slate-400">–</span>
                      )}
                    </div>
                    {resource.status ? (
                      <p className="mt-2 text-sm text-slate-300/80">Status: {resource.status}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            </article>
          ) : null}

          {/* Sources */}
          {plan.sources?.length ? (
            <article className="space-y-4">
              <h3 className="font-mono text-2xl font-semibold text-white">Source Material</h3>
              <div className="flex flex-wrap gap-3">
                {plan.sources.map((source, idx) => {
                  if (typeof source === "string") {
                    return (
                      <span
                        key={`${source}-${idx}`}
                        className="rounded-full border border-slate-600/40 bg-slate-900/70 px-4 py-2 text-xs font-mono text-slate-200/80"
                      >
                        {source}
                      </span>
                    )
                  }

                  return source?.url ? (
                    <Link
                      key={`${source.url}-${idx}`}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-sky-400/50 bg-sky-500/10 px-4 py-2 text-xs font-mono text-sky-100 transition hover:border-sky-300/70 hover:bg-sky-500/20"
                    >
                      {source.label ?? source.url}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ) : (
                    <span
                      key={`source-${idx}`}
                      className="rounded-full border border-slate-600/40 bg-slate-900/70 px-4 py-2 text-xs font-mono text-slate-200/80"
                    >
                      {source?.label ?? "Reference"}
                    </span>
                  )
                })}
              </div>
            </article>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
