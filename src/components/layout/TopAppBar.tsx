import { useEffect, useState, type Ref } from 'react'
import { IconButton } from '../IconButton'
import { ThemeToggle } from './ThemeToggle'
import type { ThemeMode } from '../../lib/useTheme'

interface Props {
  title: string
  drawerOpen: boolean
  onMenu: () => void
  menuButtonRef: Ref<HTMLButtonElement>
  themeMode: ThemeMode
  onThemeChange: (m: ThemeMode) => void
}

/**
 * M3 small top app bar.
 * 맨 위에서는 surface 색이고, 콘텐츠가 밑으로 스크롤되면 surface-container로 바뀌어 경계를 표시한다(그림자 대신 색 변화).
 */
export function TopAppBar({ title, drawerOpen, onMenu, menuButtonRef, themeMode, onThemeChange }: Props) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-30 flex h-16 items-center gap-1 px-1 pt-[env(safe-area-inset-top)] transition-colors duration-200 ${
        scrolled ? 'bg-surface-container' : 'bg-surface'
      }`}
    >
      <IconButton
        ref={menuButtonRef}
        icon="menu"
        label="컴포넌트 목록 열기"
        aria-haspopup="dialog"
        aria-expanded={drawerOpen}
        aria-controls="nav-drawer"
        onClick={onMenu}
        className="text-on-surface"
      />
      <p className="min-w-0 flex-1 truncate px-1 text-title-lg" aria-live="polite">
        {title}
      </p>
      <ThemeToggle mode={themeMode} onChange={onThemeChange} />
    </header>
  )
}
