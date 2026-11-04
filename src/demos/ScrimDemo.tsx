import { useRef, useState } from 'react'
import { useFocusTrap } from '../lib/useFocusTrap'
import { DemoScreen } from './_shared/DemoScreen'
import { filledButton, textButton } from './_shared/ui'

/** 비교용 불투명도. 32%가 M3 기준값이고, 나머지는 너무 옅거나 너무 진한 경우를 보여 주기 위한 값이다. */
const OPACITIES = [
  { value: 0, label: '0%', note: '스크림이 없으면 어디까지가 모달인지 경계가 흐려집니다.' },
  { value: 0.32, label: '32%', note: 'M3 기준값입니다. 뒤쪽 맥락은 보이면서 앞쪽 표면에 시선이 모입니다.' },
  { value: 0.7, label: '70%', note: '너무 진하면 뒤쪽 화면의 맥락이 사라져 다른 화면으로 이동한 것처럼 느껴집니다.' },
]

export default function ScrimDemo() {
  const [opacity, setOpacity] = useState(0.32)
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('불투명도를 고른 뒤 “모달 열기”를 눌러 보세요.')
  const panelRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  const close = (reason: string) => {
    setOpen(false)
    setStatus(reason)
  }

  useFocusTrap(panelRef, open, { onEscape: () => close('Esc 키로 닫았습니다.'), returnFocus: triggerRef })

  const current = OPACITIES.find((o) => o.value === opacity)!

  return (
    <>
      <DemoScreen title="스크림 비교" status={status}>
        <div className="flex flex-col gap-4 p-4">
          {/* 뒤쪽 화면에 내용이 있어야 스크림이 무엇을 가리는지 비교할 수 있다. */}
          <div aria-hidden="true" className="grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className={`aspect-square rounded-xl ${
                  ['bg-primary-container', 'bg-tertiary-container', 'bg-secondary-container'][i % 3]
                }`}
              />
            ))}
          </div>
          <fieldset>
            <legend className="mb-2 text-title-sm text-on-surface-variant">스크림 불투명도</legend>
            <div className="flex overflow-hidden rounded-full border border-outline">
              {OPACITIES.map((o) => (
                <label
                  key={o.value}
                  className={`state-layer flex min-h-11 flex-1 cursor-pointer items-center justify-center border-r border-outline text-label-lg last:border-r-0 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-primary ${
                    opacity === o.value ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface'
                  }`}
                >
                  <input
                    type="radio"
                    name="scrim-opacity"
                    value={o.value}
                    checked={opacity === o.value}
                    onChange={() => {
                      setOpacity(o.value)
                      setStatus(`불투명도를 ${o.label}로 바꿨습니다. ${o.note}`)
                    }}
                    className="sr-only"
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </fieldset>
          <button
            ref={triggerRef}
            type="button"
            className={filledButton}
            onClick={() => {
              setOpen(true)
              setStatus(`스크림 ${current.label}로 모달을 열었습니다. 어두운 영역을 누르면 닫힙니다.`)
            }}
          >
            모달 열기
          </button>
        </div>
      </DemoScreen>

      {/*
        공용 Scrim 컴포넌트는 M3 기준값(32%)으로 고정되어 있으므로,
        불투명도를 바꿔 비교하는 이 데모에서만 직접 그린다.
      */}
      <div
        aria-hidden="true"
        onClick={() => close('스크림을 눌러서 닫았습니다. 스크림은 “바깥을 누르면 닫힌다”는 영역 표시이기도 합니다.')}
        className={`absolute inset-0 z-10 bg-scrim transition-opacity duration-300 ease-standard ${
          open ? '' : 'pointer-events-none'
        }`}
        style={{ opacity: open ? opacity : 0 }}
      />

      {open && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center p-6">
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="scrim-dialog-title"
            // 패널의 빈 곳을 눌러도 포커스가 패널 안에 머물도록 프로그램 포커스만 받게 한다.
            tabIndex={-1}
            className="pointer-events-auto outline-none w-full max-w-[312px] rounded-[28px] bg-surface-container-high p-6 shadow-elev-3 transition-[opacity,scale] duration-200 ease-emphasized-decelerate starting:scale-95 starting:opacity-0"
          >
            <h2 id="scrim-dialog-title" className="text-headline-sm">
              스크림 {current.label}
            </h2>
            <p className="mt-4 text-body-md text-on-surface-variant">{current.note}</p>
            <div className="mt-6 flex justify-end">
              <button type="button" className={textButton} onClick={() => close('닫기 버튼으로 닫았습니다.')}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
