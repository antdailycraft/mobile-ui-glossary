import { useId, useImperativeHandle, useMemo, useRef, useState, type KeyboardEvent, type ReactNode, type Ref } from 'react'
import { Icon } from '../Icon'
import { ComponentNav } from './ComponentNav'
import { SearchField } from './SearchField'
import { normalize, searchComponents } from '../../lib/search'
import { CATEGORIES, CATEGORY_LABELS, PLATFORMS, PLATFORM_LABELS, type Category, type ComponentEntry, type Platform } from '../../lib/types'

interface Props {
  /** 패널 맨 위 줄(앱 제목과 버튼). 드로어와 사이드바가 서로 다른 버튼을 둔다. */
  header: ReactNode
  items: readonly ComponentEntry[]
  currentId: string
  onNavigate: (id: string) => void
  /** 항목을 고른 직후 호출한다. 드로어는 여기서 스스로 닫는다. */
  onSelect?: () => void
  /**
   * 고른 뒤 검색어와 필터를 지울지 여부.
   * 드로어는 닫히므로 지우고, 사이드바는 검색 결과를 차례로 훑어볼 수 있게 남겨 둔다.
   */
  clearOnSelect?: boolean
  activeItemRef: Ref<HTMLAnchorElement>
  inputRef?: Ref<HTMLInputElement>
}

/** 검색창과 컴포넌트 목록. 모바일 드로어와 데스크톱 사이드바가 같은 패널을 공유한다. */
export function NavPanel({ header, items, currentId, onNavigate, onSelect, clearOnSelect, activeItemRef, inputRef }: Props) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filterId = useId()
  const filterButton = useRef<HTMLButtonElement>(null)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<Category | ''>('')
  const [platform, setPlatform] = useState<Platform | ''>('')
  const searchRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(inputRef, () => searchRef.current!, [])
  const listRef = useRef<HTMLElement>(null)
  const results = useMemo(() => searchComponents(items, query, {
    category: category || undefined,
    platform: platform || undefined,
  }), [items, query, category, platform])
  const filterCount = Number(Boolean(category)) + Number(Boolean(platform))
  const filtering = Boolean(normalize(query) || category || platform)

  const reset = () => {
    setQuery('')
    setCategory('')
    setPlatform('')
  }

  const select = () => {
    if (clearOnSelect) {
      reset()
      setFiltersOpen(false)
    }
    onSelect?.()
  }

  // 검색창에서 Enter는 첫 번째 결과로 이동, 아래 화살표는 결과 목록으로 포커스를 옮긴다.
  const onSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    // 한글 조합 확정 키를 탐색으로 처리하지 않는다. 229는 일부 브라우저의 조합 이벤트다.
    if (e.nativeEvent.isComposing || e.nativeEvent.keyCode === 229) return
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
      <div className="flex shrink-0 items-center gap-2 px-3 pb-2">
        <SearchField
          value={query}
          onChange={setQuery}
          onKeyDown={onSearchKeyDown}
          resultCount={results.length}
          inputRef={searchRef}
          filtering={filtering}
        />
        <button
          ref={filterButton}
          type="button"
          aria-label={filterCount > 0 ? `필터 ${filterCount}` : '필터'}
          title="필터"
          aria-expanded={filtersOpen}
          aria-controls={filterId}
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`state-layer inline-flex size-11 shrink-0 items-center justify-center rounded-lg ${
            filtersOpen || filterCount > 0 ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant'
          }`}
        >
          <Icon name="filterList" className="size-5" />
          {filterCount > 0 && (
            <span aria-hidden="true" className="absolute end-0.5 top-0.5 min-w-4 rounded-full bg-primary px-1 text-center text-label-md text-on-primary">
              {filterCount}
            </span>
          )}
        </button>
      </div>
      <div hidden={!filtersOpen && filterCount === 0} className="shrink-0 px-3 pb-2">
        {filterCount > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {[
              { name: category ? CATEGORY_LABELS[category] : '', clear: () => setCategory('') },
              { name: platform ? PLATFORM_LABELS[platform] : '', clear: () => setPlatform('') },
            ].filter(({ name }) => name).map(({ name, clear }) => (
              <button
                key={name}
                type="button"
                aria-label={`${name} 필터 해제`}
                onClick={() => {
                  clear()
                  filterButton.current?.focus()
                }}
                className="state-layer inline-flex min-h-11 items-center gap-1 rounded-full bg-secondary-container px-3 text-label-md text-on-secondary-container"
              >
                {name}
                <Icon name="close" className="size-4" />
              </button>
            ))}
          </div>
        )}
        <div id={filterId} hidden={!filtersOpen} className="space-y-2 border-t border-outline-variant pt-2">
          <label className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-2 text-body-md text-on-surface-variant">
            카테고리
            <span className="relative min-w-0">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category | '')}
                className="nav-field w-full appearance-none rounded-lg border border-outline bg-surface-container-low ps-2 pe-9 text-on-surface forced-colors:appearance-auto forced-colors:pe-2"
              >
                <option value="">전체</option>
                {CATEGORIES.map((value) => <option key={value} value={value}>{CATEGORY_LABELS[value]}</option>)}
              </select>
              <Icon name="expandMore" className="pointer-events-none absolute end-3 top-1/2 size-5 -translate-y-1/2 forced-colors:hidden" />
            </span>
          </label>
          <label className="grid grid-cols-[4rem_minmax(0,1fr)] items-center gap-2 text-body-md text-on-surface-variant">
            플랫폼
            <span className="relative min-w-0">
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform | '')}
                className="nav-field w-full appearance-none rounded-lg border border-outline bg-surface-container-low ps-2 pe-9 text-on-surface forced-colors:appearance-auto forced-colors:pe-2"
              >
                <option value="">전체</option>
                {PLATFORMS.map((value) => <option key={value} value={value}>{PLATFORM_LABELS[value]}</option>)}
              </select>
              <Icon name="expandMore" className="pointer-events-none absolute end-3 top-1/2 size-5 -translate-y-1/2 forced-colors:hidden" />
            </span>
          </label>
          {filtering && (
            <button
              type="button"
              onClick={() => { reset(); searchRef.current?.focus() }}
              className="state-layer mt-1 min-h-11 rounded-lg px-3 text-label-lg text-primary"
            >
              검색 조건 초기화
            </button>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-[env(safe-area-inset-bottom)]">
        <ComponentNav
          items={results}
          query={query}
          filtering={filtering}
          currentId={currentId}
          onSelect={select}
          activeItemRef={activeItemRef}
          listRef={listRef}
        />
      </div>
    </>
  )
}
