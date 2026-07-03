#!/usr/bin/env node
/**
 * One-shot diagnostic: hit api-v3 for a pool's recent swaps and answer:
 *
 *   1. How many distinct `sender` vs `userAddress` values appear?
 *   2. What are the top sources by USD volume on each field?
 *   3. For each top sender, what's the diversity of userAddress (and vice versa)?
 *      → tells us whether `sender` = Router (always one of a handful) or = aggregator.
 *   4. What share of volume is covered by the static label list we're about to ship?
 *
 * Run:
 *   node apps/balancer-analytics/scripts/probe-swap-sources.mjs \
 *     [pool=0x85b2b559bc2d21104c4defdd6efca8a20343361d] \
 *     [chain=MAINNET] \
 *     [days=7]
 *
 * No deps — uses native fetch.
 */

const ENDPOINT = process.env.NEXT_PUBLIC_BALANCER_API_URL || 'https://api-v3.balancer.fi/graphql'

const POOL  = (process.argv[2] || '0x85b2b559bc2d21104c4defdd6efca8a20343361d').toLowerCase()
const CHAIN = process.argv[3] || 'MAINNET'
const DAYS  = Number(process.argv[4] || 7)

const PAGE_SIZE = 200
const HARD_CAP  = 5000 // safety stop; ~25 pages

// ---------- Labels: pasted from the user's Dune export + CowSwap added ----------

