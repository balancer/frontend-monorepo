import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverBody,
  Divider,
  VStack,
  HStack,
  Text,
  useDisclosure,
} from '@chakra-ui/react'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import { bn, fNum } from '@repo/lib/shared/utils/numbers'
import { ChevronUp } from 'react-feather'
import { getCanStake } from '../actions/stake.helpers'
import {
  getUserWalletBalance,
  calcGaugeStakedBalance,
  calcAuraStakedBalance,
  calcAuraStakedBalanceUsd,
  calcGaugeStakedBalanceUsd,
} from '../user-balance.helpers'
import { Pool } from '../pool.types'
import { useVebalBoost } from '../../vebal/useVebalBoost'
import { getTotalApr } from '../pool.utils'
import { getNetworkConfig, getChainId } from '@repo/lib/config/app.config'
import {
  PartnerRedirectModal,
  RedirectPartner,
} from '@repo/lib/shared/components/modals/PartnerRedirectModal'
import { BalancerIconCircular } from '@repo/lib/shared/components/icons/logos/BalancerIconCircular'
import { ProtocolIcon } from '@repo/lib/shared/components/icons/ProtocolIcon'
import { Protocol } from '../../protocols/useProtocols'
import { getAuraPoolLink } from '../pool.utils'
import { useCurrency } from '@repo/lib/shared/hooks/useCurrency'

type StakeUnstakeButtonProps = {
  pool: Pool
  action: 'stake' | 'unstake'
}

type OptionProps = {
  icon: ReactNode
  title: string
  apr?: number
  disabled?: boolean
  onClick(): void
  action: 'stake' | 'unstake'
  usdValue?: string
}

function Option({ icon, title, apr, disabled, onClick, action, usdValue }: OptionProps) {
  return (
    <Button
      _hover={{ textDecoration: 'none' }}
      data-group
      isDisabled={disabled}
      onClick={onClick}
      px="xs"
      variant="link"
      width="40"
    >
      <HStack alignContent="start" w="full">
        {icon}
        <VStack gap="0">
          <Text
            _groupHover={{ color: 'font.highlight' }}
            fontWeight="bold"
            textAlign="left"
            w="full"
          >
            {title}
          </Text>
          <Text
            _groupHover={{ color: 'font.highlight' }}
            color="font.secondary"
            fontSize="sm"
            textAlign="left"
            w="full"
          >
            {action === 'stake' && (apr ? `${fNum('apr', apr)} APR` : 'N/A')}
            {action === 'unstake' && usdValue}
          </Text>
        </VStack>
      </HStack>
    </Button>
  )
}

export function StakeUnstakeButton({ pool, action }: StakeUnstakeButtonProps) {
  const router = useRouter()
  const pathname = usePathname()
  const auraDisclosure = useDisclosure()
  const { veBalBoostMap } = useVebalBoost([pool])
  const { toCurrency } = useCurrency()

  const canStake = getCanStake(pool)
  const hasUnstakedBalance = bn(getUserWalletBalance(pool)).gt(0)
  const vebalBoost = veBalBoostMap[pool.address]
  const [, balancerMaxApr] = getTotalApr(pool.dynamicData.aprItems, vebalBoost)

  const hasGaugeStakedBalance = bn(calcGaugeStakedBalance(pool)).gt(0)
  const hasAuraStakedBalance = bn(calcAuraStakedBalance(pool)).gt(0)
  const hasAnyStakedBalance = hasGaugeStakedBalance || hasAuraStakedBalance

  const gaugeStakedBalanceUsdFormatted = toCurrency(calcGaugeStakedBalanceUsd(pool))
  const auraStakedBalanceUsdFormatted = toCurrency(calcAuraStakedBalanceUsd(pool))

  const hidePopover = !getNetworkConfig(pool.chain).hasAura
  const stakeOnBalancer = () => router.push(`${pathname}/stake`)
  const unstakeFromBalancer = () => router.push(`${pathname}/unstake`)
  const redirectToAura = () => auraDisclosure.onOpen()

  const isStakeAction = action === 'stake'
  const hasBalanceForAction = isStakeAction ? hasUnstakedBalance : hasAnyStakedBalance
  const isDisabled = isStakeAction ? !(canStake && hasUnstakedBalance) : !hasAnyStakedBalance

  const buttonVariant = isStakeAction
    ? canStake && hasUnstakedBalance
      ? 'secondary'
      : 'disabled'
    : hasAnyStakedBalance
      ? 'tertiary'
      : 'disabled'

  if (
    hidePopover ||
    (isStakeAction ? !pool.staking?.aura : hasGaugeStakedBalance && !hasAuraStakedBalance)
  ) {
    return (
      <Button
        flex="1"
        isDisabled={isDisabled}
        maxW="120px"
        onClick={isStakeAction ? stakeOnBalancer : unstakeFromBalancer}
        variant={buttonVariant}
      >
        {isStakeAction ? 'Stake' : 'Unstake'}
      </Button>
    )
  }

  return (
    <>
      <Popover placement="top-start">
        {({ isOpen }) => (
          <>
            <PopoverTrigger>
              <Button
                flex="1"
                isDisabled={isDisabled}
                maxW="120px"
                position="relative"
                px="md"
                rightIcon={hasBalanceForAction ? <ChevronUp size="16" /> : undefined}
                sx={{
                  '& .chakra-button__icon': {
                    position: 'absolute',
                    right: '8px',
                    marginInlineStart: '0',
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s var(--ease-out-cubic)',
                  },
                }}
                variant={buttonVariant}
                w="full"
              >
                <span style={{ marginLeft: hasBalanceForAction ? '-12px' : '0' }}>
                  {isStakeAction ? 'Stake' : 'Unstake'}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent boxSize="44" height="max-content">
              <PopoverHeader>
                <Text color="font.secondary" fontSize="sm" fontWeight="bold">
                  {isStakeAction ? 'Staking options' : 'Unstake from'}
                </Text>
              </PopoverHeader>
              <PopoverBody>
                <VStack>
                  <Option
                    action={action}
                    apr={isStakeAction ? balancerMaxApr.toNumber() : undefined}
                    disabled={
                      isStakeAction ? !(canStake && hasUnstakedBalance) : !hasGaugeStakedBalance
                    }
                    icon={<BalancerIconCircular />}
                    onClick={isStakeAction ? stakeOnBalancer : unstakeFromBalancer}
                    title="Balancer"
                    usdValue={isStakeAction ? undefined : gaugeStakedBalanceUsdFormatted}
                  />
                  <Divider />
                  <Option
                    action={action}
                    apr={isStakeAction ? pool.staking?.aura?.apr || 0 : undefined}
                    disabled={
                      isStakeAction ? !(canStake && hasUnstakedBalance) : !hasAuraStakedBalance
                    }
                    icon={<ProtocolIcon protocol={Protocol.Aura} size={28} />}
                    onClick={redirectToAura}
                    title="Aura"
                    usdValue={isStakeAction ? undefined : auraStakedBalanceUsdFormatted}
                  />
                </VStack>
              </PopoverBody>
            </PopoverContent>
          </>
        )}
      </Popover>
      <PartnerRedirectModal
        isOpen={auraDisclosure.isOpen}
        onClose={auraDisclosure.onClose}
        partner={RedirectPartner.Aura}
        redirectUrl={getAuraPoolLink(getChainId(pool.chain), pool.staking?.aura?.auraPoolId || '')}
      />
    </>
  )
}
