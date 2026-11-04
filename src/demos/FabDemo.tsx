import { useRef, useState, type UIEvent } from 'react'
import { Icon } from '../components/Icon'
import { DemoScreen } from './_shared/DemoScreen'

const INITIAL = Array.from({ length: 14 }, (_, i) => ({ id: i + 1, title: `메모 ${14 - i}`, body: '내용 미리보기가 여기에 표시됩니다.' }))

/** 이 거리 이상 스크롤해야 방향이 바뀐 것으로 본다. 손가락 떨림으로 FAB가 계속 접혔다 펴지지 않게 하기 위해서다. */
const SCROLL_THRESHOLD = 8

export default function FabDemo() {
  const [memos, setMemos] = useState(INITIAL)
  const [extended, setExtended] = useState(true)
  const [status, setStatus] = useState('목록을 아래로 스크롤하면 Extended FAB가 아이콘만 남도록 접힙니다.')
  const [highlight, setHighlight] = useState<number | null>(null)
  const lastTop = useRef(0)
  const scrollerRef = useRef<HTMLElement | null>(null)
  // 프로그램이 일으킨 스크롤(새 메모로 이동, 항목 추가로 인한 스크롤 앵커링)은 사용자 스크롤로 보지 않는다.
  const ignoreUntil = useRef(0)

  // DemoScreen 안쪽 스크롤 영역의 scroll 이벤트는 버블링되지 않으므로, 바깥에서 캡처 단계로 받는다.
  const onScrollCapture = (e: UIEvent<HTMLDivElement>) => {
    const scroller = e.target as HTMLElement
    scrollerRef.current = scroller
    const top = scroller.scrollTop
    if (performance.now() < ignoreUntil.current) {
      lastTop.current = top
      return
    }
    const delta = top - lastTop.current
    if (Math.abs(delta) < SCROLL_THRESHOLD) return
    lastTop.current = top
    // 내려갈 때는 콘텐츠를 더 보여 주려고 접고, 올라올 때(다시 찾는 중일 때)는 라벨을 펼쳐 동작을 알린다.
    const next = delta < 0 || top <= 0
    if (next !== extended) {
      setExtended(next)
      setStatus(next ? '위로 스크롤해서 FAB가 다시 펼쳐졌습니다.' : '아래로 스크롤해서 FAB가 아이콘만 남았습니다.')
    }
  }

  const create = () => {
    const id = Date.now()
    setMemos((m) => [{ id, title: '새 메모', body: '방금 만든 메모입니다.' }, ...m])
    setHighlight(id)
    setExtended(true)
    ignoreUntil.current = performance.now() + 800
    // 방금 만든 메모가 화면 밖에 생기지 않도록 목록 맨 위로 이동한다.
    scrollerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    setStatus('FAB를 눌러 새 메모를 만들었습니다. 화면의 핵심 동작 하나만 FAB에 둡니다.')
  }

  return (
    <div className="relative h-full" onScrollCapture={onScrollCapture}>
      <DemoScreen title="메모" status={status}>
        <ul className="pb-24">
          {memos.map((m) => (
            <li
              key={m.id}
              className={`border-b border-outline-variant px-4 py-3 transition-colors duration-700 ${
                m.id === highlight ? 'bg-primary-container' : ''
              }`}
            >
              <p className="text-body-lg">{m.title}</p>
              <p className="text-body-md text-on-surface-variant">{m.body}</p>
            </li>
          ))}
        </ul>
      </DemoScreen>

      <button
        type="button"
        onClick={create}
        // 접혀서 라벨이 안 보일 때도 이름은 같아야 하므로 aria-label을 고정한다.
        aria-label="새 메모"
        className={`state-layer absolute bottom-4 right-4 z-10 flex h-14 items-center rounded-2xl bg-primary-container text-on-primary-container shadow-elev-3 transition-[padding] duration-300 ease-emphasized ${
          extended ? 'pl-4 pr-5' : 'px-4'
        }`}
      >
        <Icon name="add" />
        <span
          aria-hidden="true"
          className={`overflow-hidden whitespace-nowrap text-label-lg transition-[max-width,margin,opacity] duration-300 ease-emphasized ${
            extended ? 'ml-3 max-w-24 opacity-100' : 'ml-0 max-w-0 opacity-0'
          }`}
        >
          새 메모
        </span>
      </button>
    </div>
  )
}