const LABELS = {
  // aggregators
  '0x0000000000001ff3684f28c67538d4d072c22734': { name: 'zeroex: AllowanceHolder',        category: 'aggregator' },
  '0x00000000009726632680fb29d3f7a9734e3010e2': { name: 'rainbow_swap_aggregator',         category: 'aggregator' },
  '0x00000000fdac7708d0d360bddc1bc7d097f47439': { name: 'paraswap: AugustusV6',            category: 'aggregator' },
  '0x000db803a70511e09da650d4c0506d0000100000': { name: 'paraswap: AugustusV6_1',          category: 'aggregator' },
  '0x0439e60f02a8900a951603950d8d4527f400c3f1': { name: 'metamask: MetaBridge',            category: 'aggregator' },
  '0x0736bdc975af0675b9a045384efed91360d25479': { name: 'aori',                            category: 'aggregator' },
  '0x07e594aa718bb872b526e93eed830a8d2a6a1071': { name: 'zeroex: MainnetSettler',          category: 'aggregator' },
  '0x0f26b03961eb5d625bd6001278f0db13f3e583d8': { name: 'odos_v2: LimitOrderRouter',       category: 'aggregator' },
  '0x111111125421ca6dc452d289314280a0f8842a65': { name: 'oneinch: AggregationRouterV6',    category: 'aggregator' },
  '0x11111112542d85b3ef69ae05771c2dccff4faa26': { name: 'oneinch: AggregationRouterV3',    category: 'aggregator' },
  '0x1111111254eeb25477b68fb85ed929f73a960582': { name: 'oneinch: AggregationRouterV5',    category: 'aggregator' },
  '0x1111111254fb6c44bac0bed2854e76f90643097d': { name: 'oneinch: AggregationRouterV4',    category: 'aggregator' },
  '0x1231deb6f5749ef6ce6943a275a1d3e7486f4eae': { name: 'lifi: LiFiDiamond_v2',            category: 'aggregator' },
  '0x135896de8421be2ec868e0b811006171d9df802a': { name: 'paraswap: LiquiditySwapAdapter',  category: 'aggregator' },
  '0x21b9f852534fb9ddc3a0a7b24f067b50d8ac9a99': { name: 'dodo: DODOFeeRouteProxy',         category: 'aggregator' },
  '0x28b1dc1a5e3699a428bc51d234dfab7c9cb2a183': { name: 'okx_dex_v4: DexRouter',           category: 'aggregator' },
  '0x4d9cdb3f367a93ef942f1564fee5e58d2b68220e': { name: 'swing: SwitchV2',                 category: 'aggregator' },
  '0x50f9bde1c76bba997a5d6e7fefff695ec8536194': { name: 'dodo: DODOFeeRouteProxy',         category: 'aggregator' },
  '0x5e2361cd711de7efe2a85045b643271a64262d40': { name: 'socket: FeeRouter',               category: 'aggregator' },
  '0x6307119078556fc8ad77781dfc67df20d75fb4f9': { name: 'lifi: Permit2Proxy',              category: 'aggregator' },
  '0x663dc15d3c1ac63ff12e45ab68fea3f0a883c251': { name: 'debridge: DeSwapSender',          category: 'aggregator' },
  '0x6a000f20005980200259b80c5102003040001068': { name: 'paraswap: AugustusV6_2',          category: 'aggregator' },
  '0x7d0ccaa3fac1e5a943c5168b6ced828691b46b36': { name: 'okx: DexRouter',                  category: 'aggregator' },
  '0x80aca0c645fedabaa20fd2bf0daf57885a309fe6': { name: 'paraswap: RepayAdapter',          category: 'aggregator' },
  '0x881d40237659c251811cec9c364ef91dc08d300c': { name: 'metamask: MetaSwap',              category: 'aggregator' },
  '0x9b11bc9fac17c058cab6286b0c785be6a65492ef': { name: 'lifi: LiFiDiamondImmutable',      category: 'aggregator' },
  '0xa2398842f37465f89540430bdc00219fa9e4d28a': { name: 'dodo: DODORouteProxy',            category: 'aggregator' },
  '0xa356867fdcea8e71aeaf87805808803806231fdc': { name: 'dodo: DODOV2Proxy02',             category: 'aggregator' },
  '0xa88800cd213da5ae406ce248380802bd53b47647': { name: 'oneinch: Settlement',             category: 'aggregator' },
  '0xae68b7117be0026cbd4366303f74eecbb19e4042': { name: 'bungee: Solver',                  category: 'aggregator' },
  '0xb01f8f528702d411d24c9bb8cc0e2fff779ec013': { name: 'oneinch: LeftoverExchangerV1',    category: 'aggregator' },
  '0xb300000b72deaeb607a12d5f54773d1c19c7028d': { name: 'Binance DEX Aggregator',          category: 'aggregator' },
  '0xc30141b657f4216252dc59af2e7cdb9d8792e1b0': { name: 'socket: Registry',                category: 'aggregator' },
  '0xce16f69375520ab01377ce7b88f5ba8c48f8d666': { name: 'squid_router',                    category: 'aggregator' },
  '0xcf5540fffcdc3d510b18bfca6d2b9987b0772559': { name: 'odos_v2: OdosRouterV2',           category: 'aggregator' },
  '0xd9b825d16e09f28d0c715fe004364046e5524dbb': { name: 'dodo: LimitOrderBot',             category: 'aggregator' },
  '0xdd9f24efc84d93deef3c8745c837ab63e80abd27': { name: 'oneinch: GovLeftoverExchanger',   category: 'aggregator' },
  '0xdef171fe48cf0115b1d80b88dc8eab59176fee57': { name: 'paraswap: AugustusSwapper6.0',    category: 'aggregator' },
  '0xdef1c0ded9bec7f1a1670819833240f027b25eff': { name: 'zeroex: ExchangeProxy',           category: 'aggregator' },
  '0xe66b31678d6c16e9ebf358268a790b763c133750': { name: 'zeroex: ZeroExProxy',             category: 'aggregator' },
  '0xe7351fd770a37282b91d153ee690b63579d6dd7f': { name: 'debridge: DlnDestination',        category: 'aggregator' },
  '0xf3de3c0d654fda23dad170f0f320a92172509127': { name: 'okx: DexRouter',                  category: 'aggregator' },
  '0xfc99f58a8974a4bc36e60e2d490bb8d72899ee9f': { name: 'okx: BridgeRouter',               category: 'aggregator' },
  '0xfe837a3530dd566401d35befcd55582af7c4dffc': { name: 'dodo: DODOFeeRouteProxy',         category: 'aggregator' },

  // intent venues (added manually — not in user's Dune export)
  '0x9008d19f58aabd9ed0d60971565aa8510560ab41': { name: 'cowswap: GPv2Settlement',         category: 'intent' },

  // Balancer direct routers
  '0x136f1efcc3f8f88516b9e94110d56fdbfb1778d1': { name: 'balancer_v3: BatchRouter',        category: 'direct' },
  '0x3e66b66fd1d0b02fda6c811da9e0547970db2f21': { name: 'balancer_v2: ExchangeProxy',      category: 'direct' },
  '0x5c6fb490bdfd3246eb0bb062c168decaf4bd9fdd': { name: 'balancer_v3: Router',             category: 'direct' },
  '0xae563e3f8219521950555f5962419c8919758ea2': { name: 'balancer_v3: Router',             category: 'direct' },
  '0xba12222222228d8ba445958a75a0704d566bf2c8': { name: 'balancer_v2: Vault',              category: 'direct' },

  // MEV bots
  '0x000000000035b5e5ad9019092c665357240f594e': { name: 'MEV bot 0x0000…594E',             category: 'mev_bot' },
  '0x00c21ca82d94dade0d5d1ed420a4728f58427d21': { name: 'MEV bot 0x00C2…7D21',             category: 'mev_bot' },
  '0x01fdc48ba0903bb1ae7c517c9287d88ea236f8e1': { name: 'MEV bot 0x01FD…F8E1',             category: 'mev_bot' },
  '0x1f2f10d1c40777ae1da742455c65828ff36df387': { name: 'jaredfromsubway #2',              category: 'mev_bot' },
  '0xa0f1c3ad83e07d97b5e7030e177718be175275ea': { name: 'MEV-funded EOA 0xA0F1…75EA',      category: 'mev_bot' },
  '0xd8349e874934593c85eafa8e534b495d80848e41': { name: 'MEV-interacting EOA 0xD834…8E41', category: 'mev_bot' },
  '0xe00456d3af6e9b8715a9c29c88c1932983e064c1': { name: 'MEV-funded EOA 0xE004…64C1',      category: 'mev_bot' },
}

