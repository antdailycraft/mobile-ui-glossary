import { useEffect, useId, useRef, useState } from 'react'
import { Icon, type IconName } from '../components/Icon'
import { DemoScreen } from './_shared/DemoScreen'
import { textButton } from './_shared/ui'

/** 마우스를 올린 뒤 이만큼 머물러야 보여 준다. 화면을 훑고 지나갈 때마다 툴팁이 깜빡이지 않게 하기 위해서다. */
const HOVER_DELAY = 500
/** 터치에서 이 시간 이상 누르고 있으면 "길게 누르기"로 본다. */
const LONG_PRESS = 500
/** 터치로 띄운 툴팁은 손을 뗀 뒤에도 읽을 시간을 주고 사라진다. */
const TOUCH_HIDE_DELAY = 1500

export default function TooltipDemo() {
  const [status, setStatus] = useState('아이콘에 마우스를 올리거나, 길게 누르거나, Tab으로 포커스해 보세요.')

  return (
    <DemoScreen
      title="사진 상세"
      status={status}
      actions={
        <>
          <TooltipIconButton icon="favoriteBorder" label="즐겨찾기" tip="즐겨찾기에 추가" onStatus={setStatus} />
          <TooltipIconButton icon="share" label="공유" tip="다른 앱으로 공유" onStatus={setStatus} />
          <TooltipIconButton icon="bookmark" label="저장" tip="앨범에 저장" align="end" onStatus={setStatus} />
        </>
      }
    >
      <div className="flex flex-col gap-4 p-4">
        <div
          aria-hidden="true"
          className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-secondary-container via-primary-container to-tertiary-container"
        />
        <div className="flex items-center gap-1">
          <p className="text-body-lg">
            저장 공간 <span className="text-on-surface-variant">2.1GB 사용 중</span>
          </p>
          <RichTooltip onStatus={setStatus} />
        </div>
        <p className="text-body-md text-on-surface-variant">
          위쪽 아이콘은 짧은 이름만 보여 주는 plain tooltip, 정보 아이콘은 제목과 버튼이 있는 rich tooltip입니다.
        </p>
      </div>
    </DemoScreen>
  )
}

interface TooltipIconButtonProps {
  icon: IconName
  label: string
  tip: string
  /** 화면 오른쪽 끝 버튼은 툴팁을 오른쪽에 맞춰 펼쳐야 잘리지 않는다. */
  align?: 'center' | 'end'
  onStatus: (s: string) => void
}

/**
 * plain tooltip이 붙은 아이콘 버튼.
 * 툴팁은 항상 DOM에 두고 aria-describedby로 연결해, 보이지 않을 때도 스크린 리더가 설명을 읽을 수 있게 한다.
 */
