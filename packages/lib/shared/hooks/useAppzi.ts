declare global {
  interface Window {
    appzi?: {
      openSurvey: (surveyId: string) => void
    }
  }
}

export function useAppzi() {
  function openNpsModal() {
    if (window?.appzi) {
      window?.appzi.openSurvey('b3c9ca4b-b57c-4c50-bb34-27f4405b3877')
    }
  }

  return { openNpsModal }
}
