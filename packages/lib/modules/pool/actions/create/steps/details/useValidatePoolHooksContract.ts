import { Address, isAddress, zeroAddress } from 'viem'
import { useReadContract } from 'wagmi'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useEffect } from 'react'
import { reClammPoolAbi } from '@repo/lib/modules/web3/contracts/abi/generated'

export const useValidatePoolHooksContract = (address: string) => {
  const { poolConfigForm } = usePoolCreationForm()

  const enabled = isAddress(address) && address !== zeroAddress

  const { data: hookFlags, isPending: isPendingHooksContractValidation } = useReadContract({
    address: address as Address,
    abi: reClammPoolAbi,
    functionName: 'getHookFlags',
    args: [],
    query: { enabled },
  })

  /**
   * At the smart contract level, if `enableHookAdjustedAmounts` is set to true
   * `disableUnbalancedLiquidity` must be set to true or pool registration will revert
   */
  useEffect(() => {
    if (hookFlags?.enableHookAdjustedAmounts) {
      poolConfigForm.setValue('disableUnbalancedLiquidity', true)
    }
  }, [hookFlags])

  const isValidHooksContract = !!hookFlags

  // must trigger validation manually after on chain response
  useEffect(() => {
    if (isValidHooksContract) poolConfigForm.trigger('poolHooksContract')
  }, [isValidHooksContract])

  return { isValidHooksContract, isPendingHooksContractValidation }
}
