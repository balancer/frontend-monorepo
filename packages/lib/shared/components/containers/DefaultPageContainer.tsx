import { Box, Container, ContainerProps } from '@chakra-ui/react'
import { PropsWithChildren } from 'react'
import { useNavbarHeight } from '../../hooks/useNavbarHeight'

type Props = {
  noVerticalPadding?: boolean
}

export function DefaultPageContainer({
  children,
  noVerticalPadding,
  bg,
  ...rest
}: PropsWithChildren & ContainerProps & Props) {
  const navbarHeight = useNavbarHeight()

  return (
    <Box bg={bg} pt={noVerticalPadding ? '0px' : `${navbarHeight}px`}>
      <Container
        maxW="maxContent"
        overflowX={{ base: 'hidden', md: 'visible' }}
        px={['ms', 'md']}
        py={noVerticalPadding ? 0 : ['xl', '2xl']}
        {...rest}
      >
        {children}
      </Container>
    </Box>
  )
}
