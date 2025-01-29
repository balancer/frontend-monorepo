import { Button } from '@chakra-ui/react'
import NextLink from 'next/link'

export default function LBPPage() {
  return (
    <Button as={NextLink} href="/lbp/create">
      Create LBP
    </Button>
  )
}
