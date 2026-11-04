import { useEffect, useRef, useState } from 'react'
import { ContentPanel } from './components/layout/ContentPanel'
import { NavDrawer } from './components/layout/NavDrawer'
import { TopAppBar } from './components/layout/TopAppBar'
import { components, contentErrors, getComponent } from './lib/content'
import { useHashRoute } from './lib/useHashRoute'
import { useTheme } from './lib/useTheme'

export function App() {
  const [routeId, navigate] = useHashRoute()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const { mode, setMode } = useTheme()

  // 해시가 비어 있으면 첫 컴포넌트를 보여 주고, 알 수 없는 id면 안내 화면을 보여 준다.
  const entry = routeId ? getComponent(routeId) : components[0]

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = entry ? `${entry.name} · Mobile UI Glossary` : 'Mobile UI Glossary'
  }, [entry])

  return (
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
      <main>
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
              onClick={() => setDrawerOpen(true)}
              className="state-layer mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-lg text-on-primary"
            >
              목록 열기
            </button>
          </div>
        )}
      </main>
    </>
  )
}
