import { useEffect, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { IconButton } from '../components/IconButton'
import { DemoScreen } from './_shared/DemoScreen'

interface Post {
  id: number
  author: string
  text: string
}

const INITIAL: Post[] = [
  { id: 1, author: '김지민', text: '오늘 점심은 회사 앞 국숫집으로 갑니다.' },
  { id: 2, author: '이서준', text: '디자인 시안 2차 버전을 올렸어요.' },
  { id: 3, author: '박하늘', text: '주말 등산 사진 공유합니다.' },
  { id: 4, author: '최유나', text: '회의실 예약은 3층 B로 변경되었습니다.' },
  { id: 5, author: '정다은', text: '새 프로젝트 킥오프는 다음 주 월요일입니다.' },
  { id: 6, author: '한도윤', text: '커피 머신 수리가 끝났어요.' },
]

const FRESH = ['방금 올라온 새 소식입니다.', '새로고침으로 받아 온 글이에요.', '업데이트된 공지가 있습니다.']

/** 손가락 이동량 대비 인디케이터 이동 비율. 1보다 작게 두어 "당겨지는" 저항감을 만든다. */
const RESISTANCE = 0.5
/** 이만큼(px) 당긴 상태에서 놓으면 새로고침한다. */
const THRESHOLD = 72
/** 인디케이터가 내려올 수 있는 최대 거리 */
const MAX_PULL = 120
/** 새로고침하는 동안 인디케이터가 머무는 위치 */
const REFRESH_REST = 56
/** 가짜 네트워크 요청 시간 */
const FAKE_LATENCY = 1200

type Phase = 'idle' | 'pulling' | 'refreshing'

export default function PullToRefreshDemo() {
  const [posts, setPosts] = useState(INITIAL)
  const [pull, setPull] = useState(0)
  const [phase, setPhase] = useState<Phase>('idle')
  const [status, setStatus] = useState('목록 맨 위에서 아래로 당겼다 놓아 보세요.')
  const scrollRef = useRef<HTMLDivElement>(null)
  const nextId = useRef(100)
  const timer = useRef<number | undefined>(undefined)
  // 새로고침 도중 "초기화"로 데모가 다시 마운트되면 이전 타이머가 남지 않게 정리한다.
  useEffect(() => () => window.clearTimeout(timer.current), [])

  // 이벤트 핸들러가 항상 최신 값을 보도록 ref로 들고 있는다. 리스너를 매번 다시 붙이지 않기 위해서다.
  const pullRef = useRef(0)
  const phaseRef = useRef<Phase>('idle')
  pullRef.current = pull
  phaseRef.current = phase

  const refresh = (how: string) => {
    if (phaseRef.current === 'refreshing') return
    setPhase('refreshing')
    setPull(REFRESH_REST)
    setStatus(`${how} 새로고침하는 중입니다…`)
    timer.current = window.setTimeout(() => {
      const id = nextId.current++
      setPosts((prev) => [{ id, author: '새 글', text: FRESH[id % FRESH.length]! }, ...prev])
      setPhase('idle')
      setPull(0)
      setStatus(`${how} 새로고침했습니다. 맨 위에 새 글 1개가 추가되었습니다.`)
    }, FAKE_LATENCY)
  }

  const refreshRef = useRef(refresh)
  refreshRef.current = refresh

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    let startY: number | null = null

    // 당기기는 "맨 위에 있을 때 아래로 끄는 경우"에만 시작한다. 중간에서 아래로 끌면 평범한 스크롤이다.
    const begin = (y: number) => {
      startY = phaseRef.current === 'idle' && el.scrollTop <= 0 ? y : null
    }
    /** 당기기를 처리했으면 true를 돌려준다. 이때만 브라우저 기본 스크롤을 막는다. */
    const move = (y: number) => {
      if (startY === null) return false
      const dy = y - startY
      if (dy <= 0) {
        // 위로 끌면 당기기를 그만두고 일반 스크롤로 돌려준다.
        if (phaseRef.current === 'pulling') {
          setPhase('idle')
          setPull(0)
        }
        return false
      }
      setPhase('pulling')
      setPull(Math.min(MAX_PULL, dy * RESISTANCE))
      return true
    }
    const end = () => {
      if (startY === null) return
      startY = null
      if (phaseRef.current !== 'pulling') return
      if (pullRef.current >= THRESHOLD) refreshRef.current('당겨서')
      else {
        setPhase('idle')
        setPull(0)
        setStatus('충분히 당기지 않아 인디케이터가 제자리로 돌아갔습니다.')
      }
    }

    // 터치는 touch 이벤트로 처리한다. 포인터 이벤트로 하면 브라우저가 스크롤을 시작하는 순간 pointercancel이 와서 추적이 끊긴다.
    // touchmove를 passive: false로 등록해야 당기는 동안 preventDefault로 페이지 스크롤·오버스크롤을 막을 수 있다.
    const onTouchStart = (e: TouchEvent) => begin(e.touches[0]!.clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (move(e.touches[0]!.clientY) && e.cancelable) e.preventDefault()
    }
    // 마우스는 드래그로 스크롤되지 않으므로 포인터 이벤트로 같은 동작을 흉내 낸다.
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return
      begin(e.clientY)
      if (startY !== null) el.setPointerCapture(e.pointerId)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') move(e.clientY)
    }
    const onPointerUp = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') end()
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', end)
    el.addEventListener('touchcancel', end)
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerUp)
    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', end)
      el.removeEventListener('touchcancel', end)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerUp)
    }
  }, [])

  const progress = Math.min(1, pull / THRESHOLD)
  const ready = phase === 'pulling' && pull >= THRESHOLD

  return (
    <DemoScreen
      title="피드"
      status={ready ? '지금 놓으면 새로고침합니다.' : status}
      actions={
        // 당기기 제스처를 쓸 수 없는 사용자(키보드, 스위치 제어 등)를 위한 대체 수단
        <IconButton icon="refresh" label="새로고침" disabled={phase === 'refreshing'} onClick={() => refresh('새로고침 버튼으로')} />
      }
    >
      <div className="relative h-full overflow-hidden">
        {/* M3 방식: 인디케이터가 콘텐츠 위로 겹쳐 내려온다. 콘텐츠 자체는 움직이지 않는다. */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute left-1/2 top-0 z-10 flex size-10 items-center justify-center rounded-full bg-surface-container-high text-primary shadow-elev-2 ${
            phase === 'pulling' ? '' : 'transition-[translate,opacity] duration-300 ease-emphasized'
          }`}
          style={{
            translate: `-50% ${pull - 48}px`,
            opacity: pull > 0 ? 1 : 0,
          }}
        >
          {phase === 'refreshing' ? (
            <span className="size-6 animate-spin rounded-full border-[3px] border-primary border-t-transparent" />
          ) : (
            // 당긴 정도만큼 화살표가 돌고, 임계값을 넘으면 완전히 진한 색이 되어 "놓아도 된다"를 알린다.
            <span style={{ rotate: `${progress * 270}deg`, opacity: 0.4 + progress * 0.6 }}>
              <Icon name="refresh" className="size-6" />
            </span>
          )}
        </div>

        <div ref={scrollRef} aria-busy={phase === 'refreshing'} className="h-full touch-pan-y overflow-y-auto overscroll-contain select-none">
          <ul>
            {posts.map((p) => (
              <li key={p.id} className="flex min-h-[72px] items-center gap-4 py-2 pl-4 pr-4">
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-title-md text-on-primary-container"
                >
                  {p.author[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-body-lg">{p.author}</p>
                  <p className="truncate text-body-md text-on-surface-variant">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DemoScreen>
  )
}
