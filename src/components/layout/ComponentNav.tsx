import { useId, type KeyboardEvent, type Ref } from 'react'
import { groupByCategory } from '../../lib/content'
import { CATEGORY_LABELS, CATEGORY_LABELS_EN, type ComponentEntry } from '../../lib/types'

interface Props {
  items: readonly ComponentEntry[]
  query: string
  filtering: boolean
  currentId: string
  onSelect: () => void
  activeItemRef: Ref<HTMLAnchorElement>
  listRef: Ref<HTMLElement>
}

/**
 * 컴포넌트 목록. 데스크톱 사이드바에서도 그대로 재사용할 수 있게 드로어와 분리해 두었다.
 * 각 항목은 해시 링크(<a href="#id">)라서 새 탭 열기·링크 복사 같은 브라우저 기본 동작이 그대로 된다.
 */
export function ComponentNav({ items, query, filtering, currentId, onSelect, activeItemRef, listRef }: Props) {
  // 카테고리 제목 id가 드로어·사이드바 사이에서 겹치지 않도록 인스턴스마다 접두어를 둔다.
  const idPrefix = useId()
  // 위·아래 화살표, Home/End로 항목 사이를 이동한다. Tab 순서는 그대로 두어 일반 링크 목록처럼 동작한다.
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    const links = [...e.currentTarget.querySelectorAll<HTMLAnchorElement>('a[href]')]
    const i = links.indexOf(document.activeElement as HTMLAnchorElement)
    const go = (n: number) => {
      e.preventDefault()
      links[(n + links.length) % links.length]?.focus()
    }
    if (e.key === 'ArrowDown') go(i + 1)
    else if (e.key === 'ArrowUp') go(i < 0 ? links.length - 1 : i - 1)
    else if (e.key === 'Home') go(0)
    else if (e.key === 'End') go(links.length - 1)
  }

  const renderItem = (c: ComponentEntry) => {
    const active = c.id === currentId
    return (
      <li key={c.id}>
        <a
          href={`#${c.id}`}
          ref={active ? activeItemRef : undefined}
          aria-current={active ? 'page' : undefined}
          onClick={onSelect}
          className={`state-layer flex min-h-14 items-center rounded-full px-4 text-label-lg ${
            active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant'
          }`}
        >
          {c.name}
        </a>
      </li>
    )
  }

  if (filtering && items.length === 0) {
    return (
      <p className="wrap-anywhere px-7 py-6 text-body-md text-on-surface-variant">
        {query.trim() ? `‘${query}’에 해당하는 컴포넌트가 없습니다.` : '선택한 조건에 맞는 컴포넌트가 없습니다.'}
        <br />
        다른 검색어를 입력하거나 카테고리·플랫폼 조건을 바꿔 보세요.
      </p>
    )
  }

  return (
    <nav ref={listRef} aria-label="컴포넌트" onKeyDown={onKeyDown} className="px-3 pb-4">
      {filtering ? (
        <>
          <h2 className="px-4 pb-2 pt-3 text-title-sm text-on-surface-variant">검색 결과 {items.length}개</h2>
          <ul>{items.map(renderItem)}</ul>
        </>
      ) : (
        groupByCategory(items).map((group, idx) => (
          <section key={group.category} aria-labelledby={`${idPrefix}-${group.category}`}>
            {idx > 0 && <hr className="mx-4 my-2 border-outline-variant" />}
            {/* 카테고리 제목은 누를 수 없는 묶음 이름이다. 항목(링크)과 헷갈리지 않도록
                작은 대문자 영문과 항목 개수를 붙여 "제목"처럼 보이게 한다.
                좁은 사이드바에서 줄이 넘치면 단어 중간이 아니라 한국어와 영문 사이에서 나뉘도록 각각 nowrap으로 묶는다. */}
            <h2
              id={`${idPrefix}-${group.category}`}
              className="flex items-start gap-2 px-4 pb-2 pt-4 text-label-md text-on-surface-variant"
            >
              <span className="min-w-0 flex-1">
                <span className="whitespace-nowrap">{CATEGORY_LABELS[group.category]}</span>{' '}
                <span aria-hidden="true">·</span>{' '}
                <span className="whitespace-nowrap uppercase tracking-wider">{CATEGORY_LABELS_EN[group.category]}</span>
              </span>
              <span className="shrink-0 rounded-full bg-surface-container-highest px-2 py-0.5 tabular-nums">
                {group.items.length}
                <span className="sr-only">개</span>
              </span>
            </h2>
            <ul>{group.items.map(renderItem)}</ul>
          </section>
        ))
      )}
    </nav>
  )
}
