import { ReliquaryDepositPage } from '@/lib/modules/reliquary/pages/ReliquaryDepositPage'

export default function DepositToRelicPage({ params }: { params: { relicId: string } }) {
  return <ReliquaryDepositPage relicId={params.relicId} />
}
