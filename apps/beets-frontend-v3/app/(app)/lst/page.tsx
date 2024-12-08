'use client'

import { Lst } from '@repo/lib/modules/lst/Lst'
import LstProvidersLayout from '@repo/lib/modules/lst/LstProvidersLayout'

export default function LstPage() {
  return (
    <LstProvidersLayout>
      <Lst />
    </LstProvidersLayout>
  )
}
