'use client'

import { isNotSupported, shouldBlockAddLiquidity } from '@repo/lib/modules/pool/pool.helpers'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { RelayerSignatureProvider } from '@repo/lib/modules/relayer/RelayerSignatureProvider'
import { TokenInputsValidationProvider } from '@repo/lib/modules/tokens/TokenInputsValidationProvider'
import { PriceImpactProvider } from '@repo/lib/modules/price-impact/PriceImpactProvider'
import { Alert } from '@chakra-ui/react'
import { TransactionStateProvider } from '@repo/lib/modules/transactions/transaction-steps/TransactionStateProvider'
import { PropsWithChildren } from 'react'
import { isHash } from 'viem'
import { usePoolRedirect } from '@repo/lib/modules/pool/pool.hooks'
import { DefaultPageContainer } from '@repo/lib/shared/components/containers/DefaultPageContainer'
import { AddLiquidityProvider } from '@repo/lib/modules/pool/actions/add-liquidity/AddLiquidityProvider'
import { Permit2SignatureProvider } from '@repo/lib/modules/tokens/approvals/permit2/Permit2SignatureProvider'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'
import { usePathname } from 'next/navigation'

type Props = PropsWithChildren<{
  txHash?: string[]
}>

export function AddLiquidityLayout({ txHash, children }: Props) {
  const pathname = usePathname()
  const { pool } = usePool()
  const { redirectToPoolPage } = usePoolRedirect(pool)

  const maybeTxHash = txHash?.[0] || ''
  const urlTxHash = isHash(maybeTxHash) ? maybeTxHash : undefined

  const isMabeetsAddLiquidity = pathname === '/mabeets/add-liquidity'

  if (shouldBlockAddLiquidity(pool) && !isMabeetsAddLiquidity) {
    redirectToPoolPage()
    return null
  }

  if (isNotSupported(pool)) {
    return (
      <Alert minW="50%" status="info" w="fit-content">
        {`This pool type is not currently supported in the ${PROJECT_CONFIG.projectName} UI`}
      </Alert>
    )
  }

  return (
    <DefaultPageContainer>
      <TransactionStateProvider>
        <RelayerSignatureProvider>
          <Permit2SignatureProvider>
            <TokenInputsValidationProvider>
              <AddLiquidityProvider urlTxHash={urlTxHash}>
                <PriceImpactProvider>{children}</PriceImpactProvider>
              </AddLiquidityProvider>
            </TokenInputsValidationProvider>
          </Permit2SignatureProvider>
        </RelayerSignatureProvider>
      </TransactionStateProvider>
    </DefaultPageContainer>
  )
}
