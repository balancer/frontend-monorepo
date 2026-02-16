import { AbiItem } from 'viem'

export const signatureRegistryAbi: AbiItem[] = [
  {
    type: 'function',
    inputs: [{ name: '', type: 'address' }],
    name: 'signatures',
    outputs: [{ name: '', type: 'bytes' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'signature', type: 'bytes' },
      { name: 'signer', type: 'address' },
    ],
    name: 'recordSignatureFor',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    inputs: [],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'signer',
        type: 'address',
      },
    ],
    name: 'InvalidSignature',
    type: 'error',
  },
  {
    inputs: [],
    name: 'InvalidSigner',
    type: 'error',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'signer',
        type: 'address',
      },
    ],
    name: 'SignatureAlreadyRecorded',
    type: 'error',
  },
] as const
