import { handleCoingeckoAssetPlatformsRequest } from '@repo/lib/shared/services/coingecko/assetPlatforms'

export async function GET() {
  return handleCoingeckoAssetPlatformsRequest()
}
