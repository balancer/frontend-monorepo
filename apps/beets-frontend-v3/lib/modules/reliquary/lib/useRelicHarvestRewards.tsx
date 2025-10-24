// Stub hook for harvest rewards
export function useRelicHarvestRewards() {
  const harvest = async () => {
    console.log('Harvest rewards - not implemented')
  }

  return {
    harvest,
    isPending: false,
    isSubmitting: false,
    submitError: null,
  }
}
