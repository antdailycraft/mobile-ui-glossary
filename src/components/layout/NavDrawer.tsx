import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type RefObject } from 'react'
import { IconButton } from '../IconButton'
import { ComponentNav } from './ComponentNav'
import { SearchField } from './SearchField'
import { searchComponents } from '../../lib/search'
import type { ComponentEntry } from '../../lib/types'
import { useFocusTrap } from '../../lib/useFocusTrap'
import { useScrollLock } from '../../lib/useScrollLock'

interface Props {
  open: boolean
  onClose: () => void
  items: readonly ComponentEntry[]
  currentId: string
  onNavigate: (id: string) => void
  /** 닫힐 때 포커스를 돌려줄 햄버거 버튼 */
  returnFocusRef: RefObject<HTMLButtonElement | null>
}

/**
 * M3 modal navigation drawer.
 * 닫혀 있어도 DOM에 남겨 두고 inert로 상호작용만 막는다. 그래야 열고 닫을 때 슬라이드 전환이 자연스럽다.
 */
export function NavDrawer({ open, onClose, items, currentId, onNavigate, returnFocusRef }: Props) {
  const [query, setQuery] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)
  const activeItemRef = useRef<HTMLAnchorElement>(null)
  const listRef = useRef<HTMLElement>(null)

  const results = useMemo(() => searchComponents(items, query), [items, query])

  // 열릴 때 현재 항목에 포커스한다. 검색창에 포커스하면 모바일에서 키보드가 바로 올라와 목록을 가리기 때문이다.
  useFocusTrap(panelRef, open, { initialFocus: activeItemRef, onEscape: onClose, returnFocus: returnFocusRef })
  useScrollLock(open)

  useEffect(() => {
    if (open) activeItemRef.current?.scrollIntoView({ block: 'center' })
  }, [open])

  const select = () => {
    setQuery('')
    onClose()
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
    <div className={`fixed inset-0 z-40 ${open ? '' : 'pointer-events-none'}`}>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`absolute inset-0 bg-scrim transition-opacity duration-300 ease-standard ${
          open ? 'opacity-[0.32]' : 'opacity-0'
        }`}
      />
      <div
        id="nav-drawer"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="컴포넌트 목록"
        inert={!open}
        className={`absolute inset-y-0 left-0 flex w-[min(360px,calc(100vw-56px))] flex-col rounded-r-2xl bg-surface-container-low shadow-elev-1 transition-transform duration-300 ${
          open ? 'translate-x-0 ease-emphasized-decelerate' : '-translate-x-full ease-emphasized-accelerate'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center gap-1 pl-7 pr-2 pt-[env(safe-area-inset-top)]">
          <p className="min-w-0 flex-1 truncate text-title-md text-on-surface">Mobile UI Glossary</p>
          <IconButton icon="close" label="목록 닫기" onClick={onClose} />
        </div>
        <SearchField value={query} onChange={setQuery} onKeyDown={onSearchKeyDown} resultCount={results.length} />
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
      </div>
    </div>
  )
}
