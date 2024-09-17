import { mainnet, optimism } from 'viem/chains'
import { getDefaultRpcUrl, chains } from './ChainConfig'

test('getRpcUrl by chain id', () => {
  expect(getDefaultRpcUrl(mainnet.id)).toMatch('https://cloudflare-eth.com')
  expect(getDefaultRpcUrl(optimism.id)).toMatch('https://mainnet.optimism.io')
})

test('Debug', () => {
  expect(chains[0]).toMatchInlineSnapshot(`
    {
      "blockExplorers": {
        "default": {
          "apiUrl": "https://api.etherscan.io/api",
          "name": "Etherscan",
          "url": "https://etherscan.io",
        },
      },
      "contracts": {
        "ensRegistry": {
          "address": "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
        },
        "ensUniversalResolver": {
          "address": "0xce01f8eee7E479C928F8919abD53E553a36CeF67",
          "blockCreated": 19258213,
        },
        "multicall3": {
          "address": "0xca11bde05977b3631167028862be2a173976ca11",
          "blockCreated": 14353601,
        },
      },
      "fees": undefined,
      "formatters": undefined,
      "iconUrl": "/images/chains/MAINNET.svg",
      "id": 1,
      "name": "Ethereum",
      "nativeCurrency": {
        "decimals": 18,
        "name": "Ether",
        "symbol": "ETH",
      },
      "rpcUrls": {
        "default": {
          "http": [
            "https://cloudflare-eth.com",
          ],
        },
      },
      "serializers": undefined,
    }
  `)
})
