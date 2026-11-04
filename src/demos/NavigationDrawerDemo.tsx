import { useRef, useState } from 'react'
import { Icon, type IconName } from '../components/Icon'
import { IconButton } from '../components/IconButton'
import { useFocusTrap } from '../lib/useFocusTrap'
import { DemoScreen } from './_shared/DemoScreen'
import { Scrim } from './_shared/Scrim'
import { useDrag } from './_shared/useDrag'

/** 받침 유무에 따라 조사를 고른다. 상태 문구에 들어가는 라벨이 바뀌어도 "알림으로", "도보를"처럼 자연스럽게 읽히게 하기 위해서다. */
const finalOf = (word: string) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code <= 11171 ? code % 28 : 0
}
const withRo = (w: string) => `“${w}”${finalOf(w) && finalOf(w) !== 8 ? '으로' : '로'}`


interface Dest {
  id: string
  label: string
  icon: IconName
  count?: number
}

const PRIMARY: Dest[] = [
  { id: 'inbox', label: '받은편지함', icon: 'inbox', count: 24 },
  { id: 'starred', label: '별표편지함', icon: 'star' },
  { id: 'sent', label: '보낸편지함', icon: 'mail' },
  { id: 'trash', label: '휴지통', icon: 'delete' },
]

const LABELS: Dest[] = [
  { id: 'work', label: '업무', icon: 'bookmark' },
  { id: 'travel', label: '여행', icon: 'place' },
]

/** 드로어 너비의 이 비율 이상 왼쪽으로 끌면 닫는다. */
const CLOSE_RATIO = 0.35
/** 거리가 짧아도 이 속도(px/ms) 이상으로 왼쪽으로 튕기면 닫는다. */
const CLOSE_VELOCITY = 0.5

export default function NavigationDrawerDemo() {
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<Dest>(PRIMARY[0]!)
  const [status, setStatus] = useState('왼쪽 위 ☰ 버튼을 눌러 드로어를 열어 보세요.')
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  const close = (reason: string) => {
    setOpen(false)
    setStatus(reason)
  }

  const drag = useDrag({
    axis: 'x',
    onEnd: ({ offset, velocity }) => {
      const width = panelRef.current?.offsetWidth ?? 0
      if (-offset > width * CLOSE_RATIO || velocity < -CLOSE_VELOCITY) close('드로어를 왼쪽으로 끌어서 닫았습니다.')
      else setStatus('조금만 끌어서 드로어가 제자리로 돌아갔습니다.')
    },
  })

  // 열릴 때는 현재 선택된 목적지에 포커스를 둔다. 사용자가 "지금 어디에 있는지"부터 확인할 수 있게 하기 위해서다.
  useFocusTrap(panelRef, open, {
    initialFocus: activeRef,
    returnFocus: triggerRef,
    onEscape: () => close('Esc 키로 드로어를 닫았습니다.'),
  })

  // 왼쪽으로는 손가락을 따라가고, 오른쪽으로는 열린 위치보다 더 나가지 않게 막는다.
  const dragX = drag.dragging ? Math.min(0, drag.offset) : 0

  const choose = (d: Dest) => {
    setCurrent(d)
    close(`${withRo(d.label)} 이동하고 드로어를 닫았습니다. 모달 드로어는 목적지를 고르면 바로 닫힙니다.`)
  }

  const item = (d: Dest) => {
    const active = d.id === current.id
    return (
      <li key={d.id}>
        <button
          ref={active ? activeRef : undefined}
          type="button"
          aria-current={active ? 'page' : undefined}
          onClick={() => choose(d)}
          className={`state-layer flex min-h-14 w-full items-center gap-3 rounded-full px-4 text-left text-label-lg ${
            active ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant'
          }`}
        >
          <Icon name={d.icon} className="size-6" />
          <span className="flex-1">{d.label}</span>
          {d.count !== undefined && <span className="text-label-lg">{d.count}</span>}
        </button>
      </li>
    )
  }

  return (
    <>
      <DemoScreen
        title={current.label}
        status={status}
        leading={
          <IconButton
            ref={triggerRef}
            icon="menu"
            label="메뉴 열기"
            aria-haspopup="dialog"
            aria-expanded={open}
            className="text-on-surface"
            onClick={() => {
              setOpen(true)
              setStatus('드로어가 열렸습니다. 왼쪽으로 끌거나, 어두운 영역을 누르거나, 목적지를 골라 닫아 보세요.')
            }}
          />
        }
      >
        <ul>
          {['회의 자료 공유드립니다', '디자인 리뷰 일정', '11월 행사 안내', '견적서 확인 부탁드립니다'].map((s) => (
            <li key={s} className="flex min-h-14 items-center gap-4 px-4">
              <span aria-hidden="true" className="size-10 shrink-0 rounded-full bg-primary-container" />
              <span className="truncate text-body-lg">
                [{current.label}] {s}
              </span>
            </li>
          ))}
        </ul>
      </DemoScreen>

      <Scrim visible={open} onClick={() => close('스크림(어두운 영역)을 눌러서 드로어를 닫았습니다.')} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="메일 폴더"
        inert={!open}
        {...drag.bind}
        // 세로 스크롤은 브라우저에 맡기고 가로 드래그만 직접 처리한다.
        className={`absolute inset-y-0 left-0 z-20 flex w-[80%] max-w-[360px] touch-pan-y flex-col rounded-r-2xl bg-surface-container-low py-3 shadow-elev-1 ${
          drag.dragging ? '' : 'transition-transform duration-300 ease-emphasized'
        }`}
        style={{ transform: open ? `translateX(${dragX}px)` : 'translateX(calc(-100% - 16px))' }}
      >
        <p className="px-7 pb-2 pt-3 text-title-sm text-on-surface-variant">메일</p>
        <nav aria-label="메일 폴더" className="min-h-0 flex-1 overflow-y-auto px-3">
          <ul>{PRIMARY.map(item)}</ul>
          <hr className="mx-4 my-2 border-outline-variant" />
          <p className="px-4 pb-2 pt-3 text-title-sm text-on-surface-variant">라벨</p>
          <ul>{LABELS.map(item)}</ul>
        </nav>
      </div>
    </>
  )
}
