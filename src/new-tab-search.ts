export type SearchOperations = {
  navigate(url: string): void
  search(text: string): Promise<void>
}

export function directUrlFor(rawInput: string): string | null {
  const query = rawInput.trim()
  const looksLikeUrl = /^(?:https?:\/\/|localhost(?::\d+)?(?:\/|$)|(?:[\w-]+\.)+[a-z]{2,}(?::\d+)?(?:\/|$))/i.test(query)
  if (!looksLikeUrl) return null
  return /^https?:\/\//i.test(query) ? query : `https://${query}`
}

export async function submitNewTabSearch(rawInput: string, operations: SearchOperations): Promise<void> {
  const query = rawInput.trim()
  if (!query) return

  const directUrl = directUrlFor(query)
  if (directUrl) {
    operations.navigate(directUrl)
    return
  }

  await operations.search(query)
}
