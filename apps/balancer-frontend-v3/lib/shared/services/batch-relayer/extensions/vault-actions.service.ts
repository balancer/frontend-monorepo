import { encodeFunctionData } from 'viem'
import { EncodeExitPoolInput } from '../relayer-types'
import { balancerV2BatchRelayerLibraryAbi } from '@/lib/modules/web3/contracts/abi/generated'

export class VaultActionsService {
  public encodeExitPool(params: EncodeExitPoolInput): string {
    return encodeFunctionData({
      abi: balancerV2BatchRelayerLibraryAbi,
      functionName: 'exitPool',
      args: [
        params.poolId,
        params.poolKind,
        params.sender,
        params.recipient,
        params.exitPoolRequest,
        params.outputReferences,
      ],
    })
  }
}
