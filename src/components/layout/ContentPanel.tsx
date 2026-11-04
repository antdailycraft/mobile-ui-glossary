import { mdxComponents } from '../mdx/MdxComponents'
import { DemoHost } from './DemoHost'
import { getComponent } from '../../lib/content'
import { CATEGORY_LABELS, PLATFORM_LABELS, type ComponentEntry } from '../../lib/types'

/** 선택한 컴포넌트 한 건을 보여 준다. 순서: 이름·다른 이름 → 한 줄 정의 → 본문 → 데모 → 관련 컴포넌트 */
export function ContentPanel({ entry }: { entry: ComponentEntry }) {
  const { Body } = entry
  const related = entry.related.map(getComponent).filter((c): c is ComponentEntry => Boolean(c))

  const scrollToDemo = () => {
    document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    document.getElementById('demo-heading')?.focus({ preventScroll: true })
  }

  return (
    <article className="mx-auto max-w-3xl px-4 pb-24 pt-2 md:px-8 lg:pt-10">
      <header>
        <p className="text-label-lg text-primary">{CATEGORY_LABELS[entry.category]}</p>
        <h1 className="mt-1 text-headline-sm">{entry.name}</h1>
        {entry.aliases.length > 0 && (
          <p className="mt-1 text-body-md text-on-surface-variant">
            <span className="sr-only">다른 이름: </span>
            {entry.aliases.join(' / ')}
          </p>
        )}
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="지원 플랫폼">
          {entry.platforms.map((p) => (
            <li
              key={p}
              className="rounded-lg border border-outline-variant px-2 py-1 text-label-md text-on-surface-variant"
            >
              {PLATFORM_LABELS[p]}
            </li>
          ))}
        </ul>
        <p className="mt-5 rounded-2xl bg-primary-container px-5 py-4 text-body-lg text-on-primary-container">
          {entry.summary}
        </p>
        <button
          type="button"
          onClick={scrollToDemo}
          className="state-layer mt-4 inline-flex min-h-11 items-center rounded-lg border border-outline px-4 text-label-lg text-on-surface-variant"
        >
          데모 바로 보기 ↓
        </button>
      </header>

      <Body components={mdxComponents} />

      <DemoHost demo={entry.demo} title={entry.name} />

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-10">
          <h2 id="related-heading" className="mb-3 text-title-lg">
            관련 컴포넌트
          </h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((c) => (
              <li key={c.id}>
                <a
                  href={`#${c.id}`}
                  className="state-layer inline-flex min-h-11 items-center rounded-lg border border-outline px-4 text-label-lg text-on-surface-variant"
                >
                  {c.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  )
}
