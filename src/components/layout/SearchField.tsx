import type { KeyboardEvent, Ref } from 'react'
import { Icon } from '../Icon'
import { IconButton } from '../IconButton'

interface Props {
  value: string
  onChange: (v: string) => void
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void
  inputRef?: Ref<HTMLInputElement>
  resultCount: number
}

/** M3 search bar 모양의 검색 입력. 결과 개수는 시각 표시와 별도로 스크린 리더에 알린다. */
export function SearchField({ value, onChange, onKeyDown, inputRef, resultCount }: Props) {
  return (
    <div className="px-3 pb-2">
      <div className="flex h-14 items-center gap-1 rounded-full bg-surface-container-high pl-4 pr-1 focus-within:outline-3 focus-within:outline-primary">
        <Icon name="search" className="size-6 shrink-0 text-on-surface-variant" />
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="컴포넌트 검색"
          aria-label="컴포넌트 검색"
          aria-describedby="search-count"
          autoComplete="off"
          enterKeyHint="go"
          className="h-full min-w-0 flex-1 bg-transparent px-2 text-body-lg text-on-surface outline-none placeholder:text-on-surface-variant [&::-webkit-search-cancel-button]:hidden"
        />
        {value && <IconButton icon="close" label="검색어 지우기" onClick={() => onChange('')} />}
      </div>
      <p id="search-count" aria-live="polite" className="sr-only">
        {value ? `검색 결과 ${resultCount}개` : ''}
      </p>
    </div>
  )
}
