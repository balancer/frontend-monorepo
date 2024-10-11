export enum SignatureState {
  Ready = 'init',
  Confirming = 'confirming',
  Preparing = 'preparing',
  Completed = 'completed',
}

export function isSignatureDisabled(signatureState: SignatureState) {
  return signatureState === SignatureState.Confirming || signatureState === SignatureState.Completed
}

export function isSignatureLoading(signatureState: SignatureState) {
  return signatureState === SignatureState.Confirming || signatureState === SignatureState.Preparing
}
