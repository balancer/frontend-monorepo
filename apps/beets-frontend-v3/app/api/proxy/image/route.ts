import { NextRequest } from 'next/server'
import { handleImageProxy } from '@repo/lib/shared/utils/image-proxy-handler'

export async function GET(request: NextRequest) {
  return handleImageProxy(request)
}