function TooltipIconButton({ icon, label, tip, align = 'center', onStatus }: TooltipIconButtonProps) {
  const tipId = useId()
  const [visible, setVisible] = useState(false)
  const showTimer = useRef<number | undefined>(undefined)
  const hideTimer = useRef<number | undefined>(undefined)
  // 길게 눌러 툴팁을 띄운 경우에는 손을 뗄 때 발생하는 click을 무시해야 버튼 동작이 실행되지 않는다.
  const longPressed = useRef(false)

  const clearTimers = () => {
    window.clearTimeout(showTimer.current)
    window.clearTimeout(hideTimer.current)
  }
  useEffect(() => clearTimers, [])

  const show = (how: string) => {
    clearTimers()
    setVisible(true)
    onStatus(`${how}로 “${tip}” 툴팁이 나타났습니다.`)
  }

  const hideLater = (ms: number) => {
    clearTimers()
    hideTimer.current = window.setTimeout(() => setVisible(false), ms)
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={label}
        aria-describedby={tipId}
        className="state-layer inline-flex size-12 items-center justify-center rounded-full text-on-surface-variant"
        onPointerEnter={(e) => {
          if (e.pointerType !== 'mouse') return
          clearTimers()
          showTimer.current = window.setTimeout(() => show('마우스 올리기'), HOVER_DELAY)
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === 'mouse') hideLater(0)
        }}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse') return
          longPressed.current = false
          clearTimers()
          showTimer.current = window.setTimeout(() => {
            longPressed.current = true
            show('길게 누르기')
          }, LONG_PRESS)
        }}
        onPointerUp={(e) => {
          if (e.pointerType === 'mouse') return
          window.clearTimeout(showTimer.current)
          if (longPressed.current) hideLater(TOUCH_HIDE_DELAY)
        }}
        onPointerCancel={() => hideLater(0)}
        // 모바일 브라우저가 길게 누르기를 컨텍스트 메뉴로 가로채지 않게 막는다.
        onContextMenu={(e) => e.preventDefault()}
        onFocus={(e) => {
          // 키보드 포커스일 때만 띄운다. 터치·클릭으로 생긴 포커스까지 띄우면 누를 때마다 툴팁이 가린다.
          if (e.currentTarget.matches(':focus-visible')) show('키보드 포커스')
        }}
        onBlur={() => hideLater(0)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && visible) {
            e.stopPropagation()
            hideLater(0)
          }
        }}
        onClick={() => {
          if (longPressed.current) {
            longPressed.current = false
            return
          }
          hideLater(0)
          onStatus(`“${label}” 버튼을 눌렀습니다. 짧게 누르면 툴팁 없이 바로 실행됩니다.`)
        }}
        style={{ WebkitTouchCallout: 'none' }}
      >
        <Icon name={icon} />
      </button>
      <span
        id={tipId}
        role="tooltip"
        className={`pointer-events-none absolute top-full z-30 mt-1 whitespace-nowrap rounded-[4px] bg-inverse-surface px-2 py-1 text-body-sm text-inverse-on-surface transition-opacity duration-150 ${
          align === 'end' ? 'right-1' : 'left-1/2 -translate-x-1/2'
        } ${visible ? 'opacity-100' : 'opacity-0'}`}
      >
        {tip}
      </span>
    </div>
  )
}

/**
 * rich tooltip. 제목·본문·동작 버튼을 담을 수 있어 사용자가 직접 닫을 때까지 유지된다.
 * 안에 버튼이 있으므로 role="tooltip"(상호작용 불가)이 아니라, 펼침 버튼 + 비모달 영역으로 만든다.
 */
function RichTooltip({ onStatus }: { onStatus: (s: string) => void }) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false)
        onStatus('바깥을 눌러 rich tooltip을 닫았습니다.')
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, onStatus])

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label="저장 공간 안내"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          setOpen((o) => !o)
          onStatus(open ? 'rich tooltip을 닫았습니다.' : 'rich tooltip이 열렸습니다. 직접 닫을 때까지 유지됩니다.')
        }}
        className="state-layer inline-flex size-12 items-center justify-center rounded-full text-on-surface-variant"
      >
        <Icon name="info" className="size-5" />
      </button>
      <div
        id={panelId}
        hidden={!open}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setOpen(false)
            buttonRef.current?.focus()
            onStatus('Esc로 rich tooltip을 닫았습니다.')
          }
        }}
        className="absolute left-1/2 top-full z-30 mt-1 w-64 -translate-x-1/2 rounded-xl bg-surface-container px-4 pb-2 pt-3 shadow-elev-2 transition-opacity duration-150 starting:opacity-0"
      >
        <p className="text-title-sm text-on-surface">저장 공간이란?</p>
        <p className="mt-1 text-body-md text-on-surface-variant">
          원본 화질로 백업한 사진과 동영상이 차지하는 용량입니다. 15GB까지 무료입니다.
        </p>
        <div className="mt-1 flex justify-end">
          <button
            type="button"
            className={textButton}
            onClick={() => {
              setOpen(false)
              buttonRef.current?.focus()
              onStatus('“자세히 보기”를 눌렀습니다. rich tooltip은 이렇게 동작을 하나 담을 수 있습니다.')
            }}
          >
            자세히 보기
          </button>
        </div>
      </div>
    </div>
  )
}

