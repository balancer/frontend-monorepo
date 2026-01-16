import { ReliquaryWithdrawPage } from '@/lib/modules/reliquary/pages/ReliquaryWithdrawPage'

export default async function WithdrawFromRelicPage({
  params,
}: {
  params: Promise<{ relicId: string }>
}) {
  const { relicId } = await params
  return <ReliquaryWithdrawPage relicId={relicId} />
}
