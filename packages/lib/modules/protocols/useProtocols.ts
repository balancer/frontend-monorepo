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
}

export const protocolIconPaths: Record<Protocol, string> = {
  [Protocol.Aave]: '/images/icons/protocols/aave.svg',
  [Protocol.Agave]: '/images/icons/protocols/agave.png',

  /* For now we only use these icons (Aura and Balancer)*/
  [Protocol.Aura]: '/images/protocols/aura.svg',
  [Protocol.Balancer]: '/images/protocols/balancer.svg',

  [Protocol.Beefy]: '/images/icons/protocols/beefy.svg',
  [Protocol.Euler]: '/images/icons/protocols/euler.svg',
  [Protocol.Yearn]: '/images/icons/protocols/yearn.svg',
  [Protocol.Gearbox]: '/images/icons/protocols/gearbox.svg',
  [Protocol.Idle]: '/images/icons/protocols/idle.svg',
  [Protocol.Morpho]: '/images/icons/protocols/morpho.svg',
  [Protocol.Tessera]: '/images/icons/protocols/tessera.svg',
  [Protocol.Sturdy]: '/images/icons/protocols/sturdy.png',
  [Protocol.Reaper]: '/images/icons/protocols/reaper.svg',
  [Protocol.Granary]: '/images/icons/protocols/granary.svg',
  [Protocol.Tetu]: '/images/icons/protocols/tetu.png',
  [Protocol.Zerovix]: '/images/icons/protocols/0vix.svg',
  [Protocol.Gyro]: '/images/icons/protocols/gyro.png',
}
