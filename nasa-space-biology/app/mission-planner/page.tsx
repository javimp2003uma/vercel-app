import { MissionPlanner } from "@/components/mission-planner"
import { SpaceBackground } from "@/components/space-background"

export default function MissionPlannerPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#0b1648] via-[#140b2e] to-[#040213]">
      <SpaceBackground />
      <div className="pointer-events-none absolute inset-0 -z-20 mix-blend-screen [background-image:radial-gradient(circle_at_18%_20%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(circle_at_82%_16%,rgba(236,72,153,0.32),transparent_58%),radial-gradient(circle_at_48%_80%,rgba(56,189,248,0.3),transparent_62%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-1/2 bg-gradient-to-b from-sky-400/30 via-transparent to-transparent blur-3xl" />

      <MissionPlanner />
    </main>
  )
}
