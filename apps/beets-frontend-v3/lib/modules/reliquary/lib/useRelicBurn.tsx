// Stub hook for burning relics
export function useRelicBurn() {
  const burn = async (relicId: string) => {
    console.log('Burn relic', relicId, '- not implemented')
  }

  return {
    burn,
    isPending: false,
    isSubmitting: false,
    submitError: null,
  }
}
