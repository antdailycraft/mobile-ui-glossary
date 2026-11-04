import type { ComponentMeta } from './types'

/** 대소문자, 공백, 하이픈, 밑줄 차이를 무시한다. "bottomsheet", "Bottom-Sheet" 모두 같은 검색어로 본다. */
export const normalize = (s: string) => s.toLowerCase().replace(/[\s\-_/·]+/g, '')

/**
 * 이름 → 별칭 → 요약 순으로 가중치를 두어 정렬한다.
 * 항목 수가 수십 개 수준이라 색인 없이 매번 전체를 훑어도 충분히 빠르다.
 */
export function searchComponents<T extends ComponentMeta>(items: readonly T[], query: string): T[] {
  const q = normalize(query)
  if (!q) return [...items]

  const scored: { item: T; score: number }[] = []
  for (const item of items) {
    const name = normalize(item.name)
    let score = -1
    if (name.startsWith(q)) score = 0
    else if (name.includes(q)) score = 1
    else if (item.aliases.some((a) => normalize(a).includes(q)) || normalize(item.id).includes(q)) score = 2
    else if (normalize(item.summary).includes(q)) score = 3
    if (score >= 0) scored.push({ item, score })
  }
  return scored.sort((a, b) => a.score - b.score || a.item.name.localeCompare(b.item.name, 'en')).map((s) => s.item)
}
