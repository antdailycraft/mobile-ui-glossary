import { useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from 'react'
import { ComponentNav } from './ComponentNav'
import { SearchField } from './SearchField'
import { searchComponents } from '../../lib/search'
import type { ComponentEntry } from '../../lib/types'

interface Props {
  /** 패널 맨 위 줄(앱 제목과 버튼). 드로어와 사이드바가 서로 다른 버튼을 둔다. */
  header: ReactNode
  items: readonly ComponentEntry[]
  currentId: string
  onNavigate: (id: string) => void
  /** 항목을 고른 직후 호출한다. 드로어는 여기서 스스로 닫는다. */
  onSelect?: () => void
  /**
   * 고른 뒤 검색어를 지울지 여부.
   * 드로어는 닫히므로 지우고, 사이드바는 검색 결과를 차례로 훑어볼 수 있게 남겨 둔다.
   */
  clearOnSelect?: boolean
  activeItemRef: Ref<HTMLAnchorElement>
  inputRef?: Ref<HTMLInputElement>
}

/** 검색창과 컴포넌트 목록. 모바일 드로어와 데스크톱 사이드바가 같은 패널을 공유한다. */
export function NavPanel({ header, items, currentId, onNavigate, onSelect, clearOnSelect, activeItemRef, inputRef }: Props) {
  const [query, setQuery] = useState('')
  const listRef = useRef<HTMLElement>(null)
  const results = useMemo(() => searchComponents(items, query), [items, query])

  const select = () => {
    if (clearOnSelect) setQuery('')
    onSelect?.()
  }

  // 검색창에서 Enter는 첫 번째 결과로 이동, 아래 화살표는 결과 목록으로 포커스를 옮긴다.
  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && results[0]) {
      e.preventDefault()
      onNavigate(results[0].id)
      select()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      listRef.current?.querySelector<HTMLAnchorElement>('a[href]')?.focus()
    }
  }

  return (
    <>
      {header}
      <SearchField
        value={query}
        onChange={setQuery}
        onKeyDown={onSearchKeyDown}
        resultCount={results.length}
        inputRef={inputRef}
      />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
        <ComponentNav
          items={results}
          query={query}
          currentId={currentId}
          onSelect={select}
          activeItemRef={activeItemRef}
          listRef={listRef}
        />
      </div>
    </>
  )
}
