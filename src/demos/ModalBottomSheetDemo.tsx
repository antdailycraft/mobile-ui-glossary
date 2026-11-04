import { useRef, useState } from 'react'
import { Icon, type IconName } from '../components/Icon'
import { useFocusTrap } from '../lib/useFocusTrap'
import { DemoScreen } from './_shared/DemoScreen'
import { Scrim } from './_shared/Scrim'
import { filledButton } from './_shared/ui'
import { useDrag } from './_shared/useDrag'

const ACTIONS: { icon: IconName; label: string }[] = [
  { icon: 'share', label: '공유' },
  { icon: 'link', label: '링크 복사' },
  { icon: 'edit', label: '수정' },
  { icon: 'download', label: '기기에 저장' },
  { icon: 'delete', label: '삭제' },
]

/** 시트 높이의 이 비율 이상 끌어내리면 닫는다. */
const CLOSE_DISTANCE_RATIO = 0.3
/** 거리가 짧아도 이 속도(px/ms) 이상으로 튕기면 닫는다. 빠르게 쓸어내리는 제스처를 위한 기준이다. */
const CLOSE_VELOCITY = 0.5

export default function ModalBottomSheetDemo() {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('“옵션 열기”를 눌러 시트를 열어 보세요.')
  const sheetRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = (reason: string) => {
    setOpen(false)
    setStatus(reason)
  }

  const drag = useDrag({
    axis: 'y',
    onEnd: ({ offset, velocity }) => {
      const height = sheetRef.current?.offsetHeight ?? 0
      if (offset > height * CLOSE_DISTANCE_RATIO || velocity > CLOSE_VELOCITY) {
        close('아래로 끌어서 닫았습니다.')
      } else {
        // 기준에 못 미치면 원래 자리로 돌아간다(전환은 CSS가 처리한다).
        setStatus('조금만 끌었기 때문에 시트가 제자리로 돌아갔습니다.')
      }
    },
  })

  // 모달이므로 열려 있는 동안 포커스를 시트 안에 가두고, 닫히면 "옵션 열기" 버튼으로 돌려보낸다.
  useFocusTrap(sheetRef, open, { onEscape: () => close('Esc 키로 닫았습니다.'), returnFocus: triggerRef })

  // 아래로는 손가락을 그대로 따라가고, 위로는 1/4만 움직여 "더 올라가지 않는다"는 저항감을 준다.
  const dragY = drag.dragging ? (drag.offset > 0 ? drag.offset : drag.offset / 4) : 0

  return (
    <>
      <DemoScreen title="사진" status={status}>
        <div className="flex flex-col gap-4 p-4">
          <div
            aria-hidden="true"
            className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-tertiary-container via-primary-container to-secondary-container"
          />
          <div>
            <p className="text-title-md">제주 바다, 2026년 여름</p>
            <p className="text-body-md text-on-surface-variant">사진 1장 · 3.2MB</p>
          </div>
          <button
            ref={triggerRef}
            type="button"
            className={filledButton}
            onClick={() => {
              setOpen(true)
              setStatus('시트가 열렸습니다. 핸들을 끌어내리거나 어두운 영역을 눌러 닫아 보세요.')
            }}
          >
            옵션 열기
          </button>
        </div>
      </DemoScreen>

      <Scrim visible={open} onClick={() => close('스크림(어두운 영역)을 눌러서 닫았습니다.')} />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mbs-title"
        inert={!open}
        className={`absolute inset-x-0 bottom-0 z-20 max-h-[85%] rounded-t-[28px] bg-surface-container-low pb-4 shadow-elev-1 ${
          drag.dragging ? '' : 'transition-transform duration-300 ease-emphasized'
        }`}
        style={{ transform: open ? `translateY(${dragY}px)` : 'translateY(calc(100% + 16px))' }}
      >
        {/* 드래그 영역: 핸들과 제목 줄. 목록 부분은 스크롤과 충돌하지 않도록 드래그 대상에서 뺐다. */}
        <div {...drag.bind} className="cursor-grab touch-none select-none active:cursor-grabbing">
          <button
            type="button"
            aria-label="시트 닫기"
            onClick={() => {
              if (!drag.wasDrag()) close('드래그 핸들을 눌러서 닫았습니다.')
            }}
            className="flex h-12 w-full items-center justify-center"
          >
            <span className="h-1 w-8 rounded-full bg-on-surface-variant/40" />
          </button>
          <h2 id="mbs-title" className="px-6 pb-2 text-title-md">
            사진 옵션
          </h2>
        </div>
        <ul>
          {ACTIONS.map((a) => (
            <li key={a.label}>
              <button
                type="button"
                onClick={() => close(`“${a.label}”을(를) 선택해서 시트가 닫혔습니다.`)}
                className="state-layer flex min-h-14 w-full items-center gap-4 px-6 text-left text-body-lg"
              >
                <Icon name={a.icon} className="size-6 text-on-surface-variant" />
                {a.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </>
  )
}
