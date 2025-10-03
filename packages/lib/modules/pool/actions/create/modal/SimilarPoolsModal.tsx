import { useCheckForSimilarPools } from './useCheckForSimilarPools'
import { BalAlert } from '@repo/lib/shared/components/alerts/BalAlert'
import { getChainName } from '@repo/lib/config/app.config'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

export function SimilarPoolsModal() {
  const { poolCreationForm } = usePoolCreationForm()
  const { network } = poolCreationForm.watch()
  const { similarPools, isLoadingSimilarPools, errorFetchingSimilarPools } =
    useCheckForSimilarPools()

  console.log({ similarPools, isLoadingSimilarPools, errorFetchingSimilarPools })

  return (
    <BalAlert
      content="You can still create this pool, but you’ll fragment liquidity making your pool less profitable (on top of additional set up gas fees)."
      status="warning"
      title={`Similar pools already exist on ${getChainName(network)} (${PROJECT_CONFIG.projectName})`}
    />
  )
}
