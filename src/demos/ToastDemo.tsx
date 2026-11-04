import { useEffect, useRef, useState } from 'react'
import { DemoScreen } from './_shared/DemoScreen'
import { tonalButton } from './_shared/ui'

/** Android Toast의 두 가지 표시 시간(LENGTH_SHORT, LENGTH_LONG)과 같은 값이다. */
const SHORT = 2000
const LONG = 3500

interface ToastState {
  key: number
  message: string
  duration: number
}

export default function ToastDemo() {
  const [toast, setToast] = useState<ToastState | null>(null)
  const [status, setStatus] = useState('버튼을 눌러 Toast를 띄워 보세요. 버튼이 없고 누를 수도 없습니다.')

  const show = (message: string, duration: number) => {
    // 새 Toast가 오면 이전 것을 바로 바꿔 보여 준다. 메시지가 쌓여 화면을 덮지 않게 하기 위해서다.
    setToast({ key: Date.now(), message, duration })
    setStatus(
      `${duration / 1000}초 동안 표시합니다. 마우스를 올려도 멈추지 않습니다. 되돌리기가 필요하다면 Snackbar를 씁니다.`,
    )
  }

  return (
    <>
      <DemoScreen title="메모" status={status}>
        <div className="flex flex-col gap-3 p-4">
          <div aria-hidden="true" className="space-y-2 rounded-2xl bg-surface-container p-4">
            <div className="h-3 w-3/4 rounded-full bg-outline-variant" />
            <div className="h-3 w-full rounded-full bg-outline-variant" />
            <div className="h-3 w-2/3 rounded-full bg-outline-variant" />
          </div>
          <button type="button" className={tonalButton} onClick={() => show('임시 저장했습니다', SHORT)}>
            임시 저장 (짧게, 2초)
          </button>
          <button type="button" className={tonalButton} onClick={() => show('링크를 클립보드에 복사했습니다', LONG)}>
            링크 복사 (길게, 3.5초)
          </button>
        </div>
      </DemoScreen>

      {/*
        Toast는 상호작용이 없으므로 pointer-events-none으로 아래 화면 조작을 막지 않는다.
        라이브 영역은 처음부터 DOM에 두어야 내용이 바뀔 때 스크린 리더가 읽는다.
      */}
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-6 pb-10"
      >
        {toast && (
          <Toast
            key={toast.key}
            message={toast.message}
            duration={toast.duration}
            onDone={() => {
              setToast(null)
              setStatus('Toast가 스스로 사라졌습니다. 사용자는 아무것도 누를 필요가 없었습니다.')
            }}
          />
        )}
      </div>
    </>
  )
}

function Toast({ message, duration, onDone }: { message: string; duration: number; onDone: () => void }) {
  const onDoneRef = useRef(onDone)
  useEffect(() => {
    onDoneRef.current = onDone
  })

  // Snackbar와 달리 일시정지하지 않는다. 읽지 못해도 손해가 없는 정보만 Toast로 보내야 하는 이유다.
  useEffect(() => {
    const timer = window.setTimeout(() => onDoneRef.current(), duration)
    return () => window.clearTimeout(timer)
  }, [duration])

  return (
    <p className="max-w-full rounded-full bg-inverse-surface/90 px-4 py-3 text-center text-body-md text-inverse-on-surface shadow-elev-2 transition-[opacity,translate] duration-200 ease-emphasized-decelerate starting:translate-y-2 starting:opacity-0">
      {message}
    </p>
  )
}
