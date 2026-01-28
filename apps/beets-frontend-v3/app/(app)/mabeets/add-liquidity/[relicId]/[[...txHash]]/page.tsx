import { ReliquaryAddLiquidityPage } from '@/lib/modules/reliquary/pages/ReliquaryAddLiquidityPage'

export default async function AddLiquidityToRelicTxPage({
  params,
}: {
  params: Promise<{ relicId: string }>
}) {
  const { relicId } = await params
  return <ReliquaryAddLiquidityPage relicId={relicId} />
}
