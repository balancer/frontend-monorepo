import { useSwiperSlide } from 'swiper/react'
import { useEffect, useState } from 'react'
import { Badge, Box, Heading, HStack, VStack, Flex, Stack, Button } from '@chakra-ui/react'
import { useReliquary } from '../ReliquaryProvider'
import { AnimatePresence, motion } from 'framer-motion'
import { ReliquaryFarmPosition } from '../ReliquaryProvider'
import { relicGetMaturityProgress } from '../lib/reliquary-helpers'
import RelicSlideApr from './RelicSlideApr'
import RelicSlideInfo from './RelicSlideInfo'
import RelicSlideMainInfo from './RelicSlideMainInfo'
import { LevelUpModal } from './LevelUpModal'
import { ClaimModal } from './ClaimModal'
import { BurnModal } from './BurnModal'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import RelicLevel1 from '~/assets/images/reliquary/1.png'
import RelicLevel2 from '~/assets/images/reliquary/2.png'
import RelicLevel3 from '~/assets/images/reliquary/3.png'
import RelicLevel4 from '~/assets/images/reliquary/4.png'
import RelicLevel5 from '~/assets/images/reliquary/5.png'
import RelicLevel6 from '~/assets/images/reliquary/6.png'
import RelicLevel7 from '~/assets/images/reliquary/7.png'
import RelicLevel8 from '~/assets/images/reliquary/8.png'
import RelicLevel9 from '~/assets/images/reliquary/9.png'
import RelicLevel10 from '~/assets/images/reliquary/10.png'
import RelicLevel11 from '~/assets/images/reliquary/11.png'

export interface RelicSlideProps {
  relic: ReliquaryFarmPosition
  openInvestModal: () => void
  openWithdrawModal: () => void
}

