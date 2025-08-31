import { HeroSection } from '@/components/sections/HeroSection'
import { ProblemSolutionSection } from '@/components/sections/ProblemSolutionSection'
import { NetworkVisualizationSection } from '@/components/sections/NetworkVisualizationSection'
import { UseCasesSection } from '@/components/sections/UseCasesSection'
import { SuccessStoriesSection } from '@/components/sections/SuccessStoriesSection'
import { TrustTechnologySection } from '@/components/sections/TrustTechnologySection'

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ProblemSolutionSection />
      <NetworkVisualizationSection />
      <UseCasesSection />
      <SuccessStoriesSection />
      <TrustTechnologySection />
    </main>
  )
}
