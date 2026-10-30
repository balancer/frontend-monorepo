import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// Resolve the exact renderer used by RainbowKit, including its pnpm patch.
const require = createRequire(resolve(process.cwd(), 'package.json'))
const rainbowKitDirectory = dirname(require.resolve('@rainbow-me/rainbowkit'))

const qrCode = require(require.resolve('cuer/QrCode', { paths: [rainbowKitDirectory] })) as {
  create: (value: string) => { grid: boolean[][]; edgeLength: number; value: string }
}

describe('RainbowKit QR renderer compatibility', () => {
  it('renders a complete WalletConnect URI without rejecting the QR border', () => {
    const uri = `wc:${'a'.repeat(64)}@2?relay-protocol=irn&symKey=${'b'.repeat(64)}&expiryTimestamp=2000000000`
    const { grid, edgeLength, value } = qrCode.create(uri)

    expect(value).toBe(uri)
    expect(edgeLength).toBeGreaterThanOrEqual(21)
    expect(edgeLength).toBeLessThanOrEqual(177)
    expect(edgeLength % 4).toBe(1)
    expect(grid).toHaveLength(edgeLength)
    expect(grid.every(row => row.length === edgeLength)).toBe(true)
    // The renderer receives modules, without a quiet-zone ring shifting its finder patterns.
    expect(grid[0]?.slice(0, 7)).toEqual(Array(7).fill(true))
    expect(grid[1]?.slice(0, 7)).toEqual([true, false, false, false, false, false, true])
    expect(grid[2]?.slice(0, 7)).toEqual([true, false, true, true, true, false, true])
  })
})
