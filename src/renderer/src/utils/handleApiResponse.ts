type ErrorResponse = { error: string }

function isErrorResponse<T>(response: T | ErrorResponse): response is ErrorResponse {
  return (response as ErrorResponse).error !== undefined
}

export function handleApiResponse<T>(
  response: T | ErrorResponse,
  onSuccess: (data: T) => void
): void {
  if (isErrorResponse(response)) {
    console.error('API error:', response.error)
  } else {
    onSuccess(response)
  }
}
