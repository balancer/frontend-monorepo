'use client'

import { Lst } from '@repo/beets/modules/lst/Lst'
import LstProvidersLayout from '@repo/beets/modules/lst/LstProvidersLayout'

export default function LstPage() {
  return (
    <LstProvidersLayout>
      <Lst />
    </LstProvidersLayout>
  )
}
