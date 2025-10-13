import { Card } from '@chakra-ui/react'
import { usePoolCreationFormSteps } from '../usePoolCreationFormSteps'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'

type Props = {
  children: React.ReactNode
  stepTitle: string
}

export function PreviewPoolCreationCard({ children, stepTitle }: Props) {
  const { isBeforeStep, isStep } = usePoolCreationFormSteps()
  const { poolCreationForm } = usePoolCreationForm()
  const { poolTokens, network } = poolCreationForm.watch()
  const { priceFor } = useTokens()

  const areAllTokensChosen = poolTokens.every(token => token.address)
  const isAnyTokenWithoutPrice =
    areAllTokensChosen &&
    poolTokens.some(token => {
      return !token.usdPrice && !priceFor(token.address || '', network)
    })

  let bg = 'background.level2'
  let borderGradient: string | undefined

  if (isStep(stepTitle)) {
    if (isAnyTokenWithoutPrice) {
      bg = 'background.warning'
      borderGradient = 'linear-gradient(180deg, #FDBA74 0%, rgba(151, 111, 69, 0.5) 100%)'
    } else {
      bg = 'background.specialAlpha15'
      borderGradient =
        'linear-gradient(266.76deg, rgba(234, 168, 121, 0.5) -20.29%, rgba(179, 174, 245, 0.5) 45.08%, rgba(234, 168, 121, 0) 110.45%)'
    }
  }

  return (
    <Card
      bg={bg}
      borderColor="transparent"
      opacity={isBeforeStep(stepTitle) ? 0.5 : 1}
      position="relative"
      sx={
        borderGradient
          ? {
              border: 'none',
              '&::before': {
                content: '""',
                position: 'absolute',
                inset: 0,
                borderRadius: 'inherit',
                padding: '1px',
                background: borderGradient,
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
              },
            }
          : undefined
      }
    >
      {children}
    </Card>
  )
}
