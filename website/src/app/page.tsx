import { HeroSection } from '@/components/sections/HeroSection'
import { ProblemSolutionSection } from '@/components/sections/ProblemSolutionSection'
import { InteractiveDemoSection } from '@/components/sections/InteractiveDemoSection'
import { UseCasesSection } from '@/components/sections/UseCasesSection'
import { SuccessStoriesSection } from '@/components/sections/SuccessStoriesSection'
import { TrustTechnologySection } from '@/components/sections/TrustTechnologySection'

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <ProblemSolutionSection />
      <InteractiveDemoSection />
      <UseCasesSection />
      <SuccessStoriesSection />
      <TrustTechnologySection />
    </main>
  )
}
