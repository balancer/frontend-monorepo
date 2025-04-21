'use client'
import Section from '@repo/lib/shared/components/layout/Section'

import { VebalBenefitsSection } from './components/VebalBenefitsSection'
import { VebalFooterSection } from './components/VebalFooterSection';
import { VebalHowSection } from './components/VebalHowSection';
import { VebalHeroSection } from './components/VebalHeroSection';

export default function VeBALPage() {
  return (
    <>
      <VebalHeroSection />
      <Section mt="40">
        <VebalBenefitsSection />
      </Section>
      <Section>
        <VebalHowSection />
      </Section>
      <VebalFooterSection />
    </>
  )
}
