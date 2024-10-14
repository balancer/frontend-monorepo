import { useBreakpointValue } from '@chakra-ui/react'

export function useBreakpoints() {
  const isMobile = useBreakpointValue({ base: true, lg: false }, { ssr: true })
  const is2xl = useBreakpointValue({ base: false, '2xl': true }, { ssr: true })

  return {
    isMobile,
    isDesktop: !isMobile,
    is2xl,
  }
}
