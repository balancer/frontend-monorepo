import { Reliquary } from '@/lib/modules/reliquary/Reliquary'
import { ReliquaryProvider } from '@/lib/modules/reliquary/ReliquaryProvider'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'

export default async function PoolsPageWrapper() {
  return (
    <TokenInputsValidationProvider>
      <ReliquaryProvider>
        <Reliquary />
      </ReliquaryProvider>
    </TokenInputsValidationProvider>
  )
}
