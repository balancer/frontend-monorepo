import type { NextRequest } from 'next/server'
import { captureError, ensureError } from '@repo/lib/shared/utils/errors'
import {
  getTenderlyConfig,
  validateRequestBody,
  getGasEstimateSimulation,
} from '@repo/lib/shared/utils/internal-api/tenderly-gas-estimate'

import {
  createBadRequestResponse,
  createForbiddenResponse,
  getAllowedOrigins,
  isAllowedOrigin,
} from '@repo/lib/shared/utils/internal-api/errors'

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
  } catch (err) {
    const error = ensureError(err)
    captureError(error, { extra: { message: 'Error in tenderly gas estimate' } })
    return Response.json({
      gasUsed: undefined,
      error: 'Internal server error',
    })
  }
}
