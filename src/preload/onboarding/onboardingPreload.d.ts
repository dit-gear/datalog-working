declare global {
  interface Window {
    onboardApi: {
      finishOnboarding: () => void
    }
  }
}
