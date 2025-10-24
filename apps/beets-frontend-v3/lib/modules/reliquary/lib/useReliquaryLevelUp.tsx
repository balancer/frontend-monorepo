// Stub hook for leveling up relics
export function useReliquaryLevelUp() {
  const levelUp = async (relicId: string) => {
    console.log('Level up relic', relicId, '- not implemented')
  }

  return {
    levelUp,
    isPending: false,
    isSubmitting: false,
    submitError: null,
  }
}
