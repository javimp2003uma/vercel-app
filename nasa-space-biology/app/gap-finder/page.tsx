import { GapFinder } from "@/components/gap-finder"
import { SpaceBackground } from "@/components/space-background"

export default function GapFinderPage() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <SpaceBackground />
      <GapFinder />
    </main>
  )
}
