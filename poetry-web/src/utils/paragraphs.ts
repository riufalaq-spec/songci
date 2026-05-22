export function parseParagraphs(raw: string | undefined): string[] {
  if (!raw) return []
  const trimmed = raw.trim()
  // Try JSON array first (e.g. ["line1","line2"])
  if (trimmed.startsWith('[')) {
    try {
      const arr = JSON.parse(trimmed)
      if (Array.isArray(arr)) return arr.filter(Boolean)
    } catch {}
  }
  // Fallback: newline-delimited
  return trimmed.split('\n').filter(Boolean)
}
