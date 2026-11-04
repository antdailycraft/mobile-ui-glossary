import { useEffect, useRef, useState } from 'react'
import { ContentPanel } from './components/layout/ContentPanel'
import { NavDrawer } from './components/layout/NavDrawer'
import { Sidebar } from './components/layout/Sidebar'
import { TopAppBar } from './components/layout/TopAppBar'
import { components, contentErrors, getComponent } from './lib/content'
import { useHashRoute } from './lib/useHashRoute'
import { useMediaQuery } from './lib/useMediaQuery'
import { useTheme } from './lib/useTheme'

/** Tailwind의 lg 기준점. 이 너비부터 사이드바를 상시 표시한다. */
const DESKTOP_QUERY = '(min-width: 1024px)'

export function App() {
  const [routeId, navigate] = useHashRoute()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const sidebarSearchRef = useRef<HTMLInputElement>(null)
  const mainRef = useRef<HTMLElement>(null)
  const { mode, setMode } = useTheme()
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  // 해시가 비어 있으면 첫 컴포넌트를 보여 주고, 알 수 없는 id면 안내 화면을 보여 준다.
  const entry = routeId ? getComponent(routeId) : components[0]

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = entry ? `${entry.name} · Mobile UI Glossary` : 'Mobile UI Glossary'
  }, [entry])

  // 드로어를 연 채로 창을 넓히면 드로어가 사라지므로, 열림 상태(와 스크롤 잠금)도 함께 해제한다.
  useEffect(() => {
    if (isDesktop) setDrawerOpen(false)
  }, [isDesktop])

  // 데스크톱에서는 목록이 이미 보이므로 "목록 열기"는 사이드바 검색창으로 포커스를 옮기는 것으로 대신한다.
  const openNavigation = () => (isDesktop ? sidebarSearchRef.current?.focus() : setDrawerOpen(true))

  return (
    <>
      {/* 키보드 사용자가 사이드바의 긴 목록을 건너뛰고 본문으로 바로 갈 수 있게 한다.
          해시 링크(#main)는 라우팅과 겹치므로 버튼으로 포커스만 옮긴다. */}
      <button
        type="button"
        onClick={() => mainRef.current?.focus()}
        className="sr-only z-50 rounded-full bg-primary px-5 py-3 text-label-lg text-on-primary focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        본문으로 건너뛰기
      </button>

      {isDesktop ? (
        <Sidebar
          items={components}
          currentId={entry?.id ?? ''}
          onNavigate={navigate}
          themeMode={mode}
          onThemeChange={setMode}
          searchInputRef={sidebarSearchRef}
        />
      ) : (
        <>
          <TopAppBar
            title={entry?.name ?? '찾을 수 없음'}
            drawerOpen={drawerOpen}
            onMenu={() => setDrawerOpen(true)}
            menuButtonRef={menuButtonRef}
            themeMode={mode}
            onThemeChange={setMode}
          />
          <NavDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            items={components}
            currentId={entry?.id ?? ''}
            onNavigate={navigate}
            returnFocusRef={menuButtonRef}
          />
        </>
      )}

      <main ref={mainRef} tabIndex={-1} className="outline-none lg:pl-[260px]">
        {contentErrors.length > 0 && (
          <div role="alert" className="mx-4 mt-2 rounded-xl bg-error-container p-4 text-body-md text-on-error-container">
            <p className="font-medium">콘텐츠 오류 {contentErrors.length}건</p>
            <ul className="mt-2 list-disc pl-5">
              {contentErrors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}
        {entry ? (
          <ContentPanel key={entry.id} entry={entry} />
        ) : (
          <div className="mx-auto max-w-3xl px-4 py-16 text-center">
            <h1 className="text-headline-sm">‘{routeId}’ 컴포넌트를 찾을 수 없습니다</h1>
            <p className="mt-2 text-body-lg text-on-surface-variant">주소를 확인하거나 목록에서 다시 골라 주세요.</p>
            <button
              type="button"
              onClick={openNavigation}
              className="state-layer mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-lg text-on-primary"
            >
              {isDesktop ? '목록에서 검색하기' : '목록 열기'}
            </button>
          </div>
        )}
      </main>
    </>
  )
}
