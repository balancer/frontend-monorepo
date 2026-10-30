import { EventEmitter } from 'node:events'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { EthereumProvider } from '@walletconnect/ethereum-provider'
import { connectorsForWallets, type WalletDetailsParams } from '@rainbow-me/rainbowkit'
import { createConfig, createStorage, http } from 'wagmi'
import { connect, disconnect, reconnect } from 'wagmi/actions'
import { mainnet, arbitrum } from 'viem/chains'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { oathWallet, OATH_WALLET_ID } from './oathWallet'

const init = vi.spyOn(EthereumProvider, 'init')
const ACCOUNT = '0x0000000000000000000000000000000000000001'
const PAIRING = `wc:${'a'.repeat(64)}@2?relay-protocol=irn&symKey=${'b'.repeat(64)}&expiryTimestamp=2000000000`
let projectNumber = 0

function setup(appName = 'Balancer') {
  const events = new EventEmitter()

  const provider = {
    events,
    on: events.on.bind(events),
    removeListener: events.removeListener.bind(events),
    chainId: 1,
    accounts: [] as string[],
    session: undefined as
      { namespaces: { eip155: { accounts: string[]; chains: string[] } } } | undefined,
    connect: vi.fn(async () => {
      events.emit('display_uri', PAIRING)
      provider.accounts = [ACCOUNT]

      provider.session = {
        namespaces: {
          eip155: { accounts: [`eip155:1:${ACCOUNT}`], chains: ['eip155:1', 'eip155:42161'] },
        },
      }
    }),
    enable: vi.fn(async () => provider.accounts),
    disconnect: vi.fn(async () => {
      provider.session = undefined
      provider.accounts = []
    }),
  }

  init.mockResolvedValue(provider as unknown as Awaited<ReturnType<typeof EthereumProvider.init>>)
  const storage = new Map<string, string>()

  const config = createConfig({
    chains: [mainnet, arbitrum],
    transports: { 1: http(), 42161: http() },
    multiInjectedProviderDiscovery: false,
    storage: createStorage({
      storage: {
        getItem: key => storage.get(key) ?? null,
        setItem: (key, value) => {
          storage.set(key, value)
        },
        removeItem: key => {
          storage.delete(key)
        },
      },
    }),
    connectors: connectorsForWallets([{ groupName: 'Recommended', wallets: [oathWallet] }], {
      appName,
      projectId: `oath-test-${projectNumber++}`,
      appUrl: 'https://example.test',
    }),
  })

  return { config, provider, connector: config.connectors[0]! }
}

afterEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe('Oath RainbowKit wallet', () => {
  it.each(['Balancer', 'Beets'])(
    'preserves %s metadata and creates a dedicated WalletConnect session',
    async appName => {
      const { connector } = setup(appName)
      await connector.getProvider()
      expect(connector.id).toBe(OATH_WALLET_ID)
      expect(connector.type).toBe('walletConnect')
      const { rkDetails } = connector as typeof connector & WalletDetailsParams
      expect(rkDetails.id).toBe(OATH_WALLET_ID)
      expect(rkDetails.name).toBe('Oath Wallet')
      expect(rkDetails.groupName).toBe('Recommended')
      expect(rkDetails.qrCode?.getUri(PAIRING)).toBe(PAIRING)

      expect(init).toHaveBeenLastCalledWith(
        expect.objectContaining({
          customStoragePrefix: OATH_WALLET_ID,
          showQrModal: false,
          optionalChains: [1, 42161],
          metadata: expect.objectContaining({ name: appName, url: 'https://example.test' }),
        })
      )
    }
  )

  it('keeps the same Oath identity through Wagmi connection and reconnection', async () => {
    const { config, connector, provider } = setup()
    await connect(config, { connector })
    expect(config.state.connections.get(connector.uid)?.connector.id).toBe(OATH_WALLET_ID)
    expect(provider.connect).toHaveBeenCalledWith({ optionalChains: [1, 42161] })
    expect(provider.connect).toHaveBeenCalledTimes(1)
    const restored = await reconnect(config, { connectors: [connector] })
    expect(restored[0]?.connector.id).toBe(OATH_WALLET_ID)
    expect(provider.connect).toHaveBeenCalledTimes(1)
    await disconnect(config, { connector })
    expect(config.state.status).toBe('disconnected')
    expect(provider.session).toBeUndefined()
  })

  it('recovers from a rejected connection and pairs on the next attempt', async () => {
    const { config, connector, provider } = setup()
    provider.connect.mockRejectedValueOnce(new Error('User rejected connection'))
    await expect(connect(config, { connector })).rejects.toThrow('User rejected')
    expect(config.state.status).toBe('disconnected')
    await connect(config, { connector })
    expect(provider.connect).toHaveBeenCalledTimes(2)
    expect(config.state.status).toBe('connected')
    await disconnect(config, { connector })
  })

  it('preserves the complete QR URI and percent-encodes it for the iOS app', () => {
    const wallet = oathWallet({ projectId: 'test' })
    expect(wallet.qrCode?.getUri(PAIRING)).toBe(PAIRING)
    const url = new URL(wallet.mobile!.getUri!(PAIRING))
    expect(url.protocol).toBe('oathwallet:')
    expect(url.hostname).toBe('wc')
    expect(url.searchParams.get('uri')).toBe(PAIRING)
    expect([...url.searchParams]).toHaveLength(1)
    expect(wallet.downloadUrls?.android).toBeUndefined()
    expect(wallet.extension).toBeUndefined()

    expect(wallet.qrCode?.instructions?.steps.map(step => step.step)).toEqual([
      'install',
      'scan',
      'connect',
    ])
  })

  it('does not advertise a mobile connector to Android users', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Linux; Android 15)' })
    expect(oathWallet({ projectId: 'test' }).hidden?.()).toBe(true)

    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X)',
    })

    expect(oathWallet({ projectId: 'test' }).hidden?.()).toBe(false)
  })

  it('ships the same rounded icon in both app public directories', () => {
    const balancer = readFileSync(
      resolve(process.cwd(), '../../apps/frontend-v3/public/images/logos/oathWallet.svg'),
      'utf8'
    )

    const beets = readFileSync(
      resolve(process.cwd(), '../../apps/beets-frontend-v3/public/images/logos/oathWallet.svg'),
      'utf8'
    )

    expect(balancer).toBe(beets)
    expect(balancer).toContain('rx="256"')
    expect(balancer).not.toMatch(/<script|(?:href|src)=["']https?:\/\//)
  })
})
