'use client'
import { Heading, VStack } from '@chakra-ui/react'
import NextLink from 'next/link'
import { Link } from '@chakra-ui/react'
import FadeInOnView from '@/lib/shared/components/containers/FadeInOnView'

export default function Debug() {
  return (
    <FadeInOnView>
      <VStack padding="lg" margin="lg">
        <Heading size="md">Demos</Heading>
        <Link as={NextLink} href="pools/sepolia/v3/0x7cf221fa36584f59a4f7fd7b946b8571c78e3692">
          Sepolia V3 pool (Balancer 50 BAL 50 WETH)
        </Link>
        <Link
          as={NextLink}
          href="pools/ethereum/v2/0x68e3266c9c8bbd44ad9dca5afbfe629022aee9fe000200000000000000000512/add-liquidity"
        >
          Add liquidity in WEIGHTED (wjAura-weth)
        </Link>
        <Link
          as={NextLink}
          href="pools/ethereum/v2/0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080/add-liquidity"
        >
          Add liquidity in META_STABLE (wstETH_wETH)
        </Link>
        <Link
          as={NextLink}
          href="pools/ethereum/v2/0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112/add-liquidity"
        >
          Add liquidity in STABLE (B-rETH-STABLE in Mainnet)
        </Link>
        <Link
          as={NextLink}
          href="pools/ethereum/v2/0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249/add-liquidity"
        >
          Add liquidity in STABLE with BPT tokens (AuraBal 80/20 pool in Mainnet)
        </Link>
        <Link
          as={NextLink}
          href="pools/optimism/v2/0x3dc09db8e571da76dd04e9176afc7feee0b89106000000000000000000000019/add-liquidity"
        >
          Add liquidity in STABLE (FRAX_USDC_MAI in Optimism)
        </Link>
        <Link
          as={NextLink}
          href="pools/ethereum/v2/0x08775ccb6674d6bdceb0797c364c2653ed84f3840002000000000000000004f0/add-liquidity"
        >
          Add liquidity in nested pool (50WETH-50-3pool)
        </Link>
        <Link
          as={NextLink}
          href="pools/ethereum/v2/0xc6853f0539f7d4926c719326d60bd84a752bbb8f00020000000000000000065e/add-liquidity"
        >
          Add liquidity in Gyro pool (2CLP-WSTETH-WETH in Mainnet)
        </Link>
        <Link
          as={NextLink}
          href="pools/polygon/v2/0xee278d943584dd8640eaf4cc6c7a5c80c0073e85000200000000000000000bc7/add-liquidity"
        >
          Add liquidity in Gyro pool (2CLP_WMATIC/MATICX in Polygon)
        </Link>
        <Link
          as={NextLink}
          href="pools/ethereum/v2/0x0da692ac0611397027c91e559cfd482c4197e4030002000000000000000005c9"
        >
          Weighted Pool in recovery mode (not paused)
        </Link>
        <Link
          as={NextLink}
          href="pools/ethereum/v2/0x156c02f3f7fef64a3a9d80ccf7085f23cce91d76000000000000000000000570"
        >
          Composable Pool in recovery mode (not paused)
        </Link>
        <Link
          as={NextLink}
          href="pools/fraxtal/v2/0x33251abecb0364df98a27a8d5d7b5ccddc774c42000000000000000000000008"
        >
          Pool with Merkl APR items (Fraxtal)
        </Link>
        <Link as={NextLink} href="pools/sepolia/v2/0xd1bdc51decb61ee0c98e47fe17217c58be525180">
          CoW AMM Pool (Sepolia)
        </Link>
        <Link
          as={NextLink}
          href="pools/ethereum/v2/0xae8535c23afedda9304b03c68a3563b75fc8f92b0000000000000000000005a0"
        >
          Bricked Composable Stable Pool in recovery mode and paused
        </Link>
        <Link
          as={NextLink}
          href="pools/ethereum/v2/0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb20000000000000000000000fe"
        >
          Old boosted pool with issues
        </Link>
        <Link as={NextLink} href="/debug/token-select">
          Token select
        </Link>
        <Link as={NextLink} href="/debug/token-input">
          Token input
        </Link>
        <Link as={NextLink} href="/debug/sentry">
          Sentry
        </Link>
        <Link as={NextLink} href="/debug/wallet-check">
          Wallet check
        </Link>
        <Link as={NextLink} href="/debug/alerts">
          Alerts
        </Link>
        <Link as={NextLink} href="/debug/modal">
          Modal animation
        </Link>
        <Link as={NextLink} href="/debug/remove-allowance">
          Remove allowance
        </Link>
      </VStack>
    </FadeInOnView>
  )
}
