import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Icon, type IconName } from '../components/Icon'

/** 받침 유무에 따라 조사를 고른다. 상태 문구에 들어가는 라벨이 바뀌어도 "알림으로", "도보를"처럼 자연스럽게 읽히게 하기 위해서다. */
const finalOf = (word: string) => {
  const code = word.charCodeAt(word.length - 1) - 0xac00
  return code >= 0 && code <= 11171 ? code % 28 : 0
}
const withEul = (w: string) => `“${w}”${finalOf(w) ? '을' : '를'}`


interface MenuItem {
  label: string
  icon: IconName
  /** 되돌릴 수 없는 동작. iOS 풀다운 메뉴는 이런 항목을 빨간색으로 표시한다. */
  destructive?: boolean
  /** 이 항목 위에 구분선을 둔다. 성격이 다른 동작 묶음을 나눌 때 쓴다. */
  separator?: boolean
}

const NOTE_MENU: MenuItem[] = [
  { label: '공유', icon: 'share' },
  { label: '복사본 만들기', icon: 'copy' },
  { label: '고정', icon: 'bookmark' },
  { label: '삭제', icon: 'delete', destructive: true, separator: true },
]

const POST_MENU: MenuItem[] = [
  { label: '링크 복사', icon: 'link' },
  { label: '저장', icon: 'download' },
  { label: '신고', icon: 'warning', destructive: true, separator: true },
]

export default function MeatballMenuDemo() {
  const [status, setStatus] = useState('오른쪽 위나 카드의 ⋯ 버튼을 눌러 보세요.')

  return (
    <div className="flex h-full flex-col bg-surface text-on-surface">
      {/* iOS 내비게이션 바: 표준 제목은 가운데, 넘치는 동작은 오른쪽의 ⋯(ellipsis.circle)에 둔다. */}
      <header className="grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center px-2">
        <span />
        <p className="text-title-md">메모</p>
        <div className="flex justify-end">
          <MeatballMenu
            label="메모 더보기"
            circle
            items={NOTE_MENU}
            onSelect={(i) =>
              setStatus(i.destructive ? `빨간색 파괴적 항목 ${withEul(i.label)} 선택했습니다. 실제 앱이라면 한 번 더 확인합니다.` : `${withEul(i.label)} 선택했습니다.`)
            }
            onDismiss={() => setStatus('메뉴 바깥을 눌러 아무것도 고르지 않고 닫았습니다.')}
          />
        </div>
      </header>

      <p role="status" className="mx-4 mb-2 shrink-0 rounded-lg bg-surface-container-high px-3 py-2 text-body-sm text-on-surface-variant">
        {status}
      </p>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
        <article className="rounded-2xl bg-surface-container-low p-4">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="size-10 shrink-0 rounded-full bg-tertiary-container" />
            <div className="min-w-0 flex-1">
              <p className="text-title-sm">하늘</p>
              <p className="text-body-sm text-on-surface-variant">3시간 전</p>
            </div>
            <MeatballMenu
              label="게시물 더보기"
              items={POST_MENU}
              onSelect={(i) => setStatus(`게시물 메뉴에서 ${withEul(i.label)} 선택했습니다.`)}
              onDismiss={() => setStatus('메뉴 바깥을 눌러 아무것도 고르지 않고 닫았습니다.')}
            />
          </div>
          <p className="mt-3 text-body-md">주말에 다녀온 오름 사진을 올렸어요. 날씨가 정말 좋았습니다.</p>
        </article>

        <h3 className="mb-2 mt-6 text-title-sm text-on-surface-variant">같은 역할, 다른 방향</h3>
        <dl className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-xl border border-outline-variant p-3">
            <dt className="text-[28px] leading-8" aria-hidden="true">
              ⋮
            </dt>
            <dd className="text-body-sm">
              Kebab
              <br />
              <span className="text-on-surface-variant">Material · Android</span>
            </dd>
          </div>
          <div className="rounded-xl border-2 border-primary p-3">
            <dt className="text-[28px] leading-8" aria-hidden="true">
              ⋯
            </dt>
            <dd className="text-body-sm">
              Meatball
              <br />
              <span className="text-on-surface-variant">iOS · 웹</span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

interface MeatballMenuProps {
  label: string
  items: MenuItem[]
  /** iOS 내비게이션 바처럼 원 안에 점이 든 ellipsis.circle 모양으로 그린다. */
  circle?: boolean
  onSelect: (item: MenuItem) => void
  onDismiss: () => void
}

/**
 * ⋯ 버튼과 iOS 풀다운 메뉴 모양의 메뉴.
 * 키보드 동작은 WAI-ARIA Menu Button 패턴을 따른다(화살표 이동, Esc로 닫고 버튼으로 포커스 복귀).
 */
function MeatballMenu({ label, items, circle, onSelect, onDismiss }: MeatballMenuProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const menuId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const onDismissRef = useRef(onDismiss)
  useEffect(() => {
    onDismissRef.current = onDismiss
  })

  const close = (returnFocus: boolean) => {
    setOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }

  useEffect(() => {
    if (open) itemRefs.current[active]?.focus()
  }, [open, active])

  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false)
        onDismissRef.current()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const onMenuKeyDown = (e: KeyboardEvent) => {
    const last = items.length - 1
    const move = (i: number) => {
      e.preventDefault()
      setActive(i)
    }
    if (e.key === 'ArrowDown') move(active === last ? 0 : active + 1)
    else if (e.key === 'ArrowUp') move(active === 0 ? last : active - 1)
    else if (e.key === 'Home') move(0)
    else if (e.key === 'End') move(last)
    else if (e.key === 'Escape') {
      e.preventDefault()
      close(true)
    } else if (e.key === 'Tab') close(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(true) : (setActive(0), setOpen(true)))}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
            e.preventDefault()
            setActive(e.key === 'ArrowDown' ? 0 : items.length - 1)
            setOpen(true)
          }
        }}
        className="state-layer inline-flex size-12 items-center justify-center rounded-full text-primary"
      >
        {circle ? (
          <span className="flex size-7 items-center justify-center rounded-full border-2 border-current">
            <Icon name="moreHoriz" className="size-5" />
          </span>
        ) : (
          <Icon name="moreHoriz" className="size-6 text-on-surface-variant" />
        )}
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          // iOS 풀다운 메뉴: 넓고 둥근 모서리, 반투명 배경, 버튼 쪽 모서리에서 커지며 나타난다.
          className="absolute right-0 top-full z-30 mt-1 w-56 origin-top-right overflow-hidden rounded-[14px] bg-surface-container-high/90 shadow-elev-3 backdrop-blur-xl transition-[opacity,scale] duration-200 ease-emphasized-decelerate starting:scale-75 starting:opacity-0"
        >
          {items.map((item, i) => (
            <button
              key={item.label}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              type="button"
              role="menuitem"
              tabIndex={i === active ? 0 : -1}
              onPointerMove={() => setActive(i)}
              onClick={() => {
                close(true)
                onSelect(item)
              }}
              className={`state-layer flex min-h-11 w-full items-center gap-3 px-4 text-left text-body-lg ${
                item.separator ? 'border-t-[6px] border-outline-variant/40' : '[&:not(:first-child)]:border-t [&:not(:first-child)]:border-outline-variant/60'
              } ${item.destructive ? 'text-error' : 'text-on-surface'}`}
            >
              <span className="flex-1">{item.label}</span>
              {/* iOS는 아이콘을 라벨 오른쪽에 둔다. Material 메뉴(아이콘이 왼쪽)와 눈에 띄게 다른 점이다. */}
              <Icon name={item.icon} className="size-5" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
