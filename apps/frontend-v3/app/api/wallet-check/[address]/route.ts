import { checkAddressReputation } from '@repo/lib/shared/services/hypernative/checkAddressReputation'
import { NextResponse } from 'next/server'

type Params = {
  params: {
    address: string
  }
}

export async function GET(request: Request, { params: { address } }: Params) {
  const hypernativeApiId = process.env.PRIVATE_HYPERNATIVE_API_ID
  const hypernativeApiSecret = process.env.PRIVATE_HYPERNATIVE_API_SECRET
  if (!hypernativeApiId || !hypernativeApiSecret) {
    return NextResponse.json({ isAuthorized: true })
  }

  return checkAddressReputation({
    address,
    hypernativeApiId,
    hypernativeApiSecret,
  })
}
