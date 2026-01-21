import { ReliquaryDepositPage } from '@/lib/modules/reliquary/pages/ReliquaryDepositPage'

export default async function DepositToRelicTxPage({
  params,
}: {
  params: Promise<{ relicId: string }>
}) {
  const { relicId } = await params
  return <ReliquaryDepositPage relicId={relicId} />
}
