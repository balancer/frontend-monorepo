import {
  ONE_XP,
  SQRT_1E_NEG_1,
  SQRT_1E_NEG_3,
  SQRT_1E_NEG_5,
  SQRT_1E_NEG_7,
  SQRT_1E_NEG_9,
  SQRT_1E_NEG_11,
  SQRT_1E_NEG_13,
  SQRT_1E_NEG_15,
  SQRT_1E_NEG_17,
} from './constants'

const ONE = BigInt(1e18)

/////////
/// ARITHMETIC HELPERS
/////////

export function mulUp(a: bigint, b: bigint): bigint {
  const product = a * b
  return (product - 1n) / ONE + 1n
}

export function divUp(a: bigint, b: bigint): bigint {
  const aInflated = a * ONE
  return (aInflated - 1n) / b + 1n
}

export function mulDown(a: bigint, b: bigint): bigint {
  const product = a * b
  return product / ONE
}

export function divDown(a: bigint, b: bigint): bigint {
  const aInflated = a * ONE
  return aInflated / b
}

export function mulXpU(a: bigint, b: bigint): bigint {
  return (a * b) / ONE_XP
}

export function divXpU(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new Error('ZERO DIVISION')
  return (a * ONE_XP) / b
}

export function mulDownMagU(a: bigint, b: bigint): bigint {
  return (a * b) / ONE
}

export function divDownMagU(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new Error('ZERO DIVISION')
  return (a * ONE) / b
}

export function mulUpMagU(a: bigint, b: bigint): bigint {
  const product = a * b
  if (product > 0n) return (product - 1n) / ONE + 1n
  else if (product < 0n) return (product + 1n) / ONE - 1n
  else return 0n
}

export function divUpMagU(a: bigint, b: bigint): bigint {
  if (b === 0n) throw new Error('ZERO DIVISION')
  if (b < 0n) {
    b = b * -1n
    a = a * -1n
  }
  if (a === 0n) {
    return 0n
  } else {
    if (a > 0n) return (a * ONE - 1n) / b + 1n
    else return (a * ONE + 1n) / (b - 1n)
  }
}

export function mulUpXpToNpU(a: bigint, b: bigint): bigint {
  const TenPower19 = 10n ** 19n
  const b1 = b / TenPower19
  const b2 = b < 0n ? ((b * -1n) % TenPower19) * -1n : b % TenPower19
  const prod1 = a * b1
  const prod2 = a * b2
  return prod1 <= 0n && prod2 <= 0n
    ? (prod1 + prod2 / TenPower19) / TenPower19
    : (prod1 + prod2 / TenPower19 - 1n) / TenPower19 + 1n
}

export function mulDownXpToNpU(a: bigint, b: bigint): bigint {
  const TenPower19 = 10n ** 19n
  const b1 = b / TenPower19
  const b2 = b < 0n ? ((b * -1n) % TenPower19) * -1n : b % TenPower19
  const prod1 = a * b1
  const prod2 = a * b2
  return prod1 >= 0n && prod2 >= 0n
    ? (prod1 + prod2 / TenPower19) / TenPower19
    : (prod1 + prod2 / TenPower19 + 1n) / TenPower19 - 1n
}

/////////
/// SQUARE ROOT
/////////

export function sqrt(input: bigint, tolerance: bigint): bigint {
  if (input === 0n) {
    return 0n
  }
  let guess = makeInitialGuess(input)

  // 7 iterations
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const i of new Array(7).fill(0)) {
    guess = (guess + (input * ONE) / guess) / 2n
  }

  // Check square is more or less correct (in some epsilon range)
  const guessSquared = (guess * guess) / ONE
  if (
    !(
      guessSquared <= input + mulUp(guess, tolerance) &&
      guessSquared >= input - mulUp(guess, tolerance)
    )
  ) {
    throw new Error('GyroEPool: sqrt failed')
  }

  return guess
}

function makeInitialGuess(input: bigint): bigint {
  if (input >= ONE) {
    return 2n ** BigInt(intLog2Halved(input / ONE)) * ONE
  } else {
    if (input <= 10n) {
      return SQRT_1E_NEG_17
    }
    if (input <= 100n) {
      return 10000000000n
    }
    if (input <= 1000n) {
      return SQRT_1E_NEG_15
    }
    if (input <= 10000n) {
      return 100000000000n
    }
    if (input <= 100000n) {
      return SQRT_1E_NEG_13
    }
    if (input <= 1000000n) {
      return 1000000000000n
    }
    if (input <= 10000000n) {
      return SQRT_1E_NEG_11
    }
    if (input <= 100000000n) {
      return 10000000000000n
    }
    if (input <= 1000000000n) {
      return SQRT_1E_NEG_9
    }
    if (input <= 10000000000n) {
      return 100000000000000n
    }
    if (input <= 100000000000n) {
      return SQRT_1E_NEG_7
    }
    if (input <= 1000000000000n) {
      return 1000000000000000n
    }
    if (input <= 10000000000000n) {
      return SQRT_1E_NEG_5
    }
    if (input <= 100000000000000n) {
      return 10000000000000000n
    }
    if (input <= 1000000000000000n) {
      return SQRT_1E_NEG_3
    }
    if (input <= 10000000000000000n) {
      return 100000000000000000n
    }
    if (input <= 100000000000000000n) {
      return SQRT_1E_NEG_1
    }
    return input
  }
}

function intLog2Halved(x: bigint): number {
  let n = 0

  for (let i = 128; i >= 2; i = i / 2) {
    const factor = 2n ** BigInt(i)
    if (x >= factor) {
      x = x / factor
      n += i / 2
    }
  }

  return n
}
