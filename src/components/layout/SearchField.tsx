import { useId, useImperativeHandle, useRef, type KeyboardEvent, type Ref } from 'react'
import { Icon } from '../Icon'
import { IconButton } from '../IconButton'

interface Props {
  value: string
  onChange: (v: string) => void
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
  inputRef?: Ref<HTMLInputElement>
  resultCount: number
  filtering?: boolean
}

/** M3 search bar 모양의 검색 입력. 결과 개수는 시각 표시와 별도로 스크린 리더에 알린다. */
export function SearchField({ value, onChange, onKeyDown, inputRef, resultCount, filtering = Boolean(value) }: Props) {
  // 드로어와 사이드바가 동시에 존재할 수 있으므로 id를 고정 문자열로 쓰지 않는다.
  const countId = useId()
  const localRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(inputRef, () => localRef.current!, [])
  return (
    <div className="min-w-0 flex-1">
      <div className="nav-field flex items-center gap-1 rounded-lg bg-surface-container-high pl-3 focus-within:outline-3 focus-within:outline-primary">
        <Icon name="search" className="size-5 shrink-0 text-on-surface-variant" />
        <input
          ref={localRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="검색"
          aria-label="컴포넌트 검색"
          aria-describedby={countId}
          autoComplete="off"
          enterKeyHint="go"
          className="h-full min-w-0 flex-1 bg-transparent px-2 text-inherit text-on-surface outline-none placeholder:text-on-surface-variant [&::-webkit-search-cancel-button]:hidden"
        />
        {value && <IconButton icon="close" className="size-11!" label="검색어 지우기" onClick={() => { onChange(''); localRef.current?.focus() }} />}
      </div>
      <p id={countId} aria-live="polite" className="sr-only">
        {filtering ? `검색 결과 ${resultCount}개` : ''}
      </p>
    </div>
  )
}