export default function RelicSlide({ relic, openInvestModal, openWithdrawModal }: RelicSlideProps) {
  const { isActive } = useSwiperSlide()
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState('')

  const { maturityThresholds, isLoadingRelicPositions, setSelectedRelicId, relicPositions, chain } =
    useReliquary()
  const { canUpgrade, canUpgradeTo } = relicGetMaturityProgress(relic, maturityThresholds)
  const [_isLoadingRelicPositions, setIsLoadingRelicPositions] = useState(false)

  const isLevelUpModalOpen = isModalOpen === 'levelUp'
  const isClaimModalOpen = isModalOpen === 'claim'
  const isBurnModalOpen = isModalOpen === 'burn'

  const relicLevelNames = [
    'The Initiate',
    'The Neophyte',
    'The Wanderer',
    'The Rebel',
    'The Skeptic',
    'The Apprentice',
    'The Journeyman',
    'The Savant',
    'The Creator',
    'The Scholar',
    'The Awakened',
  ]

  // hack to get around next.js hydration issues with swiper
  useEffect(() => {
    setIsLoadingRelicPositions(isLoadingRelicPositions)
  }, [isLoadingRelicPositions])

  const hasNoRelics = relicPositions.length === 0

  const isRelicAmountZero = relic.amount === '0.0'

  if (isActive) {
    setSelectedRelicId(relic.relicId)
  }

  function handleAction(action: 'claim' | 'levelUp' | 'deposit' | 'withdraw' | 'burn') {
    if (action === 'deposit') {
      router.push('/mabeets/add-liquidity')
    } else if (action === 'withdraw') {
      router.push('/mabeets/remove-liquidity')
    } else {
      setIsModalOpen(action)
    }
  }

  function getImage(level: number) {
    switch (level) {
      case 1:
        return RelicLevel1
      case 2:
        return RelicLevel2
      case 3:
        return RelicLevel3
      case 4:
        return RelicLevel4
      case 5:
        return RelicLevel5
      case 6:
        return RelicLevel6
      case 7:
        return RelicLevel7
      case 8:
        return RelicLevel8
      case 9:
        return RelicLevel9
      case 10:
        return RelicLevel10
      case 11:
        return RelicLevel11
      default:
        return RelicLevel1
    }
  }

  function getContainerOpacity() {
    if (hasNoRelics) {
      return 0.25
    }
    if (isActive) {
      return 1
    } else {
      return 0.35
    }
  }

  function getUnderglowClass() {
    if (isActive) return ''
    if (isActive) {
      return 'relic-glow'
    }
    return ''
  }

  return (
    <AnimatePresence>
      <VStack
        animate={{
          opacity: getContainerOpacity(),
          transform: isActive ? 'scale(1)' : 'scale(0.5)',
          transition: { type: 'spring', mass: 0.1 },
        }}
        as={motion.div}
        blur={hasNoRelics ? '10px' : '0'}
        filter="auto"
        rounded="lg"
        spacing="8"
        zIndex={isActive ? 1 : -1}
      >
        <Flex justifyContent="center" rounded="lg" width={{ base: '100%', lg: '50%' }}>
          <HStack
            alignItems="start"
            justifyContent={{ base: 'space-between', xl: undefined }}
            spacing="4"
            width="full"
          >
            <Badge colorScheme="green" p="2" rounded="md">
              <Heading size="sm" textAlign="center">
                {isRelicAmountZero
                  ? 'Empty relic - no level'
                  : `Level ${relic?.level + 1} - ${relicLevelNames[relic.level]}`}
              </Heading>
            </Badge>
            <Badge colorScheme="purple" p="2" rounded="md">
              <Heading size="sm">Relic #{relic?.relicId}</Heading>
            </Badge>
          </HStack>
        </Flex>
        <Flex as={motion.div} className={getUnderglowClass()} position="relative">
          {canUpgrade && isActive && !isRelicAmountZero && (
            <Flex
              alignItems="center"
              animate={{ opacity: 1 }}
              as={motion.div}
              bg="blackAlpha.500"
              exit={{ opacity: 0 }}
              height="full"
              initial={{ opacity: 0 }}
              justifyContent="center"
              position="absolute"
              rounded="lg"
              width="full"
              zIndex={2}
            >
              <Button
                onClick={() => handleAction('levelUp')}
                rounded="lg"
                size="lg"
                variant="primary"
              >
                Level Up to {canUpgradeTo}
              </Button>
            </Flex>
          )}

          {isActive && isRelicAmountZero && (
            <Flex
              alignItems="center"
              animate={{ opacity: 1 }}
              as={motion.div}
              bg="blackAlpha.500"
              exit={{ opacity: 0 }}
              height="full"
              initial={{ opacity: 0 }}
              justifyContent="center"
              position="absolute"
              rounded="lg"
              width="full"
              zIndex={2}
            >
              <HStack justifyContent="center" spacing="2" w="full">
                <Button
                  onClick={() => handleAction('deposit')}
                  rounded="lg"
                  size="md"
                  variant="primary"
                  w="100px"
                >
                  Deposit
                </Button>
                <Button
                  onClick={() => handleAction('burn')}
                  rounded="lg"
                  size="md"
                  variant="secondary"
                  w="100px"
                >
                  Burn
                </Button>
              </HStack>
            </Flex>
          )}

          <Box
            blur={isActive && canUpgrade && !_isLoadingRelicPositions ? '10px' : '0px'}
            filter="auto"
            overflow="hidden"
            rounded="lg"
            style={{ marginTop: '0 !important' }}
          >
            <Image
              alt="reliquary"
              height={400}
              placeholder="blur"
              src={getImage(relic?.level + 1)}
              style={{ cursor: 'pointer' }}
              width={400}
            />
          </Box>
        </Flex>

        <Stack
          direction={{ base: 'column', lg: 'row' }}
          height="310px"
          position="relative"
          width="full"
        >
          {isActive && !isRelicAmountZero && (
            <>
              <RelicSlideMainInfo
                isLoading={_isLoadingRelicPositions}
                openInvestModal={openInvestModal}
                openWithdrawModal={openWithdrawModal}
              />
              <RelicSlideApr />
              <RelicSlideInfo />
            </>
          )}
          {isActive && isRelicAmountZero && (
            <VStack alignItems="center" justifyContent="center" w="full">
              <Heading>No stats available for empty relics</Heading>
            </VStack>
          )}
        </Stack>
      </VStack>
      {isLevelUpModalOpen && (
        <LevelUpModal
          chain={chain}
          isOpen={isLevelUpModalOpen}
          nextLevel={canUpgradeTo}
          onClose={() => setIsModalOpen('')}
        />
      )}
      {isClaimModalOpen && (
        <ClaimModal chain={chain} isOpen={isClaimModalOpen} onClose={() => setIsModalOpen('')} />
      )}
      {isBurnModalOpen && (
        <BurnModal chain={chain} isOpen={isBurnModalOpen} onClose={() => setIsModalOpen('')} />
      )}
    </AnimatePresence>
  )
}
