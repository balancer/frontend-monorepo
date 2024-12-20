'use client'

import { Lst } from '@repo/lib/modules/beets/lst/Lst'
import LstProvidersLayout from '@repo/lib/modules/beets/lst/LstProvidersLayout'

export default function LstPage() {
  return (
    <LstProvidersLayout>
      <Lst />
    </LstProvidersLayout>
  )
}
