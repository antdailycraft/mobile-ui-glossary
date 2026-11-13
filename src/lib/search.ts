import type { Category, ComponentMeta, Platform } from './types'

/** 대소문자, 유니코드 조합, 공백, 하이픈, 밑줄 차이를 무시한다. */
export const normalize = (s: string) => s.normalize('NFC').toLowerCase().replace(/[\s\-_/·]+/g, '')

export interface SearchFilters {
  category?: Category
  platform?: Platform
}

/**
 * 이름 → 별칭 → 요약 순으로 정렬하고, 연속 일치가 없으면 모든 검색 단어가 있는지 확인한다.
 * 필터와 검색어를 함께 적용한다. 검색어가 없으면 기존 카테고리별 목록 순서를 유지한다.
 */
export function searchComponents<T extends ComponentMeta>(items: readonly T[], query: string, filters: SearchFilters = {}): T[] {
  const filtered = items.filter((item) =>
    (!filters.category || item.category === filters.category) &&
    (!filters.platform || item.platforms.includes(filters.platform)),
  )
  const q = normalize(query)
  if (!q) return filtered
  const tokens = query.trim().split(/\s+/).map(normalize).filter(Boolean)

  const scored: { item: T; score: number }[] = []
  for (const item of filtered) {
    const name = normalize(item.name)
    const aliases = [...item.aliases, item.id].map(normalize)
    const summary = normalize(item.summary)
    const fields = [name, ...aliases, summary]
    let score = -1
    if (name.startsWith(q)) score = 0
    else if (name.includes(q)) score = 1
    else if (aliases.some((a) => a.includes(q))) score = 2
    else if (summary.includes(q)) score = 3
    else if (tokens.every((token) => fields.some((field) => field.includes(token)))) score = 4
    if (score >= 0) scored.push({ item, score })
  }
  return scored.sort((a, b) => a.score - b.score || a.item.name.localeCompare(b.item.name, 'en')).map((s) => s.item)
}