// ---------- GraphQL ----------

// We embed the query inline so the script is self-contained — note the added
// `sender` selection on both swap fragments (not in the deployed query yet).
const QUERY = /* GraphQL */ `
  query Probe($first: Int!, $skip: Int!, $poolId: String!, $chainIn: [GqlChain!]!) {
    poolEvents(
      first: $first
      skip: $skip
      where: { poolId: $poolId, chainIn: $chainIn, type: SWAP }
    ) {
      id
      timestamp
      tx
      valueUSD
      userAddress
      __typename
      ... on GqlPoolSwapEventV3 {
        sender
        tokenIn { address amount }
        tokenOut { address amount }
      }
      ... on GqlPoolSwapEventCowAmm {
        sender
        tokenIn { address amount valueUSD }
        tokenOut { address amount valueUSD }
      }
    }
  }
`

async function gql(query, variables) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`)
  const json = await res.json()
  if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors, null, 2)}`)
  return json.data
}

async function fetchSwaps() {
  const cutoff = Math.floor(Date.now() / 1000) - DAYS * 86400
  const swaps = []
  let skip = 0
  while (swaps.length < HARD_CAP) {
    const { poolEvents } = await gql(QUERY, {
      first: PAGE_SIZE,
      skip,
      poolId: POOL,
      chainIn: [CHAIN],
    })
    if (!poolEvents || poolEvents.length === 0) break
    let pageOldest = Infinity
    for (const ev of poolEvents) {
      pageOldest = Math.min(pageOldest, ev.timestamp)
      if (ev.timestamp >= cutoff) swaps.push(ev)
    }
    process.stderr.write(`  fetched ${swaps.length} (oldest in page: ${new Date(pageOldest * 1000).toISOString()})\n`)
    if (pageOldest < cutoff) break
    skip += PAGE_SIZE
  }
  return swaps
}

// ---------- Aggregations ----------

function tally(swaps, field) {
  const m = new Map()
  for (const s of swaps) {
    const k = (s[field] || '0x').toLowerCase()
    const cur = m.get(k) ?? { count: 0, usd: 0, partners: new Map() }
    cur.count += 1
    cur.usd += s.valueUSD || 0
    m.set(k, cur)
  }
  return m
}

function tallyCross(swaps, primary, secondary) {
  // For each primary value, distribution of secondary values.
  const m = new Map()
  for (const s of swaps) {
    const p = (s[primary] || '0x').toLowerCase()
    const q = (s[secondary] || '0x').toLowerCase()
    if (!m.has(p)) m.set(p, new Map())
    const inner = m.get(p)
    const cur = inner.get(q) ?? { count: 0, usd: 0 }
    cur.count += 1
    cur.usd += s.valueUSD || 0
    inner.set(q, cur)
  }
  return m
}

function labelOf(addr) {
  return LABELS[addr.toLowerCase()] ?? { name: '(unlabeled)', category: 'unknown' }
}

function fmtUsd(x) {
  if (x >= 1e6) return `$${(x / 1e6).toFixed(2)}M`
  if (x >= 1e3) return `$${(x / 1e3).toFixed(1)}k`
  return `$${x.toFixed(0)}`
}

function topN(m, n) {
  return [...m.entries()].sort((a, b) => b[1].usd - a[1].usd).slice(0, n)
}

// ---------- Report ----------

