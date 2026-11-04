import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { IconButton } from '../components/IconButton'
import { DemoScreen } from './_shared/DemoScreen'

const APP_MENU = ['새로고침', '모두 읽음으로 표시', '설정', '도움말 및 의견']
const ROW_MENU = ['답장', '전달', '보관', '삭제']

const THREADS = [
  { id: 1, from: '김지민', subject: '금요일 회의 자료 공유드립니다' },
  { id: 2, from: '이서준', subject: '디자인 리뷰 일정 조율' },
  { id: 3, from: '박하늘', subject: '[공지] 11월 사내 행사 안내' },
]

export default function KebabMenuDemo() {
  const [status, setStatus] = useState('오른쪽 위나 각 행의 ⋮ 버튼을 눌러 보세요.')

  return (
    <DemoScreen
      title="받은편지함"
      status={status}
      actions={
        <>
          <IconButton icon="search" label="검색" onClick={() => setStatus('검색은 자주 쓰므로 메뉴에 숨기지 않고 앱 바에 둡니다.')} />
          <KebabMenu
            label="더보기"
            items={APP_MENU}
            onSelect={(item) => setStatus(`앱 바 메뉴에서 “${item}”을(를) 선택했습니다.`)}
            onDismiss={() => setStatus('메뉴 바깥을 눌러 아무것도 고르지 않고 닫았습니다.')}
          />
        </>
      }
    >
      <ul>
        {THREADS.map((t) => (
          <li key={t.id} className="flex min-h-[72px] items-center gap-4 py-2 pl-4 pr-1">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-tertiary-container text-title-md text-on-tertiary-container"
            >
              {t.from[0]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body-lg">{t.from}</p>
              <p className="truncate text-body-md text-on-surface-variant">{t.subject}</p>
            </div>
            <KebabMenu
              label={`${t.from}의 메일 더보기`}
              items={ROW_MENU}
              onSelect={(item) => setStatus(`${t.from}의 메일에서 “${item}”을(를) 선택했습니다.`)}
              onDismiss={() => setStatus('메뉴 바깥을 눌러 아무것도 고르지 않고 닫았습니다.')}
            />
          </li>
        ))}
      </ul>
    </DemoScreen>
  )
}

interface KebabMenuProps {
  label: string
  items: string[]
  onSelect: (item: string) => void
  onDismiss: () => void
}

/**
 * 케밥(⋮) 아이콘 버튼과 그 버튼이 여는 메뉴.
 * WAI-ARIA Menu Button 패턴을 따른다. 화살표로 항목 이동, Esc로 닫고 버튼으로 포커스 복귀, Tab을 누르면 닫고 다음 요소로 이동.
 */
function KebabMenu({ label, items, onSelect, onDismiss }: KebabMenuProps) {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const menuId = useId()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const openAt = (index: number) => {
    setActive(index)
    setOpen(true)
  }

  const close = (returnFocus: boolean) => {
    setOpen(false)
    if (returnFocus) buttonRef.current?.focus()
  }

  // 메뉴가 열려 있는 동안 활성 항목으로 포커스를 따라 옮긴다(로빙 포커스).
  useEffect(() => {
    if (open) itemRefs.current[active]?.focus()
  }, [open, active])

  // 메뉴 바깥을 누르면 닫는다. 이때는 사용자가 다른 곳을 누른 것이므로 포커스를 억지로 되돌리지 않는다.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false)
        onDismiss()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open, onDismiss])

  const onButtonKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      openAt(0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      openAt(items.length - 1)
    }
  }

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
      <IconButton
        ref={buttonRef}
        icon="moreVert"
        label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close(true) : openAt(0))}
        onKeyDown={onButtonKeyDown}
      />
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          // 버튼의 오른쪽 끝에 맞춰 아래로 펼친다. 화면 오른쪽 가장자리에 붙은 버튼이라 왼쪽으로 열려야 잘리지 않는다.
          className="absolute right-1 top-full z-30 min-w-48 origin-top-right rounded-sm bg-surface-container py-2 shadow-elev-2 transition-[opacity,scale] duration-150 ease-emphasized-decelerate starting:scale-90 starting:opacity-0"
        >
          {items.map((item, i) => (
            <button
              key={item}
              ref={(el) => {
                itemRefs.current[i] = el
              }}
              type="button"
              role="menuitem"
              tabIndex={i === active ? 0 : -1}
              onClick={() => {
                close(true)
                onSelect(item)
              }}
              onPointerMove={() => setActive(i)}
              className="state-layer flex min-h-12 w-full items-center px-3 text-left text-label-lg text-on-surface"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
