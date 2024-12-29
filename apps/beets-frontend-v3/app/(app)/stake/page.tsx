'use client'

import { Lst } from '@/lib/modules/lst/Lst'
import LstProvidersLayout from '@/lib/modules/lst/LstProvidersLayout'

export default function LstPage() {
  return (
    <LstProvidersLayout>
      <Lst />
    </LstProvidersLayout>
  )
}
