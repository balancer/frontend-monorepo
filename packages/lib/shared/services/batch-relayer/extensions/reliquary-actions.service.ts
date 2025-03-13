import { encodeFunctionData, Hex } from 'viem'
import {
  EncodeReliquaryCreateRelicAndDepositInput,
  EncodeReliquaryDepositInput,
} from '../relayer-types'
import { beetsV2BatchRelayerLibraryAbi } from '@repo/lib/modules/web3/contracts/abi/beets/generated'

export class ReliquaryActionsService {
  public encodeCreateRelicAndDeposit(params: EncodeReliquaryCreateRelicAndDepositInput): Hex {
    return encodeFunctionData({
      abi: beetsV2BatchRelayerLibraryAbi,
      functionName: 'reliquaryCreateRelicAndDeposit',
      args: [
        params.sender,
        params.recipient,
        params.token,
        params.poolId,
        params.amount,
        params.outputReference,
      ],
    })
  }

  public encodeDeposit(params: EncodeReliquaryDepositInput): Hex {
    return encodeFunctionData({
      abi: beetsV2BatchRelayerLibraryAbi,
      functionName: 'reliquaryDeposit',
      args: [params.sender, params.token, params.relicId, params.amount, params.outputReference],
    })
  }
}

export const reliquaryActionsService = new ReliquaryActionsService()
