import { ReliquaryRemoveLiquidityPage } from '@/lib/modules/reliquary/pages/ReliquaryRemoveLiquidityPage'

export default async function RemoveLiquidityFromRelicTxPage({
  params,
}: {
  params: Promise<{ relicId: string }>
}) {
  const { relicId } = await params
  return <ReliquaryRemoveLiquidityPage relicId={relicId} />
}
