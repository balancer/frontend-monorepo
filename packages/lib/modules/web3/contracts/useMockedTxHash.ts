import { sample } from 'lodash'
import { useState } from 'react'
import { Hash } from 'viem'

const existingTransactions: Hash[] = [
  '0x397ad6453af847ae131a88d8dba6413422ab7d06106a6b577ff044716c94ab22',
  '0x9d280e170a9a40e89992cc55dbbfe7e2418ae27458bcd360b633f93eb710ce58',
  '0x28daa882b2c6ede899e0ce125bb1a25c7671a9a7ce792c76daa72bf5c237562e',
  '0x2ffdf8d773b3b3961c7b4625ebe569c54390d4538bd0640a0f91b7330e9ac4c8',
  '0xa9615ea2318eb81a343d3d69ffa8c95f4cc842dc5a84121392a536ecb6bcdbb7',
  '0xa9615ea2318eb81a343d3d69ffa8c95f4cc842dc5a84121392a536ecb6bcdbb7',
  '0x5ff716530b16c6ca098c9b1014fccc9dbe624e5a30247dbf621d9ac81c471ec3',
  '0xb664f8851c63e3eacab29684a8bfa44f181f26ad51091984d1f80cf43a92d42c',
  '0xe40271275ad8d395fa0e57325c05affebf0b4a7ffb9d2f9083055be4daa7f0d0',
  '0x50e36f668610be04c13725ff90de2e3d776d1c19a6f422ea84fa85db49b96149',
  '0x75c38e76a51cf32d8f2810a85296591fc501bd5a9930bce18da378d9ad3b5481',
  '0x41902df1bd29561caa52d6288399beef9120a598ac4058c4af44e6f42a5bac92',
  '0x052c7d97bff2f7bef2bff6d8fe2d8f79cd83cfb7a9ffd4fd07ef85acc7dd2bcb',
  '0x3b15055a146dd82edc8ff242b3274f362b3e7822831190937246f2ab10bbadf5',
  '0xa52668e3d69c3cfe2d40cf21483177a2a926f38b0bc3175868db72b79bdee8e1',
  '0x592c0ce6d76f953b6f6a1936e0dc8056a4e58cb9341a7ccaec1fd212c2ae73ef',
  '0x8222631a76e8e1fff3e5885543541570f27254eda4f11a10e1afcb4c323ffdfd',
  '0xd9da4edcec15cf744b6d58eba2eb6a23ccb20544b7d536f02f92c19653a3dc14',
  '0x99fdf7b1852d2b2e6ea128f9d78b689c14ec9f35eaafdae75dd988f56248098b',
  '0xebcbcc08d8b100fb2d257911efe4852b5316bfbfc8cb60f3acbf4372f2a5f3cf',
  '0xe551d3433e7908b5534384d185ef9eb676463ea56807bf18e90488e34cef3bb9',
  '0xe68f3660be6e71c65307ee9eb8d34d14dab059ef10cc2fcbe9231f09c6918d67',
  '0x4e5b2752ff28572724efa1da60f6c17c5802547105712f4b0ae600825121a5ab',
]

function getRandomTransactionHash() {
  return sample(existingTransactions)
}

export function useMockedTxHash() {
  // simulate transaction success using existing transaction (dev only)
  const [mockedTxHash, _setMockedTxHash] = useState<Hash | undefined>(undefined)

  return {
    mockedTxHash,
    setMockedTxHash: (txHash?: Hash) => {
      if (txHash) {
        _setMockedTxHash(txHash)
        return txHash
      }

      const transactionHash = prompt(
        `Provide existing transaction hash to skip transaction? e.g. ${getRandomTransactionHash()}`
      )

      if (transactionHash) {
        _setMockedTxHash(transactionHash as Hash)
        return transactionHash
      }

      return undefined
    },
  }
}
