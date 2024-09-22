export function parseString(str: string, regex: RegExp | null): string {
  if (!regex || str.length < 1) {
    return str
  }
  // Find the match in the input string
  const match = str.match(regex)

  // If a match is found, return the part after the match
  if (match && match[0]) {
    return match[0] // Return the full match
  }

  // If no match is found, return the original string
  return str
}
