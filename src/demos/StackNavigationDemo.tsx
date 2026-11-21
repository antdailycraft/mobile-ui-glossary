import { useEffect, useRef, useState } from 'react'
import { IconButton } from '../components/IconButton'
import { DemoScreen } from './_shared/DemoScreen'
import { tonalButton } from './_shared/ui'

const SCREENS = ['여행지 목록', '제주', '방문 안내']

export default function StackNavigationDemo() {
  const [depth, setDepth] = useState(1)
  const heading = useRef<HTMLHeadingElement>(null)
  const current = SCREENS[depth - 1]
  const moved = useRef(false)

  useEffect(() => {
    if (moved.current) heading.current?.focus({ preventScroll: true })
  }, [depth])

  function move(offset: number) {
    moved.current = true
    setDepth((value) => Math.min(SCREENS.length, Math.max(1, value + offset)))
  }

  return (
    <DemoScreen
      title="여행 가이드"
      leading={depth > 1 ? <IconButton icon="arrowBack" label="이전 화면으로" onClick={() => move(-1)} /> : undefined}
      status={`현재 화면: ${current} · 스택에 ${depth}개 화면`}
    >
      <div className="space-y-4 p-4">
        <div className="relative isolate min-h-36 overflow-hidden rounded-xl bg-surface-container-low">
          {SCREENS.map((screen, index) => {
            const active = index === depth - 1
            const next = SCREENS[index + 1]
            return (
              <section
                key={screen}
                inert={!active}
                style={{ zIndex: index }}
                className={`absolute inset-0 overflow-y-auto bg-surface-container-low p-4 transition-transform duration-300 ease-standard motion-reduce:transition-none ${index < depth ? 'translate-x-0' : 'translate-x-full'}`}
              >
                <h3 ref={active ? heading : undefined} tabIndex={-1} className="text-title-lg">{screen}</h3>
                {next ? (
                  <button type="button" className={`mt-3 ${tonalButton}`} onClick={() => move(1)}>{next} 열기</button>
                ) : (
                  <p className="mt-3 text-body-lg">앱 바의 뒤로 버튼을 누르면 제주 화면으로 돌아갑니다.</p>
                )}
              </section>
            )
          })}
        </div>
        <div className="rounded-xl bg-surface-container p-4">
          <h4 className="text-title-sm">이동 기록 (처음부터)</h4>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-body-md">
            {SCREENS.slice(0, depth).map((screen) => (
              <li key={screen} aria-current={screen === current ? 'step' : undefined}>
                {screen}{screen === current && ' (현재 화면)'}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </DemoScreen>
  )
}
