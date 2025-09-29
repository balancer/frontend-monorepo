import { mainnet, optimism } from 'viem/chains'
import { getDefaultRpcUrl, chains } from './ChainConfig'

test('getRpcUrl by chain id', () => {
  expect(getDefaultRpcUrl(mainnet.id)).toMatch('https://eth.merkle.io')
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
      "blockTime": 12000,
      "contracts": {
        "ensUniversalResolver": {
          "address": "0xeeeeeeee14d718c2b47d9923deab1335e144eeee",
          "blockCreated": 23085558,
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
            "https://eth.merkle.io",
          ],
        },
      },
      "serializers": undefined,
    }
  `)
})
