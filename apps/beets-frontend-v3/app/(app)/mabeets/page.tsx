import { Reliquary } from '@/lib/modules/reliquary/Reliquary'
import ReliquaryProvidersLayout from '@/lib/modules/reliquary/ReliquaryProvidersLayout'

export default async function PoolsPageWrapper() {
  return (
    <ReliquaryProvidersLayout>
      <Reliquary />
    </ReliquaryProvidersLayout>
  )
}
