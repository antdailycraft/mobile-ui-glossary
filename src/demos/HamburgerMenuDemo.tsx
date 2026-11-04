import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useFocusTrap } from '../lib/useFocusTrap'
import { Scrim } from './_shared/Scrim'

/** 받침 유무에 따라 조사를 고른다. 상태 문구에 들어가는 라벨이 바뀌어도 "알림으로", "도보를"처럼 자연스럽게 읽히게 하기 위해서다. */
const finalOf = (word: string) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code <= 11171 ? code % 28 : 0
}
const withEul = (w: string) => `“${w}”${finalOf(w) ? '을' : '를'}`


type Variant = 'material' | 'web'

const LINKS = ['소개', '서비스', '요금제', '고객 지원']

export default function HamburgerMenuDemo() {
  const [variant, setVariant] = useState<Variant>('material')
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState('☰ 버튼을 눌러 보고, 아래 표에서 버튼의 접근성 속성이 어떻게 바뀌는지 확인해 보세요.')
  const buttonRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Material 변형은 모달 드로어이므로 포커스를 가두고, 웹 변형은 펼침(disclosure) 패턴이라 가두지 않는다.
  useFocusTrap(drawerRef, open && variant === 'material', {
    returnFocus: buttonRef,
    onEscape: () => toggle(false, 'Esc 키로 드로어를 닫았습니다. 포커스는 ☰ 버튼으로 돌아갑니다.'),
  })

  // 웹 변형: 펼친 메뉴는 Esc로 닫고 버튼으로 포커스를 돌려준다. 바깥 영역 클릭은 막지 않으므로 별도 처리한다.
  useEffect(() => {
    if (!open || variant !== 'web') return
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        toggle(false, 'Esc 키로 펼친 메뉴를 닫았습니다.')
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  })

  function toggle(next: boolean, reason: string) {
    setOpen(next)
    setStatus(reason)
  }

  const onButton = () => {
    if (variant === 'material') {
      toggle(true, '☰ 버튼이 Navigation Drawer를 열었습니다. 드로어가 버튼을 덮으므로 닫기는 드로어 쪽에서 합니다.')
    } else {
      toggle(
        !open,
        open ? '같은 버튼(✕)을 다시 눌러 메뉴를 닫았습니다.' : '메뉴가 펼쳐지고 아이콘이 ✕로 바뀌었습니다. 같은 버튼으로 다시 닫을 수 있습니다.',
      )
    }
  }

  const switchVariant = (v: Variant) => {
    setVariant(v)
    setOpen(false)
    setStatus(
      v === 'material'
        ? 'Material: 앱 바 왼쪽의 ☰가 모달 드로어를 엽니다.'
        : '웹: 헤더 오른쪽의 ☰가 아래로 메뉴를 펼치고, 열리면 ✕로 바뀝니다.',
    )
  }

  const label = variant === 'web' && open ? '메뉴 닫기' : '메뉴 열기'

  const button = (
    <button
      ref={buttonRef}
      type="button"
      aria-label={label}
      aria-expanded={open}
      aria-controls={variant === 'material' ? 'hm-drawer' : 'hm-panel'}
      onClick={onButton}
      className="state-layer inline-flex size-12 shrink-0 items-center justify-center rounded-full text-on-surface"
    >
      <HamburgerIcon open={variant === 'web' && open} />
    </button>
  )

  return (
    <div className="relative flex h-full flex-col bg-surface text-on-surface">
      {variant === 'material' ? (
        <header className="flex h-16 shrink-0 items-center gap-1 px-1">
          {button}
          <p className="flex-1 px-1 text-title-lg">메일</p>
        </header>
      ) : (
        <header className="relative z-20 flex h-16 shrink-0 items-center gap-1 border-b border-outline-variant bg-surface pl-4 pr-1">
          <p className="flex-1 text-title-md font-bold text-primary">ACME</p>
          {button}
        </header>
      )}

      {variant === 'web' && (
        // 펼침 메뉴는 헤더 바로 아래에서 내려온다. 모달이 아니므로 스크림이나 포커스 트랩을 두지 않는다.
        <div
          id="hm-panel"
          ref={panelRef}
          inert={!open}
          className={`absolute inset-x-0 top-16 z-10 origin-top border-b border-outline-variant bg-surface shadow-elev-2 transition-[opacity,translate] duration-200 ease-emphasized ${
            open ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-2 opacity-0'
          }`}
        >
          <ul className="py-2">
            {LINKS.map((l) => (
              <li key={l}>
                <a
                  href="#hamburger-menu"
                  onClick={(e) => {
                    e.preventDefault()
                    toggle(false, `“${l}” 링크를 눌러 이동하고 메뉴를 접었습니다.`)
                    buttonRef.current?.focus()
                  }}
                  className="state-layer flex min-h-12 items-center px-4 text-body-lg"
                >
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p role="status" className="mx-4 mb-2 mt-2 shrink-0 rounded-lg bg-surface-container-high px-3 py-2 text-body-sm text-on-surface-variant">
        {status}
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <VariantPicker value={variant} onChange={switchVariant} />
        <h3 className="mb-2 mt-5 text-title-sm text-on-surface-variant">☰ 버튼의 현재 접근성 속성</h3>
        {/* 스크린 리더가 실제로 읽는 값을 그대로 보여 준다. 아이콘 모양만으로는 전달되지 않는 정보다. */}
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 rounded-xl border border-outline-variant p-3 font-mono text-body-sm">
          <dt className="text-on-surface-variant">aria-label</dt>
          <dd>"{label}"</dd>
          <dt className="text-on-surface-variant">aria-expanded</dt>
          <dd className={open ? 'text-primary' : ''}>{String(open)}</dd>
          <dt className="text-on-surface-variant">aria-controls</dt>
          <dd>{variant === 'material' ? 'hm-drawer' : 'hm-panel'}</dd>
        </dl>
        <p className="mt-3 text-body-sm text-on-surface-variant">
          ☰는 메뉴 자체가 아니라 숨겨진 내비게이션을 여는 버튼입니다. Material에서는 Navigation Drawer를, 웹에서는 접힌 상단 메뉴를 엽니다.
        </p>
      </div>

      {variant === 'material' && (
        <>
          <Scrim visible={open} onClick={() => toggle(false, '스크림을 눌러 드로어를 닫았습니다. 포커스는 ☰ 버튼으로 돌아갑니다.')} className="z-30" />
          <div
            id="hm-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="메일 메뉴"
            inert={!open}
            className={`absolute inset-y-0 left-0 z-40 w-[75%] rounded-r-2xl bg-surface-container-low px-3 py-4 shadow-elev-1 transition-transform duration-300 ease-emphasized ${
              open ? 'translate-x-0' : '-translate-x-[calc(100%+16px)]'
            }`}
          >
            <p className="px-4 pb-2 text-title-sm text-on-surface-variant">메일</p>
            <ul>
              {['받은편지함', '보낸편지함', '휴지통'].map((l) => (
                <li key={l}>
                  <button
                    type="button"
                    onClick={() => toggle(false, `드로어에서 ${withEul(l)} 골라 닫았습니다. 포커스는 ☰ 버튼으로 돌아갑니다.`)}
                    className="state-layer flex min-h-14 w-full items-center rounded-full px-4 text-left text-label-lg text-on-surface-variant"
                  >
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

/** 가로줄 세 개가 ✕로 바뀌는 아이콘. 가운데 줄은 사라지고 위아래 줄이 45도씩 회전한다. */
function HamburgerIcon({ open }: { open: boolean }) {
  const bar = 'absolute left-0 h-0.5 w-[18px] rounded-full bg-current transition-[transform,opacity] duration-200 ease-emphasized'
  return (
    <span aria-hidden="true" className="relative block h-3 w-[18px]">
      <span className={`${bar} top-0 ${open ? 'translate-y-[5px] rotate-45' : ''}`} />
      <span className={`${bar} top-[5px] ${open ? 'opacity-0' : ''}`} />
      <span className={`${bar} top-[10px] ${open ? '-translate-y-[5px] -rotate-45' : ''}`} />
    </span>
  )
}

function VariantPicker({ value, onChange }: { value: Variant; onChange: (v: Variant) => void }) {
  const options: { id: Variant; label: string }[] = [
    { id: 'material', label: 'Material (드로어)' },
    { id: 'web', label: '웹 (펼침 메뉴)' },
  ]
  const refs = useRef<(HTMLButtonElement | null)[]>([])
  const onKeyDown = (e: KeyboardEvent) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return
    e.preventDefault()
    const next = value === 'material' ? 1 : 0
    onChange(options[next]!.id)
    refs.current[next]?.focus()
  }
  return (
    <div role="radiogroup" aria-label="표시 방식" onKeyDown={onKeyDown} className="flex rounded-full border border-outline">
      {options.map((o, i) => (
        <button
          key={o.id}
          ref={(el) => {
            refs.current[i] = el
          }}
          type="button"
          role="radio"
          aria-checked={o.id === value}
          tabIndex={o.id === value ? 0 : -1}
          onClick={() => onChange(o.id)}
          className={`state-layer min-h-11 flex-1 text-label-lg first:rounded-l-full last:rounded-r-full [&:not(:first-child)]:border-l [&:not(:first-child)]:border-outline ${
            o.id === value ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
