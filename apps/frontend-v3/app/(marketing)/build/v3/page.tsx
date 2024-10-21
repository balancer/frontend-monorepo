/* eslint-disable max-len */
'use client'

import { Box } from '@chakra-ui/react'
import { V3Hero } from '@repo/lib/shared/components/marketing/build/v3/V3Hero'
import { V3About } from '@repo/lib/shared/components/marketing/build/v3/V3About'
import { V3UseCases } from '@repo/lib/shared/components/marketing/build/v3/V3UseCases'
import { V3Technical } from '@repo/lib/shared/components/marketing/build/v3/V3Technical'
import { V3Grants } from '@repo/lib/shared/components/marketing/build/v3/V3Grants'
import { V3VideoTutorial } from '@repo/lib/shared/components/marketing/build/v3/V3VideoTutorial'
import { ReactLenis } from '@studio-freight/react-lenis'

export default function Home() {
  return (
    <ReactLenis options={{ lerp: 0.1, duration: 1.5 }} root>
      <Box className="build">
        <V3Hero />
        <V3VideoTutorial />
        <V3About />
        <V3UseCases />
        <V3Technical />
        <V3Grants />
      </Box>
    </ReactLenis>
  )
}
