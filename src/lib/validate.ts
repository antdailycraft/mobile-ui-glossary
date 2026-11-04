import { CATEGORIES, PLATFORMS, type ComponentMeta } from './types'

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === 'string')

/**
 * frontmatter 한 건을 검증한다.
 * 런타임 검증 라이브러리를 쓰지 않는 대신, 잘못된 필드를 모두 모아 사람이 읽을 수 있는 메시지로 돌려준다.
 */
export function validateMeta(raw: unknown, fileId: string): { meta?: ComponentMeta; errors: string[] } {
  const errors: string[] = []
  if (typeof raw !== 'object' || raw === null) {
    return { errors: [`${fileId}.mdx: frontmatter가 없습니다.`] }
  }
  const r = raw as Record<string, unknown>
  const err = (msg: string) => errors.push(`${fileId}.mdx: ${msg}`)

  if (typeof r.id !== 'string' || !ID_PATTERN.test(r.id)) err('id는 kebab-case 문자열이어야 합니다.')
  else if (r.id !== fileId) err(`id(${r.id})가 파일명(${fileId})과 다릅니다.`)
  if (typeof r.name !== 'string' || !r.name.trim()) err('name이 비어 있습니다.')
  if (!isStringArray(r.aliases)) err('aliases는 문자열 배열이어야 합니다.')
  if (typeof r.category !== 'string' || !(CATEGORIES as readonly string[]).includes(r.category))
    err(`category는 ${CATEGORIES.join(', ')} 중 하나여야 합니다.`)
  if (!isStringArray(r.platforms) || !r.platforms.every((p) => (PLATFORMS as readonly string[]).includes(p)))
    err(`platforms는 ${PLATFORMS.join(', ')} 값으로 이루어진 배열이어야 합니다.`)
  if (typeof r.summary !== 'string' || !r.summary.trim()) err('summary가 비어 있습니다.')
  if (!isStringArray(r.related)) err('related는 컴포넌트 id 배열이어야 합니다.')
  if (typeof r.demo !== 'string' || !r.demo.trim()) err('demo가 비어 있습니다.')

  return errors.length ? { errors } : { meta: r as unknown as ComponentMeta, errors }
}

/** 컴포넌트 사이의 참조(related, demo)가 실제로 존재하는지 검사한다. */
export function validateReferences(metas: ComponentMeta[], demoNames: string[]): string[] {
  const ids = new Set(metas.map((m) => m.id))
  const demos = new Set(demoNames)
  const errors: string[] = []
  for (const m of metas) {
    for (const rel of m.related) {
      if (!ids.has(rel)) errors.push(`${m.id}.mdx: related에 없는 id "${rel}"가 있습니다.`)
    }
    if (!demos.has(m.demo)) errors.push(`${m.id}.mdx: src/demos/${m.demo}.tsx 파일이 없습니다.`)
  }
  return errors
}
