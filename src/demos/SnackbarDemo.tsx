import { useEffect, useRef, useState } from 'react'
import { IconButton } from '../components/IconButton'
import { DemoScreen } from './_shared/DemoScreen'
import { tonalButton } from './_shared/ui'

interface Mail {
  id: number
  from: string
  subject: string
}

const INITIAL: Mail[] = [
  { id: 1, from: '김지민', subject: '금요일 회의 자료 공유드립니다' },
  { id: 2, from: '이서준', subject: '디자인 리뷰 일정 조율' },
  { id: 3, from: '박하늘', subject: '[공지] 11월 사내 행사 안내' },
  { id: 4, from: '최유나', subject: '견적서 확인 부탁드립니다' },
]

/** M3 권장 표시 시간(4~10초) 중 가장 짧은 값. 짧은 문구라 4초면 충분히 읽을 수 있다. */
const DURATION = 4000

interface SnackState {
  /** 새 스낵바가 뜰 때마다 바뀌는 값. 이 값이 바뀌면 타이머도 처음부터 다시 잰다. */
  key: number
  mail: Mail
  index: number
}

export default function SnackbarDemo() {
  const [mails, setMails] = useState(INITIAL)
  const [snack, setSnack] = useState<SnackState | null>(null)
  const [status, setStatus] = useState('메일 오른쪽의 보관 버튼을 눌러 보세요.')

  const archive = (mail: Mail) => {
    const index = mails.findIndex((m) => m.id === mail.id)
    setMails((prev) => prev.filter((m) => m.id !== mail.id))
    // 스낵바는 한 번에 하나만 보인다. 이전 스낵바는 즉시 사라지고 그 작업은 그대로 확정된다.
    setSnack({ key: Date.now(), mail, index })
    setStatus(`“${mail.subject}” 메일을 보관했습니다. 4초 안에 실행 취소할 수 있습니다.`)
  }

  const undo = () => {
    if (!snack) return
    const { mail, index } = snack
    setMails((prev) => [...prev.slice(0, index), mail, ...prev.slice(index)])
    setSnack(null)
    setStatus('실행 취소를 눌러 메일을 되돌렸습니다.')
  }

  return (
    <>
      <DemoScreen title="받은편지함" status={status}>
        {mails.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <p className="text-body-lg text-on-surface-variant">모든 메일을 보관했습니다.</p>
            <button type="button" className={tonalButton} onClick={() => setMails(INITIAL)}>
              메일 다시 채우기
            </button>
          </div>
        ) : (
          <ul>
            {mails.map((m) => (
              <li key={m.id} className="flex min-h-[72px] items-center gap-4 py-2 pl-4 pr-1">
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-container text-title-md text-on-primary-container"
                >
                  {m.from[0]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-body-lg">{m.from}</p>
                  <p className="truncate text-body-md text-on-surface-variant">{m.subject}</p>
                </div>
                <IconButton icon="archive" label={`${m.from}의 메일 보관`} onClick={() => archive(m)} />
              </li>
            ))}
          </ul>
        )}
      </DemoScreen>

      {/* 라이브 영역은 처음부터 DOM에 있어야 내용이 바뀔 때 스크린 리더가 읽어 준다. */}
      <div role="status" aria-live="polite" className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3">
        {snack && (
          <Snackbar
            key={snack.key}
            message="메일 1개를 보관했습니다"
            actionLabel="실행 취소"
            onAction={undo}
            onTimeout={() => {
              setSnack(null)
              setStatus('스낵바가 시간이 지나 자동으로 사라졌습니다. 보관이 확정되었습니다.')
            }}
          />
        )}
      </div>
    </>
  )
}

interface SnackbarProps {
  message: string
  actionLabel: string
  onAction: () => void
  onTimeout: () => void
}

/**
 * 일정 시간 뒤 스스로 사라지는 스낵바.
 * 마우스를 올리거나 키보드 포커스가 들어오면 타이머를 멈춰서, 실행 취소 버튼을 누르기 전에 사라지지 않게 한다(WCAG 2.2.1).
 */
function Snackbar({ message, actionLabel, onAction, onTimeout }: SnackbarProps) {
  const [paused, setPaused] = useState(false)
  const remaining = useRef(DURATION)
  const onTimeoutRef = useRef(onTimeout)
  useEffect(() => {
    onTimeoutRef.current = onTimeout
  })

  useEffect(() => {
    if (paused) return
    const startedAt = performance.now()
    const timer = window.setTimeout(() => onTimeoutRef.current(), remaining.current)
    return () => {
      window.clearTimeout(timer)
      // 멈출 때 남은 시간을 기억해 두었다가 다시 시작할 때 이어서 잰다.
      remaining.current -= performance.now() - startedAt
    }
  }, [paused])

  return (
    <div
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex min-h-12 items-center gap-2 rounded-sm bg-inverse-surface py-1 pl-4 pr-2 text-inverse-on-surface shadow-elev-3 transition-[opacity,translate] duration-300 ease-emphasized-decelerate starting:translate-y-4 starting:opacity-0"
    >
      <p className="flex-1 py-2 text-body-md">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className="state-layer min-h-11 shrink-0 rounded-full px-3 text-label-lg text-inverse-primary"
      >
        {actionLabel}
      </button>
    </div>
  )
}
