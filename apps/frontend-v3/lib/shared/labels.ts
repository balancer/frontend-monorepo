// Common labels used in app, helps keep common text consistent and easy to change.
export const LABELS = {
  walletNotConnected: 'Wallet not connected',
}

// Converts an index to a letter. 0 is A, 1 is B, etc.
export function indexToLetter(index: number): string {
  if (index >= 0 && index <= 25) return String.fromCharCode(index + 65)
  throw new Error('index but be between 0 and 25')
}
