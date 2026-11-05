import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { Icon } from '../components/Icon'
import { DemoScreen } from './_shared/DemoScreen'

const SIZES = ['S', 'M', 'L', 'XL']

const PRODUCTS = [
  { name: '백팩', price: 59000 },
  { name: '머그컵', price: 12000 },
  { name: '우산', price: 18000 },
]

type SortKey = 'name' | 'price'
type SortDir = 'ascending' | 'descending'

const COLUMN_LABEL: Record<SortKey, string> = { name: '상품명', price: '가격' }

export default function CaretDownDemo() {
  const [status, setStatus] = useState('▼가 붙은 입력란을 눌러 선택지를 열거나, 표 머리글을 눌러 정렬해 보세요.')
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: 'price', dir: 'ascending' })

  const sorted = [...PRODUCTS].sort((a, b) => {
    const diff = sort.key === 'name' ? a.name.localeCompare(b.name, 'ko') : a.price - b.price
    return sort.dir === 'ascending' ? diff : -diff
  })

  const toggleSort = (key: SortKey) => {
    const dir: SortDir = sort.key === key && sort.dir === 'ascending' ? 'descending' : 'ascending'
    setSort({ key, dir })
    setStatus(`${COLUMN_LABEL[key]} ${dir === 'ascending' ? '오름차순(▲)' : '내림차순(▼)'}으로 정렬했습니다.`)
  }

  return (
    <DemoScreen title="주문하기" status={status}>
      <section aria-labelledby="ct-dd" className="px-4 pb-4">
        <h2 id="ct-dd" className="py-2 text-title-sm text-on-surface-variant">
          드롭다운 메뉴
        </h2>
        <Dropdown
          label="사이즈"
          options={SIZES}
          onOpen={() => setStatus('▼가 ▲로 바뀌며 선택지 목록이 열렸습니다.')}
          onSelect={(v) => setStatus(`사이즈 “${v}”를 골랐습니다. 목록이 닫히며 ▲가 다시 ▼로 바뀝니다.`)}
          onDismiss={() => setStatus('아무것도 고르지 않고 목록을 닫았습니다.')}
        />
      </section>

      <section aria-labelledby="ct-sort" className="px-4 pb-4">
        <h2 id="ct-sort" className="py-2 text-title-sm text-on-surface-variant">
          정렬 방향
        </h2>
        <table className="w-full overflow-hidden rounded-xl bg-surface-container text-left text-body-md">
          <thead>
            <tr className="border-b border-outline-variant">
              {(Object.keys(COLUMN_LABEL) as SortKey[]).map((key) => {
                const active = sort.key === key
                return (
                  <th key={key} aria-sort={active ? sort.dir : 'none'} className="p-0 font-medium">
                    <button
                      type="button"
                      onClick={() => toggleSort(key)}
                      className={`state-layer flex min-h-12 w-full items-center gap-1 px-4 text-label-lg ${
                        key === 'price' ? 'justify-end' : ''
                      } ${active ? 'text-primary' : 'text-on-surface-variant'}`}
                    >
                      {COLUMN_LABEL[key]}
                      {/* 정렬하지 않은 열은 흐린 ▼로 "누르면 정렬된다"는 것만 알린다. */}
                      <Icon
                        name={active && sort.dir === 'ascending' ? 'arrowDropUp' : 'arrowDropDown'}
                        className={`size-5 ${active ? '' : 'opacity-40'}`}
                      />
                    </button>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p) => (
              <tr key={p.name} className="border-t border-outline-variant first:border-t-0">
                <td className="px-4 py-3">{p.name}</td>
                <td className="px-4 py-3 text-right tabular-nums">{p.price.toLocaleString('ko-KR')}원</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </DemoScreen>
  )
}

interface DropdownProps {
  label: string
  options: string[]
  onOpen: () => void
  onSelect: (value: string) => void
  onDismiss: () => void
}

/**
 * M3 exposed dropdown menu를 단순화한 선택 상자.
 * 버튼이 aria-haspopup="listbox"로 목록을 연다는 것을 알리고, 열리면 화살표·Home·End로 옵션을 옮기며 Enter·Space로 고른다.
 */
function Dropdown({ label, options, onOpen, onSelect, onDismiss }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState<string | null>(null)
  const [active, setActive] = useState(0)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<(HTMLLIElement | null)[]>([])
  const labelId = useId()
  const listId = useId()

  const openList = () => {
    setActive(value ? options.indexOf(value) : 0)
    setOpen(true)
    onOpen()
  }

  const choose = (v: string) => {
    setValue(v)
    setOpen(false)
    buttonRef.current?.focus()
    onSelect(v)
  }

  useEffect(() => {
    if (open) optionRefs.current[active]?.focus()
  }, [open, active])

  // 목록 바깥을 누르면 닫는다. 사용자가 다른 곳을 누른 것이므로 포커스는 되돌리지 않는다.
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
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      openList()
    }
  }

  const onListKeyDown = (e: KeyboardEvent) => {
    const last = options.length - 1
    const move = (i: number) => {
      e.preventDefault()
      setActive(i)
    }
    if (e.key === 'ArrowDown') move(Math.min(last, active + 1))
    else if (e.key === 'ArrowUp') move(Math.max(0, active - 1))
    else if (e.key === 'Home') move(0)
    else if (e.key === 'End') move(last)
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      choose(options[active]!)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      buttonRef.current?.focus()
      onDismiss()
    } else if (e.key === 'Tab') {
      setOpen(false)
      onDismiss()
    }
  }

  return (
    <div ref={wrapperRef} className="relative">
      <span id={labelId} className="sr-only">
        {label}
      </span>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={`${labelId} ${labelId}-value`}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onButtonKeyDown}
        className={`relative flex min-h-14 w-full items-center rounded-sm border pl-4 pr-2 text-left text-body-lg ${
          open ? 'border-2 border-primary' : 'border-outline'
        }`}
      >
        {/* 테두리 위에 걸친 M3 outlined 입력란의 라벨 */}
        <span aria-hidden="true" className="absolute -top-2.5 left-3 bg-surface px-1 text-body-sm text-on-surface-variant">
          {label}
        </span>
        <span id={`${labelId}-value`} className={`flex-1 ${value ? '' : 'text-on-surface-variant'}`}>
          {value ?? '선택하세요'}
        </span>
        <Icon name={open ? 'arrowDropUp' : 'arrowDropDown'} className="size-6 text-on-surface-variant" />
      </button>
      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={labelId}
          onKeyDown={onListKeyDown}
          className="absolute inset-x-0 top-full z-30 mt-1 rounded-sm bg-surface-container py-2 shadow-elev-2 transition-[opacity,scale] duration-150 ease-emphasized-decelerate starting:scale-y-90 starting:opacity-0"
        >
          {options.map((opt, i) => (
            <li
              key={opt}
              ref={(el) => {
                optionRefs.current[i] = el
              }}
              role="option"
              aria-selected={opt === value}
              tabIndex={i === active ? 0 : -1}
              onClick={() => choose(opt)}
              onPointerMove={() => setActive(i)}
              className={`state-layer flex min-h-12 cursor-pointer items-center px-4 text-body-lg outline-none focus-visible:bg-on-surface/10 ${
                opt === value ? 'bg-secondary-container text-on-secondary-container' : ''
              }`}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
