import { useRef, useState } from 'react'
import { useFocusTrap } from '../lib/useFocusTrap'
import { DemoScreen } from './_shared/DemoScreen'
import { Scrim } from './_shared/Scrim'
import { filledButton } from './_shared/ui'

const ACTIONS = [
  { label: '사진 저장', destructive: false },
  { label: '앨범에 추가', destructive: false },
  { label: '사진 삭제', destructive: true },
]

/** 버튼 사이의 얇은 구분선. iOS Action Sheet는 항목을 하나의 둥근 그룹 안에 선으로만 나눈다. */
const rowClass = 'state-layer flex min-h-14 w-full items-center justify-center border-t border-outline-variant px-4 text-[1.25rem]'

export default function ActionSheetDemo() {
  const [open, setOpen] = useState(false)
  const [deleted, setDeleted] = useState(false)
  const [status, setStatus] = useState('사진 아래의 “더 보기”를 눌러 Action Sheet를 열어 보세요.')
  const sheetRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  // 첫 포커스는 가장 안전한 "취소"에 둔다. 파괴적 항목이 목록에 섞여 있기 때문이다.
  const cancelRef = useRef<HTMLButtonElement>(null)

  const close = (reason: string) => {
    setOpen(false)
    setStatus(reason)
  }

  useFocusTrap(sheetRef, open, {
    initialFocus: cancelRef,
    onEscape: () => close('Esc 키로 취소했습니다.'),
    returnFocus: triggerRef,
  })

  return (
    <>
      <DemoScreen title="사진" status={status}>
        <div className="flex flex-col gap-4 p-4">
          {deleted ? (
            <div className="flex aspect-[4/3] items-center justify-center rounded-2xl border border-dashed border-outline text-body-md text-on-surface-variant">
              사진이 삭제되었습니다
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-secondary-container via-tertiary-container to-primary-container"
            />
          )}
          <button
            ref={triggerRef}
            type="button"
            className={filledButton}
            onClick={() => {
              setOpen(true)
              setStatus('Action Sheet를 열었습니다. 파괴적 항목은 빨간색, 취소는 따로 떨어져 있습니다.')
            }}
          >
            더 보기
          </button>
        </div>
      </DemoScreen>

      <Scrim visible={open} onClick={() => close('바깥 영역을 눌러 취소했습니다.')} />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="as-title"
        aria-describedby="as-desc"
        inert={!open}
        // 제목 영역처럼 버튼이 아닌 곳을 눌러도 포커스가 시트 밖으로 빠져나가지 않게 한다.
        tabIndex={-1}
        className={`outline-none absolute inset-x-0 bottom-0 z-20 flex flex-col gap-2 p-2 transition-transform duration-300 ease-emphasized ${
          open ? 'translate-y-0' : 'translate-y-[calc(100%+16px)]'
        }`}
      >
        {/* 제목·설명과 동작 버튼은 하나의 그룹, 취소는 분리된 그룹이다. 엄지가 닿기 쉬운 맨 아래에 취소를 둔다. */}
        <div className="overflow-hidden rounded-[14px] bg-surface-container-highest/95 text-center backdrop-blur">
          <div className="px-4 py-3">
            <h2 id="as-title" className="text-title-sm text-on-surface-variant">
              이 사진으로 무엇을 할까요?
            </h2>
            <p id="as-desc" className="text-body-sm text-on-surface-variant">
              삭제한 사진은 되돌릴 수 없습니다.
            </p>
          </div>
          {ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              disabled={deleted}
              onClick={() => {
                if (a.destructive) setDeleted(true)
                close(`“${a.label}”을(를) 선택했습니다.`)
              }}
              className={`${rowClass} disabled:opacity-40 ${a.destructive ? 'text-error' : 'text-primary'}`}
            >
              {a.label}
            </button>
          ))}
        </div>
        <button
          ref={cancelRef}
          type="button"
          onClick={() => close('“취소”를 눌러 아무것도 하지 않고 닫았습니다.')}
          className="state-layer min-h-14 w-full rounded-[14px] bg-surface-container-lowest text-[1.25rem] font-semibold text-primary"
        >
          취소
        </button>
      </div>
    </>
  )
}