function report(swaps) {
  const totalUsd = swaps.reduce((a, s) => a + (s.valueUSD || 0), 0)
  const senders   = tally(swaps, 'sender')
  const users     = tally(swaps, 'userAddress')
  const senderToUsers = tallyCross(swaps, 'sender', 'userAddress')
  const userToSenders = tallyCross(swaps, 'userAddress', 'sender')

  const labeledBySender = swaps.reduce(
    (a, s) => a + (LABELS[(s.sender || '').toLowerCase()] ? (s.valueUSD || 0) : 0), 0)
  const labeledByUser = swaps.reduce(
    (a, s) => a + (LABELS[(s.userAddress || '').toLowerCase()] ? (s.valueUSD || 0) : 0), 0)
  const labeledByEither = swaps.reduce(
    (a, s) => {
      const hit = LABELS[(s.sender || '').toLowerCase()] || LABELS[(s.userAddress || '').toLowerCase()]
      return a + (hit ? (s.valueUSD || 0) : 0)
    }, 0)

  const cowAmmCount = swaps.filter(s => s.__typename === 'GqlPoolSwapEventCowAmm').length

  console.log()
  console.log('='.repeat(80))
  console.log(`Pool:    ${POOL}`)
  console.log(`Chain:   ${CHAIN}`)
  console.log(`Window:  last ${DAYS} day(s)`)
  console.log(`Swaps:   ${swaps.length}  (CowAmm typename: ${cowAmmCount})`)
  console.log(`Volume:  ${fmtUsd(totalUsd)}`)
  console.log(`Distinct senders:      ${senders.size}`)
  console.log(`Distinct userAddress:  ${users.size}`)
  console.log('='.repeat(80))

  console.log('\nLabel coverage (USD share of total volume):')
  console.log(`  by sender:      ${(labeledBySender / totalUsd * 100).toFixed(1)}%`)
  console.log(`  by userAddress: ${(labeledByUser / totalUsd * 100).toFixed(1)}%`)
  console.log(`  by either:      ${(labeledByEither / totalUsd * 100).toFixed(1)}%`)

  console.log('\nTop 20 by `sender` (USD volume desc):')
  console.log('  ' + 'addr'.padEnd(44) + 'usd'.padStart(10) + '  ' + 'pct'.padStart(6)
    + '  ' + 'cnt'.padStart(5) + '  ' + 'uniq_users'.padStart(11) + '  label')
  for (const [addr, v] of topN(senders, 20)) {
    const uniqUsers = senderToUsers.get(addr)?.size ?? 0
    const lab = labelOf(addr)
    const pct = (v.usd / totalUsd * 100).toFixed(1) + '%'
    console.log('  ' + addr.padEnd(44)
      + fmtUsd(v.usd).padStart(10)
      + '  ' + pct.padStart(6)
      + '  ' + String(v.count).padStart(5)
      + '  ' + String(uniqUsers).padStart(11)
      + `  [${lab.category}] ${lab.name}`)
  }

  console.log('\nTop 20 by `userAddress` (USD volume desc):')
  console.log('  ' + 'addr'.padEnd(44) + 'usd'.padStart(10) + '  ' + 'pct'.padStart(6)
    + '  ' + 'cnt'.padStart(5) + '  ' + 'uniq_senders'.padStart(13) + '  label')
  for (const [addr, v] of topN(users, 20)) {
    const uniqSenders = userToSenders.get(addr)?.size ?? 0
    const lab = labelOf(addr)
    const pct = (v.usd / totalUsd * 100).toFixed(1) + '%'
    console.log('  ' + addr.padEnd(44)
      + fmtUsd(v.usd).padStart(10)
      + '  ' + pct.padStart(6)
      + '  ' + String(v.count).padStart(5)
      + '  ' + String(uniqSenders).padStart(13)
      + `  [${lab.category}] ${lab.name}`)
  }

  console.log('\nSender vs userAddress cross-table (top 10 senders × their top userAddress):')
  for (const [sAddr, sStats] of topN(senders, 10)) {
    const sLab = labelOf(sAddr)
    console.log(`  ${sAddr}  ${fmtUsd(sStats.usd).padStart(10)}  [${sLab.category}] ${sLab.name}`)
    const innerTop = [...senderToUsers.get(sAddr).entries()].sort((a, b) => b[1].usd - a[1].usd).slice(0, 5)
    for (const [uAddr, v] of innerTop) {
      const uLab = labelOf(uAddr)
      console.log(`      └─ user ${uAddr}  ${fmtUsd(v.usd).padStart(10)}  (${v.count} swaps)  [${uLab.category}] ${uLab.name}`)
    }
  }

  console.log('\n(Cascade order to validate: if a row above shows sender=[unknown] but userAddress=[known aggregator],')
  console.log(' the userAddress-first cascade wins. If most rows show sender=[direct balancer] with diverse')
  console.log(' userAddress values, then sender alone is uninformative and userAddress should be primary.)')
  console.log()
}

(async () => {
  console.error(`Probing ${POOL} on ${CHAIN}, last ${DAYS} day(s)…`)
  const swaps = await fetchSwaps()
  if (swaps.length === 0) {
    console.error('No swaps returned. Check pool id and chain.')
    process.exit(1)
  }
  report(swaps)
})().catch(err => {
  console.error('FAILED:', err.message)
  process.exit(1)
})
