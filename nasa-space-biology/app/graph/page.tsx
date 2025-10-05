import { Graph3D } from "@/components/graph-3d"
import { SpaceBackground } from "@/components/space-background"
import { graphData } from "@/lib/graph-data"

export default function GraphPage() {
  const nodeCount = graphData.nodes.length
  const edgeCount = graphData.edges.length
  const communityCount = new Set(graphData.nodes.map((node) => node.community ?? -1)).size

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0b1648] via-[#140b2e] to-[#040213]">
      <SpaceBackground />
      <div className="pointer-events-none absolute inset-0 -z-20 mix-blend-screen [background-image:radial-gradient(circle_at_12%_18%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(circle_at_78%_12%,rgba(236,72,153,0.32),transparent_58%),radial-gradient(circle_at_52%_82%,rgba(56,189,248,0.3),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60 [background-image:radial-gradient(#f8fafc_1px,transparent_1px),radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:140px_140px,90px_90px] [background-position:10px_20px,60px_80px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-sky-400/30 via-transparent to-transparent blur-3xl" />

      <section className="relative z-10 py-24">
        <div className="container mx-auto flex flex-col gap-12 px-4">
          <header className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-400/30 bg-purple-500/10 px-4 py-1 font-mono text-xs uppercase tracking-[0.3em] text-purple-100">
              <span aria-hidden>🛰️</span> Knowledge Graph
            </div>
            <h1 className="text-balance font-mono text-4xl font-bold text-white sm:text-5xl">
              Navigate NASA's Space Biology Universe
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-balance text-sm text-slate-200/80 sm:text-base">
              Explore the communities powering the mission. Each planetary cluster groups related experiments, assays, and
              publications so you can spot the orbits where investment accelerates discovery.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-slate-600/40 bg-slate-900/70 p-6 text-center text-slate-200 shadow-[0_0_30px_-15px_rgba(56,189,248,0.5)]">
              <p className="font-mono text-4xl font-bold text-sky-300">{nodeCount}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400">Nodes</p>
              <p className="mt-2 text-sm text-slate-300/80">Unique experiments, assays, and publications.</p>
            </div>
            <div className="rounded-3xl border border-slate-600/40 bg-slate-900/70 p-6 text-center text-slate-200 shadow-[0_0_30px_-15px_rgba(236,72,153,0.45)]">
              <p className="font-mono text-4xl font-bold text-pink-300">{edgeCount}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400">Connections</p>
              <p className="mt-2 text-sm text-slate-300/80">Knowledge links mapped across the repository.</p>
            </div>
            <div className="rounded-3xl border border-slate-600/40 bg-slate-900/70 p-6 text-center text-slate-200 shadow-[0_0_30px_-15px_rgba(168,85,247,0.5)]">
              <p className="font-mono text-4xl font-bold text-purple-300">{communityCount}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.3em] text-slate-400">Communities</p>
              <p className="mt-2 text-sm text-slate-300/80">Coordinated clusters of mission activity.</p>
            </div>
          </div>

          <Graph3D graph={graphData} />
        </div>
      </section>
    </main>
  )
}
