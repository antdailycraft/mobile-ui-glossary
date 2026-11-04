import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { Icon } from '../components/Icon'
import { IconButton } from '../components/IconButton'
import { useFocusTrap } from '../lib/useFocusTrap'
import { DemoScreen } from './_shared/DemoScreen'
import { filledButton, textButton } from './_shared/ui'

interface Step {
  title: string
  body: string
  target: 'search' | 'filter' | 'fab'
}

const STEPS: Step[] = [
  { target: 'search', title: '메모 검색', body: '제목과 내용으로 메모를 빠르게 찾을 수 있습니다.' },
  { target: 'filter', title: '태그로 거르기', body: '태그 칩을 눌러 원하는 메모만 모아 볼 수 있습니다.' },
  { target: 'fab', title: '새 메모 만들기', body: '오른쪽 아래 버튼으로 언제든 새 메모를 시작하세요.' },
]

/** 하이라이트 구멍을 대상보다 이만큼 넓게 뚫어, 대상 가장자리가 잘려 보이지 않게 한다. */
const HOLE_PADDING = 6

interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export default function CoachMarkDemo() {
  const [step, setStep] = useState<number | null>(null)
  const [status, setStatus] = useState('“둘러보기 시작”을 눌러 코치 마크를 띄워 보세요.')
  const [rect, setRect] = useState<Rect | null>(null)

  const rootRef = useRef<HTMLDivElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const startRef = useRef<HTMLButtonElement>(null)
  const targets: Record<Step['target'], RefObject<HTMLElement | null>> = {
    search: useRef<HTMLButtonElement>(null),
    filter: useRef<HTMLDivElement>(null),
    fab: useRef<HTMLButtonElement>(null),
  }

  const current = step === null ? null : STEPS[step]
  const idx = step ?? 0

  // 대상 요소의 위치를 데모 화면 기준 좌표로 다시 잰다. 단계가 바뀌거나 화면 크기가 바뀔 때마다 필요하다.
  const measure = useCallback(() => {
    const root = rootRef.current
    const el = current ? targets[current.target].current : null
    if (!root || !el) return setRect(null)
    const r = el.getBoundingClientRect()
    const base = root.getBoundingClientRect()
    setRect({
      x: r.left - base.left - HOLE_PADDING,
      y: r.top - base.top - HOLE_PADDING,
      w: r.width + HOLE_PADDING * 2,
      h: r.height + HOLE_PADDING * 2,
    })
    // targets는 렌더마다 새 객체지만 안의 ref는 같으므로 current만 의존하면 된다.
  }, [current])

  useLayoutEffect(() => {
    measure()
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    return () => ro.disconnect()
  }, [measure])

  const finish = (message: string) => {
    setStep(null)
    setStatus(message)
  }

  // 코치 마크가 떠 있는 동안에는 말풍선 안에서만 포커스가 돌고, Esc는 "건너뛰기"와 같게 처리한다.
  useFocusTrap(bubbleRef, step !== null, {
    onEscape: () => finish('Esc로 둘러보기를 건너뛰었습니다.'),
    returnFocus: startRef,
  })

  // 말풍선은 대상 아래 공간이 넉넉하면 아래에, 아니면 위에 띄운다.
  const rootHeight = rootRef.current?.clientHeight ?? 0
  const below = rect ? rect.y + rect.h + 180 < rootHeight : true

  return (
    <div ref={rootRef} className="relative h-full">
      <DemoScreen
        title="메모"
        status={status}
        actions={<IconButton ref={targets.search as RefObject<HTMLButtonElement>} icon="search" label="메모 검색" />}
      >
        <div className="flex flex-col gap-4 p-4">
          <div ref={targets.filter as RefObject<HTMLDivElement>} className="flex w-fit gap-2">
            {['업무', '개인', '아이디어'].map((t) => (
              <span key={t} className="rounded-lg border border-outline-variant px-3 py-1.5 text-label-lg text-on-surface-variant">
                {t}
              </span>
            ))}
          </div>
          {['회의록 정리', '장보기 목록', '여행 준비물'].map((t) => (
            <div key={t} className="rounded-xl bg-surface-container px-4 py-3">
              <p className="text-title-sm">{t}</p>
              <p className="text-body-md text-on-surface-variant">어제 수정</p>
            </div>
          ))}
          <button
            ref={startRef}
            type="button"
            className={filledButton}
            onClick={() => {
              setStep(0)
              setStatus('둘러보기 1단계가 시작되었습니다.')
            }}
          >
            둘러보기 시작
          </button>
        </div>
      </DemoScreen>

      <button
        ref={targets.fab as RefObject<HTMLButtonElement>}
        type="button"
        aria-label="새 메모"
        className="state-layer absolute bottom-4 right-4 flex size-14 items-center justify-center rounded-2xl bg-primary-container text-on-primary-container shadow-elev-3"
      >
        <Icon name="add" />
      </button>

      {current && (
        <>
          {/* 화면 전체 클릭을 막는 투명한 층. 코치 마크가 떠 있는 동안 뒤쪽 화면이 실수로 눌리지 않게 한다. */}
          <div aria-hidden="true" className="absolute inset-0 z-40" />
          {/*
            구멍 뚫린 스크림: 대상 위치에 투명한 상자를 두고, 아주 큰 box-shadow로 바깥을 어둡게 칠한다.
            SVG 마스크 없이 상자 하나로 구멍과 어두운 배경을 함께 만들 수 있고, 위치가 바뀔 때 전환도 자연스럽다.
          */}
          {rect && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute z-40 rounded-2xl transition-all duration-300 ease-emphasized"
              style={{
                left: rect.x,
                top: rect.y,
                width: rect.w,
                height: rect.h,
                boxShadow: '0 0 0 9999px rgb(0 0 0 / 0.6)',
              }}
            />
          )}
          <div
            ref={bubbleRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="coach-title"
            aria-describedby="coach-body"
            className="absolute inset-x-4 z-50 rounded-2xl bg-surface-container-high p-4 shadow-elev-3 transition-[top] duration-300 ease-emphasized"
            style={
              rect
                ? below
                  ? { top: rect.y + rect.h + 12 }
                  : { top: Math.max(8, rect.y - 12 - 172) }
                : { top: 80 }
            }
          >
            <p className="text-label-md text-primary">
              {idx + 1} / {STEPS.length}
            </p>
            <p id="coach-title" className="mt-1 text-title-md">
              {current.title}
            </p>
            <p id="coach-body" className="mt-1 text-body-md text-on-surface-variant">
              {current.body}
            </p>
            <div className="mt-3 flex justify-end gap-2">
              <button type="button" className={textButton} onClick={() => finish('둘러보기를 건너뛰었습니다.')}>
                건너뛰기
              </button>
              <button
                type="button"
                className={filledButton}
                onClick={() => {
                  if (idx + 1 < STEPS.length) {
                    setStep(idx + 1)
                    setStatus(`둘러보기 ${idx + 2}단계로 넘어갔습니다.`)
                  } else {
                    finish('둘러보기를 마쳤습니다. 다시 보려면 “둘러보기 시작”을 누르세요.')
                  }
                }}
              >
                {idx + 1 < STEPS.length ? '다음' : '완료'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
