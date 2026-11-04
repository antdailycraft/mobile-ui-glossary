import { demoNames } from './demos'
import { CATEGORIES, type Category, type ComponentEntry, type ComponentMeta } from './types'
import { validateMeta, validateReferences } from './validate'

type MdxModule = { frontmatter: unknown; default: ComponentEntry['Body'] }

// 콘텐츠 파일은 작아서 한 번에 번들에 포함한다(eager). 검색과 목록에 frontmatter가 즉시 필요하기 때문이다.
const modules = import.meta.glob<MdxModule>('../content/components/*.mdx', { eager: true })

const fileIdOf = (path: string) => path.slice(path.lastIndexOf('/') + 1).replace(/\.mdx$/, '')

function load(): { entries: ComponentEntry[]; errors: string[] } {
  const entries: ComponentEntry[] = []
  const errors: string[] = []
  for (const [path, mod] of Object.entries(modules)) {
    const { meta, errors: e } = validateMeta(mod.frontmatter, fileIdOf(path))
    errors.push(...e)
    if (meta) entries.push({ ...meta, Body: mod.default })
  }
  errors.push(...validateReferences(entries, demoNames))
  entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))
  return { entries, errors }
}

const loaded = load()

export const components: readonly ComponentEntry[] = loaded.entries
export const contentErrors: readonly string[] = loaded.errors

const byId = new Map(components.map((c) => [c.id, c]))

export const getComponent = (id: string): ComponentEntry | undefined => byId.get(id)

export interface CategoryGroup<T extends ComponentMeta = ComponentEntry> {
  category: Category
  items: T[]
}

/** 카테고리 순서(CATEGORIES)대로 묶는다. 항목이 없는 카테고리는 뺀다. */
export function groupByCategory<T extends ComponentMeta>(items: readonly T[]): CategoryGroup<T>[] {
  return CATEGORIES.map((category) => ({ category, items: items.filter((i) => i.category === category) })).filter(
    (g) => g.items.length > 0,
  )
}
