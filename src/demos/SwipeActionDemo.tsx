import { useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from '../components/Icon'
import { IconButton } from '../components/IconButton'
import { DemoScreen } from './_shared/DemoScreen'
import { tonalButton } from './_shared/ui'
import { useDrag } from './_shared/useDrag'

interface Item {
  id: number
  title: string
  detail: string
}

const INITIAL: Item[] = [
  { id: 1, title: '장보기 목록', detail: '우유, 달걀, 사과' },
  { id: 2, title: '치과 예약', detail: '다음 주 화요일 오후 3시' },
  { id: 3, title: '보고서 초안', detail: '금요일까지 팀장님께 공유' },
  { id: 4, title: '운동', detail: '저녁 7시 러닝 5km' },
  { id: 5, title: '책 반납', detail: '시립도서관, 11월 10일까지' },
]

/** 뒤에 숨어 있는 삭제 버튼의 너비. 열린 상태에서 행은 정확히 이만큼 왼쪽으로 밀려 있다. */
const ACTION_WIDTH = 88
/** 행 너비의 이 비율 이상 밀면 버튼을 누르지 않아도 바로 삭제한다(iOS의 full swipe). */
const FULL_SWIPE_RATIO = 0.6
/** 거리가 짧아도 이 속도(px/ms) 이상으로 튕기면 열거나 닫는다. */
const FLING_VELOCITY = 0.5

export default function SwipeActionDemo() {
  const [items, setItems] = useState(INITIAL)
  // 한 번에 한 행만 열려 있게 한다. 여러 행이 동시에 열리면 어느 행의 버튼인지 헷갈린다.
  const [openId, setOpenId] = useState<number | null>(null)
  const [status, setStatus] = useState('행을 왼쪽으로 밀어 보세요. ⋯ 버튼으로도 열 수 있습니다.')

  const remove = (item: Item, how: string) => {
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    setOpenId(null)
    setStatus(`“${item.title}”을(를) ${how} 삭제했습니다.`)
  }

  const setOpen = (item: Item, open: boolean, how: string) => {
    setOpenId(open ? item.id : null)
    if (open) setStatus(`“${item.title}” 행이 ${how} 열렸습니다. 삭제 버튼이 나타났습니다.`)
    else if (how === '덜 밀어서') setStatus('충분히 밀지 않아 행이 제자리로 돌아갔습니다.')
    else setStatus(`행이 ${how} 닫혔습니다.`)
  }

  return (
    <DemoScreen title="할 일" status={status}>
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
          <p className="text-body-lg text-on-surface-variant">모든 항목을 삭제했습니다.</p>
          <button type="button" className={tonalButton} onClick={() => setItems(INITIAL)}>
            목록 다시 채우기
          </button>
        </div>
      ) : (
        <ul>
          {items.map((item) => (
            <SwipeRow
              key={item.id}
              item={item}
              open={openId === item.id}
              onOpenChange={(open, how) => setOpen(item, open, how)}
              onDelete={(how) => remove(item, how)}
            />
          ))}
        </ul>
      )}
    </DemoScreen>
  )
}

interface RowProps {
  item: Item
  open: boolean
  onOpenChange: (open: boolean, how: string) => void
  onDelete: (how: string) => void
}

function SwipeRow({ item, open, onOpenChange, onDelete }: RowProps) {
  const rowRef = useRef<HTMLLIElement>(null)
  const deleteRef = useRef<HTMLButtonElement>(null)

  const drag = useDrag({
    axis: 'x',
    onEnd: ({ offset, velocity }) => {
      const width = rowRef.current?.offsetWidth ?? 360
      const end = (open ? -ACTION_WIDTH : 0) + offset
      if (end < -width * FULL_SWIPE_RATIO) onDelete('끝까지 밀어서')
      else if (velocity < -FLING_VELOCITY || (velocity <= FLING_VELOCITY && end < -ACTION_WIDTH / 2))
        onOpenChange(true, '밀어서')
      else onOpenChange(false, open ? '다시 밀어서' : '덜 밀어서')
    },
  })

  // 열린 상태를 기준점으로 손가락 이동량을 더한다. 오른쪽(양수)으로는 0을 넘지 못하게 막는다.
  const base = open ? -ACTION_WIDTH : 0
  const x = drag.dragging ? Math.min(0, base + drag.offset) : base
  const width = rowRef.current?.offsetWidth ?? 360
  const fullSwipe = drag.dragging && x < -width * FULL_SWIPE_RATIO

  // 키보드 사용자를 위한 대체 수단: ← 열기, → 또는 Esc 닫기, Delete 삭제.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' && !open) {
      e.preventDefault()
      onOpenChange(true, '← 키로')
    } else if ((e.key === 'ArrowRight' || e.key === 'Escape') && open) {
      e.preventDefault()
      onOpenChange(false, '키보드로')
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault()
      onDelete('Delete 키로')
    }
  }

  return (
    <li ref={rowRef} className="relative overflow-hidden">
      {/* 뒤쪽 레이어: 행이 밀리면 드러나는 삭제 버튼. 끝까지 밀면 버튼이 행 전체 너비로 늘어나 "놓으면 삭제"를 예고한다. */}
      <div className="absolute inset-y-0 right-0 flex justify-end bg-error" style={{ width: Math.max(ACTION_WIDTH, -x) }}>
        <button
          ref={deleteRef}
          type="button"
          tabIndex={open ? 0 : -1}
          aria-hidden={!open}
          onClick={() => onDelete('삭제 버튼을 눌러')}
          className={`flex h-full flex-col items-center justify-center gap-1 text-label-md text-on-error transition-[width] duration-150 ${
            fullSwipe ? 'w-full' : 'w-[88px]'
          }`}
        >
          <Icon name="delete" className="size-6" />
          삭제
        </button>
      </div>

      {/* 앞쪽 레이어: 실제 행. 세로 스크롤은 브라우저에 맡기고(pan-y) 가로 이동만 직접 처리한다. */}
      <div
        {...drag.bind}
        tabIndex={0}
        role="group"
        aria-label={`${item.title}. ← 키로 삭제 버튼 열기, Delete 키로 삭제`}
        onKeyDown={onKeyDown}
        onClick={() => {
          // 드래그 직후의 click과, 열린 행을 탭해서 닫는 동작을 구분한다.
          if (!drag.wasDrag() && open) onOpenChange(false, '탭해서')
        }}
        style={{ transform: `translateX(${x}px)`, touchAction: 'pan-y' }}
        className={`relative flex min-h-[72px] cursor-grab select-none items-center gap-4 bg-surface py-2 pl-4 pr-1 active:cursor-grabbing ${
          drag.dragging ? '' : 'transition-transform duration-300 ease-emphasized'
        }`}
      >
        <span
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"
        >
          <Icon name="check" className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-body-lg">{item.title}</p>
          <p className="truncate text-body-md text-on-surface-variant">{item.detail}</p>
        </div>
        {/* 스와이프를 할 수 없거나 모르는 사용자를 위한 대체 수단. 같은 삭제 버튼을 드러낸다. */}
        <IconButton
          icon="moreHoriz"
          label={open ? `${item.title} 삭제 버튼 숨기기` : `${item.title} 삭제 버튼 보기`}
          aria-expanded={open}
          onClick={(e) => {
            e.stopPropagation()
            onOpenChange(!open, '⋯ 버튼으로')
            // 열었다면 바로 삭제 버튼으로 포커스를 옮겨 키보드로 이어서 누를 수 있게 한다.
            if (!open) requestAnimationFrame(() => deleteRef.current?.focus())
          }}
        />
      </div>
    </li>
  )
}
