import { HStack, Icon, Text, VStack, Box } from '@chakra-ui/react'
import { usePool } from '@repo/lib/modules/pool/PoolProvider'
import { Picture } from '@repo/lib/shared/components/other/Picture'
import { useDateCountdown } from '@repo/lib/shared/hooks/date.hooks'
import { GqlPoolLiquidityBootstrappingV3 } from '@repo/lib/shared/services/api/generated/graphql'
import { format, isAfter, isBefore, secondsToMilliseconds } from 'date-fns'
import { AlertTriangle, Clock } from 'react-feather'
import { PropsWithChildren } from 'react'
import { now } from '@repo/lib/shared/utils/time'

function TimeElement({ title, value }: { title: string; value: string }) {
  return (
    <VStack>
      <Text
        color="font.secondary"
        fontSize="10px"
        fontWeight="500"
        lineHeight="12px"
        textAlign="center"
      >
        {title}
      </Text>
      <Text
        color="font.primary"
        fontFamily="monospace"
        fontSize="18px"
        fontWeight="500"
        letterSpacing="0.1em"
        lineHeight="20px"
        pl="2px"
        textAlign="center"
      >
        {value}
      </Text>
    </VStack>
  )
}

function Tile({ children }: PropsWithChildren) {
  return (
    <VStack
      alignItems="center"
      justifyContent="center"
      minH="100%"
      position="relative"
      px="sm"
      rounded="lg"
      shadow="2xl"
      spacing="none"
    >
      <Box
        h="full"
        inset={0}
        overflow="hidden"
        position="absolute"
        rounded="lg"
        w="full"
        zIndex={-1}
      >
        <Picture
          altText="Marble texture"
          defaultImgType="jpg"
          directory="/images/textures/"
          height="100%"
          imgAvif
          imgAvifDark
          imgJpg
          imgJpgDark
          imgName="marble-square"
          width="100%"
        />
      </Box>
      <Box
        bg="background.level1"
        inset={0}
        opacity={0.4}
        overflow="hidden"
        position="absolute"
        rounded="lg"
        zIndex={-1}
      />
      {children}
    </VStack>
  )
}

export function LbpHeaderTimeInfo() {
  const { pool } = usePool()

  // this will only be rendered for LBPs so we can be sure it is a liquidity bootstrapping pool
  const lbpPool = pool as GqlPoolLiquidityBootstrappingV3
  const startTimeFormatted = format(secondsToMilliseconds(lbpPool.startTime), 'haaa, MM/dd/yy')
  const endTimeFormatted = format(secondsToMilliseconds(lbpPool.endTime), 'haaa, MM/dd/yy')
  const currentTime = now()

  return (
    <>
      {isBefore(currentTime, secondsToMilliseconds(lbpPool.startTime)) ? (
        <HStack spacing="4" w="full">
          <HStack
            alignItems="center"
            backgroundColor="special"
            borderColor="special"
            borderRadius="sm"
            borderStyle="dashed"
            borderWidth="1px"
            color="special"
            flex="1"
            h="full"
            justifyContent="start"
            px="2"
          >
            <Icon as={Clock} fontVariant="special" />
            <Text variant="special">{`LBP starts ${startTimeFormatted}`}</Text>
          </HStack>

          <Countdown until={new Date(secondsToMilliseconds(lbpPool.startTime))} />
        </HStack>
      ) : isAfter(currentTime, secondsToMilliseconds(lbpPool.endTime)) ? (
        <HStack
          alignItems="center"
          bg="red.400"
          borderRadius="sm"
          color="black"
          flex="1"
          h="full"
          justifyContent="start"
          px="2"
          w="full"
        >
          <Icon as={AlertTriangle} />
          <Text color="black">{`LBP ended ${endTimeFormatted}`}</Text>
        </HStack>
      ) : (
        <HStack spacing="4" w="full">
          <HStack
            alignItems="center"
            bg="green.400"
            borderRadius="sm"
            color="black"
            flex="1"
            h="full"
            justifyContent="start"
            px="2"
          >
            <Icon as={Clock} />
            <Text color="black">{`LBP is live! Ends ${endTimeFormatted}`}</Text>
          </HStack>

          <Countdown until={new Date(secondsToMilliseconds(lbpPool.endTime))} />
        </HStack>
      )}
    </>
  )
}

function Countdown({ until }: { until: Date }) {
  const info = useDateCountdown(until)

  return (
    <HStack flexShrink="0" h="48px" spacing="xs">
      <Tile>
        <TimeElement title="D" value={String(info.daysDiff)} />
      </Tile>
      <Tile>
        <HStack spacing="xs">
          <TimeElement title="H" value={String(info.hoursDiff).padStart(2, '0')} />
          <TimeElement title="M" value={String(info.minutesDiff).padStart(2, '0')} />
          <TimeElement title="S" value={String(info.secondsDiff).padStart(2, '0')} />
        </HStack>
      </Tile>
    </HStack>
  )
}
