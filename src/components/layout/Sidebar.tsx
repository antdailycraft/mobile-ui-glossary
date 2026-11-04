import { useEffect, useRef, type Ref } from 'react'
import { NavPanel } from './NavPanel'
import { ThemeToggle } from './ThemeToggle'
import type { ComponentEntry } from '../../lib/types'
import type { ThemeMode } from '../../lib/useTheme'

interface Props {
  items: readonly ComponentEntry[]
  currentId: string
  onNavigate: (id: string) => void
  themeMode: ThemeMode
  onThemeChange: (m: ThemeMode) => void
  searchInputRef: Ref<HTMLInputElement>
}

/**
 * 넓은 화면(lg 이상)에서 항상 보이는 사이드바. M3의 standard navigation drawer에 해당한다.
 * 모달이 아니므로 포커스를 가두지 않고, 본문과 자유롭게 오갈 수 있다.
 */
export function Sidebar({ items, currentId, onNavigate, themeMode, onThemeChange, searchInputRef }: Props) {
  const activeItemRef = useRef<HTMLAnchorElement>(null)

  const firstScroll = useRef(true)

  // 링크 공유로 목록 아래쪽 항목이 처음부터 선택된 경우에도 현재 항목이 보이도록 스크롤한다.
  // 처음에는 가운데로 맞춰 앞뒤 항목이 함께 보이게 하고, 이후에는 필요할 때만 최소한으로 움직여 목록이 튀지 않게 한다.
  useEffect(() => {
    activeItemRef.current?.scrollIntoView({ block: firstScroll.current ? 'center' : 'nearest' })
    firstScroll.current = false
  }, [currentId])

  return (
    <aside
      aria-label="컴포넌트 탐색"
      className="fixed inset-y-0 left-0 z-20 flex w-[260px] flex-col border-r border-outline-variant bg-surface-container-low"
    >
      <NavPanel
        header={
          <div className="flex h-16 shrink-0 items-center gap-1 pl-6 pr-1">
            <p className="min-w-0 flex-1 truncate text-title-md text-on-surface">Mobile UI Glossary</p>
            <ThemeToggle mode={themeMode} onChange={onThemeChange} />
          </div>
        }
        items={items}
        currentId={currentId}
        onNavigate={onNavigate}
        activeItemRef={activeItemRef}
        inputRef={searchInputRef}
      />
    </aside>
  )
}
