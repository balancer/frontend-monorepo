import { Card } from '@chakra-ui/react'
import { usePoolCreationForm } from '../PoolCreationFormProvider'
import { useTokens } from '@repo/lib/modules/tokens/TokensProvider'
import { useWatch } from 'react-hook-form'
import { PROJECT_CONFIG } from '@repo/lib/config/getProjectConfig'

type Props = {
  children: React.ReactNode
  stepTitle: string
  hasWarning?: boolean
  isConnected?: boolean
}

export function PreviewPoolCreationCard({
  children,
  stepTitle,
  hasWarning = false,
  isConnected = true,
}: Props) {
  const { poolCreationForm, isBeforeStep, isStep } = usePoolCreationForm()
  
export function PreviewPoolCreationCard({ children, stepTitle }: Props) {
  const { poolCreationForm, isBeforeStep, isStep } = usePoolCreationForm()
  const [poolTokens, network] = useWatch({
    control: poolCreationForm.control,
    name: ['poolTokens', 'network'],
  })
  const { priceFor } = useTokens()

  const areAllTokensChosen = (poolTokens || []).every(token => token.address)
  const isAnyTokenWithoutPrice =
    areAllTokensChosen &&
    (poolTokens || []).some(token => {
      return (
        !token.usdPrice && !priceFor(token.address || '', network || PROJECT_CONFIG.defaultNetwork)
      )
    })

  let bg = 'background.level2'
  let borderGradient: string | undefined
  let backgroundGradient: string | undefined

  if (isStep(stepTitle)) {
    if (hasWarning && isConnected) {
      backgroundGradient = 'hsla(31, 97%, 72%, 0.12)'
      borderGradient =
        'linear-gradient(45deg, hsla(31, 97%, 72%, 0.05) 0%, hsla(31, 97%, 72%, 0.8) 100%)'
    } else if (isAnyTokenWithoutPrice && isConnected) {
      bg = 'background.warning'
      borderGradient = 'linear-gradient(180deg, #FDBA74 0%, rgba(151, 111, 69, 0.5) 100%)'
    } else {
      backgroundGradient =
        'linear-gradient(45deg, hsla(245, 97%, 76%,0.08) 0%, hsla(266, 85%, 69%,0.12) 40%, hsla(9, 85%, 71%,0.25) 100%)'
      borderGradient =
        'linear-gradient(266.76deg, rgba(234, 168, 121, 0.75) -20.29%, rgba(179, 174, 245, 0.75) 45.08%, rgba(234, 168, 121, 0.05) 110.45%)'
    }
  }

  return (
    <Card
      bg={bg}
      borderColor="transparent"
      opacity={isBeforeStep(stepTitle) ? 0.5 : 1}
      position="relative"
      sx={
        borderGradient || backgroundGradient || isBeforeStep(stepTitle)
          ? {
              border: 'none',
              boxShadow: isStep(stepTitle) ? undefined : 'none',
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
                pointerEvents: 'none',
              },
              ...(backgroundGradient && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 'inherit',
                  background: backgroundGradient,
                  pointerEvents: 'none',
                  zIndex: 0,
                  opacity: 0.4,
                },
              }),
              '& > *': {
                position: 'relative',
                zIndex: 1,
              },
            }
          : undefined
      }
    >
      {children}
    </Card>
  )
}
