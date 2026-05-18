import { loadEnvFile } from 'node:process'
import { dirname, resolve } from 'path'
import { Instance, Server } from 'prool'
import { fileURLToPath } from 'url'

import { ANVIL_NETWORKS, getForkUrl } from './anvil-setup'
import { testChains } from './testWagmiConfig'

const currentDir = dirname(fileURLToPath(import.meta.url))
const DEFAULT_ANVIL_INSTANCE_TIMEOUT_MS = 60_000
type ProolAnvilInstance = ReturnType<typeof Instance.anvil>

function loadEnvFileIfExists(path: string) {
  try {
    loadEnvFile(path)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
}

loadEnvFileIfExists(resolve(currentDir, '../../../.env.local'))

async function sleep(time: number) {
  return new Promise(resolve => {
    setTimeout(resolve, time)
  })
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, description: string): Promise<T> {
  let timeout: NodeJS.Timeout | undefined

  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        reject(new Error(`${description} timed out after ${timeoutMs}ms`))
      }, timeoutMs)
    }),
  ]).finally(() => {
    if (timeout) clearTimeout(timeout)
  })
}

function withInstanceTimeout(instance: ProolAnvilInstance, timeoutMs: number): ProolAnvilInstance {
  return new Proxy(instance, {
    get(target, property, receiver) {
      if (property !== 'create') return Reflect.get(target, property, receiver)

      return (parameters: Parameters<ProolAnvilInstance['create']>[0]) => {
        const instance = target.create.call(target, parameters)

        return new Proxy(instance, {
          get(target, property, receiver) {
            if (property === 'start') {
              return () => withTimeout(target.start.call(target), timeoutMs, 'Anvil instance start')
            }

            if (property === 'stop') {
              return () => withTimeout(target.stop.call(target), timeoutMs, 'Anvil instance stop')
            }

            if (property === 'restart') {
              return () =>
                withTimeout(target.restart.call(target), timeoutMs, 'Anvil instance restart')
            }

            return Reflect.get(target, property, receiver)
          },
        })
      }
    },
  }) as ProolAnvilInstance
}

export async function setup() {
  const promises = []
  for (const chain of Object.values(testChains)) {
    const forkUrl = getForkUrl(chain.id, false)

    console.log('Starting proxy ', {
      port: chain.port,
      forkUrl,
      forkBlockNumber: ANVIL_NETWORKS[chain.id].forkBlockNumber,
      timeout: DEFAULT_ANVIL_INSTANCE_TIMEOUT_MS,
    })

    const server = Server.create({
      port: chain.port,
      host: '::',
      instance: withInstanceTimeout(
        Instance.anvil({
          chainId: chain.id,
          forkUrl,
          forkBlockNumber: ANVIL_NETWORKS[chain.id].forkBlockNumber,
          mnemonic: process.env.TEST_ACCOUNT_MNEMONIC,
        }),
        DEFAULT_ANVIL_INSTANCE_TIMEOUT_MS
      ),
    })

    promises.push(server.start().then(() => server.stop.bind(server)))
  }
  const results = await Promise.all(promises)
  // Wait for the proxy to start
  await sleep(2000)

  return async () => {
    await Promise.all(results.map(shutdown => shutdown()))
  }
}
