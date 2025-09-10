import type { NextRequest } from 'next/server'
import {
  getTenderlyConfig,
  getAllowedOrigins,
  isAllowedOrigin,
  validateRequestBody,
  getGasEstimateSimulation,
  createForbiddenResponse,
  createBadRequestResponse,
} from '@repo/lib/shared/utils/tenderly-gas-estimate'

const allowedOrigins = getAllowedOrigins()
const tenderlyConfig = getTenderlyConfig()

export async function POST(request: NextRequest) {
  if (!isAllowedOrigin(request, allowedOrigins)) {
    return createForbiddenResponse()
  }

  try {
    const body = await request.json()

    if (!validateRequestBody(body)) {
      return createBadRequestResponse('Missing required parameters')
    }

    const result = await getGasEstimateSimulation(tenderlyConfig, body)
    return Response.json(result)
  } catch (error) {
    console.log('Error in tenderly gas estimate:', error)

    return Response.json({
      gasUsed: undefined,
      error: 'Internal server error',
    })
  }
}
