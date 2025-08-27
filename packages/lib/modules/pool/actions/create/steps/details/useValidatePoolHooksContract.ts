import { Address, isAddress, zeroAddress } from 'viem'
import { useReadContract } from 'wagmi'
import { usePoolCreationForm } from '../../PoolCreationFormProvider'
import { useEffect } from 'react'
import { reClammPoolAbi } from '@repo/lib/modules/web3/contracts/abi/generated'

export const useValidatePoolHooksContract = (address: string) => {
  const { poolCreationForm } = usePoolCreationForm()

  const isZeroAddress = address === zeroAddress
  const enabled = isAddress(address) && !isZeroAddress

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
      poolCreationForm.setValue('disableUnbalancedLiquidity', true)
    }
  }, [hookFlags])

  return { isValidHooksContract: !!hookFlags, isPendingHooksContractValidation }
}
