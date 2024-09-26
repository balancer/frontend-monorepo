/**
 * The types in this file only exist for testing reasons (MSW handlers will use them to mock GQL responses)
 */

import { GetTokensQuery } from '@repo/api/graphql'

// Each Token in this list is a superset of TokenBase
export type MswTokenList = GetTokensQuery['tokens']
