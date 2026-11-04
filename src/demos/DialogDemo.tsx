import { useRef, useState } from 'react'
import { useFocusTrap } from '../lib/useFocusTrap'
import { DemoScreen } from './_shared/DemoScreen'
import { Scrim } from './_shared/Scrim'
import { filledButton, textButton, tonalButton } from './_shared/ui'

type Kind = 'basic' | 'destructive'

export default function DialogDemo() {
  const [open, setOpen] = useState<Kind | null>(null)
  const [draftCount, setDraftCount] = useState(3)
  const [status, setStatus] = useState('두 종류의 다이얼로그를 열어 스크림을 눌렀을 때 차이를 비교해 보세요.')
  const panelRef = useRef<HTMLDivElement>(null)
  const basicTriggerRef = useRef<HTMLButtonElement>(null)
  const destructiveTriggerRef = useRef<HTMLButtonElement>(null)
  // 파괴적 확인에서는 실수로 Enter를 눌러도 삭제되지 않도록 "취소"에 먼저 포커스한다.
  const cancelRef = useRef<HTMLButtonElement>(null)

  const close = (reason: string) => {
    setOpen(null)
    setStatus(reason)
  }

  useFocusTrap(panelRef, open !== null, {
    initialFocus: open === 'destructive' ? cancelRef : undefined,
    onEscape: () => close('Esc 키로 닫았습니다. Esc는 언제나 “취소”와 같습니다.'),
    returnFocus: open === 'destructive' ? destructiveTriggerRef : basicTriggerRef,
  })

  const onScrimClick = () => {
    if (open === 'basic') {
      close('스크림을 눌러 닫았습니다. 결정이 필요 없는 기본 다이얼로그는 바깥을 눌러 닫아도 됩니다.')
    } else {
      // 되돌릴 수 없는 작업은 사용자가 버튼으로 명확히 선택해야 하므로 바깥 탭을 무시한다.
      setStatus('스크림을 눌렀지만 닫히지 않습니다. 되돌릴 수 없는 작업이라 “취소”나 “삭제”를 직접 골라야 합니다.')
      // 포커스할 수 없는 스크림을 누르면 포커스가 body로 빠져나가 Esc·Tab 가두기가 끊긴다. 안전한 버튼으로 되돌린다.
      cancelRef.current?.focus()
    }
  }

  return (
    <>
      <DemoScreen title="임시 보관함" status={status}>
        <div className="flex flex-col gap-3 p-4">
          <p className="text-body-lg">
            임시 저장된 글 <strong className="font-medium">{draftCount}개</strong>
          </p>
          <button
            ref={basicTriggerRef}
            type="button"
            className={tonalButton}
            onClick={() => {
              setOpen('basic')
              setStatus('기본 다이얼로그를 열었습니다. 스크림을 눌러 보세요.')
            }}
          >
            알림 설정 다이얼로그
          </button>
          <button
            ref={destructiveTriggerRef}
            type="button"
            className={`${filledButton} disabled:pointer-events-none disabled:opacity-40`}
            disabled={draftCount === 0}
            onClick={() => {
              setOpen('destructive')
              setStatus('삭제 확인 다이얼로그를 열었습니다. 스크림을 눌러도 닫히지 않습니다.')
            }}
          >
            임시 저장 글 모두 삭제
          </button>
        </div>
      </DemoScreen>

      <Scrim visible={open !== null} onClick={onScrimClick} />

      {open && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-6">
          <div
            ref={panelRef}
            // 확인이 꼭 필요한 다이얼로그는 alertdialog로 알려 스크린 리더가 즉시 내용을 읽게 한다.
            role={open === 'destructive' ? 'alertdialog' : 'dialog'}
            aria-modal="true"
            aria-labelledby="dialog-title"
            aria-describedby="dialog-desc"
            // 패널의 빈 곳을 눌러도 포커스가 패널 안에 머물도록 프로그램 포커스만 받게 한다.
            tabIndex={-1}
            className="pointer-events-auto outline-none w-full max-w-[312px] rounded-[28px] bg-surface-container-high p-6 shadow-elev-3 transition-[opacity,scale] duration-200 ease-emphasized-decelerate starting:scale-95 starting:opacity-0"
          >
            {open === 'basic' ? (
              <>
                <h2 id="dialog-title" className="text-headline-sm">
                  알림을 받을까요?
                </h2>
                <p id="dialog-desc" className="mt-4 text-body-md text-on-surface-variant">
                  새 댓글이 달리면 알림을 보내 드립니다. 설정에서 언제든 바꿀 수 있습니다.
                </p>
                <div className="mt-6 flex justify-end gap-2">
                  <button type="button" className={textButton} onClick={() => close('“나중에”를 선택해서 닫았습니다.')}>
                    나중에
                  </button>
                  <button type="button" className={textButton} onClick={() => close('“알림 받기”를 선택했습니다.')}>
                    알림 받기
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 id="dialog-title" className="text-headline-sm">
                  임시 저장 글을 모두 삭제할까요?
                </h2>
                <p id="dialog-desc" className="mt-4 text-body-md text-on-surface-variant">
                  {draftCount}개의 글이 영구적으로 삭제되며 되돌릴 수 없습니다.
                </p>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    ref={cancelRef}
                    type="button"
                    className={textButton}
                    onClick={() => close('“취소”를 선택했습니다. 글은 그대로 있습니다.')}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    // 같은 속성의 유틸리티 두 개를 겹치면 우선순위가 CSS 생성 순서에 달려 있으므로, 색 클래스를 바꿔 끼운다.
                    className={textButton.replace('text-primary', 'text-error')}
                    onClick={() => {
                      setDraftCount(0)
                      close('“삭제”를 선택했습니다. 이런 작업은 확인 다이얼로그가 맞습니다.')
                    }}
                  >
                    삭제
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
