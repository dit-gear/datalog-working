function passwordGenerator(length = 32): string {
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-='
  const randomValues = new Uint8Array(length)
  window.crypto.getRandomValues(randomValues)
  const password = Array.from(randomValues)
    .map((byte) => charset[byte % charset.length])
    .join('')
  return password
}

export function generatePassword(): Promise<{
  password?: string
  error: boolean
  message?: string
}> {
  const password = passwordGenerator()
  return navigator.clipboard
    .writeText(password)
    .then(() => {
      return { password: password, error: false, message: 'Copied to clipboard!' }
    })
    .catch((error) => {
      if (error instanceof Error) {
        return { error: true, message: error.message }
      }
      return { error: true, message: 'An unknown error occurred' }
    })
}
