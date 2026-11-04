import { useState } from 'react'
import { Icon } from '../components/Icon'
import { DemoScreen } from './_shared/DemoScreen'
import { useDrag } from './_shared/useDrag'

const PLACES = [
  { id: 1, name: '바다 앞 카페', meta: '도보 3분 · 영업 중', x: '22%', y: '30%' },
  { id: 2, name: '골목 서점', meta: '도보 6분 · 21시까지', x: '64%', y: '22%' },
  { id: 3, name: '언덕 위 빵집', meta: '도보 9분 · 영업 중', x: '48%', y: '52%' },
  { id: 4, name: '항구 시장', meta: '도보 12분 · 영업 중', x: '78%', y: '44%' },
  { id: 5, name: '등대 공원', meta: '도보 15분 · 항상 열림', x: '30%', y: '62%' },
]

/** 접힌 상태에서 화면에 보이는 시트 높이(px). 핸들과 제목 줄이 들어갈 만큼만 남긴다. */
const PEEK = 104
/** 이 거리(px) 이상 끌거나 이 속도(px/ms) 이상으로 튕기면 반대 상태로 전환한다. */
const SNAP_DISTANCE = 48
const SNAP_VELOCITY = 0.4

export default function StandardBottomSheetDemo() {
  const [expanded, setExpanded] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [status, setStatus] = useState('핸들을 위로 끌어 시트를 펼쳐 보세요. 지도는 계속 누를 수 있습니다.')

  const drag = useDrag({
    axis: 'y',
    onEnd: ({ offset, velocity }) => {
      if (!expanded && (offset < -SNAP_DISTANCE || velocity < -SNAP_VELOCITY)) {
        setExpanded(true)
        setStatus('위로 끌어서 시트를 펼쳤습니다. 그래도 위쪽 지도는 가려지지 않고 조작할 수 있습니다.')
      } else if (expanded && (offset > SNAP_DISTANCE || velocity > SNAP_VELOCITY)) {
        setExpanded(false)
        setStatus('아래로 끌어서 시트를 접었습니다. 비모달 시트는 닫히지 않고 접힌 높이로 남습니다.')
      } else {
        setStatus('조금만 끌었기 때문에 시트가 원래 높이로 돌아갔습니다.')
      }
    },
  })

  // 현재 상태 방향으로는 저항(1/4)을 줘서 "더 이상 움직이지 않는 끝"이라는 느낌을 준다.
  const dy = drag.dragging
    ? expanded
      ? drag.offset < 0
        ? drag.offset / 4
        : drag.offset
      : drag.offset > 0
        ? drag.offset / 4
        : drag.offset
    : 0
  const base = expanded ? '0px' : `calc(100% - ${PEEK}px)`

  const toggle = () => {
    setExpanded((v) => !v)
    setStatus(expanded ? '핸들을 눌러 시트를 접었습니다.' : '핸들을 눌러 시트를 펼쳤습니다. 드래그가 어려운 사용자를 위한 대체 수단입니다.')
  }

  const pick = (id: number, from: '지도' | '목록') => {
    const place = PLACES.find((p) => p.id === id)!
    setSelected(id)
    setStatus(`${from}에서 “${place.name}”을(를) 골랐습니다. 시트와 지도가 함께 동작합니다.`)
  }

  return (
    <DemoScreen title="주변 둘러보기" status={status}>
      {/* 뒤쪽 화면(지도). 스크림이 없으므로 시트가 펼쳐져 있어도 마커를 누를 수 있다. */}
      <div
        className="absolute inset-0 bg-surface-container"
        style={{
          backgroundImage:
            'linear-gradient(var(--md-outline-variant) 1px, transparent 1px), linear-gradient(90deg, var(--md-outline-variant) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      >
        {PLACES.map((p) => (
          <button
            key={p.id}
            type="button"
            aria-label={`지도에서 ${p.name} 선택`}
            aria-pressed={selected === p.id}
            onClick={() => pick(p.id, '지도')}
            style={{ left: p.x, top: p.y }}
            className={`absolute flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-transform ${
              selected === p.id ? 'scale-125 text-error' : 'text-primary'
            }`}
          >
            <Icon name="place" className="size-8 drop-shadow" />
          </button>
        ))}
      </div>

      <section
        aria-label="주변 장소 목록"
        className={`absolute inset-x-0 bottom-0 z-10 flex h-[78%] flex-col rounded-t-[28px] bg-surface-container-low shadow-elev-1 ${
          drag.dragging ? '' : 'transition-transform duration-300 ease-emphasized'
        }`}
        style={{ transform: `translateY(calc(${base} + ${dy}px))` }}
      >
        <div {...drag.bind} className="shrink-0 cursor-grab touch-none select-none active:cursor-grabbing">
          <button
            type="button"
            aria-label={expanded ? '목록 접기' : '목록 펼치기'}
            aria-expanded={expanded}
            onClick={() => {
              if (!drag.wasDrag()) toggle()
            }}
            className="flex h-12 w-full items-center justify-center"
          >
            <span className="h-1 w-8 rounded-full bg-on-surface-variant/40" />
          </button>
          <div className="px-6 pb-3">
            <h2 className="text-title-md">주변 장소 {PLACES.length}곳</h2>
            <p className="text-body-md text-on-surface-variant">지도와 목록을 함께 볼 수 있습니다</p>
          </div>
        </div>
        {/* 접힌 상태에서 화면 밖에 있는 목록으로 키보드 포커스가 들어가지 않도록 inert 처리한다. */}
        <ul inert={!expanded} className="min-h-0 flex-1 overflow-y-auto overscroll-contain pb-4">
          {PLACES.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => pick(p.id, '목록')}
                aria-current={selected === p.id ? 'true' : undefined}
                className={`state-layer flex min-h-[72px] w-full items-center gap-4 px-6 text-left ${
                  selected === p.id ? 'bg-secondary-container text-on-secondary-container' : ''
                }`}
              >
                <Icon name="place" className="size-6 shrink-0 text-on-surface-variant" />
                <span className="min-w-0 flex-1">
                  <span className="block text-body-lg">{p.name}</span>
                  <span className="block text-body-md text-on-surface-variant">{p.meta}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </DemoScreen>
  )
}
