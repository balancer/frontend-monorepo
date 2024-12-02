/* eslint-disable max-len */
export enum Protocol {
  Aave = 'aave',
  Aura = 'aura',
  Agave = 'agave',
  Balancer = 'balancer',
  Beefy = 'beefy',
  Euler = 'euler',
  Yearn = 'yearn',
  Gearbox = 'gearbox',
  Idle = 'idle',
  Morpho = 'morpho',
  Tessera = 'tessera',
  Sturdy = 'sturdy',
  Reaper = 'reaper',
  Tetu = 'tetu',
  Granary = 'granary',
  Zerovix = '0vix',
  Gyro = 'gyro',
  CowAmm = 'cow-amm',
  Xave = 'xave',
  Fjord = 'fjord',
}

export const protocolIconPaths: Record<Protocol, string> = {
  [Protocol.Aura]: '/images/protocols/aura.svg',
  [Protocol.Balancer]: '/images/protocols/balancer.svg',
  [Protocol.Gyro]: '/images/protocols/gyro.png',
  [Protocol.Fjord]: '/images/protocols/fjord.png',
  [Protocol.CowAmm]: '/images/protocols/cowamm.png',
  [Protocol.Xave]: '/images/protocols/xave.png',
  [Protocol.Aave]: '/images/protocols/aave.svg',
  /* Icons below are yet unused */
  [Protocol.Agave]: '/images/protocols/agave.png',
  [Protocol.Beefy]: '/images/protocols/beefy.svg',
  [Protocol.Euler]: '/images/protocols/euler.svg',
  [Protocol.Yearn]: '/images/protocols/yearn.svg',
  [Protocol.Gearbox]: '/images/protocols/gearbox.svg',
  [Protocol.Idle]: '/images/protocols/idle.svg',
  [Protocol.Morpho]: '/images/protocols/morpho.svg',
  [Protocol.Tessera]: '/images/protocols/tessera.svg',
  [Protocol.Sturdy]: '/images/protocols/sturdy.png',
  [Protocol.Reaper]: '/images/protocols/reaper.svg',
  [Protocol.Granary]: '/images/protocols/granary.svg',
  [Protocol.Tetu]: '/images/protocols/tetu.png',
  [Protocol.Zerovix]: '/images/protocols/0vix.svg',
}

export type boostedProtocols = Protocol.Aave

export const protocolDescriptions: Record<boostedProtocols, string> = {
  [Protocol.Aave]:
    "The magic of this Boosted pool lies in its composition—under the hood, it contains wrapped Aave tokens that earn interest from Aave borrowers, continuously growing the pool's worth.",
}
