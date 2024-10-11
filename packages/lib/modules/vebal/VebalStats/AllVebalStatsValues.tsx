'use client'
import { Stack } from '@chakra-ui/react'
import BigNumber from 'bignumber.js'

export type VebalAllStatsValues = {
  balance: string | undefined
  rank: number | undefined
  percentOfAllSupply: BigNumber | undefined
  lockedUntil: string | undefined
}

export function AllVebalStatsValues() {
  return <Stack></Stack>
}
