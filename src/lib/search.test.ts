import { describe, expect, it } from 'vitest'
import { normalize, searchComponents } from './search'
import type { ComponentMeta } from './types'

const make = (id: string, name: string, aliases: string[] = [], summary = ''): ComponentMeta => ({
  id,
  name,
  aliases,
  summary,
  category: 'overlay',
  platforms: ['material'],
  related: [],
  demo: 'X',
})

const items = [
  make('kebab-menu', 'Kebab Menu', ['Overflow Menu', 'more_vert', '더보기 메뉴']),
  make('modal-bottom-sheet', 'Modal Bottom Sheet', ['바텀 시트']),
  make('snackbar', 'Snackbar', [], '실행 취소 버튼을 함께 제공'),
]

describe('normalize', () => {
  it('대소문자·공백·하이픈·밑줄 차이를 무시한다', () => {
    expect(normalize('Bottom-Sheet')).toBe(normalize('bottom sheet'))
    expect(normalize('more_vert')).toBe('morevert')
  })
})

describe('searchComponents', () => {
  it('검색어가 비어 있으면 전체를 돌려준다', () => {
    expect(searchComponents(items, '  ')).toHaveLength(3)
  })

  it('별칭과 한국어 이름으로도 찾는다', () => {
    expect(searchComponents(items, 'overflow').map((c) => c.id)).toEqual(['kebab-menu'])
    expect(searchComponents(items, '바텀').map((c) => c.id)).toEqual(['modal-bottom-sheet'])
    expect(searchComponents(items, 'morevert').map((c) => c.id)).toEqual(['kebab-menu'])
  })

  it('이름 일치를 요약 일치보다 앞에 둔다', () => {
    const list = [make('a', 'Undo Thing'), make('b', 'Other', [], 'undo 지원')]
    expect(searchComponents(list, 'undo').map((c) => c.id)).toEqual(['a', 'b'])
  })
})
