import { ReliquaryWithdrawPage } from '@/lib/modules/reliquary/pages/ReliquaryWithdrawPage'

export default function WithdrawFromRelicPage({ params }: { params: { relicId: string } }) {
  return <ReliquaryWithdrawPage relicId={params.relicId} />
}
